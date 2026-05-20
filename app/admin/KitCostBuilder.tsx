'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import { Product } from '../lib/supabase';
import { COP } from '../lib/analytics';

const accent = '#FFD400';

export interface KitComponent {
  id?: string;
  source_product_id?: string | null;
  nombre: string;
  cantidad: number;
  costo_unitario: number;
  tipo: string;
}

const TIPOS = ['insumo', 'máquina', 'accesorio', 'otro'] as const;

interface Props {
  components: KitComponent[];
  onChange: (components: KitComponent[]) => void;
  products: Product[];
  inputStyle: React.CSSProperties;
}

export default function KitCostBuilder({ components, onChange, products, inputStyle }: Props) {
  const [newNombre, setNewNombre] = useState('');
  const [newCantidad, setNewCantidad] = useState(1);
  const [newCostoU, setNewCostoU] = useState(0);
  const [newTipo, setNewTipo] = useState('insumo');
  const [newSourceId, setNewSourceId] = useState<string | null>(null);
  const [showSugg, setShowSugg] = useState(false);
  const suggRef = useRef<HTMLDivElement>(null);

  const total = useMemo(
    () => components.reduce((sum, c) => sum + c.cantidad * c.costo_unitario, 0),
    [components]
  );

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (suggRef.current && !suggRef.current.contains(e.target as Node)) {
        setShowSugg(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const suggestions = newNombre.length >= 1
    ? products
        .filter((p) => p.name.toLowerCase().includes(newNombre.toLowerCase()))
        .slice(0, 6)
    : [];

  const handleSelectProduct = (p: Product) => {
    setNewNombre(p.name);
    setNewCostoU(p.costo || 0);
    setNewTipo(p.category === 'Máquinas' ? 'máquina' : 'insumo');
    setNewSourceId(p.id);
    setShowSugg(false);
  };

  const handleAdd = () => {
    if (!newNombre.trim()) return;
    onChange([
      ...components,
      {
        nombre: newNombre.trim(),
        cantidad: Math.max(newCantidad, 1),
        costo_unitario: newCostoU,
        tipo: newTipo,
        source_product_id: newSourceId,
      },
    ]);
    setNewNombre('');
    setNewCantidad(1);
    setNewCostoU(0);
    setNewTipo('insumo');
    setNewSourceId(null);
  };

  const handleRemove = (idx: number) => onChange(components.filter((_, i) => i !== idx));

  const handleUpdate = (idx: number, field: keyof KitComponent, value: string | number) => {
    const updated = [...components];
    updated[idx] = { ...updated[idx], [field]: value };
    onChange(updated);
  };

  const cellInput: React.CSSProperties = {
    ...inputStyle,
    padding: '5px 8px',
    fontSize: '12px',
    width: '100%',
    boxSizing: 'border-box',
  };

  return (
    <div>
      {/* ── Total display ─────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '18px' }}>
        <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: total > 0 ? accent : 'var(--text-muted)', letterSpacing: '1px' }}>
          {COP(total)}
        </div>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
          {components.length > 0 ? `${components.length} componente${components.length !== 1 ? 's' : ''}` : 'Sin componentes aún'}
        </div>
      </div>

      {/* ── Add component row ─────────────────────────────────────────── */}
      <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', padding: '14px', marginBottom: '16px' }}>
        <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1.5px', marginBottom: '10px', fontFamily: '"DM Mono", monospace' }}>
          + AGREGAR COMPONENTE
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr 70px 120px auto', gap: '8px', alignItems: 'start' }}>

          {/* Tipo */}
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', fontFamily: '"DM Mono", monospace' }}>TIPO</div>
            <select value={newTipo} onChange={(e) => setNewTipo(e.target.value)} style={{ ...cellInput }}>
              {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Nombre + suggestions */}
          <div ref={suggRef} style={{ position: 'relative' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', fontFamily: '"DM Mono", monospace' }}>NOMBRE / BUSCAR PRODUCTO</div>
            <input
              type="text"
              value={newNombre}
              placeholder="Ej: Agujas 14RL, EZ Caster..."
              onChange={(e) => { setNewNombre(e.target.value); setNewSourceId(null); setShowSugg(true); }}
              onFocus={() => setShowSugg(true)}
              style={cellInput}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
            />
            {showSugg && suggestions.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, background: 'var(--surface)', border: `1px solid ${accent}55`, boxShadow: '0 4px 12px rgba(0,0,0,0.4)', maxHeight: '180px', overflowY: 'auto' }}>
                {suggestions.map((p) => (
                  <div
                    key={p.id}
                    onMouseDown={() => handleSelectProduct(p)}
                    style={{ padding: '9px 12px', cursor: 'pointer', fontFamily: '"DM Mono", monospace', fontSize: '12px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = `${accent}22`; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
                  >
                    <span style={{ color: 'var(--text)' }}>{p.name}</span>
                    <span style={{ color: p.costo ? accent : 'var(--text-muted)', fontSize: '11px' }}>
                      {p.costo ? COP(p.costo) : 'sin costo'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', fontFamily: '"DM Mono", monospace' }}>CANT.</div>
            <input
              type="number" min="1" value={newCantidad}
              onChange={(e) => setNewCantidad(Number(e.target.value))}
              style={cellInput}
            />
          </div>

          {/* Costo unitario */}
          <div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', fontFamily: '"DM Mono", monospace' }}>COSTO UNITARIO</div>
            <input
              type="number" min="0" value={newCostoU}
              onChange={(e) => setNewCostoU(Number(e.target.value))}
              style={cellInput}
            />
          </div>

          {/* Add button */}
          <div style={{ paddingTop: '18px' }}>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!newNombre.trim()}
              style={{
                padding: '7px 16px', background: newNombre.trim() ? accent : 'var(--surface2)',
                color: newNombre.trim() ? '#111' : 'var(--text-muted)',
                border: 'none', fontFamily: '"Bebas Neue", sans-serif',
                fontSize: '15px', cursor: newNombre.trim() ? 'pointer' : 'not-allowed',
                letterSpacing: '1px', whiteSpace: 'nowrap',
              }}
            >
              AGREGAR
            </button>
          </div>
        </div>

        {/* Preview of subtotal for the item being added */}
        {newNombre.trim() && newCostoU > 0 && (
          <div style={{ marginTop: '8px', fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)' }}>
            Subtotal: <span style={{ color: accent }}>{COP(newCantidad * newCostoU)}</span>
            {newSourceId && <span style={{ marginLeft: '8px', color: accent, fontSize: '10px' }}>⬡ vinculado a producto</span>}
          </div>
        )}
      </div>

      {/* ── Components table ──────────────────────────────────────────── */}
      {components.length > 0 && (
        <div style={{ overflowX: 'auto', border: '1px solid var(--border)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"DM Mono", monospace', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: `2px solid ${accent}33`, background: 'var(--surface2)' }}>
                {['Tipo', 'Nombre', 'Cant.', 'Costo/u', 'Subtotal', ''].map((h) => (
                  <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: accent, fontWeight: 700, letterSpacing: '1px', fontSize: '10px', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {components.map((c, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '6px 10px', minWidth: '100px' }}>
                    <select
                      value={c.tipo}
                      onChange={(e) => handleUpdate(idx, 'tipo', e.target.value)}
                      style={{ ...cellInput, width: '100px' }}
                    >
                      {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td style={{ padding: '6px 10px', color: 'var(--text)', minWidth: '160px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {c.nombre}
                      {c.source_product_id && (
                        <span title="Vinculado a producto existente" style={{ color: accent, fontSize: '10px' }}>⬡</span>
                      )}
                    </span>
                  </td>
                  <td style={{ padding: '6px 10px', minWidth: '70px' }}>
                    <input
                      type="number" min="1" value={c.cantidad}
                      onChange={(e) => handleUpdate(idx, 'cantidad', Math.max(1, Number(e.target.value)))}
                      style={{ ...cellInput, width: '64px' }}
                    />
                  </td>
                  <td style={{ padding: '6px 10px', minWidth: '120px' }}>
                    <input
                      type="number" min="0" value={c.costo_unitario}
                      onChange={(e) => handleUpdate(idx, 'costo_unitario', Number(e.target.value))}
                      style={{ ...cellInput, width: '110px' }}
                    />
                  </td>
                  <td style={{ padding: '6px 10px', color: accent, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {COP(c.cantidad * c.costo_unitario)}
                  </td>
                  <td style={{ padding: '6px 10px', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleRemove(idx)}
                      style={{ background: 'transparent', border: 'none', color: '#e55', cursor: 'pointer', fontSize: '14px', padding: '2px 6px', fontFamily: '"DM Mono", monospace' }}
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `2px solid ${accent}33`, background: 'var(--surface2)' }}>
                <td colSpan={4} style={{ padding: '10px 10px', fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                  TOTAL ({components.length} componente{components.length !== 1 ? 's' : ''})
                </td>
                <td style={{ padding: '10px 10px', fontFamily: '"Bebas Neue", sans-serif', fontSize: '20px', color: accent, letterSpacing: '1px' }}>
                  {COP(total)}
                </td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
