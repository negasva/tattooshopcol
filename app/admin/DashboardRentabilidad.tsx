'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabase, Product } from '../lib/supabase';
import {
  computeOps, buildProductMetrics, buildSimScenarios,
  currentMonthKey, monthOptions, COP,
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
function KpiCard({ label, value, sub, color, dim }: { label: string; value: string; sub?: string; color?: string; dim?: boolean }) {
  return (
    <div style={{ background: dim ? 'var(--surface)' : 'var(--bg)', border: `1px solid ${color ? color + '44' : 'var(--border)'}`, padding: '16px 20px', flex: '1 1 160px', minWidth: '140px' }}>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1.5px', marginBottom: '8px', fontFamily: '"DM Mono", monospace' }}>{label}</div>
      <div style={{ fontSize: '24px', fontFamily: '"Bebas Neue", sans-serif', color: color || 'var(--text)', letterSpacing: '1px', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: '10px', marginTop: '5px', fontFamily: '"DM Mono", monospace', color: color || 'var(--text-muted)' }}>{sub}</div>}
    </div>
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

function SortTh({ label, field, current, dir, onClick }: { label: string; field: string; current: string; dir: 'asc' | 'desc'; onClick: (f: string) => void }) {
  const active = current === field;
  return (
    <th
      onClick={() => onClick(field)}
      style={{ padding: '10px 12px', textAlign: 'left', color: active ? accent : 'var(--text-muted)', fontWeight: 700, letterSpacing: '1px', fontSize: '11px', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }}
    >
      {label}{active ? (dir === 'desc' ? ' ↓' : ' ↑') : ''}
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

  const kitMetrics: ProductMetrics[] = kitsWithCost.map((p) => {
    const unidades = salesData.find((s) => s.product_id === p.id)?.unidades_vendidas ?? 0;
    return buildProductMetrics(p, unidades, cac);
  });
  const otherMetrics: ProductMetrics[] = othersWithCost.map((p) => {
    const unidades = salesData.find((s) => s.product_id === p.id)?.unidades_vendidas ?? 0;
    return buildProductMetrics(p, unidades, null); // no CAC for non-kits
  });
  const allMetrics: ProductMetrics[] = [...kitMetrics, ...otherMetrics];

  const sortedMetrics = [...allMetrics].sort((a, b) => {
    const dir = sortDir === 'desc' ? -1 : 1;
    const field = sortField as keyof ProductMetrics;
    const av = a[field] ?? -Infinity;
    const bv = b[field] ?? -Infinity;
    if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
    return 0;
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

  // Alerts only for kits (CAC-based alerts don't apply to insumos/máquinas)
  const alertas = kitMetrics.filter((m) => m.alerta === 'perdida' || m.alerta === 'riesgo' || m.alerta === 'estrella');

  // Simulator scenarios
  const scenarios = buildSimScenarios(allMetrics, simTarget);

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
          value={cac !== null ? COP(cac) : '— Sin datos'}
          sub={cac !== null ? `${totalVentasKits} kits vendidos · ${COP(performance?.gasto_meta ?? 0)} en Meta` : 'Registra Meta Ads y ventas de kits'}
          color={cac !== null ? (cac < 80000 ? '#25d366' : cac < 120000 ? '#FFD400' : '#e55') : undefined}
        />
        <KpiCard
          label="KITS VENDIDOS"
          value={totalVentasKits > 0 ? `${totalVentasKits} uds` : '— Sin datos'}
          sub={totalVentasKits > 0 ? `${selectedMonthLabel}${totalVentas !== totalVentasKits ? ` · +${totalVentas - totalVentasKits} insumos/máq.` : ''}` : 'Registra ventas de kits'}
          color={totalVentasKits > 0 ? accent : undefined}
        />
        <KpiCard
          label="GANANCIA NETA KITS"
          value={totalGananciaKits !== 0 ? COP(totalGananciaKits) : '— Sin datos'}
          sub={totalGananciaKits > 0 ? '✓ Kits (con CAC)' : totalGananciaKits < 0 ? '✕ Pérdida neta' : 'Requiere ventas + CAC'}
          color={totalGananciaKits > 0 ? '#25d366' : totalGananciaKits < 0 ? '#e55' : undefined}
        />
        <KpiCard
          label="KIT ESTRELLA"
          value={kitEstrella?.roi !== null && kitEstrella?.roi !== undefined ? kitEstrella.product.name.split(' ').slice(0, 2).join(' ') : '— Sin CAC'}
          sub={kitEstrella?.roi !== null && kitEstrella?.roi !== undefined ? `ROI ${kitEstrella.roi.toFixed(0)}%` : 'Registra datos para ver ranking'}
          color={kitEstrella?.alerta === 'estrella' ? '#25d366' : undefined}
        />
        <KpiCard
          label="LEADS META"
          value={performance?.leads ? String(performance.leads) : '— Sin datos'}
          sub={performance && totalVentasKits > 0 ? `Conv. kits ${((totalVentasKits / performance.leads) * 100).toFixed(1)}%` : 'Registra Meta Ads'}
          dim
        />
      </div>
      <div style={{ marginBottom: '20px', fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
        El CAC se calcula solo sobre ventas de <strong style={{ color: accent }}>Kits</strong>. Insumos y Máquinas muestran margen sin impacto publicitario.
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginBottom: '16px' }}>
                  {productsWithCost.map((p) => (
                    <div key={p.id}>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px', fontFamily: '"DM Mono", monospace' }}>
                        {p.name.toUpperCase()}
                      </label>
                      <input
                        type="number" min="0"
                        value={salesForm[p.id] ?? 0}
                        onChange={(e) => setSalesForm({ ...salesForm, [p.id]: Number(e.target.value) })}
                        style={{ ...inputStyle }}
                        placeholder="0"
                      />
                    </div>
                  ))}
                </div>
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

      {/* ── Metrics table ─────────────────────────────────────────────────── */}
      {productsWithCost.length > 0 && (
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '12px', fontFamily: '"DM Mono", monospace' }}>
            MÉTRICAS POR KIT — {selectedMonthLabel.toUpperCase()}
            {cac === null && <span style={{ color: '#FFD400', marginLeft: '12px' }}>· CAC sin datos: registra Meta Ads y ventas para ver rentabilidad real</span>}
          </div>
          <div style={{ overflowX: 'auto', border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"DM Mono", monospace', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: `2px solid ${accent}33`, background: 'var(--surface2)' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: accent, fontWeight: 700, letterSpacing: '1px', fontSize: '11px', whiteSpace: 'nowrap' }}>Kit</th>
                  <SortTh label="Precio" field="ops.gNeta" current={sortField} dir={sortDir} onClick={handleSort} />
                  <SortTh label="G. Neta/u" field="ops.gNeta" current={sortField} dir={sortDir} onClick={handleSort} />
                  <SortTh label="CAC" field="cac" current={sortField} dir={sortDir} onClick={handleSort} />
                  <SortTh label="Rent. real/u" field="rentabilidadReal" current={sortField} dir={sortDir} onClick={handleSort} />
                  <SortTh label="ROI %" field="roi" current={sortField} dir={sortDir} onClick={handleSort} />
                  <SortTh label="P. Equilibrio" field="puntoEquilibrio" current={sortField} dir={sortDir} onClick={handleSort} />
                  <SortTh label="Unidades" field="unidades" current={sortField} dir={sortDir} onClick={handleSort} />
                  <SortTh label="Ganancia acum." field="gananciaAcumulada" current={sortField} dir={sortDir} onClick={handleSort} />
                  <th style={{ padding: '10px 12px', textAlign: 'left', color: accent, fontWeight: 700, letterSpacing: '1px', fontSize: '11px', whiteSpace: 'nowrap' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {sortedMetrics.map((m, i) => (
                  <tr key={m.product.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 600 }}>{m.product.name}</td>
                    <td style={{ padding: '10px 12px', color: accent, fontWeight: 700 }}>{COP(m.product.price)}</td>
                    <td style={{ padding: '10px 12px', color: m.ops.colorGN }}>{COP(m.ops.gNeta)}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{cac !== null ? COP(cac) : '—'}</td>
                    <td style={{ padding: '10px 12px', color: m.rentabilidadReal !== null ? (m.rentabilidadReal >= 0 ? '#25d366' : '#e55') : 'var(--text-muted)', fontWeight: 700 }}>
                      {m.rentabilidadReal !== null ? COP(m.rentabilidadReal) : '—'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {m.roi !== null ? (
                        <span style={{ color: m.roi > 100 ? '#25d366' : m.roi > 50 ? '#FFD400' : '#e55', fontWeight: 700 }}>
                          {m.roi.toFixed(0)}%
                          <MiniBar value={m.roi} max={Math.max(maxROI, 100)} color={m.roi > 100 ? '#25d366' : m.roi > 50 ? '#FFD400' : '#e55'} />
                        </span>
                      ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                      {m.puntoEquilibrio !== null ? `${m.puntoEquilibrio} uds` : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', color: m.unidades > 0 ? 'var(--text)' : 'var(--text-muted)' }}>
                      {m.unidades > 0 ? `${m.unidades} uds` : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', color: m.gananciaAcumulada !== null ? (m.gananciaAcumulada >= 0 ? '#25d366' : '#e55') : 'var(--text-muted)', fontWeight: 700 }}>
                      {m.gananciaAcumulada !== null ? COP(m.gananciaAcumulada) : '—'}
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

      {/* ── ROI ranking (kits only) ───────────────────────────────────────── */}
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

      {/* ── Simulator ─────────────────────────────────────────────────────── */}
      <div style={{ marginBottom: '8px' }}>
        <SectionToggle
          label="🎯 SIMULADOR — ¿CUÁNTO QUIERO GANAR?"
          open={showSimulator}
          onToggle={() => setShowSimulator(!showSimulator)}
        />
        {showSimulator && (
          <div style={{ border: '1px solid var(--border)', borderTop: 'none', padding: '20px', background: 'var(--bg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text-muted)' }}>Quiero ganar</span>
              <input
                type="number" min="100000" step="100000" value={simTarget}
                onChange={(e) => setSimTarget(Number(e.target.value))}
                style={{ ...inputStyle, width: '180px' }}
              />
              <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text-muted)' }}>en {selectedMonthLabel}</span>
              {cac === null && (
                <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: '#FFD400' }}>
                  ⚠ Registra Meta Ads y ventas para ver rentabilidad real por unidad
                </span>
              )}
            </div>

            {scenarios.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace', fontSize: '12px', padding: '20px', textAlign: 'center', border: '1px solid var(--border)' }}>
                {cac === null
                  ? 'Registra los datos de Meta Ads y ventas del mes para usar el simulador.'
                  : 'Ningún kit es rentable con el CAC actual. Revisa los costos o el gasto en Meta.'}
              </div>
            ) : (
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
                        <span style={{ color: 'var(--text)' }}>{l.productName.split(' ').slice(0, 2).join(' ')}</span>
                        <span style={{ color: accent, fontWeight: 700 }}>{l.unidades} uds</span>
                      </div>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border)', marginTop: '10px', paddingTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
                      <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-muted)' }}>
                        Total: <span style={{ color: 'var(--text)' }}>{sc.totalUnidades} unidades</span>
                      </div>
                      <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', color: '#25d366', letterSpacing: '1px' }}>
                        {COP(sc.totalGanancia)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
