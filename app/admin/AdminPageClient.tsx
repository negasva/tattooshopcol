'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabase, Product } from '../lib/supabase';

const accent = '#FFD400';
const COP = (n: number) => `$${Math.round(n).toLocaleString('es-CO')}`;

// ─── Operational metrics helper ───────────────────────────────────────────────
interface OpsMetrics {
  gBruta: number; gBrutaPct: number;
  gNeta: number; gNetaPct: number;
  costoTotal: number; puntoEquilibrio: number;
  impactoDev: number; impactoEnvio: number;
  ratioGNvsGB: number; colorGN: string; label: string;
}

function computeOps(price: number, costo: number, cEnvio: number, tDevPct: number, cDev: number): OpsMetrics {
  const tDev = tDevPct / 100;
  const gBruta = price - costo;
  const gNeta = gBruta * (1 - tDev) - cEnvio - cDev * tDev;
  const costoTotal = costo + cEnvio;
  const gBrutaPct = price > 0 ? (gBruta / price) * 100 : 0;
  const gNetaPct = price > 0 ? (gNeta / price) * 100 : 0;
  const ratioGNvsGB = gBruta > 0 ? (gNeta / gBruta) * 100 : 0;
  const colorGN = ratioGNvsGB > 60 ? '#25d366' : ratioGNvsGB >= 30 ? '#FFD400' : '#e55';
  const label = ratioGNvsGB > 60 ? 'BUENO' : ratioGNvsGB >= 30 ? 'MEDIO' : 'BAJO';
  return {
    gBruta, gBrutaPct, gNeta, gNetaPct,
    costoTotal, puntoEquilibrio: costoTotal,
    impactoDev: gBruta * tDev + cDev * tDev,
    impactoEnvio: cEnvio,
    ratioGNvsGB, colorGN, label,
  };
}

// ─── Toast ────────────────────────────────────────────────────────────────────
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

function ToastContainer({ toasts }: { toasts: Toast[] }) {
  return (
    <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', pointerEvents: 'none' }}>
      {toasts.map((t) => (
        <div key={t.id} style={{
          background: t.type === 'success' ? '#1a2e1a' : '#2e1a1a',
          border: `1px solid ${t.type === 'success' ? '#25d366' : '#e55'}`,
          color: t.type === 'success' ? '#25d366' : '#e55',
          fontFamily: '"DM Mono", monospace', fontSize: '13px', letterSpacing: '0.5px',
          padding: '10px 20px', whiteSpace: 'nowrap', animation: 'fadeIn 0.2s ease',
        }}>
          {t.type === 'success' ? '✓' : '✕'} {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Inline editable cell ─────────────────────────────────────────────────────
function EditableCell({ value, field, type = 'text', options, onSave, accent: a }: {
  value: string | number; field: string; type?: string;
  options?: string[]; onSave: (field: string, value: string | number) => void; accent: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => { onSave(field, draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg)', border: `1px solid ${a}`, color: 'var(--text)',
    fontFamily: '"DM Mono", monospace', fontSize: '12px', padding: '4px 8px',
    width: type === 'number' ? '90px' : '140px', outline: 'none',
  };

  if (editing) {
    return (
      <span style={{ display: 'inline-flex', gap: '4px', alignItems: 'center' }}>
        {options ? (
          <select value={String(draft)} onChange={(e) => setDraft(e.target.value)} style={inputStyle} autoFocus>
            {options.map((o) => <option key={o}>{o}</option>)}
          </select>
        ) : (
          <input
            type={type} value={draft} autoFocus
            onChange={(e) => setDraft(type === 'number' ? Number(e.target.value) : e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') cancel(); }}
            style={inputStyle}
          />
        )}
        <button onClick={commit} style={{ background: a, color: '#111', border: 'none', padding: '3px 7px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>✓</button>
        <button onClick={cancel} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '3px 7px', cursor: 'pointer', fontSize: '11px' }}>✕</button>
      </span>
    );
  }

  return (
    <span
      onClick={() => { setDraft(value); setEditing(true); }}
      title="Clic para editar"
      style={{ cursor: 'text', borderBottom: '1px dashed var(--border)', paddingBottom: '1px', transition: 'border-color 0.2s' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.borderBottomColor = a; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.borderBottomColor = 'var(--border)'; }}
    >
      {value === '' || value === 0 || value === null || value === undefined
        ? <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>
        : String(value)}
    </span>
  );
}

// ─── Margin badge ─────────────────────────────────────────────────────────────
function MarginBadge({ price, costo }: { price: number; costo?: number }) {
  if (!costo || costo <= 0 || price <= 0) {
    return <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '11px' }}>—</span>;
  }
  const pct = ((price - costo) / price) * 100;
  const color = pct >= 50 ? '#25d366' : pct >= 30 ? '#FFD400' : '#e55';
  return <span style={{ color, fontWeight: 700, fontFamily: '"DM Mono", monospace', fontSize: '12px' }}>{pct.toFixed(1)}%</span>;
}

// ─── CSS bar chart ────────────────────────────────────────────────────────────
function BarChart({ items }: { items: { label: string; price: number; costo: number; gNeta: number; colorGN: string }[] }) {
  const maxVal = Math.max(...items.map((i) => i.price));
  const barStyle = (pct: number, color: string): React.CSSProperties => ({
    height: '14px', width: `${Math.max((pct / maxVal) * 100, 0)}%`,
    background: color, transition: 'width 0.4s ease', minWidth: pct > 0 ? '2px' : '0',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {items.map((item) => (
        <div key={item.label}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontFamily: '"DM Mono", monospace', letterSpacing: '0.5px' }}>
            {item.label}
          </div>
          {[
            { label: 'Precio  ', val: item.price, color: accent },
            { label: 'Costo   ', val: item.costo, color: '#e55' },
            { label: 'G. Neta ', val: Math.max(item.gNeta, 0), color: item.colorGN },
          ].map(({ label: l, val, color }) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
              <div style={{ width: '56px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace', flexShrink: 0 }}>{l}</div>
              <div style={{ flex: 1, background: 'var(--surface2)', height: '14px', overflow: 'hidden' }}>
                <div style={barStyle(val, color)} />
              </div>
              <div style={{ width: '88px', fontSize: '10px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color, flexShrink: 0 }}>{COP(val)}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Category Table ───────────────────────────────────────────────────────────
const CATEGORIES = ['Kits', 'Máquinas', 'Insumos'];

function CategoryTable({ category, products, onSaveField, onEdit, onDelete }: {
  category: string; products: Product[];
  onSaveField: (id: string, field: string, value: string | number) => Promise<void>;
  onEdit: (p: Product) => void; onDelete: (id: string, name: string) => void;
}) {
  if (products.length === 0) return null;

  return (
    <div style={{ marginBottom: '40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '22px', color: accent, margin: 0, letterSpacing: '2px' }}>
          {category.toUpperCase()}
        </h2>
        <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)', padding: '2px 8px' }}>
          {products.length} producto{products.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div style={{ overflowX: 'auto', background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"DM Mono", monospace', fontSize: '12px' }}>
          <thead>
            <tr style={{ borderBottom: `2px solid ${accent}33`, background: 'var(--surface2)' }}>
              {['Imagen', 'Nombre', 'Precio Original', 'Precio Final', 'Descuento %', 'Inventario', 'Etiqueta', 'Nivel', 'Tipo', 'Complejidad', 'Costo', 'Margen %', 'G. Neta', 'Acciones'].map((h) => (
                <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Acciones' ? 'center' : 'left', color: accent, fontWeight: 700, letterSpacing: '1px', fontSize: '11px', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => {
              const ops = (p.costo && p.costo > 0)
                ? computeOps(p.price, p.costo, p.costo_envio || 40000, p.tasa_devolucion || 25, p.costo_devolucion || 36000)
                : null;

              return (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '10px 12px' }}>
                    {p.image_url
                      ? <img src={p.image_url} alt={p.name} style={{ width: '44px', height: '44px', objectFit: 'cover' }} />
                      : <div style={{ width: '44px', height: '44px', background: 'var(--surface2)' }} />}
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text)', maxWidth: '200px' }}>
                    <EditableCell value={p.name} field="name" onSave={(f, v) => onSaveField(p.id, f, v)} accent={accent} />
                  </td>
                  <td style={{ padding: '10px 12px', color: p.original_price ? accent : 'var(--text-muted)' }}>
                    <EditableCell value={p.original_price ?? 0} field="original_price" type="number" onSave={(f, v) => onSaveField(p.id, f, v)} accent={accent} />
                  </td>
                  <td style={{ padding: '10px 12px', color: accent, fontWeight: 700 }}>
                    <EditableCell value={p.price} field="price" type="number" onSave={(f, v) => onSaveField(p.id, f, v)} accent={accent} />
                  </td>
                  <td style={{ padding: '10px 12px', color: p.discount_percentage && p.discount_percentage > 0 ? '#e55' : 'var(--text-muted)' }}>
                    <EditableCell value={p.discount_percentage ?? 0} field="discount_percentage" type="number" onSave={(f, v) => onSaveField(p.id, f, v)} accent={accent} />
                  </td>
                  <td style={{ padding: '10px 12px', color: (p.inventory ?? 0) > 0 ? 'var(--text)' : '#e55', fontWeight: (p.inventory ?? 0) === 0 ? 700 : 400 }}>
                    <EditableCell value={p.inventory ?? 0} field="inventory" type="number" onSave={(f, v) => onSaveField(p.id, f, v)} accent={accent} />
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                    <EditableCell value={p.tag ?? ''} field="tag" onSave={(f, v) => onSaveField(p.id, f, v)} accent={accent} />
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <EditableCell value={p.nivel_recomendado ?? ''} field="nivel_recomendado" options={['', 'principiante', 'intermedio', 'profesional']} onSave={(f, v) => onSaveField(p.id, f, v)} accent={accent} />
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <EditableCell value={p.tipo_uso ?? ''} field="tipo_uso" options={['', 'liner', 'shader', 'ambos', 'colorear']} onSave={(f, v) => onSaveField(p.id, f, v)} accent={accent} />
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <EditableCell value={p.complejidad_uso ?? ''} field="complejidad_uso" type="number" onSave={(f, v) => onSaveField(p.id, f, v)} accent={accent} />
                  </td>
                  <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>
                    <EditableCell value={p.costo ?? 0} field="costo" type="number" onSave={(f, v) => onSaveField(p.id, f, v)} accent={accent} />
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <MarginBadge price={p.price} costo={p.costo} />
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    {ops ? (
                      <span style={{ color: ops.colorGN, fontWeight: 700, fontSize: '12px' }}>
                        {COP(ops.gNeta)}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', fontSize: '11px' }}>—</span>
                    )}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <button onClick={() => onEdit(p)} style={{ marginRight: '6px', padding: '5px 10px', background: 'transparent', color: accent, border: `1px solid ${accent}33`, cursor: 'pointer', fontSize: '11px', fontFamily: '"DM Mono", monospace' }}>
                      Editar
                    </button>
                    <button onClick={() => onDelete(p.id, p.name)} style={{ padding: '5px 10px', background: 'transparent', color: '#e55', border: '1px solid #e5533344', cursor: 'pointer', fontSize: '11px', fontFamily: '"DM Mono", monospace' }}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Empty form state ─────────────────────────────────────────────────────────
const emptyForm = {
  name: '', category: 'Kits', price: 0, original_price: 0,
  discount_percentage: 0, image_url: '', specs: '', tag: '', inventory: 0,
  costo: 0, margen_deseado: 0,
  costo_envio: 40000, tasa_devolucion: 25, costo_devolucion: 36000,
};

// ─── Stat box ─────────────────────────────────────────────────────────────────
function StatBox({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '14px 16px' }}>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1.5px', marginBottom: '6px', fontFamily: '"DM Mono", monospace' }}>{label}</div>
      <div style={{ fontSize: '20px', fontFamily: '"Bebas Neue", sans-serif', color: color || 'var(--text)', letterSpacing: '1px' }}>{value}</div>
      {sub && <div style={{ fontSize: '10px', marginTop: '3px', fontFamily: '"DM Mono", monospace', color: color || 'var(--text-muted)' }}>{sub}</div>}
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: '8px 16px', border: 'none', cursor: 'pointer',
        fontFamily: '"DM Mono", monospace', fontSize: '11px', letterSpacing: '1px',
        background: active ? accent : 'var(--surface2)',
        color: active ? '#111' : 'var(--text-muted)',
        fontWeight: active ? 700 : 400,
        borderBottom: active ? `2px solid ${accent}` : '2px solid transparent',
      }}
    >
      {children}
    </button>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminPageClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [finTab, setFinTab] = useState<'basico' | 'operativo'>('basico');
  const [simUnidades, setSimUnidades] = useState(10);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const { toasts, show: showToast } = useToast();
  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

  useEffect(() => {
    if (authenticated) { fetch('/api/migrate').catch(() => {}); loadProducts(); }
  }, [authenticated]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await getSupabase().from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch { showToast('Error cargando productos', 'error'); }
    finally { setLoading(false); }
  };

  const handleSaveField = async (id: string, field: string, value: string | number) => {
    try {
      const { error } = await getSupabase().from('products').update({ [field]: value || null, updated_at: new Date().toISOString() }).eq('id', id);
      if (error) throw error;
      setProducts((prev) => prev.map((p) => p.id === id ? { ...p, [field]: value } : p));
      showToast('Guardado');
    } catch { showToast('Error guardando', 'error'); }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) { setAuthenticated(true); setPassword(''); }
    else showToast('Contraseña incorrecta', 'error');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.costo > 0 && formData.price > 0 && formData.costo >= formData.price) {
      showToast('El costo no puede ser mayor o igual al precio de venta', 'error'); return;
    }
    if (formData.margen_deseado < 0) {
      showToast('El margen deseado no puede ser negativo', 'error'); return;
    }
    if (formData.tasa_devolucion < 0 || formData.tasa_devolucion > 100) {
      showToast('La tasa de devolución debe estar entre 0 y 100', 'error'); return;
    }
    if (formData.costo_envio < 0) {
      showToast('El costo de envío debe ser positivo', 'error'); return;
    }

    try {
      const sb = getSupabase();
      const data = {
        ...formData,
        discount_percentage: formData.discount_percentage > 0 ? formData.discount_percentage : null,
        original_price: formData.original_price > 0 ? formData.original_price : null,
        costo: formData.costo > 0 ? formData.costo : null,
        margen_deseado: formData.margen_deseado > 0 ? formData.margen_deseado : null,
        updated_at: new Date().toISOString(),
      };
      if (editingId) {
        const { error } = await sb.from('products').update(data).eq('id', editingId);
        if (error) throw error;
        showToast('Producto actualizado');
        setEditingId(null);
      } else {
        const { error } = await sb.from('products').insert([{ ...data, created_at: new Date().toISOString() }]);
        if (error) throw error;
        showToast('Producto agregado');
      }
      setFormData(emptyForm);
      setFormOpen(false);
      loadProducts();
    } catch { showToast('Error guardando producto', 'error'); }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      const { error } = await getSupabase().from('products').delete().eq('id', deletingId);
      if (error) throw error;
      setProducts((prev) => prev.filter((p) => p.id !== deletingId));
      showToast('Producto eliminado');
    } catch { showToast('Error eliminando', 'error'); }
    finally { setDeletingId(null); }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name, category: product.category, price: product.price,
      original_price: product.original_price || 0, discount_percentage: product.discount_percentage || 0,
      image_url: product.image_url || '', specs: product.specs, tag: product.tag, inventory: product.inventory,
      costo: product.costo || 0, margen_deseado: product.margen_deseado || 0,
      costo_envio: product.costo_envio ?? 40000,
      tasa_devolucion: product.tasa_devolucion ?? 25,
      costo_devolucion: product.costo_devolucion ?? 36000,
    });
    setEditingId(product.id);
    setFormOpen(true);
    setFinTab('basico');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);
      const sb = getSupabase();
      const filePath = `products/${Date.now()}.${file.name.split('.').pop()}`;
      const { error: uploadError } = await sb.storage.from('product-images').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = sb.storage.from('product-images').getPublicUrl(filePath);
      setFormData((prev) => ({ ...prev, image_url: publicUrl }));
      showToast('Imagen subida');
    } catch { showToast('Error subiendo imagen', 'error'); }
    finally { setUploading(false); }
  };

  const downloadCSV = () => {
    const withCost = products.filter((p) => p.costo && p.costo > 0);
    if (withCost.length === 0) { showToast('No hay productos con costo definido', 'error'); return; }
    const headers = ['Nombre', 'Categoría', 'Precio', 'Costo', 'Envío', 'Tasa Dev%', 'Costo Dev', 'G.Bruta', 'G.Bruta%', 'G.Neta', 'G.Neta%', 'Estado'];
    const rows = withCost.map((p) => {
      const ops = computeOps(p.price, p.costo!, p.costo_envio || 40000, p.tasa_devolucion || 25, p.costo_devolucion || 36000);
      return [
        `"${p.name}"`, p.category, p.price, p.costo,
        p.costo_envio || 40000, p.tasa_devolucion || 25, p.costo_devolucion || 36000,
        Math.round(ops.gBruta), ops.gBrutaPct.toFixed(1),
        Math.round(ops.gNeta), ops.gNetaPct.toFixed(1), ops.label,
      ];
    });
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analisis-tattooshop-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV descargado');
  };

  // ── Fase 1 — margin calcs ───────────────────────────────────────────────────
  const margenPesos = formData.price > 0 && formData.costo > 0 ? formData.price - formData.costo : 0;
  const margenPctReal = formData.price > 0 && formData.costo > 0 ? (margenPesos / formData.price) * 100 : 0;
  const margenOk = formData.margen_deseado > 0 ? margenPctReal >= formData.margen_deseado : true;
  const margenColor = margenPctReal >= 50 ? '#25d366' : margenPctReal >= 30 ? '#FFD400' : '#e55';
  const showFinancialCalcs = formData.price > 0 && formData.costo > 0;
  const costoMayorPrecio = formData.costo > 0 && formData.price > 0 && formData.costo >= formData.price;

  // ── Fase 2 — operational calcs ──────────────────────────────────────────────
  const ops = showFinancialCalcs
    ? computeOps(formData.price, formData.costo, formData.costo_envio, formData.tasa_devolucion, formData.costo_devolucion)
    : null;
  const gnBajaVsGB = ops ? ops.gNeta < ops.gBruta * 0.5 : false;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px', border: '1px solid var(--border)',
    background: 'var(--bg)', color: 'var(--text)', fontFamily: '"DM Mono", monospace',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block', marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1.5px',
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  if (!authenticated) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '40px', maxWidth: '380px', width: '100%' }}>
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '36px', marginBottom: '28px', color: accent }}>ADMIN</h1>
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Contraseña" style={inputStyle} />
            <button type="submit" style={{ padding: '12px', background: accent, color: '#111', border: 'none', fontFamily: '"Bebas Neue", sans-serif', fontSize: '20px', cursor: 'pointer', letterSpacing: '1.5px' }}>
              INGRESAR
            </button>
          </form>
        </div>
        <ToastContainer toasts={toasts} />
      </div>
    );
  }

  const productsByCategory = CATEGORIES.map((cat) => ({ category: cat, products: products.filter((p) => p.category === cat) }));
  const uncategorized = products.filter((p) => !CATEGORIES.includes(p.category));
  const deletingProduct = products.find((p) => p.id === deletingId);

  // Products with cost data for global analysis
  const productsWithCost = products.filter((p) => p.costo && p.costo > 0);
  const chartItems = productsWithCost.slice(0, 6).map((p) => {
    const o = computeOps(p.price, p.costo!, p.costo_envio || 40000, p.tasa_devolucion || 25, p.costo_devolucion || 36000);
    return { label: p.name, price: p.price, costo: p.costo!, gNeta: o.gNeta, colorGN: o.colorGN };
  });

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px clamp(16px,4vw,40px)', color: 'var(--text)' }}>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }`}</style>

      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '48px', color: accent, margin: 0 }}>PANEL ADMIN</h1>
          <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)' }}>{products.length} productos en total</span>
        </div>

        {/* ── FORM TOGGLE ─────────────────────────────────────────────────── */}
        <div style={{ marginBottom: '40px' }}>
          <button
            onClick={() => { setFormOpen(!formOpen); if (formOpen && editingId) { setEditingId(null); setFormData(emptyForm); } }}
            style={{ width: '100%', padding: '14px 20px', background: formOpen && !editingId ? 'var(--surface)' : accent, color: formOpen && !editingId ? 'var(--text)' : '#111', border: `1px solid ${accent}`, fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', cursor: 'pointer', letterSpacing: '1.5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>{editingId ? '✏ EDITANDO PRODUCTO' : '+ AGREGAR PRODUCTO'}</span>
            <span>{formOpen ? '−' : '+'}</span>
          </button>

          {formOpen && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: 'none', padding: '24px' }}>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Basic fields */}
                <div>
                  <label style={labelStyle}>NOMBRE</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>CATEGORÍA</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={inputStyle}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>PRECIO ORIGINAL</label>
                  <input type="number" value={formData.original_price} onChange={(e) => setFormData({ ...formData, original_price: Number(e.target.value) })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>PRECIO FINAL</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>DESCUENTO %</label>
                  <input type="number" min="0" max="100" value={formData.discount_percentage} onChange={(e) => setFormData({ ...formData, discount_percentage: Number(e.target.value) })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>INVENTARIO</label>
                  <input type="number" value={formData.inventory} onChange={(e) => setFormData({ ...formData, inventory: Number(e.target.value) })} required style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>ETIQUETA</label>
                  <input type="text" placeholder="ej: BESTSELLER" value={formData.tag} onChange={(e) => setFormData({ ...formData, tag: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>IMAGEN</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="file" accept="image/*" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} style={{ ...inputStyle, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.5 : 1 }} />
                    {formData.image_url && <img src={formData.image_url} alt="" style={{ width: '44px', height: '44px', objectFit: 'cover', flexShrink: 0 }} />}
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>ESPECIFICACIONES</label>
                  <textarea value={formData.specs} onChange={(e) => setFormData({ ...formData, specs: e.target.value })} rows={6} placeholder="Una línea por ítem..." style={{ ...inputStyle, resize: 'vertical', fontFamily: '"DM Mono", monospace', lineHeight: 1.6 }} />
                </div>

                {/* ── FINANCIAL SECTION WITH TABS ─────────────────────────── */}
                <div style={{ gridColumn: '1 / -1', borderTop: `1px solid ${accent}33`, paddingTop: '20px', marginTop: '4px' }}>
                  <div style={{ fontSize: '11px', color: accent, letterSpacing: '2px', marginBottom: '14px', fontFamily: '"DM Mono", monospace', fontWeight: 700 }}>
                    ─── INFORMACIÓN FINANCIERA (solo admin)
                  </div>

                  {/* Tab bar */}
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '0' }}>
                    <TabBtn active={finTab === 'basico'} onClick={() => setFinTab('basico')}>FINANCIERO BÁSICO</TabBtn>
                    <TabBtn active={finTab === 'operativo'} onClick={() => setFinTab('operativo')}>ANÁLISIS OPERATIVO</TabBtn>
                  </div>

                  {/* ── TAB 1: BÁSICO (Phase 1) ─────────────────────────── */}
                  {finTab === 'basico' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={labelStyle}>COSTO (COP)</label>
                          <input
                            type="number" min="0" value={formData.costo}
                            onChange={(e) => setFormData({ ...formData, costo: Number(e.target.value) })}
                            style={{ ...inputStyle, borderColor: costoMayorPrecio ? '#e55' : 'var(--border)' }}
                          />
                          {costoMayorPrecio && (
                            <div style={{ marginTop: '4px', color: '#e55', fontSize: '11px', fontFamily: '"DM Mono", monospace' }}>
                              ✕ El costo no puede ser mayor o igual al precio
                            </div>
                          )}
                        </div>
                        <div>
                          <label style={labelStyle}>MARGEN % DESEADO</label>
                          <input type="number" min="0" max="100" value={formData.margen_deseado} onChange={(e) => setFormData({ ...formData, margen_deseado: Number(e.target.value) })} style={inputStyle} />
                        </div>
                      </div>

                      {showFinancialCalcs && (
                        <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                          <StatBox label="MARGEN $" value={COP(margenPesos)} color={margenPesos >= 0 ? 'var(--text)' : '#e55'} />
                          <StatBox label="MARGEN % REAL" value={`${margenPctReal.toFixed(1)}%`} sub={margenPctReal >= 50 ? '● Alto' : margenPctReal >= 30 ? '● Medio' : '● Bajo'} color={margenColor} />
                          <StatBox
                            label="OBJETIVO"
                            value={formData.margen_deseado > 0 ? (margenOk ? '✓ OK' : `⚠ Falta ${(formData.margen_deseado - margenPctReal).toFixed(1)}%`) : '— Sin obj.'}
                            color={margenOk ? '#25d366' : '#FFD400'}
                          />
                        </div>
                      )}
                    </>
                  )}

                  {/* ── TAB 2: OPERATIVO (Phase 2) ──────────────────────── */}
                  {finTab === 'operativo' && (
                    <>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        <div>
                          <label style={labelStyle}>COSTO ENVÍO (COP)</label>
                          <input type="number" min="0" value={formData.costo_envio} onChange={(e) => setFormData({ ...formData, costo_envio: Number(e.target.value) })} style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>TASA DEVOLUCIÓN %</label>
                          <input type="number" min="0" max="100" value={formData.tasa_devolucion} onChange={(e) => setFormData({ ...formData, tasa_devolucion: Number(e.target.value) })} style={inputStyle} />
                        </div>
                        <div>
                          <label style={labelStyle}>COSTO DEVOLUCIÓN (COP)</label>
                          <input type="number" min="0" value={formData.costo_devolucion} onChange={(e) => setFormData({ ...formData, costo_devolucion: Number(e.target.value) })} style={inputStyle} />
                        </div>
                      </div>

                      {ops ? (
                        <>
                          {gnBajaVsGB && (
                            <div style={{ marginTop: '12px', padding: '10px 14px', background: '#2e1a0a', border: '1px solid #e55', color: '#e55', fontFamily: '"DM Mono", monospace', fontSize: '12px' }}>
                              ⚠ Ganancia neta es menor al 50% de la ganancia bruta. Revisa los costos operativos.
                            </div>
                          )}

                          {/* Metrics grid */}
                          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            <StatBox label="G. BRUTA" value={COP(ops.gBruta)} sub={`${ops.gBrutaPct.toFixed(1)}% del precio`} />
                            <StatBox label="G. NETA ESPERADA" value={COP(ops.gNeta)} sub={`${ops.gNetaPct.toFixed(1)}% del precio`} color={ops.colorGN} />
                            <StatBox label="ESTADO" value={ops.label} color={ops.colorGN} />
                            <StatBox label="COSTO TOTAL OP." value={COP(ops.costoTotal)} sub="Costo + Envío" />
                            <StatBox label="IMPACTO DEVOLUC." value={COP(ops.impactoDev)} sub={`A tasa ${formData.tasa_devolucion}%`} color="#e55" />
                            <StatBox label="IMPACTO ENVÍOS" value={COP(ops.impactoEnvio)} color="#e55" />
                          </div>

                          {/* Comparison: bruta vs neta */}
                          <div style={{ marginTop: '16px', background: 'var(--bg)', border: `1px solid ${accent}22`, padding: '16px 20px' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1.5px', marginBottom: '12px', fontFamily: '"DM Mono", monospace' }}>COMPARACIÓN BRUTA vs NETA</div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
                              <div style={{ width: '80px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace' }}>G. Bruta</div>
                              <div style={{ flex: 1, background: 'var(--surface2)', height: '20px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: '100%', background: '#25d366' }} />
                              </div>
                              <div style={{ width: '80px', fontSize: '11px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: '#25d366' }}>{COP(ops.gBruta)}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <div style={{ width: '80px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace' }}>G. Neta</div>
                              <div style={{ flex: 1, background: 'var(--surface2)', height: '20px', overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${Math.max((ops.gNeta / ops.gBruta) * 100, 0)}%`, background: ops.colorGN, transition: 'width 0.4s ease' }} />
                              </div>
                              <div style={{ width: '80px', fontSize: '11px', textAlign: 'right', fontFamily: '"DM Mono", monospace', color: ops.colorGN }}>{COP(ops.gNeta)}</div>
                            </div>
                          </div>

                          {/* Simulator */}
                          <div style={{ marginTop: '16px', background: 'var(--bg)', border: `1px solid ${accent}22`, padding: '16px 20px' }}>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1.5px', marginBottom: '12px', fontFamily: '"DM Mono", monospace' }}>SIMULADOR DE VENTAS</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace' }}>Si vendo</span>
                                <input
                                  type="number" min="1" value={simUnidades}
                                  onChange={(e) => setSimUnidades(Math.max(1, Number(e.target.value)))}
                                  style={{ ...inputStyle, width: '80px', padding: '6px 10px' }}
                                />
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace' }}>unidades:</span>
                              </div>
                              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                                <div>
                                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace' }}>GANANCIA NETA TOTAL</div>
                                  <div style={{ fontSize: '22px', fontFamily: '"Bebas Neue", sans-serif', color: ops.colorGN, letterSpacing: '1px' }}>
                                    {COP(ops.gNeta * simUnidades)}
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace' }}>INGRESOS BRUTOS</div>
                                  <div style={{ fontSize: '22px', fontFamily: '"Bebas Neue", sans-serif', color: accent, letterSpacing: '1px' }}>
                                    {COP(formData.price * simUnidades)}
                                  </div>
                                </div>
                                <div>
                                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace' }}>DEVOLUCIONES EST.</div>
                                  <div style={{ fontSize: '22px', fontFamily: '"Bebas Neue", sans-serif', color: '#e55', letterSpacing: '1px' }}>
                                    ~{Math.round(simUnidades * formData.tasa_devolucion / 100)} unid.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div style={{ marginTop: '16px', padding: '20px', background: 'var(--bg)', border: '1px solid var(--border)', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>
                          Completa el Costo en la pestaña "Financiero Básico" para ver el análisis operativo.
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Submit */}
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px' }}>
                  <button
                    type="submit"
                    disabled={costoMayorPrecio}
                    style={{ flex: 1, padding: '12px', background: costoMayorPrecio ? 'var(--surface2)' : accent, color: costoMayorPrecio ? 'var(--text-muted)' : '#111', border: 'none', fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', cursor: costoMayorPrecio ? 'not-allowed' : 'pointer', letterSpacing: '1.5px' }}
                  >
                    {editingId ? 'ACTUALIZAR' : 'AGREGAR'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={() => { setEditingId(null); setFormOpen(false); setFormData(emptyForm); }}
                      style={{ padding: '12px 20px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', fontFamily: '"DM Mono", monospace', fontSize: '13px', cursor: 'pointer' }}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>
          )}
        </div>

        {/* HINT */}
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '24px', letterSpacing: '0.5px' }}>
          💡 Haz clic en cualquier celda subrayada para editarla directamente.
        </div>

        {/* TABLES BY CATEGORY */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace' }}>Cargando...</div>
        ) : (
          <>
            {productsByCategory.map(({ category, products: catProducts }) => (
              <CategoryTable key={category} category={category} products={catProducts}
                onSaveField={handleSaveField} onEdit={handleEdit} onDelete={(id, name) => setDeletingId(id)} />
            ))}
            {uncategorized.length > 0 && (
              <CategoryTable category="Otros" products={uncategorized}
                onSaveField={handleSaveField} onEdit={handleEdit} onDelete={(id, name) => setDeletingId(id)} />
            )}
          </>
        )}

        {/* ── ANÁLISIS OPERATIVO GLOBAL ──────────────────────────────────── */}
        <div style={{ marginTop: '40px' }}>
          <button
            onClick={() => setShowAnalysis(!showAnalysis)}
            style={{ width: '100%', padding: '14px 20px', background: showAnalysis ? accent : 'var(--surface)', color: showAnalysis ? '#111' : 'var(--text)', border: `1px solid ${accent}`, fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', cursor: 'pointer', letterSpacing: '1.5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>📊 ANÁLISIS OPERATIVO GLOBAL</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {productsWithCost.length > 0 && (
                <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', background: showAnalysis ? '#11111133' : `${accent}22`, padding: '3px 10px', letterSpacing: '0.5px' }}>
                  {productsWithCost.length} producto{productsWithCost.length !== 1 ? 's' : ''} con costo
                </span>
              )}
              {showAnalysis ? '−' : '+'}
            </span>
          </button>

          {showAnalysis && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: 'none', padding: '24px' }}>
              {productsWithCost.length === 0 ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace', fontSize: '13px' }}>
                  Ningún producto tiene costo definido. Edita un producto y completa el campo "Costo" para ver el análisis.
                </div>
              ) : (
                <>
                  {/* Action bar */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                    <button
                      onClick={downloadCSV}
                      style={{ padding: '9px 18px', background: accent, color: '#111', border: 'none', fontFamily: '"Bebas Neue", sans-serif', fontSize: '15px', cursor: 'pointer', letterSpacing: '1px' }}
                    >
                      ↓ DESCARGAR CSV
                    </button>
                  </div>

                  {/* Metrics table */}
                  <div style={{ overflowX: 'auto', marginBottom: '32px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"DM Mono", monospace', fontSize: '12px' }}>
                      <thead>
                        <tr style={{ borderBottom: `2px solid ${accent}33`, background: 'var(--surface2)' }}>
                          {['Nombre', 'Precio', 'Costo', 'Envío', 'Dev%', 'G. Bruta', 'G. Bruta%', 'G. Neta', 'G. Neta%', 'Estado'].map((h) => (
                            <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: accent, fontWeight: 700, letterSpacing: '1px', fontSize: '11px', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {productsWithCost.map((p, i) => {
                          const o = computeOps(p.price, p.costo!, p.costo_envio || 40000, p.tasa_devolucion || 25, p.costo_devolucion || 36000);
                          return (
                            <tr key={p.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                              <td style={{ padding: '10px 12px', color: 'var(--text)', maxWidth: '200px' }}>{p.name}</td>
                              <td style={{ padding: '10px 12px', color: accent, fontWeight: 700 }}>{COP(p.price)}</td>
                              <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{COP(p.costo!)}</td>
                              <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{COP(p.costo_envio || 40000)}</td>
                              <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{p.tasa_devolucion ?? 25}%</td>
                              <td style={{ padding: '10px 12px' }}>{COP(o.gBruta)}</td>
                              <td style={{ padding: '10px 12px', color: o.gBrutaPct >= 50 ? '#25d366' : o.gBrutaPct >= 30 ? '#FFD400' : '#e55' }}>{o.gBrutaPct.toFixed(1)}%</td>
                              <td style={{ padding: '10px 12px', color: o.colorGN, fontWeight: 700 }}>{COP(o.gNeta)}</td>
                              <td style={{ padding: '10px 12px', color: o.colorGN }}>{o.gNetaPct.toFixed(1)}%</td>
                              <td style={{ padding: '10px 12px' }}>
                                <span style={{ color: o.colorGN, fontWeight: 700, fontSize: '11px', border: `1px solid ${o.colorGN}44`, padding: '2px 8px' }}>{o.label}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Bar chart */}
                  {chartItems.length > 0 && (
                    <div style={{ background: 'var(--bg)', border: `1px solid ${accent}22`, padding: '20px 24px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '20px', fontFamily: '"DM Mono", monospace' }}>
                        COMPARATIVO PRECIO / COSTO / GANANCIA NETA
                      </div>
                      <BarChart items={chartItems} />
                      <div style={{ display: 'flex', gap: '20px', marginTop: '16px', flexWrap: 'wrap' }}>
                        {[{ color: accent, label: 'Precio' }, { color: '#e55', label: 'Costo' }, { color: '#25d366', label: 'Ganancia Neta' }].map(({ color, label }) => (
                          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <div style={{ width: '12px', height: '12px', background: color, flexShrink: 0 }} />
                            {label}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* DELETE CONFIRM MODAL */}
      {deletingId && (
        <div onClick={() => setDeletingId(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface)', border: '1px solid #e55', padding: '28px 32px', maxWidth: '380px', width: '90%' }}>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '22px', color: '#e55', marginBottom: '12px' }}>¿ELIMINAR PRODUCTO?</div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text)', marginBottom: '24px' }}>{deletingProduct?.name}</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '10px', background: '#e55', color: '#fff', border: 'none', fontFamily: '"Bebas Neue", sans-serif', fontSize: '16px', cursor: 'pointer' }}>ELIMINAR</button>
              <button onClick={() => setDeletingId(null)} style={{ flex: 1, padding: '10px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', fontFamily: '"DM Mono", monospace', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} />
    </div>
  );
}
