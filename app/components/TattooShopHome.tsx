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

function LogoMark({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style={{ width: 80, height: 80 }}>
      <circle cx="60" cy="60" r="55" fill="none" stroke={accent} strokeWidth="2" opacity="0.6" />
      <circle cx="60" cy="60" r="44" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.3" />
      <line x1="60" y1="20" x2="60" y2="90" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="60,90 55,75 65,75" fill={accent} />
      <line x1="38" y1="45" x2="82" y2="45" stroke={accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="44" y1="36" x2="76" y2="36" stroke={accent} strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function ProductCard({ product, idx, onAdd, accent }: { product: Product; idx: number; onAdd: (p: Product) => void; accent: string }) {
  const [hovered, setHovered] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
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
        boxShadow: hasDiscount ? `0 0 24px rgba(229, 85, 85, 0.3)` : 'none',
      }}
    >
      {(product.discount_percentage && product.discount_percentage > 0) ? (
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
            style={{
              background: added ? accent : 'transparent',
              color: added ? '#111' : accent,
              border: `1px solid ${accent}`,
              fontFamily: '"DM Mono", monospace',
              fontSize: '10px',
              letterSpacing: '1.5px',
              padding: '8px 14px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (!added) {
                (e.currentTarget as HTMLButtonElement).style.background = accent;
                (e.currentTarget as HTMLButtonElement).style.color = '#111';
              }
            }}
            onMouseLeave={(e) => {
              if (!added) {
                (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.color = accent;
              }
            }}
          >
            {added ? '✓ Agregado' : '+ Carrito'}
          </button>
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
                      style={{ width: '28px', height: '28px', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
  const [activeFilter, setActiveFilter] = useState('all');
  const [navScrolled, setNavScrolled] = useState(false);
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

  const filtered = activeFilter === 'all' ? products : products.filter((p) => p.category.toLowerCase() === activeFilter.toLowerCase());

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...product, qty: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));
  const changeQty = (id: string, delta: number) =>
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)).filter((i) => i.qty > 0));

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const categories = [
    { key: 'kits', label: 'Kits', count: products.filter(p => p.category === 'Kits').length },
    { key: 'máquinas', label: 'Máquinas', count: products.filter(p => p.category === 'Máquinas').length },
    { key: 'insumos', label: 'Insumos', count: products.filter(p => p.category === 'Insumos').length },
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
          position: 'relative',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', color: accent, textDecoration: 'none' }}>
          <BrandLogo size={32} />
        </Link>
        <div style={{ position: 'absolute', right: 'clamp(20px,5vw,80px)', top: '50%', transform: 'translateY(-50%)', color: accent, margin: '8px 0' }}>
          <BrandLogoCombined width={90} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          {['Kits', 'Máquinas', 'Insumos'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveFilter(cat.toLowerCase());
                document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                fontFamily: '"DM Mono", monospace',
                fontSize: '11px',
                letterSpacing: '1.5px',
                cursor: 'pointer',
                textTransform: 'uppercase',
                padding: '4px 0',
                borderBottom: '1px solid transparent',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = accent;
                (e.currentTarget as HTMLButtonElement).style.borderBottomColor = accent;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                (e.currentTarget as HTMLButtonElement).style.borderBottomColor = 'transparent';
              }}
            >
              {cat}
            </button>
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
          <span>EST. 2018</span>
          <span style={{ flex: 1, height: '1px', background: 'var(--border)', maxWidth: '80px' }} />
          <span>BOGOTÁ, COL</span>
        </div>

        <div
          style={{
            fontFamily: '"Bebas Neue", sans-serif',
            fontSize: 'clamp(72px,14vw,200px)',
            lineHeight: 0.88,
            color: 'var(--text)',
            textTransform: 'uppercase',
            position: 'relative',
            zIndex: 1,
          }}
        >
          TATTOO
          <span style={{ color: accent }}>SHOP</span>
          <br />
          <span style={{ fontSize: 'clamp(40px,7vw,100px)', color: 'var(--text-muted)' }}>COLOMBIA</span>
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
            <button
              key={cat.key}
              onClick={() => {
                setActiveFilter(cat.key);
                document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              style={{
                background: 'var(--surface)',
                border: `2px solid ${accent}`,
                borderRadius: '4px',
                padding: 'clamp(28px,5vw,56px) clamp(20px,4vw,48px)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = accent;
                (e.currentTarget as HTMLButtonElement).style.color = '#111';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-4px)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 12px 32px ${accent}44`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)';
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              }}
            >
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: accent, letterSpacing: '3px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>0{i + 1}</span>
                <span style={{ height: '2px', width: '20px', background: accent }} />
              </div>
              <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(32px,5vw,64px)', lineHeight: 0.9, color: 'var(--text)', marginBottom: '16px' }}>
                {cat.label.toUpperCase()}
              </div>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-dim)', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{cat.count} productos</span>
                <span style={{ transition: 'transform 0.3s' }}>→</span>
              </div>
            </button>
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

        {loading ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Cargando productos...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No hay productos en esta categoría
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1px',
                background: 'var(--border)',
              }}
            >
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} idx={i} onAdd={addToCart} accent={accent} />
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
            Desde 2018 somos el proveedor de confianza de tatuadores profesionales en Colombia. Trabajamos directamente con fabricantes certificados para garantizar insumos de alta calidad a precios justos. Envío a todas las ciudades del país.
          </p>
        </div>
        <div style={{ padding: 'clamp(48px,8vw,96px) clamp(24px,5vw,80px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--surface)' }}>
          {[
            { n: '500+', label: 'Clientes activos' },
            { n: '48h', label: 'Tiempo de entrega promedio' },
            { n: '100%', label: 'Garantía en productos' },
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

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div style={{ padding: 'clamp(40px,6vw,80px) clamp(20px,5vw,80px)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: accent, letterSpacing: '3px', marginBottom: '12px' }}>NEWSLETTER</div>
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
            <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-dim)', lineHeight: 1.7, letterSpacing: '0.5px' }}>
              Tu proveedor profesional<br />
              de insumos para tatuaje<br />
              en Colombia.
            </p>
          </div>

          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: accent, letterSpacing: '3px', marginBottom: '18px' }}>CATÁLOGO</div>
            {['Kits de Inicio', 'Máquinas Rotary', 'Máquinas Coil', 'Agujas y Cartridges', 'Tintas', 'Insumos Descartables'].map((l) => (
              <div key={l} style={{ marginBottom: '10px' }}>
                <a
                  href="#"
                  style={{ color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace', fontSize: '12px', textDecoration: 'none', letterSpacing: '0.5px', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = accent;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
                  }}
                >
                  {l}
                </a>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: accent, letterSpacing: '3px', marginBottom: '18px' }}>INFORMACIÓN</div>
            {['Política de Envíos', 'Devoluciones y Garantía', 'Preguntas Frecuentes', 'Métodos de Pago', 'Sobre Nosotros', 'Términos y Condiciones'].map((l) => (
              <div key={l} style={{ marginBottom: '10px' }}>
                <a
                  href="#"
                  style={{ color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace', fontSize: '12px', textDecoration: 'none', letterSpacing: '0.5px', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = accent;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)';
                  }}
                >
                  {l}
                </a>
              </div>
            ))}
          </div>

          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: accent, letterSpacing: '3px', marginBottom: '18px' }}>CONTACTO</div>
            <div style={{ marginBottom: '20px' }}>
              <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                Cra 7 #45-23<br />
                Bogotá, Colombia<br />
                Lun-Vie 8am-6pm
              </p>
            </div>
            <a
              href="https://wa.me/573000000000"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: accent,
                color: '#111',
                textDecoration: 'none',
                padding: '10px 16px',
                fontFamily: '"DM Mono", monospace',
                fontSize: '11px',
                letterSpacing: '1px',
                marginBottom: '24px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = '#ffe033';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.background = accent;
              }}
            >
              <WhatsAppLogo size="16px" />
              WHATSAPP
            </a>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: accent, letterSpacing: '3px', marginBottom: '12px' }}>REDES SOCIALES</div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {['Instagram', 'TikTok', 'Facebook', 'YouTube'].map((s) => (
                <a
                  key={s}
                  href="#"
                  style={{
                    color: 'var(--text-muted)',
                    fontFamily: '"DM Mono", monospace',
                    fontSize: '10px',
                    textDecoration: 'none',
                    border: '1px solid var(--border)',
                    padding: '6px 10px',
                    letterSpacing: '1px',
                    transition: 'all 0.2s',
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
                  {s}
                </a>
              ))}
            </div>
          </div>

          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: accent, letterSpacing: '3px', marginBottom: '18px' }}>PAGAMOS CON</div>
            {['PSE / Bancolombia', 'Nequi / Daviplata', 'Contraentrega', 'Tarjeta Crédito/Débito', 'Efecty / Baloto'].map((p) => (
              <div
                key={p}
                style={{
                  marginBottom: '8px',
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  letterSpacing: '0.5px',
                }}
              >
                {p}
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: '20px clamp(20px,5vw,80px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '1px' }}>TattooShop Colombia ©2026 — Todos los derechos reservados</div>
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '1px' }}>
            Hecho con <span style={{ color: accent }}>✦</span> en Colombia
          </div>
        </div>
      </footer>

      {/* CART DRAWER */}
      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onRemove={removeFromCart} onQty={changeQty} accent={accent} onCheckout={() => { setCartOpen(false); router.push('/checkout'); }} />}
    </div>
  );
}
