'use client';

import { useState, useEffect } from 'react';
import { supabase, Product } from '../lib/supabase';

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Kits',
    price: 0,
    specs: '',
    tag: '',
    inventory: 0,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';

  useEffect(() => {
    if (authenticated) {
      loadProducts();
    }
  }, [authenticated]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Error cargando productos');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      setPassword('');
    } else {
      alert('Contraseña incorrecta');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);
        if (error) throw error;
        setEditingId(null);
      } else {
        const { error } = await supabase.from('products').insert([
          {
            ...formData,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
        if (error) throw error;
      }
      setFormData({ name: '', category: 'Kits', price: 0, specs: '', tag: '', inventory: 0 });
      loadProducts();
      alert(editingId ? 'Producto actualizado' : 'Producto agregado');
    } catch (error) {
      console.error('Error:', error);
      alert('Error guardando producto');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      loadProducts();
      alert('Producto eliminado');
    } catch (error) {
      console.error('Error:', error);
      alert('Error eliminando producto');
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price,
      specs: product.specs,
      tag: product.tag,
      inventory: product.inventory,
    });
    setEditingId(product.id);
    window.scrollTo(0, 0);
  };

  if (!authenticated) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ background: 'var(--surface)', padding: '40px', borderRadius: '8px', maxWidth: '400px', width: '100%' }}>
          <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', marginBottom: '30px', color: 'var(--text)' }}>ADMIN</h1>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontFamily: '"DM Sans", sans-serif', color: 'var(--text-muted)' }}>
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  fontFamily: '"DM Sans", sans-serif',
                  borderRadius: '4px',
                }}
              />
            </div>
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--accent)',
                color: '#111',
                border: 'none',
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: '18px',
                cursor: 'pointer',
                borderRadius: '4px',
              }}
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '40px 20px', color: 'var(--text)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '48px', marginBottom: '40px', color: 'var(--accent)' }}>PANEL ADMIN</h1>

        {/* FORM */}
        <div style={{ background: 'var(--surface)', padding: '30px', marginBottom: '40px', borderRadius: '8px' }}>
          <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '24px', marginBottom: '20px' }}>
            {editingId ? 'Editar Producto' : 'Agregar Producto'}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    borderRadius: '4px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    borderRadius: '4px',
                  }}
                >
                  <option>Kits</option>
                  <option>Máquinas</option>
                  <option>Insumos</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Precio (COP)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    borderRadius: '4px',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Inventario</label>
                <input
                  type="number"
                  value={formData.inventory}
                  onChange={(e) => setFormData({ ...formData, inventory: Number(e.target.value) })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid var(--border)',
                    background: 'var(--bg)',
                    color: 'var(--text)',
                    borderRadius: '4px',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Especificaciones</label>
              <input
                type="text"
                placeholder="ej: 12 piezas — Completo"
                value={formData.specs}
                onChange={(e) => setFormData({ ...formData, specs: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  borderRadius: '4px',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: 'var(--text-muted)' }}>Etiqueta</label>
              <input
                type="text"
                placeholder="ej: Más vendido"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  color: 'var(--text)',
                  borderRadius: '4px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="submit"
                style={{
                  flex: 1,
                  padding: '12px',
                  background: 'var(--accent)',
                  color: '#111',
                  border: 'none',
                  fontFamily: '"Bebas Neue", sans-serif',
                  fontSize: '16px',
                  cursor: 'pointer',
                  borderRadius: '4px',
                }}
              >
                {editingId ? 'Actualizar' : 'Agregar'}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({ name: '', category: 'Kits', price: 0, specs: '', tag: '', inventory: 0 });
                  }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: 'var(--surface2)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border)',
                    fontFamily: '"DM Sans", sans-serif',
                    cursor: 'pointer',
                    borderRadius: '4px',
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* PRODUCTS TABLE */}
        <div>
          <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '24px', marginBottom: '20px' }}>Productos ({products.length})</h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Cargando...</div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Sin productos</div>
          ) : (
            <div style={{ overflowX: 'auto', background: 'var(--surface)', borderRadius: '8px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: '"DM Sans", sans-serif', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '16px', textAlign: 'left', color: 'var(--accent)', fontWeight: '600' }}>Nombre</th>
                    <th style={{ padding: '16px', textAlign: 'left', color: 'var(--accent)', fontWeight: '600' }}>Categoría</th>
                    <th style={{ padding: '16px', textAlign: 'right', color: 'var(--accent)', fontWeight: '600' }}>Precio</th>
                    <th style={{ padding: '16px', textAlign: 'center', color: 'var(--accent)', fontWeight: '600' }}>Inventario</th>
                    <th style={{ padding: '16px', textAlign: 'center', color: 'var(--accent)', fontWeight: '600' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px', color: 'var(--text)' }}>{product.name}</td>
                      <td style={{ padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>{product.category}</td>
                      <td style={{ padding: '16px', textAlign: 'right', color: 'var(--accent)', fontWeight: '600' }}>
                        ${product.price.toLocaleString('es-CO')}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center', color: product.inventory > 0 ? 'var(--text)' : '#e55' }}>
                        {product.inventory}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleEdit(product)}
                          style={{
                            marginRight: '8px',
                            padding: '6px 12px',
                            background: 'var(--surface2)',
                            color: 'var(--accent)',
                            border: '1px solid var(--border)',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          style={{
                            padding: '6px 12px',
                            background: 'transparent',
                            color: '#e55',
                            border: '1px solid #e55',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                          }}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
