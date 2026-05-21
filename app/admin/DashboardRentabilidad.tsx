'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabase, Product } from '../lib/supabase';
import {
  buildProductMetrics, buildSimScenarios, effectiveMargin,
  currentMonthKey, monthOptions, prevMonthKey, COP,
  type ProductMetrics,
} from '../lib/analytics';

const accent = '#FFD400';

// ─── Types ────────────────────────────────────────────────────────────────────
interface MonthlyPerf {
  id?: string;
  mes: string;
  gasto_meta: number;
  leads: number;
}

interface MonthlySale {
  id?: string;
  mes: string;
  product_id: string;
  unidades_vendidas: number;
}

// ─── Small components ─────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, color, dim }: { label: string; value: string; sub?: React.ReactNode; color?: string; dim?: boolean }) {
  return (
    <div style={{ background: dim ? 'var(--surface)' : 'var(--bg)', border: `1px solid ${color ? color + '44' : 'var(--border)'}`, padding: '16px 20px', flex: '1 1 160px', minWidth: '140px' }}>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1.5px', marginBottom: '8px', fontFamily: '"DM Mono", monospace' }}>{label}</div>
      <div style={{ fontSize: '24px', fontFamily: '"Bebas Neue", sans-serif', color: color || 'var(--text)', letterSpacing: '1px', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '10px', marginTop: '5px', fontFamily: '"DM Mono", monospace', color: color || 'var(--text-muted)' }}>{sub}</div>}
    </div>
  );
}

function Delta({ pct, invertColors = false }: { pct: number | null; invertColors?: boolean }) {
  if (pct === null) return null;
  const good = invertColors ? pct <= 0 : pct >= 0;
  const color = good ? '#25d366' : '#e55';
  const arrow = pct > 0 ? '↑' : '↓';
  return (
    <span style={{ display: 'block', fontSize: '10px', color, fontFamily: '"DM Mono", monospace', marginTop: '3px' }}>
      {arrow}{Math.abs(pct).toFixed(0)}% vs mes ant.
    </span>
  );
}

function SectionToggle({ label, open, onToggle, badge }: { label: string; open: boolean; onToggle: () => void; badge?: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      style={{ width: '100%', padding: '11px 16px', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace', fontSize: '12px', cursor: 'pointer', letterSpacing: '1px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}
    >
      <span>{label}{badge ? <span style={{ marginLeft: '10px', color: accent, fontSize: '11px' }}>{badge}</span> : null}</span>
      <span style={{ color: accent }}>{open ? '▲' : '▼'}</span>
    </button>
  );
}

// ─── Delayed tooltip — position: fixed so it renders above everything ─────────
function Tip({ children, text }: { children: React.ReactNode; text: React.ReactNode }) {
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const spanRef = useRef<HTMLSpanElement>(null);

  const show = () => {
    if (!spanRef.current) return;
    const r = spanRef.current.getBoundingClientRect();
    timer.current = setTimeout(
      () => setCoords({ x: Math.min(r.left + r.width / 2, window.innerWidth - 200), y: r.top }),
      1000
    );
  };
  const hide = () => { if (timer.current) clearTimeout(timer.current); setCoords(null); };

  return (
    <>
      <span ref={spanRef} style={{ cursor: 'help' }} onMouseEnter={show} onMouseLeave={hide}>
        {children}
      </span>
      {coords && (
        <div
          style={{
            position: 'fixed',
            left: coords.x,
            top: coords.y - 8,
            transform: 'translateX(-50%) translateY(-100%)',
            background: '#111827',
            border: `1px solid ${accent}66`,
            color: 'var(--text)',
            padding: '10px 14px',
            fontSize: '11px',
            fontFamily: '"DM Mono", monospace',
            lineHeight: 1.7,
            zIndex: 999999,
            minWidth: '220px',
            maxWidth: '480px',
            pointerEvents: 'none',
            boxShadow: '0 8px 24px rgba(0,0,0,0.8)',
            ...(typeof text === 'string' ? { whiteSpace: 'pre-line' } : {}),
          }}
        >
          <div style={{ color: accent, fontSize: '9px', letterSpacing: '2px', marginBottom: '5px', fontWeight: 700 }}>FÓRMULA</div>
          {text}
        </div>
      )}
    </>
  );
}

// ─── Annotated formula row: each number has its label below ──────────────────
type FPart = { val: string; lbl: string } | string;

function Fmla({ parts }: { parts: FPart[] }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', flexWrap: 'wrap' }}>
      {parts.map((p, i) =>
        typeof p === 'string' ? (
          <span key={i} style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1, paddingTop: '3px', alignSelf: 'flex-start' }}>{p}</span>
        ) : (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', fontWeight: 700, color: '#f0f0f0', lineHeight: 1.3 }}>{p.val}</div>
            {p.lbl && <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '8px', color: accent, letterSpacing: '0.5px', marginTop: '3px', whiteSpace: 'nowrap' }}>{p.lbl}</div>}
          </div>
        )
      )}
    </div>
  );
}

function AlertBadge({ alerta }: { alerta: ProductMetrics['alerta'] }) {
  const map: Record<string, [string, string]> = {
    estrella: ['⭐ ESTRELLA', '#25d366'],
    ok: ['✓ OK', '#25d366'],
    riesgo: ['⚠ RIESGO', '#FFD400'],
    perdida: ['✕ PÉRDIDA', '#e55'],
    'sin-cac': ['— SIN CAC', 'var(--text-muted)'],
  };
  const [txt, color] = map[alerta] ?? ['—', 'var(--text-muted)'];
  return <span style={{ color, fontWeight: 700, fontSize: '11px', fontFamily: '"DM Mono", monospace', border: `1px solid ${color}44`, padding: '2px 7px', whiteSpace: 'nowrap' }}>{txt}</span>;
}

function SortTh({ label, field, current, dir, onClick, tip }: { label: string; field: string; current: string; dir: 'asc' | 'desc'; onClick: (f: string) => void; tip?: string }) {
  const active = current === field;
  const content = <>{label}{active ? (dir === 'desc' ? ' ↓' : ' ↑') : ''}</>;
  return (
    <th
      onClick={() => onClick(field)}
      style={{ padding: '10px 12px', textAlign: 'left', color: active ? accent : 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', fontSize: '11px', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}
    >
      {tip ? <Tip text={tip}>{content}</Tip> : content}
    </th>
  );
}

// ─── CSS mini bar ─────────────────────────────────────────────────────────────
function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.max((value / max) * 100, 0) : 0;
  return (
    <div style={{ background: 'var(--surface2)', height: '8px', width: '80px', overflow: 'hidden', display: 'inline-block', verticalAlign: 'middle', marginLeft: '6px' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, transition: 'width 0.4s ease' }} />
    </div>
  );
}

// ─── Toast (local) ────────────────────────────────────────────────────────────
interface Toast { id: number; message: string; type: 'success' | 'error' }
function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const show = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);
  return { toasts, show };
}

// ─── Main dashboard component ─────────────────────────────────────────────────
export default function DashboardRentabilidad({ products }: { products: Product[] }) {
  const MONTHS = monthOptions(6);
  const [selectedMes, setSelectedMes] = useState(currentMonthKey());
  const [performance, setPerformance] = useState<MonthlyPerf | null>(null);
  const [salesData, setSalesData] = useState<MonthlySale[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tablesReady, setTablesReady] = useState<boolean | null>(null);

  const [showMetaForm, setShowMetaForm] = useState(false);
  const [showSalesForm, setShowSalesForm] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  const [perfForm, setPerfForm] = useState({ gasto_meta: 1125000, leads: 969 });
  const [salesForm, setSalesForm] = useState<Record<string, number>>({});

  const [simTarget, setSimTarget] = useState(5000000);
  const [sortField, setSortField] = useState('roi');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [prevPerf, setPrevPerf] = useState<MonthlyPerf | null>(null);
  const [prevSalesData, setPrevSalesData] = useState<MonthlySale[]>([]);

  const { toasts, show: showToast } = useToast();

  // ── Load monthly data ──────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const sb = getSupabase();
      const [perfRes, salesRes] = await Promise.all([
        sb.from('monthly_performance').select('*').eq('mes', selectedMes).maybeSingle(),
        sb.from('monthly_sales').select('*').eq('mes', selectedMes),
      ]);
      if (perfRes.error?.code === '42P01' || salesRes.error?.code === '42P01') {
        setTablesReady(false);
        return;
      }
      setTablesReady(true);
      setPerformance(perfRes.data ?? null);
      setSalesData(salesRes.data ?? []);
      if (perfRes.data) {
        setPerfForm({ gasto_meta: perfRes.data.gasto_meta, leads: perfRes.data.leads });
      }
      const salesMap: Record<string, number> = {};
      (salesRes.data ?? []).forEach((s: MonthlySale) => {
        salesMap[s.product_id] = s.unidades_vendidas;
      });
      setSalesForm(salesMap);
      // Fetch previous month for comparison
      const prev = prevMonthKey(selectedMes);
      const [prevPerfRes, prevSalesRes] = await Promise.all([
        sb.from('monthly_performance').select('*').eq('mes', prev).maybeSingle(),
        sb.from('monthly_sales').select('*').eq('mes', prev),
      ]);
      setPrevPerf(prevPerfRes.data ?? null);
      setPrevSalesData(prevSalesRes.data ?? []);
    } catch {
      setTablesReady(false);
      showToast('Error cargando datos del mes', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedMes]);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Save Meta Ads performance ──────────────────────────────────────────────
  const savePerfData = async () => {
    setSaving(true);
    try {
      const sb = getSupabase();
      const payload = { mes: selectedMes, ...perfForm, updated_at: new Date().toISOString() };
      if (performance?.id) {
        const { error } = await sb.from('monthly_performance').update(payload).eq('id', performance.id);
        if (error) throw error;
      } else {
        const { error } = await sb.from('monthly_performance').insert([{ ...payload, created_at: new Date().toISOString() }]);
        if (error) throw error;
      }
      await loadData();
      setShowMetaForm(false);
      showToast('Datos Meta Ads guardados');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? (err as { message: string }).message : '';
      if (msg.includes('row-level') || msg.includes('42501') || msg.includes('permission')) {
        showToast('Error de permisos — ejecuta SUPABASE_FIX_RLS.sql en Supabase', 'error');
      } else {
        showToast(`Error guardando: ${msg || '¿Ejecutaste SUPABASE_MONTHLY_DATA.sql?'}`, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Save monthly sales ─────────────────────────────────────────────────────
  const saveSalesData = async () => {
    setSaving(true);
    try {
      const sb = getSupabase();
      const entries = Object.entries(salesForm).filter(([, v]) => v > 0);
      for (const [product_id, unidades_vendidas] of entries) {
        const existing = salesData.find((s) => s.product_id === product_id);
        const payload = { mes: selectedMes, product_id, unidades_vendidas, updated_at: new Date().toISOString() };
        if (existing?.id) {
          const { error } = await sb.from('monthly_sales').update(payload).eq('id', existing.id);
          if (error) throw error;
        } else {
          const { error } = await sb.from('monthly_sales').insert([{ ...payload, created_at: new Date().toISOString() }]);
          if (error) throw error;
        }
      }
      const toDelete = salesData.filter((s) => !salesForm[s.product_id] || salesForm[s.product_id] === 0);
      for (const s of toDelete) {
        if (s.id) { const { error } = await sb.from('monthly_sales').delete().eq('id', s.id); if (error) throw error; }
      }
      await loadData();
      setShowSalesForm(false);
      showToast('Ventas guardadas');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'message' in err ? (err as { message: string }).message : '';
      if (msg.includes('row-level') || msg.includes('42501') || msg.includes('permission')) {
        showToast('Error de permisos — ejecuta SUPABASE_FIX_RLS.sql en Supabase', 'error');
      } else {
        showToast(`Error guardando ventas: ${msg || 'revisa la consola'}`, 'error');
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Computed metrics ───────────────────────────────────────────────────────
  const productsWithCost = products.filter((p) => p.costo && p.costo > 0);

  // CAC only applies to Kits — Meta Ads spend is for selling kits, not insumos/máquinas
  const kitsWithCost = productsWithCost.filter((p) => p.category === 'Kits');
  const othersWithCost = productsWithCost.filter((p) => p.category !== 'Kits');

  const kitSaleIds = new Set(kitsWithCost.map((p) => p.id));
  const totalVentasKits = salesData
    .filter((s) => kitSaleIds.has(s.product_id))
    .reduce((sum, s) => sum + s.unidades_vendidas, 0);
  const totalVentas = salesData.reduce((sum, s) => sum + s.unidades_vendidas, 0);

  // CAC = Meta spend / kit units sold (insumos pay their own shipping, no ad attribution)
  const cac = performance && totalVentasKits > 0 ? performance.gasto_meta / totalVentasKits : null;

  const metaAds = performance?.gasto_meta ?? null;

  const kitMetrics: ProductMetrics[] = kitsWithCost.map((p) => {
    const unidades = salesData.find((s) => s.product_id === p.id)?.unidades_vendidas ?? 0;
    return buildProductMetrics(p, unidades, cac, metaAds, performance?.leads ?? null);
  });
  const otherMetrics: ProductMetrics[] = othersWithCost.map((p) => {
    const unidades = salesData.find((s) => s.product_id === p.id)?.unidades_vendidas ?? 0;
    return buildProductMetrics(p, unidades, null, null);
  });
  const getMetricVal = (m: ProductMetrics, field: string): number => {
    switch (field) {
      case 'price': return m.product.price;
      case 'gNeta': return m.ops.gNeta;
      case 'cac': return m.cac ?? -Infinity;
      case 'rentabilidadReal': return m.rentabilidadReal ?? -Infinity;
      case 'roi': return m.roi ?? -Infinity;
      case 'puntoEquilibrio': return m.puntoEquilibrio ?? Infinity;
      case 'unidades': return m.unidades;
      case 'gananciaAcumulada': return m.gananciaAcumulada ?? -Infinity;
      case 'gananciaReal': return m.gananciaReal ?? -Infinity;
      case 'revenue': return m.revenue ?? -Infinity;
      case 'precioMinimoViable': return m.precioMinimoViable ?? -Infinity;
      case 'margenSeguridad': return m.margenSeguridad ?? -Infinity;
      case 'convRate': return m.convRate ?? -Infinity;
      case 'mesesStock': return m.mesesStock ?? Infinity;
      default: return -Infinity;
    }
  };

  const sortedMetrics = [...kitMetrics].sort((a, b) => {
    const dir = sortDir === 'desc' ? -1 : 1;
    return (getMetricVal(a, sortField) - getMetricVal(b, sortField)) * dir;
  });

  const handleSort = (field: string) => {
    if (sortField === field) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  // KPI totals: ganancia from kits only (CAC-adjusted), others counted separately
  const totalGananciaKits = kitMetrics.reduce((s, m) => s + (m.gananciaAcumulada ?? 0), 0);
  const totalGananciaOtros = otherMetrics.reduce((s, m) => s + (m.gananciaAcumulada ?? 0), 0);
  const totalGanancia = totalGananciaKits + totalGananciaOtros;

  const kitEstrella = [...kitMetrics].sort((a, b) => (b.roi ?? -Infinity) - (a.roi ?? -Infinity))[0];
  const maxROI = Math.max(...kitMetrics.map((m) => m.roi ?? 0), 1);

  // Monthly break-even: total accumulated gNeta from all kits vs Meta Ads spend
  const totalGnetaAcum = kitMetrics.reduce((s, m) => s + (m.gananciaAcumulada ?? 0), 0);
  // Total real profit after Meta Ads: sum(gananciaReal) = totalGnetaAcum - MetaAds (when all units counted)
  const totalGananciaReal = kitMetrics.some((m) => m.gananciaReal !== null)
    ? kitMetrics.reduce((s, m) => s + (m.gananciaReal ?? 0), 0)
    : null;
  const breakEvenGap = metaAds !== null ? metaAds - totalGnetaAcum : null;
  const breakEvenPct = metaAds && metaAds > 0 ? Math.min((totalGnetaAcum / metaAds) * 100, 100) : null;

  // Revenue total (price × units sold)
  const totalRevenue = kitMetrics.reduce((s, m) => s + (m.revenue ?? 0), 0);

  // ROAS = Revenue / Meta Ads spend (industry standard: how much revenue per peso of ads)
  const roas = totalRevenue > 0 && metaAds && metaAds > 0 ? totalRevenue / metaAds : null;
  // ROAS real = gNeta acumulada / Meta Ads (margin return per peso of ads)
  const roasReal = totalGnetaAcum > 0 && metaAds && metaAds > 0 ? totalGnetaAcum / metaAds : null;

  // Días para cubrir Meta Ads (only makes sense for current month)
  const isCurrentMonth = selectedMes === currentMonthKey();
  const dayOfMonth = isCurrentMonth ? new Date().getDate() : null;
  const daysInMonth = isCurrentMonth ? new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate() : null;
  const dailyGnetaRate = dayOfMonth && dayOfMonth > 0 && totalGnetaAcum > 0 ? totalGnetaAcum / dayOfMonth : null;
  const projectedDayBreakEven = dailyGnetaRate && metaAds ? Math.ceil(metaAds / dailyGnetaRate) : null;

  // Previous month metrics
  const prevKitSaleIds = kitSaleIds; // same kit set
  const prevTotalKitsVendidos = prevSalesData
    .filter((s) => prevKitSaleIds.has(s.product_id))
    .reduce((sum, s) => sum + s.unidades_vendidas, 0);
  const prevCac = prevPerf && prevTotalKitsVendidos > 0
    ? prevPerf.gasto_meta / prevTotalKitsVendidos
    : null;
  const prevKitMetrics = kitsWithCost.map((p) => {
    const unidades = prevSalesData.find((s) => s.product_id === p.id)?.unidades_vendidas ?? 0;
    return buildProductMetrics(p, unidades, prevCac, prevPerf?.gasto_meta ?? null, prevPerf?.leads ?? null);
  });
  const prevTotalGnetaAcum = prevKitMetrics.reduce((s, m) => s + (m.gananciaAcumulada ?? 0), 0);
  const prevTotalRevenue = prevKitMetrics.reduce((s, m) => s + (m.revenue ?? 0), 0);
  const prevGananciaRealTotal = prevKitMetrics.some((m) => m.gananciaReal !== null)
    ? prevKitMetrics.reduce((s, m) => s + (m.gananciaReal ?? 0), 0)
    : null;

  // Delta % vs previous month
  const deltaCac = cac !== null && prevCac !== null && prevCac !== 0
    ? ((cac - prevCac) / Math.abs(prevCac)) * 100 : null;
  const deltaUnits = totalVentasKits > 0 && prevTotalKitsVendidos > 0
    ? ((totalVentasKits - prevTotalKitsVendidos) / prevTotalKitsVendidos) * 100 : null;
  const deltaGneta = totalGnetaAcum > 0 && prevTotalGnetaAcum > 0
    ? ((totalGnetaAcum - prevTotalGnetaAcum) / prevTotalGnetaAcum) * 100 : null;
  const deltaRevenue = totalRevenue > 0 && prevTotalRevenue > 0
    ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 : null;
  const deltaGananciaReal = totalGananciaReal !== null && prevGananciaRealTotal !== null && prevGananciaRealTotal !== 0
    ? ((totalGananciaReal - prevGananciaRealTotal) / Math.abs(prevGananciaRealTotal)) * 100 : null;

  // Alerts only for kits (CAC-based alerts don't apply to insumos/máquinas)
  const alertas = kitMetrics.filter((m) => m.alerta === 'perdida' || m.alerta === 'riesgo' || m.alerta === 'estrella');

  // Simulator scenarios (kits only)
  const scenarios = buildSimScenarios(kitMetrics, simTarget);

  const inputStyle: React.CSSProperties = {
    padding: '9px 12px', border: '1px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text)', fontFamily: '"DM Mono", monospace', fontSize: '13px',
    outline: 'none', width: '100%', boxSizing: 'border-box',
  };

  const selectedMonthLabel = MONTHS.find((m) => m.key === selectedMes)?.label ?? selectedMes;

  return (
    <div style={{ padding: '24px', background: 'var(--surface)', border: '1px solid var(--border)', borderTop: 'none' }}>

      {/* ── Month selector ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px' }}>MES:</span>
          <select
            value={selectedMes}
            onChange={(e) => setSelectedMes(e.target.value)}
            style={{ ...inputStyle, width: 'auto', padding: '7px 12px' }}
          >
            {MONTHS.map((m) => <option key={m.key} value={m.key}>{m.label}</option>)}
          </select>
        </div>
        {loading && <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)' }}>Cargando...</span>}
        {!loading && productsWithCost.length === 0 && (
          <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: '#e55' }}>
            ⚠ Ningún producto tiene costo definido. Configúralos en el formulario de producto.
          </span>
        )}
      </div>

      {/* ── Migration banner ───────────────────────────────────────────────── */}
      {tablesReady === false && (
        <div style={{ marginBottom: '20px', padding: '14px 18px', background: '#2e1a00', border: '1px solid #FFD40066', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: '#FFD400' }}>
          ⚠ Las tablas del dashboard no existen en Supabase.
          <br />Ejecuta <strong>SUPABASE_MONTHLY_DATA.sql</strong> en el SQL Editor de Supabase para habilitarlas.
          <br /><span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Supabase Dashboard → SQL Editor → Nueva query → pega y ejecuta el archivo.</span>
        </div>
      )}

      {tablesReady === true && !loading && !performance && (
        <div style={{ marginBottom: '20px', padding: '12px 18px', background: 'var(--surface2)', border: '1px solid var(--border)', fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
          ℹ Sin datos para {MONTHS.find((m) => m.key === selectedMes)?.label ?? selectedMes}.
          Abre «REGISTRAR META ADS» y «REGISTRAR VENTAS DEL MES», completa los datos y guarda.
        </div>
      )}

      {/* ── KPI cards ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '8px' }}>
        <KpiCard
          label="CAC ACTUAL (KITS)"
          value={cac !== null ? COP(cac) : performance ? '— Sin ventas kits' : '— Sin datos'}
          sub={<>{cac !== null ? `${totalVentasKits} kits · ${COP(performance?.gasto_meta ?? 0)} en Meta` : performance ? 'Registra ventas de Kits' : 'Registra Meta Ads y ventas'}<Delta pct={deltaCac} invertColors /></>}
          color={cac !== null ? (cac < 80000 ? '#25d366' : cac < 120000 ? '#FFD400' : '#e55') : undefined}
        />
        <KpiCard
          label="KITS VENDIDOS"
          value={totalVentasKits > 0 ? `${totalVentasKits} uds` : '— Sin datos'}
          sub={<>{totalVentasKits > 0 ? selectedMonthLabel : 'Registra ventas de kits'}<Delta pct={deltaUnits} /></>}
          color={totalVentasKits > 0 ? accent : undefined}
        />
        <KpiCard
          label="REVENUE TOTAL"
          value={totalRevenue > 0 ? COP(totalRevenue) : '— Sin ventas'}
          sub={<>Ingresos brutos kits<Delta pct={deltaRevenue} /></>}
          color={totalRevenue > 0 ? accent : undefined}
        />
        <KpiCard
          label="GANANCIA BRUTA KITS"
          value={totalGnetaAcum > 0 ? COP(totalGnetaAcum) : '— Sin ventas'}
          sub={<>Antes de Meta Ads<Delta pct={deltaGneta} /></>}
          color={totalGnetaAcum > 0 ? '#25d366' : undefined}
        />
        <KpiCard
          label="GANANCIA REAL"
          value={totalGananciaReal !== null ? COP(totalGananciaReal) : '— Sin datos'}
          sub={<>{totalGananciaReal !== null ? (totalGananciaReal >= 0 ? `✓ Después de Meta Ads` : `✕ Meta Ads no cubierto`) : 'Registra Meta Ads y ventas'}<Delta pct={deltaGananciaReal} /></>}
          color={totalGananciaReal !== null ? (totalGananciaReal >= 0 ? '#25d366' : '#e55') : undefined}
        />
        <KpiCard
          label="ROAS"
          value={roas !== null ? `${roas.toFixed(1)}x` : '— Sin datos'}
          sub={roasReal !== null ? `Margen real: ${roasReal.toFixed(1)}x` : 'Revenue ÷ Meta Ads'}
          color={roas !== null ? (roas >= 3 ? '#25d366' : roas >= 2 ? '#FFD400' : '#e55') : undefined}
        />
        <KpiCard
          label="COBERTURA META ADS"
          value={breakEvenPct !== null ? `${breakEvenPct.toFixed(0)}%` : performance ? '0%' : '— Sin datos'}
          sub={breakEvenGap !== null ? (breakEvenGap <= 0 ? `✓ Cubierto (sobran ${COP(-breakEvenGap)})` : `Faltan ${COP(breakEvenGap)}`) : 'Registra Meta Ads y ventas'}
          color={breakEvenGap !== null ? (breakEvenGap <= 0 ? '#25d366' : breakEvenGap < (metaAds ?? 0) * 0.5 ? '#FFD400' : '#e55') : undefined}
        />
        <KpiCard
          label="DÍAS P/ EQUILIBRIO"
          value={
            breakEvenGap !== null && breakEvenGap <= 0
              ? '✓ Cubierto'
              : projectedDayBreakEven !== null
              ? projectedDayBreakEven <= (daysInMonth ?? 31)
                ? `Día ${projectedDayBreakEven}`
                : 'No este mes'
              : '— Sin datos'
          }
          sub={
            isCurrentMonth && dailyGnetaRate
              ? `Ritmo: ${COP(dailyGnetaRate)}/día · ${dayOfMonth}/${daysInMonth} días`
              : isCurrentMonth ? 'Registra ventas para proyectar' : 'Solo disponible en mes actual'
          }
          color={
            projectedDayBreakEven !== null && projectedDayBreakEven <= (daysInMonth ?? 31) && (breakEvenGap ?? 1) > 0
              ? '#FFD400'
              : breakEvenGap !== null && breakEvenGap <= 0
              ? '#25d366'
              : undefined
          }
          dim
        />
        <KpiCard
          label="KIT ESTRELLA"
          value={kitEstrella?.roi != null ? kitEstrella.product.name.split(' ').slice(0, 2).join(' ') : '— Sin datos'}
          sub={kitEstrella?.roi != null ? `ROI ${kitEstrella.roi.toFixed(0)}%` : 'Agrega costos a los kits'}
          color={kitEstrella?.alerta === 'estrella' ? '#25d366' : undefined}
        />
        <KpiCard
          label="LEADS META"
          value={performance?.leads ? String(performance.leads) : '— Sin datos'}
          sub={performance && totalVentasKits > 0 ? `Conv. ${((totalVentasKits / performance.leads) * 100).toFixed(1)}% · Costo/lead: ${COP(performance.gasto_meta / performance.leads)}` : performance ? `Costo/lead: ${COP(performance.gasto_meta / performance.leads)}` : 'Registra Meta Ads'}
          dim
        />
      </div>

      {/* Monthly break-even progress bar */}
      {metaAds !== null && metaAds > 0 && (
        <div style={{ marginBottom: '20px', padding: '12px 16px', background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1.5px' }}>
              PUNTO DE EQUILIBRIO MENSUAL — ganancia neta acumulada vs Meta Ads
            </span>
            <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: breakEvenGap !== null && breakEvenGap <= 0 ? '#25d366' : '#FFD400', fontWeight: 700 }}>
              {COP(totalGnetaAcum)} / {COP(metaAds)}
            </span>
          </div>
          <div style={{ background: 'var(--bg)', height: '10px', width: '100%', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${breakEvenPct ?? 0}%`,
              background: breakEvenGap !== null && breakEvenGap <= 0 ? '#25d366' : '#FFD400',
              transition: 'width 0.6s ease',
            }} />
          </div>
          <div style={{ marginTop: '6px', fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-muted)' }}>
            {breakEvenGap !== null && breakEvenGap > 0
              ? `Necesitas ${COP(breakEvenGap)} más en ganancia neta para cubrir los anuncios de Meta`
              : breakEvenGap !== null && breakEvenGap <= 0
              ? `✓ Meta Ads cubierto este mes`
              : 'Registra ventas para ver progreso'}
          </div>
        </div>
      )}

      <div style={{ marginBottom: '20px', fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
        CAC = Meta Ads ÷ kits vendidos (referencia por unidad). <strong style={{ color: accent }}>G. Neta acumulada</strong> es el margen real que cubre el gasto publicitario.
      </div>

      {/* ── Alerts (kits only) ──────────────────────────────────────────────── */}
      {alertas.length > 0 && (
        <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {kitMetrics.filter((m) => m.alerta === 'estrella').map((m) => (
            <div key={m.product.id} style={{ padding: '10px 14px', background: '#0d2b1a', border: '1px solid #25d36644', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: '#25d366' }}>
              ⭐ <strong>{m.product.name}</strong> — Kit estrella. ROI {m.roi?.toFixed(0)}%. Prioriza presupuesto de Meta en este kit.
            </div>
          ))}
          {kitMetrics.filter((m) => m.alerta === 'perdida').map((m) => (
            <div key={m.product.id} style={{ padding: '10px 14px', background: '#2e1a1a', border: '1px solid #e5533344', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: '#e55' }}>
              🔴 <strong>{m.product.name}</strong> — CAC ({COP(cac!)}) supera la ganancia neta del kit ({COP(m.ops.gNeta)}). Sube el precio o baja el costo para mejorar rentabilidad.
            </div>
          ))}
          {kitMetrics.filter((m) => m.alerta === 'riesgo').map((m) => (
            <div key={m.product.id} style={{ padding: '10px 14px', background: '#2e220a', border: '1px solid #FFD40044', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: '#FFD400' }}>
              🟡 <strong>{m.product.name}</strong> — Margen post-CAC bajo ({COP(m.rentabilidadReal ?? 0)}). Considera subir precio o reducir costos operativos del kit.
            </div>
          ))}
        </div>
      )}

      {/* ── Meta Ads form ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '12px' }}>
        <SectionToggle
          label="⚙ REGISTRAR META ADS"
          open={showMetaForm}
          onToggle={() => setShowMetaForm(!showMetaForm)}
          badge={performance ? `${selectedMonthLabel} · ${COP(performance.gasto_meta)}` : 'Sin datos'}
        />
        {showMetaForm && (
          <div style={{ border: '1px solid var(--border)', borderTop: 'none', padding: '16px', background: 'var(--bg)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1.5px', fontFamily: '"DM Mono", monospace' }}>GASTO META ADS (COP)</label>
                <input
                  type="number" min="0" value={perfForm.gasto_meta}
                  onChange={(e) => setPerfForm({ ...perfForm, gasto_meta: Number(e.target.value) })}
                  style={inputStyle}
                  placeholder="1125000"
                />
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: '"DM Mono", monospace' }}>
                  ≈ {COP(perfForm.gasto_meta / 30)}/día
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1.5px', fontFamily: '"DM Mono", monospace' }}>LEADS GENERADOS</label>
                <input
                  type="number" min="0" value={perfForm.leads}
                  onChange={(e) => setPerfForm({ ...perfForm, leads: Number(e.target.value) })}
                  style={inputStyle}
                  placeholder="969"
                />
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', fontFamily: '"DM Mono", monospace' }}>
                  {perfForm.leads > 0 ? `Costo/lead: ${COP(perfForm.gasto_meta / perfForm.leads)}` : ''}
                </div>
              </div>
            </div>
            <button
              onClick={savePerfData}
              disabled={saving}
              style={{ padding: '10px 24px', background: accent, color: '#111', border: 'none', fontFamily: '"Bebas Neue", sans-serif', fontSize: '16px', cursor: saving ? 'not-allowed' : 'pointer', letterSpacing: '1px', opacity: saving ? 0.6 : 1 }}
            >
              {saving ? 'GUARDANDO...' : 'GUARDAR META ADS'}
            </button>
          </div>
        )}
      </div>

      {/* ── Sales registration form ────────────────────────────────────────── */}
      <div style={{ marginBottom: '20px' }}>
        <SectionToggle
          label="📦 REGISTRAR VENTAS DEL MES"
          open={showSalesForm}
          onToggle={() => setShowSalesForm(!showSalesForm)}
          badge={totalVentas > 0 ? `${totalVentas} unidades vendidas` : 'Sin datos'}
        />
        {showSalesForm && (
          <div style={{ border: '1px solid var(--border)', borderTop: 'none', padding: '16px', background: 'var(--bg)' }}>
            {productsWithCost.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace', fontSize: '12px' }}>
                Agrega costo a tus productos primero.
              </div>
            ) : (
              <>
                {(['Kits', 'Máquinas', 'Insumos'] as const).map((cat) => {
                  const catProducts = productsWithCost.filter((p) => p.category === cat);
                  if (catProducts.length === 0) return null;
                  const isKit = cat === 'Kits';
                  return (
                    <div key={cat} style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', letterSpacing: '2px', color: isKit ? accent : 'var(--text-muted)', fontWeight: 700 }}>
                          {cat.toUpperCase()}
                        </div>
                        {isKit && (
                          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: accent, border: `1px solid ${accent}44`, padding: '1px 6px' }}>
                            AFECTA CAC
                          </div>
                        )}
                        {!isKit && (
                          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '1px 6px' }}>
                            sin impacto CAC
                          </div>
                        )}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                        {catProducts.map((p) => (
                          <div key={p.id}>
                            <label style={{ display: 'block', marginBottom: '5px', fontSize: '11px', color: isKit ? 'var(--text)' : 'var(--text-muted)', letterSpacing: '1px', fontFamily: '"DM Mono", monospace' }}>
                              {p.name.toUpperCase()}
                            </label>
                            <input
                              type="number" min="0"
                              value={salesForm[p.id] ?? 0}
                              onChange={(e) => setSalesForm({ ...salesForm, [p.id]: Number(e.target.value) })}
                              style={{ ...inputStyle, borderColor: isKit && (salesForm[p.id] ?? 0) > 0 ? accent : 'var(--border)' }}
                              placeholder="0"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                <button
                  onClick={saveSalesData}
                  disabled={saving}
                  style={{ padding: '10px 24px', background: accent, color: '#111', border: 'none', fontFamily: '"Bebas Neue", sans-serif', fontSize: '16px', cursor: saving ? 'not-allowed' : 'pointer', letterSpacing: '1px', opacity: saving ? 0.6 : 1 }}
                >
                  {saving ? 'GUARDANDO...' : 'GUARDAR VENTAS'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Metrics table (Kits only) ────────────────────────────────────── */}
      {kitsWithCost.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '12px', fontFamily: '"DM Mono", monospace' }}>
            MÉTRICAS POR KIT — {selectedMonthLabel.toUpperCase()}
            {cac === null && <span style={{ color: '#FFD400', marginLeft: '12px' }}>· Sin CAC: registra Meta Ads y ventas de kits para ver rentabilidad real</span>}
          </div>
          <div style={{ overflowX: 'auto', border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"DM Mono", monospace', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${accent}33`, background: 'var(--surface2)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: accent, fontWeight: 700, letterSpacing: '1px', fontSize: '11px', whiteSpace: 'nowrap' }}>Kit</th>
                  <SortTh label="Precio" field="price" current={sortField} dir={sortDir} onClick={handleSort} tip="Precio de venta actual del producto" />
                  <SortTh label="G. Neta/u" field="gNeta" current={sortField} dir={sortDir} onClick={handleSort} tip="Ganancia por unidad = Precio − Costo − Envío − Impacto devoluciones" />
                  <SortTh label="CAC" field="cac" current={sortField} dir={sortDir} onClick={handleSort} tip="Costo de Adquisición = Meta Ads ÷ Kits vendidos.\nEs mensual fijo, no por unidad." />
                  <SortTh label="ROI %" field="roi" current={sortField} dir={sortDir} onClick={handleSort} tip="ROI = (G. Neta ÷ Costo total) × 100\n>100% excelente · 50-100% bueno · <50% bajo" />
                  <SortTh label="P. Equilibrio" field="puntoEquilibrio" current={sortField} dir={sortDir} onClick={handleSort} tip="Unidades de ESTE kit para cubrir TODO el gasto de Meta Ads.\nFórmula: ceil(Meta Ads ÷ G. Neta/u)" />
                  <SortTh label="P. Mín. Viable" field="precioMinimoViable" current={sortField} dir={sortDir} onClick={handleSort} tip="Precio mínimo para cubrir costos + CAC (ganancia real = 0).\nFórmula: Precio actual − G. Neta/u + CAC" />
                  <SortTh label="Margen Seg." field="margenSeguridad" current={sortField} dir={sortDir} onClick={handleSort} tip="% de margen de seguridad sobre el precio.\nCon CAC: (Precio − P.Mín.Viable) ÷ Precio × 100\nSin CAC: G. Neta ÷ Precio × 100" />
                  <SortTh label="Unidades" field="unidades" current={sortField} dir={sortDir} onClick={handleSort} tip="Unidades vendidas registradas este mes" />
                  <SortTh label="Conv. %" field="convRate" current={sortField} dir={sortDir} onClick={handleSort} tip="% de leads de Meta Ads que compraron este kit.\nFórmula: Unidades ÷ Leads totales × 100" />
                  <SortTh label="G. Acumulada" field="gananciaAcumulada" current={sortField} dir={sortDir} onClick={handleSort} tip="Ganancia bruta del mes (antes de Meta Ads).\nFórmula: G. Neta/u × Unidades" />
                  <SortTh label="G. Real" field="gananciaReal" current={sortField} dir={sortDir} onClick={handleSort} tip="Ganancia real después de Meta Ads proporcional.\nFórmula: (G. Neta/u − CAC) × Unidades" />
                  <SortTh label="Stock" field="mesesStock" current={sortField} dir={sortDir} onClick={handleSort} tip="Meses de inventario al ritmo actual de ventas.\nFórmula: Inventario ÷ Unidades vendidas" />
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: accent, fontWeight: 700, letterSpacing: '1px', fontSize: '11px', whiteSpace: 'nowrap' }}>
                    <Tip text={`⭐ ESTRELLA: ROI > 100%\n✓ OK: ROI 50-100%\n⚠ RIESGO: ROI < 50%\n✕ PÉRDIDA: G. Neta negativa`}>Estado</Tip>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedMetrics.map((m, i) => (
                  <tr key={m.product.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{m.product.name}</td>
                    <td style={{ padding: '10px 12px', color: accent, fontWeight: 700 }}>
                      <Tip text={`Precio: ${COP(m.product.price)}\nP. Mínimo Viable: ${m.precioMinimoViable !== null ? COP(m.precioMinimoViable) : 'sin CAC'}`}>{COP(m.product.price)}</Tip>
                    </td>
                    <td style={{ padding: '10px 12px', color: m.ops.colorGN }}>
                      <Tip text={<Fmla parts={[
                        { val: COP(m.product.price), lbl: 'Precio' },
                        '−',
                        { val: COP(m.product.costo ?? 0), lbl: 'Costo' },
                        '−',
                        { val: COP(m.product.costo_envio ?? 40000), lbl: 'Envío' },
                        '−',
                        { val: COP(m.ops.impactoDev), lbl: 'Dev.' },
                        '=',
                        { val: COP(m.ops.gNeta), lbl: 'G. Neta/u' },
                      ]} />}>{COP(m.ops.gNeta)}</Tip>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '11px' }}>
                      {cac !== null ? <Tip text={<Fmla parts={[
                        { val: COP(performance?.gasto_meta ?? 0), lbl: 'Meta Ads' },
                        '÷',
                        { val: `${totalVentasKits}`, lbl: 'Kits vend.' },
                        '=',
                        { val: COP(cac), lbl: 'CAC' },
                      ]} />}>{COP(cac)}</Tip> : '—'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {m.roi !== null ? (
                        <Tip text={<Fmla parts={[
                          { val: COP(m.ops.gNeta), lbl: 'G. Neta/u' },
                          '÷',
                          { val: COP(m.ops.costoTotal), lbl: 'Costo total' },
                          '×',
                          { val: '100', lbl: '' },
                          '=',
                          { val: `${m.roi.toFixed(1)}%`, lbl: 'ROI' },
                        ]} />}>
                          <span style={{ color: m.roi > 100 ? '#25d366' : m.roi > 50 ? '#FFD400' : '#e55', fontWeight: 700 }}>
                            {m.roi.toFixed(0)}%
                            <MiniBar value={m.roi} max={Math.max(maxROI, 100)} color={m.roi > 100 ? '#25d366' : m.roi > 50 ? '#FFD400' : '#e55'} />
                          </span>
                        </Tip>
                      ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 12px', color: m.puntoEquilibrio !== null ? 'var(--text)' : 'var(--text-muted)' }}>
                      {m.puntoEquilibrio !== null ? <Tip text={<Fmla parts={[
                        { val: COP(metaAds ?? 0), lbl: 'Meta Ads' },
                        '÷',
                        { val: COP(m.ops.gNeta), lbl: 'G. Neta/u' },
                        '=',
                        { val: `${m.puntoEquilibrio} uds`, lbl: 'P. Equil.' },
                      ]} />}>{m.puntoEquilibrio} uds</Tip> : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', color: m.precioMinimoViable !== null ? (m.precioMinimoViable < m.product.price ? '#25d366' : '#e55') : 'var(--text-muted)' }}>
                      {m.precioMinimoViable !== null ? <Tip text={<Fmla parts={[
                        { val: COP(m.product.price), lbl: 'Precio' },
                        '−',
                        { val: COP(m.ops.gNeta), lbl: 'G. Neta/u' },
                        '+',
                        { val: COP(cac ?? 0), lbl: 'CAC' },
                        '=',
                        { val: COP(m.precioMinimoViable), lbl: 'P. Mín.' },
                      ]} />}>{COP(m.precioMinimoViable)}</Tip> : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: m.margenSeguridad !== null ? (m.margenSeguridad > 20 ? '#25d366' : m.margenSeguridad > 0 ? '#FFD400' : '#e55') : 'var(--text-muted)' }}>
                      {m.margenSeguridad !== null ? <Tip text={`Margen de seguridad = ${m.margenSeguridad.toFixed(1)}%\n${cac !== null ? `Precio puede bajar hasta ${COP(m.precioMinimoViable ?? 0)} antes de perder dinero` : 'Sin CAC: % del precio que es ganancia neta'}`}>{m.margenSeguridad.toFixed(1)}%</Tip> : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', color: m.unidades > 0 ? 'var(--text)' : 'var(--text-muted)' }}>
                      {m.unidades > 0 ? `${m.unidades} uds` : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', color: m.convRate !== null ? accent : 'var(--text-muted)' }}>
                      {m.convRate !== null ? <Tip text={<Fmla parts={[
                        { val: `${m.unidades}`, lbl: 'Unidades' },
                        '÷',
                        { val: `${performance?.leads ?? 0}`, lbl: 'Leads' },
                        '×',
                        { val: '100', lbl: '' },
                        '=',
                        { val: `${m.convRate.toFixed(1)}%`, lbl: 'Conv. %' },
                      ]} />}>{m.convRate.toFixed(1)}%</Tip> : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', color: m.gananciaAcumulada !== null ? '#25d366' : 'var(--text-muted)', fontWeight: 700 }}>
                      {m.gananciaAcumulada !== null ? <Tip text={<Fmla parts={[
                        { val: COP(m.ops.gNeta), lbl: 'G. Neta/u' },
                        '×',
                        { val: `${m.unidades}`, lbl: 'Unidades' },
                        '=',
                        { val: COP(m.gananciaAcumulada), lbl: 'G. Acumulada' },
                      ]} />}>{COP(m.gananciaAcumulada)}</Tip> : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: m.gananciaReal !== null ? (m.gananciaReal >= 0 ? '#25d366' : '#e55') : 'var(--text-muted)' }}>
                      {m.gananciaReal !== null ? <Tip text={<Fmla parts={[
                        { val: COP(m.ops.gNeta), lbl: 'G. Neta/u' },
                        '−',
                        { val: COP(m.cac ?? 0), lbl: 'CAC' },
                        '×',
                        { val: `${m.unidades}`, lbl: 'Uds' },
                        '=',
                        { val: COP(m.gananciaReal), lbl: 'G. Real' },
                      ]} />}>{COP(m.gananciaReal)}</Tip> : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', color: m.mesesStock !== null ? (m.mesesStock > 6 ? '#e55' : m.mesesStock > 2 ? '#FFD400' : '#25d366') : 'var(--text-muted)' }}>
                      {m.mesesStock !== null ? <Tip text={<Fmla parts={[
                        { val: `${m.product.inventory ?? 0}`, lbl: 'Inventario' },
                        '÷',
                        { val: `${m.unidades}`, lbl: 'Uds/mes' },
                        '=',
                        { val: `${m.mesesStock}m`, lbl: 'Meses stock' },
                      ]} />}>{m.mesesStock}m</Tip> : '—'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <AlertBadge alerta={m.alerta} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── ROI ranking (kits only) — always shown when kits have cost ────── */}
      {kitMetrics.some((m) => m.roi !== null) && (
        <div style={{ marginBottom: '28px', background: 'var(--bg)', border: `1px solid ${accent}22`, padding: '20px 24px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '16px', fontFamily: '"DM Mono", monospace' }}>RANKING ROI — KITS (con CAC Meta Ads)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[...kitMetrics]
              .filter((m) => m.roi !== null)
              .sort((a, b) => (b.roi ?? 0) - (a.roi ?? 0))
              .map((m, idx) => (
                <div key={m.product.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '20px', fontFamily: '"Bebas Neue", sans-serif', fontSize: '16px', color: idx === 0 ? accent : 'var(--text-muted)', textAlign: 'right', flexShrink: 0 }}>#{idx + 1}</div>
                  <div style={{ width: '160px', fontSize: '11px', color: 'var(--text)', fontFamily: '"DM Mono", monospace', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.product.name}</div>
                  <div style={{ flex: 1, background: 'var(--surface2)', height: '18px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.max(((m.roi ?? 0) / Math.max(maxROI, 1)) * 100, 0)}%`, background: m.roi! > 100 ? '#25d366' : m.roi! > 50 ? '#FFD400' : '#e55', transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ width: '56px', fontSize: '12px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: m.roi! > 100 ? '#25d366' : m.roi! > 50 ? '#FFD400' : '#e55', fontWeight: 700, flexShrink: 0 }}>{m.roi!.toFixed(0)}%</div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── Simulator + Break-even calculator ────────────────────────────── */}
      <div style={{ marginBottom: '8px' }}>
        <SectionToggle
          label="🎯 SIMULADOR — ¿CUÁNTO QUIERO GANAR?"
          open={showSimulator}
          onToggle={() => setShowSimulator(!showSimulator)}
        />
        {showSimulator && (
          <div style={{ border: '1px solid var(--border)', borderTop: 'none', padding: '20px', background: 'var(--bg)' }}>

            {/* Target input */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
              <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text-muted)' }}>Quiero ganar</span>
              <input
                type="number" min="100000" step="100000" value={simTarget}
                onChange={(e) => setSimTarget(Number(e.target.value))}
                style={{ ...inputStyle, width: '180px' }}
              />
              <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text-muted)' }}>en {selectedMonthLabel}</span>
              {cac === null && (
                <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                  · usando ganancia neta por unidad (sin CAC)
                </span>
              )}
            </div>

            {/* Break-even table — always visible when kits have cost */}
            {kitsWithCost.length > 0 && (
              <div style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '10px', color: accent, letterSpacing: '2px', marginBottom: '12px', fontFamily: '"DM Mono", monospace', fontWeight: 700 }}>
                  PUNTO DE EQUILIBRIO POR KIT
                </div>
                <div style={{ overflowX: 'auto', border: '1px solid var(--border)' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"DM Mono", monospace', fontSize: '12px' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface2)', borderBottom: `2px solid ${accent}33` }}>
                        <th style={{ padding: '9px 12px', textAlign: 'left', color: accent, fontWeight: 700, fontSize: '11px', letterSpacing: '1px' }}>Kit</th>
                        <th style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 700, fontSize: '11px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>G. Neta/u</th>
                        {cac !== null && <th style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 700, fontSize: '11px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>Rent. real/u</th>}
                        <th style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--text-muted)', fontWeight: 700, fontSize: '11px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>P. Equilibrio</th>
                        <th style={{ padding: '9px 12px', textAlign: 'right', color: accent, fontWeight: 700, fontSize: '11px', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
                          Para ganar {COP(simTarget)}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {kitsWithCost.map((p, i) => {
                        const m = kitMetrics.find((km) => km.product.id === p.id);
                        if (!m) return null;
                        const margin = effectiveMargin(m);
                        const unidadesParaMeta = margin > 0 ? Math.ceil(simTarget / margin) : null;
                        // puntoEquilibrio: already computed in m using metaAds / gNeta
                        const peq = m.puntoEquilibrio;
                        return (
                          <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                            <td style={{ padding: '9px 12px', color: 'var(--text)', fontWeight: 600 }}>{p.name}</td>
                            <td style={{ padding: '9px 12px', textAlign: 'right', color: m.ops.colorGN }}>{COP(m.ops.gNeta)}</td>
                            {cac !== null && (
                              <td style={{ padding: '9px 12px', textAlign: 'right', color: m.rentabilidadReal !== null ? (m.rentabilidadReal >= 0 ? '#25d366' : '#e55') : 'var(--text-muted)', fontWeight: 700 }}>
                                {m.rentabilidadReal !== null ? COP(m.rentabilidadReal) : '—'}
                              </td>
                            )}
                            <td style={{ padding: '9px 12px', textAlign: 'right', color: 'var(--text-muted)' }}>
                              {peq !== null ? `${peq} uds` : '—'}
                            </td>
                            <td style={{ padding: '9px 12px', textAlign: 'right', color: unidadesParaMeta !== null ? accent : 'var(--text-muted)', fontWeight: 700, fontSize: '13px' }}>
                              {unidadesParaMeta !== null ? `${unidadesParaMeta} uds` : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {cac === null && (
                  <div style={{ marginTop: '8px', fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-muted)' }}>
                    P. Equilibrio = cuántas unidades cubren el costo del producto · Registra Meta Ads para incluir el CAC en el cálculo
                  </div>
                )}
              </div>
            )}

            {/* Scenario cards */}
            {scenarios.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace', fontSize: '12px', padding: '20px', textAlign: 'center', border: '1px solid var(--border)' }}>
                Ningún kit tiene ganancia positiva. Revisa los costos del producto.
              </div>
            ) : (
              <>
                <div style={{ fontSize: '10px', color: accent, letterSpacing: '2px', marginBottom: '12px', fontFamily: '"DM Mono", monospace', fontWeight: 700 }}>
                  ESCENARIOS DE VENTA
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                  {scenarios.map((sc, idx) => (
                    <div key={idx} style={{ background: 'var(--surface)', border: `1px solid ${idx === 0 ? accent + '55' : 'var(--border)'}`, padding: '16px' }}>
                      <div style={{ fontSize: '11px', color: idx === 0 ? accent : 'var(--text-muted)', letterSpacing: '1.5px', marginBottom: '8px', fontFamily: '"DM Mono", monospace', fontWeight: 700 }}>
                        {sc.label.toUpperCase()}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '12px', fontFamily: '"DM Mono", monospace' }}>
                        {sc.description}
                      </div>
                      {sc.lines.map((l) => (
                        <div key={l.productName} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontFamily: '"DM Mono", monospace', fontSize: '12px' }}>
                          <span style={{ color: 'var(--text)' }}>{l.productName.split(' ').slice(0, 3).join(' ')}</span>
                          <span style={{ color: accent, fontWeight: 700 }}>{l.unidades} uds</span>
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid var(--border)', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-muted)' }}>
                          Total: <span style={{ color: 'var(--text)' }}>{sc.totalUnidades} uds</span>
                        </div>
                        <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', color: '#25d366', letterSpacing: '1px' }}>
                          {COP(sc.totalGanancia)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Toast (local) */}
      <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', pointerEvents: 'none' }}>
        {toasts.map((t) => (
          <div key={t.id} style={{ background: t.type === 'success' ? '#1a2e1a' : '#2e1a1a', border: `1px solid ${t.type === 'success' ? '#25d366' : '#e55'}`, color: t.type === 'success' ? '#25d366' : '#e55', fontFamily: '"DM Mono", monospace', fontSize: '13px', padding: '10px 20px', whiteSpace: 'nowrap', animation: 'fadeIn 0.2s ease' }}>
            {t.type === 'success' ? '✓' : '✕'} {t.message}
          </div>
        ))}
      </div>
    </div>
  );
}
