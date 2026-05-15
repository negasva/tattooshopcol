'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabase, Product } from '../lib/supabase';

const accent = '#FFD400';

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
          padding: '10px 20px', whiteSpace: 'nowrap',
          animation: 'fadeIn 0.2s ease',
        }}>
          {t.type === 'success' ? '✓' : '✕'} {t.message}
        </div>
      ))}
    </div>
  );
}

// ─── Inline editable cell ─────────────────────────────────────────────────────
function EditableCell({ value, field, type = 'text', options, onSave, accent }: {
  value: string | number; field: string; type?: string;
  options?: string[]; onSave: (field: string, value: string | number) => void; accent: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => { onSave(field, draft); setEditing(false); };
  const cancel = () => { setDraft(value); setEditing(false); };

  const inputStyle: React.CSSProperties = {
    background: 'var(--bg)', border: `1px solid ${accent}`, color: 'var(--text)',
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
        <button onClick={commit} style={{ background: accent, color: '#111', border: 'none', padding: '3px 7px', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}>✓</button>
        <button onClick={cancel} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '3px 7px', cursor: 'pointer', fontSize: '11px' }}>✕</button>
      </span>
    );
  }

  return (
    <span
      onClick={() => { setDraft(value); setEditing(true); }}
      title="Clic para editar"
      style={{ cursor: 'text', borderBottom: '1px dashed var(--border)', paddingBottom: '1px', transition: 'border-color 0.2s' }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLSpanElement).style.borderBottomColor = accent; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLSpanElement).style.borderBottomColor = 'var(--border)'; }}
    >
      {value === '' || value === 0 || value === null || value === undefined ? <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span> : String(value)}
    </span>
  );
}

// ─── Category Table ───────────────────────────────────────────────────────────
const CATEGORIES = ['Kits', 'Máquinas', 'Insumos'];

function CategoryTable({ category, products, onSaveField, onEdit, onDelete, accent }: {
  category: string; products: Product[];
  onSaveField: (id: string, field: string, value: string | number) => Promise<void>;
  onEdit: (p: Product) => void; onDelete: (id: string, name: string) => void; accent: string;
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
              {['Imagen', 'Nombre', 'Precio Original', 'Precio Final', 'Descuento %', 'Inventario', 'Etiqueta', 'Nivel', 'Tipo de uso', 'Complejidad', 'Acciones'].map((h) => (
                <th key={h} style={{ padding: '10px 12px', textAlign: h === 'Acciones' ? 'center' : 'left', color: accent, fontWeight: 700, letterSpacing: '1px', fontSize: '11px', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p, i) => (
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
                <td style={{ padding: '10px 12px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                  <button onClick={() => onEdit(p)} style={{ marginRight: '6px', padding: '5px 10px', background: 'transparent', color: accent, border: `1px solid ${accent}33`, cursor: 'pointer', fontSize: '11px', fontFamily: '"DM Mono", monospace' }}>
                    Editar
                  </button>
                  <button onClick={() => onDelete(p.id, p.name)} style={{ padding: '5px 10px', background: 'transparent', color: '#e55', border: '1px solid #e5533344', cursor: 'pointer', fontSize: '11px', fontFamily: '"DM Mono", monospace' }}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
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
  const [formData, setFormData] = useState({
    name: '', category: 'Kits', price: 0, original_price: 0,
    discount_percentage: 0, image_url: '', specs: '', tag: '', inventory: 0,
  });

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

  // Save a single field inline
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
    try {
      const sb = getSupabase();
      const data = {
        ...formData,
        discount_percentage: formData.discount_percentage > 0 ? formData.discount_percentage : null,
        original_price: formData.original_price > 0 ? formData.original_price : null,
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
      setFormData({ name: '', category: 'Kits', price: 0, original_price: 0, discount_percentage: 0, image_url: '', specs: '', tag: '', inventory: 0 });
      setFormOpen(false);
      loadProducts();
    } catch { showToast('Error guardando producto', 'error'); }
  };

  const handleDelete = (id: string, name: string) => {
    setDeletingId(id);
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
    });
    setEditingId(product.id);
    setFormOpen(true);
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

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px', border: '1px solid var(--border)',
    background: 'var(--bg)', color: 'var(--text)', fontFamily: '"DM Mono", monospace',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box',
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

  const productsByCategory = CATEGORIES.map((cat) => ({
    category: cat,
    products: products.filter((p) => p.category === cat),
  }));
  const uncategorized = products.filter((p) => !CATEGORIES.includes(p.category));
  const deletingProduct = products.find((p) => p.id === deletingId);

  // ── Main ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '32px clamp(16px,4vw,40px)', color: 'var(--text)' }}>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }`}</style>

      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '48px', color: accent, margin: 0 }}>PANEL ADMIN</h1>
          <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)' }}>{products.length} productos en total</span>
        </div>

        {/* FORM TOGGLE */}
        <div style={{ marginBottom: '40px' }}>
          <button
            onClick={() => { setFormOpen(!formOpen); if (formOpen && editingId) { setEditingId(null); setFormData({ name: '', category: 'Kits', price: 0, original_price: 0, discount_percentage: 0, image_url: '', specs: '', tag: '', inventory: 0 }); } }}
            style={{ width: '100%', padding: '14px 20px', background: formOpen && !editingId ? 'var(--surface)' : accent, color: formOpen && !editingId ? 'var(--text)' : '#111', border: `1px solid ${accent}`, fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', cursor: 'pointer', letterSpacing: '1.5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
          >
            <span>{editingId ? '✏ EDITANDO PRODUCTO' : '+ AGREGAR PRODUCTO'}</span>
            <span>{formOpen ? '−' : '+'}</span>
          </button>

          {formOpen && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderTop: 'none', padding: '24px' }}>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1.5px' }}>NOMBRE</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1.5px' }}>CATEGORÍA</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={inputStyle}>
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1.5px' }}>PRECIO ORIGINAL</label>
                  <input type="number" value={formData.original_price} onChange={(e) => setFormData({ ...formData, original_price: Number(e.target.value) })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1.5px' }}>PRECIO FINAL</label>
                  <input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1.5px' }}>DESCUENTO %</label>
                  <input type="number" min="0" max="100" value={formData.discount_percentage} onChange={(e) => setFormData({ ...formData, discount_percentage: Number(e.target.value) })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1.5px' }}>INVENTARIO</label>
                  <input type="number" value={formData.inventory} onChange={(e) => setFormData({ ...formData, inventory: Number(e.target.value) })} required style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1.5px' }}>ETIQUETA</label>
                  <input type="text" placeholder="ej: BESTSELLER" value={formData.tag} onChange={(e) => setFormData({ ...formData, tag: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1.5px' }}>IMAGEN</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input type="file" accept="image/*" disabled={uploading} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} style={{ ...inputStyle, cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.5 : 1 }} />
                    {formData.image_url && <img src={formData.image_url} alt="" style={{ width: '44px', height: '44px', objectFit: 'cover', flexShrink: 0 }} />}
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1.5px' }}>ESPECIFICACIONES</label>
                  <textarea value={formData.specs} onChange={(e) => setFormData({ ...formData, specs: e.target.value })} rows={6} placeholder="Una línea por ítem..." style={{ ...inputStyle, resize: 'vertical', fontFamily: '"DM Mono", monospace', lineHeight: 1.6 }} />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '12px' }}>
                  <button type="submit" style={{ flex: 1, padding: '12px', background: accent, color: '#111', border: 'none', fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', cursor: 'pointer', letterSpacing: '1.5px' }}>
                    {editingId ? 'ACTUALIZAR' : 'AGREGAR'}
                  </button>
                  {editingId && (
                    <button type="button" onClick={() => { setEditingId(null); setFormOpen(false); setFormData({ name: '', category: 'Kits', price: 0, original_price: 0, discount_percentage: 0, image_url: '', specs: '', tag: '', inventory: 0 }); }}
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
                onSaveField={handleSaveField} onEdit={handleEdit} onDelete={handleDelete} accent={accent} />
            ))}
            {uncategorized.length > 0 && (
              <CategoryTable category="Otros" products={uncategorized}
                onSaveField={handleSaveField} onEdit={handleEdit} onDelete={handleDelete} accent={accent} />
            )}
          </>
        )}
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
