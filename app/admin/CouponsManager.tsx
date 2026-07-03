'use client';

import { useState, useEffect, useCallback } from 'react';
import { COP } from '../lib/analytics';

const accent = '#FFD400';

export interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order: number | null;
  uses_limit: number | null;
  uses_count: number;
  expires_at: string | null;
  active: boolean;
  kit_only: boolean;
  online_only: boolean;
  created_at: string;
}

const emptyForm = {
  code: '',
  description: '',
  discount_type: 'percent' as 'percent' | 'fixed',
  discount_value: 10,
  min_order: '',
  uses_limit: '',
  expires_at: '',
  kit_only: false,
  online_only: false,
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontFamily: '"DM Mono", monospace', fontSize: '10px',
  letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '6px',
};
const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
  color: 'var(--text)', fontFamily: '"DM Mono", monospace', fontSize: '13px',
  padding: '9px 12px', outline: 'none', boxSizing: 'border-box',
};

export default function CouponsManager({ onToast }: { onToast: (msg: string, type?: 'success' | 'error') => void }) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCoupons(data.coupons || []);
    } catch {
      onToast('Error cargando cupones', 'error');
    } finally {
      setLoading(false);
    }
  }, [onToast]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) { onToast('Ingresa un código', 'error'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code,
          description: form.description || null,
          discount_type: form.discount_type,
          discount_value: Number(form.discount_value),
          min_order: form.min_order === '' ? null : Number(form.min_order),
          uses_limit: form.uses_limit === '' ? null : Number(form.uses_limit),
          expires_at: form.expires_at || null,
          kit_only: form.kit_only,
          online_only: form.online_only,
          active: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCoupons((prev) => [data.coupon, ...prev]);
      setForm(emptyForm);
      onToast(`Cupón ${data.coupon.code} creado`);
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Error creando cupón', 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: Coupon) => {
    // optimista
    setCoupons((prev) => prev.map((x) => x.id === c.id ? { ...x, active: !x.active } : x));
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: c.id, active: !c.active }),
      });
      if (!res.ok) throw new Error();
      onToast(`Cupón ${c.code} ${!c.active ? 'activado' : 'desactivado'}`);
    } catch {
      setCoupons((prev) => prev.map((x) => x.id === c.id ? { ...x, active: c.active } : x));
      onToast('Error actualizando cupón', 'error');
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const id = deletingId;
    setDeletingId(null);
    try {
      const res = await fetch(`/api/admin/coupons?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setCoupons((prev) => prev.filter((x) => x.id !== id));
      onToast('Cupón eliminado');
    } catch {
      onToast('Error eliminando cupón', 'error');
    }
  };

  const fmtDiscount = (c: Coupon) =>
    c.discount_type === 'percent' ? `${c.discount_value}%` : COP(c.discount_value);

  const deletingCoupon = coupons.find((c) => c.id === deletingId);

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: 'none', padding: '24px' }}>
      {/* ── FORM DE CREACIÓN ────────────────────────────────────────────────── */}
      <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div>
          <label style={labelStyle}>CÓDIGO</label>
          <input
            type="text" value={form.code} required
            placeholder="ej: BIENVENIDO10"
            onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>TIPO</label>
          <select
            value={form.discount_type}
            onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'percent' | 'fixed' })}
            style={inputStyle}
          >
            <option value="percent">Porcentaje (%)</option>
            <option value="fixed">Monto fijo (COP)</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>{form.discount_type === 'percent' ? 'DESCUENTO %' : 'DESCUENTO COP'}</label>
          <input
            type="number" min="1" value={form.discount_value} required
            max={form.discount_type === 'percent' ? 100 : undefined}
            onChange={(e) => setForm({ ...form, discount_value: Number(e.target.value) })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>MÍNIMO DE COMPRA (opcional)</label>
          <input
            type="number" min="0" value={form.min_order} placeholder="sin mínimo"
            onChange={(e) => setForm({ ...form, min_order: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>LÍMITE DE USOS (opcional)</label>
          <input
            type="number" min="1" value={form.uses_limit} placeholder="ilimitado"
            onChange={(e) => setForm({ ...form, uses_limit: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>EXPIRA (opcional)</label>
          <input
            type="date" value={form.expires_at}
            onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>DESCRIPCIÓN (visible en el checkout)</label>
          <input
            type="text" value={form.description} maxLength={200}
            placeholder="ej: 10% de descuento en tu primera compra"
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text)', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.kit_only} onChange={(e) => setForm({ ...form, kit_only: e.target.checked })} />
            Solo para Kits
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text)', cursor: 'pointer' }}>
            <input type="checkbox" checked={form.online_only} onChange={(e) => setForm({ ...form, online_only: e.target.checked })} />
            Solo pago online (no contra entrega)
          </label>
          <button
            type="submit" disabled={saving}
            style={{ marginLeft: 'auto', padding: '11px 28px', background: accent, color: '#111', border: 'none', fontFamily: '"Bebas Neue", sans-serif', fontSize: '16px', letterSpacing: '1px', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.6 : 1 }}
          >
            {saving ? 'GUARDANDO...' : '+ CREAR CUPÓN'}
          </button>
        </div>
      </form>

      {/* ── LISTA DE CUPONES ────────────────────────────────────────────────── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace', fontSize: '13px' }}>Cargando cupones...</div>
      ) : coupons.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace', fontSize: '13px' }}>
          No hay cupones todavía. Crea el primero con el formulario de arriba.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"DM Mono", monospace', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${accent}33`, background: 'var(--surface2)' }}>
                {['Código', 'Descuento', 'Mínimo', 'Usos', 'Expira', 'Restricciones', 'Estado', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: accent, fontWeight: 700, letterSpacing: '1px', fontSize: '11px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coupons.map((c, i) => {
                const expired = c.expires_at ? new Date(c.expires_at) < new Date() : false;
                const exhausted = c.uses_limit ? c.uses_count >= c.uses_limit : false;
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                    <td style={{ padding: '10px 12px', color: 'var(--text)', fontWeight: 700, letterSpacing: '0.5px' }}>
                      {c.code}
                      {c.description && <div style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '11px', marginTop: '2px', maxWidth: '220px', whiteSpace: 'normal' }}>{c.description}</div>}
                    </td>
                    <td style={{ padding: '10px 12px', color: accent, fontWeight: 700 }}>{fmtDiscount(c)}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)' }}>{c.min_order ? COP(c.min_order) : '—'}</td>
                    <td style={{ padding: '10px 12px', color: exhausted ? '#e55' : 'var(--text-muted)' }}>
                      {c.uses_count}{c.uses_limit ? ` / ${c.uses_limit}` : ''}
                    </td>
                    <td style={{ padding: '10px 12px', color: expired ? '#e55' : 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {c.expires_at ? new Date(c.expires_at).toLocaleDateString('es-CO') : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-muted)', fontSize: '11px' }}>
                      {[c.kit_only && 'Kits', c.online_only && 'Online'].filter(Boolean).join(', ') || '—'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <button
                        onClick={() => toggleActive(c)}
                        title="Clic para cambiar"
                        style={{
                          background: 'transparent', cursor: 'pointer',
                          border: `1px solid ${c.active && !expired && !exhausted ? '#25d366' : '#e55'}44`,
                          color: c.active && !expired && !exhausted ? '#25d366' : '#e55',
                          padding: '3px 10px', fontWeight: 700, fontSize: '11px', fontFamily: '"DM Mono", monospace',
                        }}
                      >
                        {expired ? 'EXPIRADO' : exhausted ? 'AGOTADO' : c.active ? '● ACTIVO' : '○ INACTIVO'}
                      </button>
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'right' }}>
                      <button
                        onClick={() => setDeletingId(c.id)}
                        title="Eliminar cupón"
                        style={{ background: 'transparent', border: '1px solid #e5533344', color: '#e55', cursor: 'pointer', padding: '3px 9px', fontSize: '11px', fontFamily: '"DM Mono", monospace' }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── MODAL DE CONFIRMACIÓN ───────────────────────────────────────────── */}
      {deletingCoupon && (
        <div onClick={() => setDeletingId(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--surface)', border: '1px solid #e55', padding: '28px 32px', maxWidth: '380px', width: '90%' }}>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '22px', color: '#e55', marginBottom: '12px' }}>¿ELIMINAR CUPÓN?</div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text)', marginBottom: '24px' }}>{deletingCoupon.code}</div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={confirmDelete} style={{ flex: 1, padding: '10px', background: '#e55', color: '#fff', border: 'none', fontFamily: '"Bebas Neue", sans-serif', fontSize: '16px', cursor: 'pointer' }}>ELIMINAR</button>
              <button onClick={() => setDeletingId(null)} style={{ flex: 1, padding: '10px', background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', fontFamily: '"DM Mono", monospace', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
