'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabase } from '../lib/supabase';
import { toSlug } from '../lib/utils';
import BrandLogo from './BrandLogo';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  tag?: string;
  specs: string;
  image_url?: string;
  original_price?: number;
  discount_percentage?: number;
  inventory?: number;
}

interface CartItem extends Product {
  qty: number;
}

const accent = '#FFD400';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);

const getCategoryIcon = (category: string) => {
  const icons: { [key: string]: string } = {
    'Kits': '✦',
    'Máquinas': '⚙',
    'Insumos': '◈',
  };
  return icons[category] || '◈';
};

function ProductPlaceholder({ icon, category }: { icon: string; category: string }) {
  const gradId = `g-${Math.random().toString(36).slice(2)}`;
  const colors: { [key: string]: [string, string] } = {
    Kits: ['#1e1e1e', '#2a2a2a'],
    Máquinas: ['#1a1e22', '#222831'],
    Insumos: ['#1e1a1e', '#2a222a'],
  };
  const [c1, c2] = colors[category] || ['#1e1e1e', '#2a2a2a'];
  return (
    <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c1} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#${gradId})`} />
      <text x="200" y="165" textAnchor="middle" fontSize="64" fill={accent} opacity="0.25" fontFamily="sans-serif">{icon}</text>
      <text x="200" y="220" textAnchor="middle" fontSize="11" fill={accent} opacity="0.4" fontFamily="monospace" letterSpacing="3">{category.toUpperCase()}</text>
    </svg>
  );
}

function ProductCard({ product, onAdd, cartQty }: { product: Product; onAdd: (p: Product) => void; cartQty: number }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const outOfStock = (product.inventory ?? 0) <= 0;
  const atLimit = !outOfStock && cartQty >= (product.inventory ?? 0);

  const handleAdd = () => {
    if (outOfStock || atLimit) return;
    onAdd(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  const hasDiscount = !!(product.discount_percentage && product.discount_percentage > 0);
  const originalPrice = (product.original_price && product.original_price > product.price)
    ? product.original_price
    : hasDiscount ? product.price : null;
  const salePrice = hasDiscount
    ? (product.original_price && product.original_price > product.price
        ? product.price
        : Math.round(product.price - product.price * (product.discount_percentage! / 100)))
    : product.price;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'background 0.2s',
      }}
    >
      {hasDiscount && (
        <div style={{
          position: 'absolute', top: '12px', left: '12px', zIndex: 2,
          background: accent, color: '#111',
          fontFamily: '"DM Mono", monospace', fontSize: '10px',
          letterSpacing: '1px', padding: '4px 8px', fontWeight: 700,
        }}>
          -{product.discount_percentage}%
        </div>
      )}

      <Link
        href={`/productos/${toSlug(product.name)}`}
        style={{ display: 'block', aspectRatio: '4/3', overflow: 'hidden', background: '#111', flexShrink: 0, textDecoration: 'none' }}
      >
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s', transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
          />
        ) : (
          <ProductPlaceholder icon={getCategoryIcon(product.category)} category={product.category} />
        )}
      </Link>

      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: '8px', textTransform: 'uppercase' }}>
          {product.category} {product.tag ? `· ${product.tag}` : ''}
        </div>
        <Link href={`/productos/${toSlug(product.name)}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, lineHeight: 1.3, color: 'var(--text)', marginBottom: '8px', transition: 'color 0.2s', ...(hovered ? { color: accent } : {}) }}>
            {product.name}
          </h3>
        </Link>
        {product.specs && (
          <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px', flex: 1 }}>
            {product.specs}
          </p>
        )}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '22px', color: accent }}>{fmt(salePrice)}</span>
          {originalPrice && (
            <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-dim)', textDecoration: 'line-through' }}>{fmt(originalPrice)}</span>
          )}
        </div>
        <button
          onClick={handleAdd}
          disabled={outOfStock || atLimit}
          style={{
            padding: '12px',
            background: outOfStock ? 'transparent' : added ? '#1a3a1a' : hovered ? accent : 'transparent',
            color: outOfStock ? '#444' : added ? '#4ade80' : hovered ? '#111' : 'var(--text)',
            border: `1px solid ${outOfStock ? '#333' : added ? '#4ade80' : hovered ? accent : '#2e2e2e'}`,
            fontFamily: '"DM Mono", monospace',
            fontSize: '11px',
            letterSpacing: '1.5px',
            cursor: outOfStock || atLimit ? 'not-allowed' : 'pointer',
            transition: 'all 0.25s',
            textTransform: 'uppercase',
          }}
        >
          {outOfStock ? 'AGOTADO' : atLimit ? 'LÍMITE' : added ? '✓ AGREGADO' : 'AGREGAR AL CARRITO'}
        </button>
      </div>
    </div>
  );
}

function CartDrawer({ cart, onClose, onRemove, onQty, onCheckout }: {
  cart: CartItem[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onQty: (id: string, delta: number) => void;
  onCheckout: () => void;
}) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 800, backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: 'clamp(320px,40vw,480px)', background: '#181818', zIndex: 900, display: 'flex', flexDirection: 'column', borderLeft: '1px solid #2e2e2e', boxShadow: '-20px 0 60px rgba(0,0,0,0.6)' }}>
        <div style={{ padding: '28px 28px 20px', borderBottom: '1px solid #2e2e2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: accent, letterSpacing: '2px', textTransform: 'uppercase' }}>Carrito</span>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '28px', lineHeight: 1, marginTop: '4px', color: 'var(--text)' }}>
              {cart.length} {cart.length === 1 ? 'ítem' : 'ítems'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: '1px solid #2e2e2e', color: 'var(--text)', cursor: 'pointer', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.2s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = accent; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2e2e2e'; }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0 28px' }}>
          {cart.length === 0 ? (
            <div style={{ paddingTop: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px', opacity: 0.3 }}>∅</div>
              <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', letterSpacing: '1px' }}>Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.id} style={{ padding: '20px 0', borderBottom: '1px solid #2a2a2a', display: 'flex', gap: '16px', alignItems: 'center' }}>
                <div style={{ width: '64px', height: '64px', background: '#1e1e1e', flexShrink: 0, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {item.image_url
                    ? <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <span style={{ fontSize: '24px', opacity: 0.3 }}>{getCategoryIcon(item.category)}</span>
                  }
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '3px' }}>{item.category.toUpperCase()}</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                  <div style={{ color: accent, fontFamily: '"DM Mono", monospace', fontSize: '13px', marginTop: '4px' }}>{fmt(item.price)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #2e2e2e' }}>
                    <button onClick={() => onQty(item.id, -1)} style={{ width: '28px', height: '28px', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ width: '28px', textAlign: 'center', fontFamily: '"DM Mono", monospace', fontSize: '12px' }}>{item.qty}</span>
                    <button onClick={() => onQty(item.id, 1)} disabled={item.qty >= (item.inventory ?? 0)} style={{ width: '28px', height: '28px', background: 'none', border: 'none', color: item.qty >= (item.inventory ?? 0) ? '#444' : 'var(--text)', cursor: item.qty >= (item.inventory ?? 0) ? 'not-allowed' : 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                  <button onClick={() => onRemove(item.id)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '11px', fontFamily: '"DM Mono", monospace', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#e55'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#555'; }}
                  >eliminar</button>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div style={{ padding: '24px 28px', borderTop: '1px solid #2e2e2e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
              <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px' }}>SUBTOTAL</span>
              <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '26px', color: accent }}>{fmt(total)}</span>
            </div>
            <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-dim)', marginBottom: '20px' }}>Envío calculado al pagar · IVA incluido</p>
            <button
              style={{ width: '100%', padding: '16px', background: accent, color: '#111', border: 'none', fontFamily: '"Bebas Neue", sans-serif', fontSize: '22px', letterSpacing: '1px', cursor: 'pointer', transition: 'background 0.2s,transform 0.1s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#ffe033'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = accent; }}
              onClick={onCheckout}
              onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)'; }}
              onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
            >
              PAGAR AHORA
            </button>
            <button
              onClick={onClose}
              style={{ width: '100%', marginTop: '10px', padding: '12px', background: 'none', color: 'var(--text-muted)', border: '1px solid #2e2e2e', fontFamily: '"DM Mono", monospace', fontSize: '12px', letterSpacing: '1px', cursor: 'pointer', transition: 'border-color 0.2s,color 0.2s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = accent; (e.currentTarget as HTMLButtonElement).style.color = accent; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2e2e2e'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
            >
              SEGUIR COMPRANDO
            </button>
          </div>
        )}
      </div>
    </>
  );
}

interface CategoryPageProps {
  category: string;
  slug: string;
}

export default function CategoryPage({ category, slug }: CategoryPageProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const sb = getSupabase();
        const { data, error } = await sb
          .from('products')
          .select('*')
          .eq('category', category)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Error loading products:', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, [category]);

  useEffect(() => {
    const load = () => {
      try {
        const stored = localStorage.getItem('ts_cart');
        if (stored) setCart(JSON.parse(stored));
      } catch {}
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  useEffect(() => {
    try { localStorage.setItem('ts_cart', JSON.stringify(cart)); } catch {}
  }, [cart]);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      const stock = product.inventory ?? 0;
      if (stock <= 0) return prev;
      if (existing) {
        if (existing.qty >= stock) return prev;
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));
  const changeQty = (id: string, delta: number) =>
    setCart((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const stock = i.inventory ?? 0;
        const newQty = Math.max(1, i.qty + delta);
        return { ...i, qty: Math.min(newQty, stock) };
      }).filter((i) => i.qty > 0)
    );

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const icon = getCategoryIcon(category);

  const otherCategories = [
    { label: 'Kits', slug: 'kits' },
    { label: 'Máquinas', slug: 'maquinas' },
    { label: 'Insumos', slug: 'insumos' },
  ].filter((c) => c.slug !== slug);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* NAV */}
      <nav style={{
        position: 'sticky',
        top: 0,
        zIndex: 700,
        background: navScrolled ? 'rgba(18,18,18,0.97)' : 'var(--bg)',
        backdropFilter: navScrolled ? 'blur(12px)' : 'none',
        borderBottom: '1px solid var(--border)',
        transition: 'all 0.35s ease',
        padding: '0 clamp(20px,5vw,80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="/" style={{ color: accent, display: 'flex', alignItems: 'center' }}>
            <BrandLogo size={36} />
          </Link>
          <Link
            href="/"
            style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '1px', transition: 'color 0.2s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = accent; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'; }}
          >
            ← Inicio
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {otherCategories.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '1.5px', textTransform: 'uppercase', transition: 'color 0.2s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = accent; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'; }}
            >
              {c.label}
            </Link>
          ))}

          <button
            onClick={() => setCartOpen(true)}
            style={{
              background: cartCount > 0 ? accent : 'transparent',
              color: cartCount > 0 ? '#111' : 'var(--text)',
              border: `1px solid ${cartCount > 0 ? accent : '#2e2e2e'}`,
              fontFamily: '"DM Mono", monospace',
              fontSize: '11px',
              letterSpacing: '1px',
              padding: '8px 16px',
              cursor: 'pointer',
              transition: 'all 0.25s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
            onMouseEnter={(e) => {
              if (cartCount === 0) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = accent;
                (e.currentTarget as HTMLButtonElement).style.color = accent;
              }
            }}
            onMouseLeave={(e) => {
              if (cartCount === 0) {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#2e2e2e';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)';
              }
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px' }}>
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            {cartCount > 0 ? `${cartCount} ítems` : 'Carrito'}
          </button>
        </div>
      </nav>

      {/* HEADER */}
      <header style={{ padding: 'clamp(48px,8vw,96px) clamp(20px,5vw,80px) clamp(32px,5vw,56px)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: accent, letterSpacing: '4px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span>{icon}</span>
          <span>CATÁLOGO</span>
          <span style={{ height: '1px', width: '40px', background: accent, opacity: 0.4 }} />
          <span style={{ opacity: 0.6 }}>{products.length} productos</span>
        </div>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(48px,10vw,120px)', lineHeight: 0.85, color: 'var(--text)', fontWeight: 900 }}>
          {category.toUpperCase()}
        </h1>
      </header>

      {/* PRODUCTS GRID */}
      <main style={{ padding: 'clamp(32px,5vw,64px) clamp(20px,5vw,80px)' }}>
        {loading ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace', fontSize: '12px', letterSpacing: '2px' }}>
            Cargando productos...
          </div>
        ) : products.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace', fontSize: '12px' }}>
            No hay productos disponibles en esta categoría
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1px',
              background: 'var(--border)',
            }}>
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAdd={addToCart}
                  cartQty={cart.find((c) => c.id === p.id)?.qty ?? 0}
                />
              ))}
            </div>
            <div style={{ marginTop: '24px', fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '1px', display: 'flex', justifyContent: 'flex-end' }}>
              {products.length} productos en {category}
            </div>
          </>
        )}
      </main>

      {/* FOOTER CATEGORÍAS */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,80px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '24px' }}>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '1px' }}>
          © {new Date().getFullYear()} TATTOO SHOP COLOMBIA — MEDELLÍN
        </div>
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          {otherCategories.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '1.5px', textTransform: 'uppercase', transition: 'color 0.2s' }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = accent; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'; }}
            >
              {c.label}
            </Link>
          ))}
          <Link
            href="/"
            style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', textDecoration: 'none', letterSpacing: '1.5px', transition: 'color 0.2s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = accent; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'; }}
          >
            ← Inicio
          </Link>
        </div>
      </footer>

      {cartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setCartOpen(false)}
          onRemove={removeFromCart}
          onQty={changeQty}
          onCheckout={() => { setCartOpen(false); router.push('/checkout'); }}
        />
      )}
    </div>
  );
}
