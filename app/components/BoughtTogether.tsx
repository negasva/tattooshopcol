'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/app/lib/supabase';

const accent = '#FFD400';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image_url?: string;
  discount_percentage?: number;
  original_price?: number;
  inventory?: number;
}

function salePrice(p: Product) {
  if (p.discount_percentage && p.discount_percentage > 0) {
    if (p.original_price && p.original_price > p.price) return p.price;
    return Math.round(p.price - p.price * (p.discount_percentage / 100));
  }
  return p.price;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

function toSlug(name: string) {
  return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Complementary categories logic
const COMPLEMENTS: Record<string, string[]> = {
  'Kits': ['Insumos', 'Máquinas'],
  'Máquinas': ['Insumos', 'Kits'],
  'Insumos': ['Kits', 'Máquinas'],
};

export default function BoughtTogether({ currentProduct, onAddToCart }: { currentProduct: Product; onAddToCart: (p: Product) => void }) {
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const targets = COMPLEMENTS[currentProduct.category] || [];
    if (!targets.length) return;

    const sb = getSupabase();
    sb.from('products')
      .select('id, name, category, price, image_url, discount_percentage, original_price, inventory')
      .in('category', targets)
      .gt('inventory', 0)
      .neq('id', currentProduct.id)
      .limit(3)
      .then(({ data }) => {
        if (data && data.length > 0) setSuggestions(data);
      });
  }, [currentProduct.id, currentProduct.category]);

  if (suggestions.length === 0) return null;

  const handleAdd = (p: Product) => {
    onAddToCart(p);
    setAddedIds((prev) => new Set(prev).add(p.id));
    setTimeout(() => setAddedIds((prev) => { const s = new Set(prev); s.delete(p.id); return s; }), 1500);
  };

  return (
    <section style={{ borderTop: '1px solid var(--border)', padding: 'clamp(32px,4vw,56px) clamp(20px,5vw,80px)' }}>
      <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: accent, letterSpacing: '3px', marginBottom: '8px', fontWeight: 700 }}>COMPRADO JUNTO CON</div>
      <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(24px,3vw,40px)', color: 'var(--text)', margin: '0 0 24px', lineHeight: 1 }}>COMPLETA TU KIT</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1px', background: 'var(--border)' }}>
        {suggestions.map((p) => {
          const sp = salePrice(p);
          const added = addedIds.has(p.id);
          return (
            <div key={p.id} style={{ background: 'var(--surface)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {p.image_url && (
                <Link href={`/productos/${toSlug(p.name)}`} style={{ display: 'block', textDecoration: 'none' }}>
                  <img src={p.image_url} alt={p.name} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
                </Link>
              )}
              <div>
                <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1.5px', marginBottom: '4px' }}>{p.category.toUpperCase()}</div>
                <Link href={`/productos/${toSlug(p.name)}`} style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text)', textDecoration: 'none', lineHeight: 1.4, display: 'block' }}>{p.name}</Link>
              </div>
              <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '20px', color: accent }}>{fmt(sp)}</div>
              <button
                onClick={() => handleAdd(p)}
                style={{
                  background: added ? '#25d366' : 'transparent', color: added ? '#fff' : accent,
                  border: `1px solid ${added ? '#25d366' : accent}`, fontFamily: '"DM Mono", monospace',
                  fontSize: '10px', letterSpacing: '1.5px', padding: '8px', cursor: 'pointer',
                  textTransform: 'uppercase', transition: 'all 0.2s',
                }}
              >
                {added ? '✓ Agregado' : '+ Añadir al carrito'}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
