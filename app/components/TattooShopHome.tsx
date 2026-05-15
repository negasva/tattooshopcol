'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getSupabase } from '../lib/supabase';
import { toSlug } from '../lib/utils';
import WhatsAppLogo from './WhatsAppLogo';
import BrandLogo from './BrandLogo';
import BrandLogoFull from './BrandLogoFull';
import BrandLogoCombined from './BrandLogoCombined';
import ReviewsSection from './ReviewsSection';

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
}

interface CartItem extends Product {
  qty: number;
}

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

function ProductPlaceholder({ icon, category, accent }: { icon: string; category: string; accent: string }) {
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
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line key={`h${i}`} x1="0" y1={i * 60} x2="400" y2={i * 60} stroke="#ffffff" strokeOpacity="0.03" strokeWidth="1" />
      ))}
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <line key={`v${i}`} x1={i * 70} y1="0" x2={i * 70} y2="300" stroke="#ffffff" strokeOpacity="0.03" strokeWidth="1" />
      ))}
      <text x="200" y="165" textAnchor="middle" fontSize="64" fill={accent} opacity="0.25" fontFamily="sans-serif">
        {icon}
      </text>
      <text x="200" y="220" textAnchor="middle" fontSize="11" fill={accent} opacity="0.4" fontFamily="monospace" letterSpacing="3">
        {category.toUpperCase()}
      </text>
      <rect x="8" y="8" width="16" height="1" fill={accent} opacity="0.2" />
      <rect x="8" y="8" width="1" height="16" fill={accent} opacity="0.2" />
      <rect x="376" y="8" width="16" height="1" fill={accent} opacity="0.2" />
      <rect x="391" y="8" width="1" height="16" fill={accent} opacity="0.2" />
      <rect x="8" y="291" width="16" height="1" fill={accent} opacity="0.2" />
      <rect x="8" y="276" width="1" height="16" fill={accent} opacity="0.2" />
      <rect x="376" y="291" width="16" height="1" fill={accent} opacity="0.2" />
      <rect x="391" y="276" width="1" height="16" fill={accent} opacity="0.2" />
    </svg>
  );
}


function ProductCard({ product, idx, onAdd, accent, cartQty, onCompare, inCompare }: { product: Product; idx: number; onAdd: (p: Product) => void; accent: string; cartQty: number; onCompare?: (id: string) => void; inCompare?: boolean }) {
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
  // Si original_price está guardado: precio = sale, original_price = tachado
  // Si no: price = precio original, sale = price - (price × pct/100)
  const originalPrice = (product.original_price && product.original_price > product.price)
    ? product.original_price
    : hasDiscount
    ? product.price
    : null;
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
        background: hovered ? 'var(--surface2)' : 'var(--surface)',
        border: `1px solid ${hovered ? accent + '33' : 'var(--border)'}`,
        transition: 'all 0.25s ease',
        cursor: 'default',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: hasDiscount && !outOfStock ? `0 0 24px rgba(229, 85, 85, 0.3)` : 'none',
        opacity: outOfStock ? 0.7 : 1,
      }}
    >
      {outOfStock ? (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 2,
            background: '#555',
            color: '#ccc',
            fontFamily: '"DM Mono", monospace',
            fontSize: '9px',
            letterSpacing: '2px',
            padding: '3px 8px',
            textTransform: 'uppercase',
            fontWeight: '700',
          }}
        >
          AGOTADO
        </div>
      ) : (product.discount_percentage && product.discount_percentage > 0) ? (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 2,
            background: '#e55',
            color: '#fff',
            fontFamily: '"DM Mono", monospace',
            fontSize: '9px',
            letterSpacing: '2px',
            padding: '3px 8px',
            textTransform: 'uppercase',
            fontWeight: '700',
          }}
        >
          -{product.discount_percentage}%
        </div>
      ) : product.tag && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 2,
            background: accent,
            color: '#111',
            fontFamily: '"DM Mono", monospace',
            fontSize: '9px',
            letterSpacing: '2px',
            padding: '3px 8px',
            textTransform: 'uppercase',
          }}
        >
          {product.tag}
        </div>
      )}

      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 14,
          zIndex: 2,
          fontFamily: '"DM Mono", monospace',
          fontSize: '11px',
          color: hovered ? accent : 'var(--text-dim)',
          transition: 'color 0.25s',
        }}
      >
        0{idx + 1}
      </div>

      <Link href={`/productos/${toSlug(product.name)}`} style={{ display: 'block', textDecoration: 'none' }}>
        <div style={{ aspectRatio: '4/3', overflow: 'hidden', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transform: hovered ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 0.5s ease',
            }}
          >
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <ProductPlaceholder icon={getCategoryIcon(product.category)} category={product.category} accent={accent} />
            )}
          </div>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: hovered ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.25s',
              pointerEvents: 'none',
            }}
          >
            <span style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: '10px',
              color: accent,
              letterSpacing: '2px',
              border: `1px solid ${accent}`,
              padding: '8px 16px',
              background: 'rgba(0,0,0,0.7)',
              textTransform: 'uppercase',
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.2s, transform 0.2s',
            }}>
              VER DETALLE →
            </span>
          </div>
        </div>
      </Link>

      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>
          {product.category} — {product.specs?.split('\n')[0]}
        </div>
        <Link href={`/productos/${toSlug(product.name)}`} style={{ textDecoration: 'none' }}>
          <div
            style={{
              fontFamily: '"Bebas Neue", sans-serif',
              fontSize: '24px',
              lineHeight: 1.1,
              color: hovered ? accent : 'var(--text)',
              letterSpacing: '0.5px',
              transition: 'color 0.2s',
            }}
          >
            {product.name}
          </div>
        </Link>
        <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
            {hasDiscount && originalPrice && (
              <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text-muted)', textDecoration: 'line-through', opacity: 0.4 }}>
                {fmt(originalPrice)}
              </span>
            )}
            <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '22px', fontWeight: '700', color: accent }}>{fmt(salePrice)}</span>
          </div>
          <button
            onClick={handleAdd}
            disabled={outOfStock || atLimit}
            style={{
              background: outOfStock || atLimit ? '#2a2a2a' : added ? accent : 'transparent',
              color: outOfStock || atLimit ? '#555' : added ? '#111' : accent,
              border: `1px solid ${outOfStock || atLimit ? '#444' : accent}`,
              fontFamily: '"DM Mono", monospace',
              fontSize: '10px',
              letterSpacing: '1.5px',
              padding: '8px 14px',
              cursor: outOfStock || atLimit ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (!added && !outOfStock && !atLimit) {
                (e.currentTarget as HTMLButtonElement).style.background = accent;
                (e.currentTarget as HTMLButtonElement).style.color = '#111';
              }
            }}
            onMouseLeave={(e) => {
              if (!added && !outOfStock && !atLimit) {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = accent;
              }
            }}
          >
            {outOfStock ? 'Agotado' : atLimit ? 'Límite' : added ? '✓ Agregado' : '+ Carrito'}
          </button>
          {onCompare && (
            <button
              onClick={() => onCompare(product.id)}
              style={{
                background: inCompare ? accent : 'transparent',
                color: inCompare ? '#111' : 'var(--text-muted)',
                border: `1px solid ${inCompare ? accent : 'var(--border)'}`,
                fontFamily: '"DM Mono", monospace',
                fontSize: '10px',
                letterSpacing: '1px',
                padding: '8px 10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}
              title={inCompare ? 'Quitar de comparación' : 'Comparar'}
            >
              {inCompare ? '✓' : '⇔'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cart, onClose, onRemove, onQty, accent, onCheckout }: { cart: CartItem[]; onClose: () => void; onRemove: (id: string) => void; onQty: (id: string, delta: number) => void; accent: string; onCheckout: () => void }) {
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 800,
          backdropFilter: 'blur(4px)',
        }}
      />
      <div
        data-cart-drawer=""
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 'clamp(320px,40vw,480px)',
          background: '#181818',
          zIndex: 900,
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid #2e2e2e',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ padding: '28px 28px 20px', borderBottom: '1px solid #2e2e2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: accent, letterSpacing: '2px', textTransform: 'uppercase' }}>Carrito</span>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '28px', lineHeight: 1, marginTop: '4px', color: 'var(--text)' }}>
              {cart.length} {cart.length === 1 ? 'ítem' : 'ítems'}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: '1px solid #2e2e2e',
              color: 'var(--text)',
              cursor: 'pointer',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = accent;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#2e2e2e';
            }}
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
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '24px', opacity: 0.3 }}>{getCategoryIcon(item.category)}</span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '3px' }}>
                    {item.category.toUpperCase()}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.name}
                  </div>
                  <div style={{ color: accent, fontFamily: '"DM Mono", monospace', fontSize: '13px', marginTop: '4px' }}>{fmt(item.price)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #2e2e2e' }}>
                    <button
                      onClick={() => onQty(item.id, -1)}
                      style={{ width: '28px', height: '28px', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      −
                    </button>
                    <span style={{ width: '28px', textAlign: 'center', fontFamily: '"DM Mono", monospace', fontSize: '12px' }}>{item.qty}</span>
                    <button
                      onClick={() => onQty(item.id, 1)}
                      disabled={item.qty >= (item.inventory ?? 0)}
                      style={{ width: '28px', height: '28px', background: 'none', border: 'none', color: item.qty >= (item.inventory ?? 0) ? '#444' : 'var(--text)', cursor: item.qty >= (item.inventory ?? 0) ? 'not-allowed' : 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => onRemove(item.id)}
                    style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '11px', fontFamily: '"DM Mono", monospace', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = '#e55';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color = '#555';
                    }}
                  >
                    eliminar
                  </button>
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
              style={{
                width: '100%',
                padding: '16px',
                background: accent,
                color: '#111',
                border: 'none',
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: '22px',
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'background 0.2s,transform 0.1s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#ffe033';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = accent;
              }}
              onClick={onCheckout}
              onMouseDown={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)';
              }}
              onMouseUp={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
              }}
            >
              PAGAR AHORA
            </button>
            <button
              onClick={onClose}
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '12px',
                background: 'none',
                color: 'var(--text-muted)',
                border: '1px solid #2e2e2e',
                fontFamily: '"DM Mono", monospace',
                fontSize: '12px',
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'border-color 0.2s,color 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = accent;
                (e.currentTarget as HTMLButtonElement).style.color = accent;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#2e2e2e';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
              }}
            >
              SEGUIR COMPRANDO
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function TattooShopHome() {
  const accent = '#FFD400';
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('kits');
  const [navScrolled, setNavScrolled] = useState(false);
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const sb = getSupabase();
        const { data, error } = await sb
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  // Leer carrito desde localStorage al montar y cuando cambie desde otra página
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

  // Escribir carrito a localStorage cada vez que cambie
  useEffect(() => {
    try { localStorage.setItem('ts_cart', JSON.stringify(cart)); } catch {}
  }, [cart]);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const searchTerm = search.trim().toLowerCase();
  const filtered = (activeFilter === 'all'
    ? products
    : products.filter((p) => p.category && p.category.toLowerCase() === activeFilter.toLowerCase())
  ).filter((p) =>
    !searchTerm ||
    p.name.toLowerCase().includes(searchTerm) ||
    (p.specs || '').toLowerCase().includes(searchTerm) ||
    (p.category || '').toLowerCase().includes(searchTerm)
  ).slice(0, searchTerm ? products.length : 4);

  const toggleCompare = (id: string) => {
    setCompareList((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };
  const compareProducts = products.filter((p) => compareList.includes(p.id));

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

  const categories = [
    { key: 'kits', label: 'Kits', count: products.filter(p => p.category === 'Kits').length, slug: 'kits' },
    { key: 'máquinas', label: 'Máquinas', count: products.filter(p => p.category === 'Máquinas').length, slug: 'maquinas' },
    { key: 'insumos', label: 'Insumos', count: products.filter(p => p.category === 'Insumos').length, slug: 'insumos' },
  ];

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterDone(true);
      setNewsletterEmail('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* NAV */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 700,
          background: navScrolled ? 'rgba(18,18,18,0.97)' : 'transparent',
          backdropFilter: navScrolled ? 'blur(12px)' : 'none',
          borderBottom: navScrolled ? '1px solid #2e2e2e' : '1px solid transparent',
          transition: 'all 0.35s ease',
          padding: '0 clamp(20px,5vw,80px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', color: accent }}>
          <BrandLogo size={40} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {categories.map((cat) => (
            <Link
              key={cat.key}
              href={`/${cat.slug}`}
              style={{
                color: 'var(--text-muted)',
                fontFamily: '"DM Mono", monospace',
                fontSize: '11px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                padding: '4px 0',
                borderBottom: '1px solid transparent',
                transition: 'all 0.2s',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = accent;
                (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = accent;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
                (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = 'transparent';
              }}
            >
              {cat.label}
            </Link>
          ))}
          <Link href="/calculadora" style={{ color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '4px 0', textDecoration: 'none', borderBottom: '1px solid transparent', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = accent; (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = accent; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = 'transparent'; }}>
            Calculadora
          </Link>
          <Link href="/blog" style={{ color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace', fontSize: '11px', letterSpacing: '1.5px', textTransform: 'uppercase', padding: '4px 0', textDecoration: 'none', borderBottom: '1px solid transparent', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = accent; (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = accent; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLAnchorElement).style.borderBottomColor = 'transparent'; }}>
            Blog
          </Link>
          {/* Search icon + expandable input */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0', position: 'relative' }}>
            <div style={{
              display: 'flex', alignItems: 'center',
              overflow: 'hidden',
              width: searchOpen ? '200px' : '0',
              transition: 'width 0.3s ease',
            }}>
              <input
                type="text"
                value={search}
                autoFocus={searchOpen}
                onChange={(e) => { setSearch(e.target.value); setActiveFilter('all'); }}
                onKeyDown={(e) => { if (e.key === 'Escape') { setSearch(''); setSearchOpen(false); } }}
                placeholder="Buscar productos..."
                style={{
                  width: '100%', background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRight: 'none', color: 'var(--text)', fontFamily: '"DM Mono", monospace',
                  fontSize: '11px', padding: '8px 12px', outline: 'none', letterSpacing: '0.5px',
                }}
              />
            </div>
            <button
              onClick={() => {
                if (searchOpen && search) { setSearch(''); }
                else { setSearchOpen(!searchOpen); }
                if (!searchOpen) {
                  setTimeout(() => document.querySelector<HTMLElement>('#productos')?.scrollIntoView({ behavior: 'smooth' }), 350);
                }
              }}
              style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                color: search ? accent : 'var(--text-muted)',
                width: '36px', height: '36px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s', flexShrink: 0,
              }}
              title="Buscar"
            >
              {search ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              )}
            </button>
          </div>

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
            <span>CARRITO</span>
            {cartCount > 0 && <span style={{ fontWeight: 700 }}>{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section
        data-hero-section=""
        style={{
          padding: 'clamp(60px,10vh,120px) clamp(20px,5vw,80px) 0',
          display: 'flex',
          flexDirection: 'column',
          borderBottom: '1px solid var(--border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: `${i * 9.09}%`,
                borderLeft: '1px solid rgba(255,255,255,0.025)',
              }}
            />
          ))}
        </div>

        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: accent, letterSpacing: '4px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>EST. 2021</span>
          <span style={{ flex: 1, height: '1px', background: 'var(--border)', maxWidth: '80px' }} />
          <span>MEDELLÍN, COL</span>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', width: '100%' }}>
          <BrandLogoFull width="clamp(260px,60vw,860px)" />
        </div>

        <div style={{ marginTop: '32px', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '16px', color: 'var(--text-muted)', fontStyle: 'italic', maxWidth: '380px', lineHeight: 1.6 }}>
            Todo lo que necesitas para tatuar — profesional, rápido, a tu puerta.
          </p>
          <div style={{ height: '1px', flex: 1, background: 'var(--border)', minWidth: '40px' }} />
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '2px', textAlign: 'right' }}>
            ENVÍO<br />
            NACIONAL
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '12px',
            marginLeft: '0',
            marginRight: '0',
          }}
        >
          {categories.map((cat, i) => (
            <Link
              key={cat.key}
              href={`/${cat.slug}`}
              style={{
                background: 'var(--surface)',
                border: `2px solid ${accent}`,
                borderRadius: '4px',
                padding: 'clamp(28px,5vw,56px) clamp(20px,4vw,48px)',
                textAlign: 'left',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: 'relative',
                overflow: 'hidden',
                display: 'block',
                textDecoration: 'none',
                color: 'var(--text)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = accent;
                (e.currentTarget as HTMLAnchorElement).style.color = '#111';
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 12px 32px ${accent}44`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = 'var(--surface)';
                (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text)';
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLAnchorElement).style.boxShadow = 'none';
              }}
            >
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: accent, letterSpacing: '3px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>0{i + 1}</span>
                <span style={{ height: '2px', width: '20px', background: accent }} />
              </div>
              <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(32px,5vw,64px)', lineHeight: 0.9, color: 'inherit', marginBottom: '16px' }}>
                {cat.label.toUpperCase()}
              </div>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{cat.count} productos</span>
                <span style={{ transition: 'transform 0.3s' }}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TICKER */}
      <div style={{ borderBottom: '1px solid var(--border)', padding: '12px 0', overflow: 'hidden', background: 'var(--surface)', marginTop: '32px' }}>
        <div
          style={{
            display: 'flex',
            gap: '48px',
            animation: 'ticker 20s linear infinite',
            whiteSpace: 'nowrap',
          }}
        >
          {[...Array(4)].map((_, i) => (
            <span key={i} style={{ display: 'flex', gap: '48px', fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '2px' }}>
              <span>ENVÍO A TODO COLOMBIA</span>
              <span style={{ color: accent }}>✦</span>
              <span>PRODUCTOS PROFESIONALES</span>
              <span style={{ color: accent }}>✦</span>
              <span>PAGO CONTRAENTREGA</span>
              <span style={{ color: accent }}>✦</span>
              <span>GARANTÍA INCLUIDA</span>
              <span style={{ color: accent }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* PRODUCTS */}
      <section id="productos" style={{ padding: 'clamp(48px,8vh,96px) clamp(20px,5vw,80px)' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border)',
            paddingBottom: '24px',
            marginBottom: '40px',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: accent, letterSpacing: '3px', marginBottom: '8px' }}>CATÁLOGO</div>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(36px,5vw,72px)', lineHeight: 0.9, color: 'var(--text)' }}>
              PRODUCTOS<br />
              <span style={{ color: accent }}>DESTACADOS</span>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
            {/* Category filters */}
            <div style={{ display: 'flex', gap: '1px', flexWrap: 'wrap' }}>
            {[{ key: 'all', label: 'Todos' }, ...categories.map((c) => ({ key: c.key, label: c.label }))].map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                style={{
                  background: activeFilter === f.key ? accent : 'var(--surface)',
                  color: activeFilter === f.key ? '#111' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '10px',
                  letterSpacing: '1.5px',
                  padding: '10px 18px',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (activeFilter !== f.key) {
                    (e.currentTarget as HTMLButtonElement).style.color = accent;
                    (e.currentTarget as HTMLButtonElement).style.borderColor = accent;
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeFilter !== f.key) {
                    (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                    (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                  }
                }}
              >
                {f.label}
              </button>
            ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Cargando productos...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            {search ? `Sin resultados para "${search}"` : 'No hay productos en esta categoría'}
          </div>
        ) : (
          <>
            <div
              data-products-grid=""
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1px',
                background: 'var(--border)',
                maxWidth: '100%',
              }}
            >
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} idx={i} onAdd={addToCart} accent={accent} cartQty={cart.find((c) => c.id === p.id)?.qty ?? 0} onCompare={toggleCompare} inCompare={compareList.includes(p.id)} />
              ))}
            </div>

            <div style={{ marginTop: '24px', fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '1px', display: 'flex', justifyContent: 'flex-end' }}>
              {filtered.length} de {products.length} productos
            </div>
          </>
        )}
      </section>

      {/* ABOUT */}
      <section style={{ borderTop: '1px solid var(--border)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <div style={{ padding: 'clamp(48px,8vw,96px) clamp(24px,5vw,80px)', borderRight: '1px solid var(--border)' }}>
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: accent, letterSpacing: '3px', marginBottom: '20px' }}>SOBRE NOSOTROS</div>
          <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(28px,4vw,52px)', lineHeight: 0.95, color: 'var(--text)', marginBottom: '24px' }}>
            SUMINISTROS<br />
            PARA ARTISTAS<br />
            <span style={{ color: accent }}>REALES.</span>
          </h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: '400px', fontSize: '14px' }}>
            Desde 2021 somos el proveedor de confianza de tatuadores profesionales en Colombia. Trabajamos directamente con fabricantes certificados para garantizar insumos de alta calidad a precios justos. Envío a todas las ciudades del país.
          </p>
        </div>
        <div style={{ padding: 'clamp(48px,8vw,96px) clamp(24px,5vw,80px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--surface)' }}>
          {[
            { n: '1000+', label: 'Clientes activos' },
            { n: '2 a 4 días', label: 'Tiempo de entrega promedio' },
            { n: 'Garantía 6 meses', label: 'Por defectos de fábrica' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                paddingBottom: i < 2 ? '28px' : 0,
                marginBottom: i < 2 ? '28px' : 0,
                borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                display: 'flex',
                alignItems: 'baseline',
                gap: '16px',
              }}
            >
              <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(36px,5vw,64px)', color: accent }}>{s.n}</span>
              <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1px' }}>{s.label.toUpperCase()}</span>
            </div>
          ))}
        </div>
      </section>

      {/* RESEÑAS */}
      <ReviewsSection />

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ padding: 'clamp(40px,6vw,80px) clamp(20px,5vw,80px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: accent, letterSpacing: '3px', marginBottom: '12px', fontWeight: '700' }}>NEWSLETTER</div>
            <h4 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(24px,3vw,42px)', lineHeight: 0.95, color: 'var(--text)' }}>
              OFERTAS EXCLUSIVAS<br />
              PARA TATUADORES
            </h4>
          </div>
          {newsletterDone ? (
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: accent, letterSpacing: '2px' }}>✓ ¡Suscrito! Gracias.</div>
          ) : (
            <form onSubmit={handleNewsletter} style={{ display: 'flex', gap: 0, minWidth: '300px', flex: 1, maxWidth: '480px' }}>
              <input
                type="email"
                placeholder="tu@email.com"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                style={{ flex: 1, background: '#1a1a1a', border: '1px solid var(--border)', borderRight: 'none', color: 'var(--text)', padding: '14px 18px', fontFamily: '"DM Mono", monospace', fontSize: '12px', outline: 'none' }}
              />
              <button
                type="submit"
                style={{ background: accent, color: '#111', border: 'none', padding: '14px 24px', fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', cursor: 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = '#ffe033';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = accent;
                }}
              >
                SUSCRIBIR
              </button>
            </form>
          )}
        </div>

        <div style={{ padding: 'clamp(40px,6vw,72px) clamp(20px,5vw,80px)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '40px 60px', borderBottom: '1px solid var(--border)' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', color: accent }}>
              <BrandLogoFull width={120} />
            </div>
            <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.7, letterSpacing: '0.5px' }}>
              Tu proveedor profesional<br />
              de insumos para tatuaje<br />
              en Colombia.
            </p>
          </div>

          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: accent, letterSpacing: '3px', marginBottom: '18px', fontWeight: '700' }}>CATÁLOGO</div>
            {[
              { label: 'Kits', slug: 'kits' },
              { label: 'Máquinas', slug: 'maquinas' },
              { label: 'Insumos', slug: 'insumos' },
            ].map((l) => (
              <div key={l.slug} style={{ marginBottom: '10px' }}>
                <Link
                  href={`/${l.slug}`}
                  style={{ color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace', fontSize: '13px', textDecoration: 'none', letterSpacing: '0.5px', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = accent;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
                  }}
                >
                  {l.label}
                </Link>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: accent, letterSpacing: '3px', marginBottom: '18px', fontWeight: '700' }}>INFORMACIÓN</div>
            {[
              { label: 'Políticas de Envíos', href: '/politica-envios' },
              { label: 'Garantía', href: '/devoluciones-garantia' },
              { label: 'Preguntas Frecuentes', href: '/preguntas-frecuentes' },
              { label: 'Métodos de Pago', href: '/metodos-pago' },
            ].map((item) => (
              <div key={item.label} style={{ marginBottom: '10px' }}>
                <Link
                  href={item.href}
                  style={{ color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace', fontSize: '13px', textDecoration: 'none', letterSpacing: '0.5px', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = accent;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
                  }}
                >
                  {item.label}
                </Link>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: accent, letterSpacing: '3px', marginBottom: '18px', fontWeight: '700' }}>CONTACTO</div>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                Tienda Virtual<br />
                Medellín, Antioquia<br />
                Abierto todos los días<br />
                8am - 7pm
              </p>
            </div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: accent, letterSpacing: '3px', marginBottom: '12px', fontWeight: '700' }}>REDES SOCIALES</div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { label: 'Instagram', href: 'https://instagram.com' },
                { label: 'Facebook', href: 'https://facebook.com' },
                { label: 'WhatsApp', href: 'https://wa.me/573000000000' },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--text-muted)',
                    fontFamily: '"DM Mono", monospace',
                    fontSize: '12px',
                    textDecoration: 'none',
                    border: '1px solid var(--border)',
                    padding: '6px 10px',
                    letterSpacing: '1px',
                    transition: 'all 0.2s',
                    display: 'inline-block',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = accent;
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = accent;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)';
                  }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '20px clamp(20px,5vw,80px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1px' }}>TattooShop Colombia ©2026 — Todos los derechos reservados</div>
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
            Hecho con <span style={{ color: accent }}>✦</span> en Colombia
          </div>
        </div>
      </footer>

      {/* CART DRAWER */}
      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onRemove={removeFromCart} onQty={changeQty} accent={accent} onCheckout={() => { setCartOpen(false); router.push('/checkout'); }} />}

      {/* COMPARE BAR */}
      {compareList.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 500, background: 'rgba(17,17,17,0.97)', borderTop: `2px solid ${accent}`, backdropFilter: 'blur(12px)', padding: '12px clamp(20px,5vw,80px)', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: accent, letterSpacing: '2px', flexShrink: 0 }}>COMPARAR ({compareList.length}/3)</span>
          <div style={{ display: 'flex', gap: '8px', flex: 1, flexWrap: 'wrap' }}>
            {compareProducts.map((p) => (
              <span key={p.id} style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text)', background: 'var(--surface)', border: '1px solid var(--border)', padding: '4px 10px' }}>{p.name}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            {compareList.length >= 2 && (
              <button onClick={() => setShowCompare(true)} style={{ background: accent, color: '#111', border: 'none', fontFamily: '"Bebas Neue", sans-serif', fontSize: '16px', padding: '8px 20px', cursor: 'pointer', letterSpacing: '1px' }}>
                VER COMPARACIÓN
              </button>
            )}
            <button onClick={() => setCompareList([])} style={{ background: 'transparent', color: 'var(--text-muted)', border: '1px solid var(--border)', fontFamily: '"DM Mono", monospace', fontSize: '10px', padding: '8px 14px', cursor: 'pointer', letterSpacing: '1px' }}>
              LIMPIAR
            </button>
          </div>
        </div>
      )}

      {/* COMPARE MODAL */}
      {showCompare && (
        <div onClick={() => setShowCompare(false)} style={{ position: 'fixed', inset: 0, zIndex: 600, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg)', border: `1px solid ${accent}`, maxWidth: '900px', width: '100%', maxHeight: '90vh', overflow: 'auto', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '28px', color: accent, letterSpacing: '2px' }}>COMPARACIÓN DE PRODUCTOS</span>
              <button onClick={() => setShowCompare(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${compareProducts.length}, 1fr)`, gap: '1px', background: 'var(--border)' }}>
              {compareProducts.map((p) => {
                const sp = p.discount_percentage && p.discount_percentage > 0 ? Math.round(p.price - p.price * (p.discount_percentage / 100)) : p.price;
                return (
                  <div key={p.id} style={{ background: 'var(--surface)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {p.image_url && <img src={p.image_url} alt={p.name} style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />}
                    <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '20px', color: 'var(--text)' }}>{p.name}</div>
                    <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '24px', color: accent }}>{fmt(sp)}</div>
                    {p.discount_percentage && p.discount_percentage > 0 && <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: '#e55' }}>-{p.discount_percentage}% descuento</div>}
                    <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '8px' }}>CATEGORÍA</div>
                    <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text)' }}>{p.category}</div>
                    <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase', marginTop: '8px' }}>ESPECIFICACIONES</div>
                    <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text)', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{p.specs || '—'}</div>
                    <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: (p.inventory ?? 0) > 0 ? '#25d366' : '#e55', marginTop: '4px' }}>
                      {(p.inventory ?? 0) > 0 ? `✓ En stock (${p.inventory} uds)` : '✗ Agotado'}
                    </div>
                    <Link href={`/productos/${toSlug(p.name)}`} style={{ background: accent, color: '#111', textAlign: 'center', padding: '10px', fontFamily: '"Bebas Neue", sans-serif', fontSize: '16px', letterSpacing: '1px', textDecoration: 'none', marginTop: 'auto' }}>
                      VER PRODUCTO
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
