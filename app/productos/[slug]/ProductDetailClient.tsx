'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import WhatsAppLogo from '@/app/components/WhatsAppLogo';
import BrandLogo from '@/app/components/BrandLogo';

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
    Kits: '✦',
    Máquinas: '⚙',
    Insumos: '◈',
  };
  return icons[category] || '◈';
};

function ProductPlaceholderLarge({ icon, category, accent }: { icon: string; category: string; accent: string }) {
  return (
    <svg viewBox="0 0 600 500" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', display: 'block' }}>
      <defs>
        <linearGradient id="grad-detail" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e1e1e" />
          <stop offset="100%" stopColor="#2a2a2a" />
        </linearGradient>
      </defs>
      <rect width="600" height="500" fill="url(#grad-detail)" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <line key={`h${i}`} x1="0" y1={i * 72} x2="600" y2={i * 72} stroke="#ffffff" strokeOpacity="0.03" strokeWidth="1" />
      ))}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <line key={`v${i}`} x1={i * 75} y1="0" x2={i * 75} y2="500" stroke="#ffffff" strokeOpacity="0.03" strokeWidth="1" />
      ))}
      <text x="300" y="270" textAnchor="middle" fontSize="120" fill={accent} opacity="0.12" fontFamily="sans-serif">
        {icon}
      </text>
      <text x="300" y="340" textAnchor="middle" fontSize="13" fill={accent} opacity="0.3" fontFamily="monospace" letterSpacing="6">
        {category.toUpperCase()}
      </text>
    </svg>
  );
}

function CartDrawer({ cart, onClose, onRemove, onQty, accent, onCheckout }: { cart: CartItem[]; onClose: () => void; onRemove: (id: string) => void; onQty: (id: string, delta: number) => void; accent: string; onCheckout: () => void }) {
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
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #2e2e2e', color: 'var(--text)', cursor: 'pointer', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.2s' }} onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = accent; }} onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2e2e2e'; }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
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
                    <button onClick={() => onQty(item.id, -1)} style={{ width: '28px', height: '28px', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                    <span style={{ width: '28px', textAlign: 'center', fontFamily: '"DM Mono", monospace', fontSize: '12px' }}>{item.qty}</span>
                    <button onClick={() => onQty(item.id, 1)} style={{ width: '28px', height: '28px', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                  </div>
                  <button onClick={() => onRemove(item.id)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '11px', fontFamily: '"DM Mono", monospace', transition: 'color 0.2s' }} onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#e55'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#555'; }}>
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
            <button style={{ width: '100%', padding: '16px', background: accent, color: '#111', border: 'none', fontFamily: '"Bebas Neue", sans-serif', fontSize: '22px', letterSpacing: '1px', cursor: 'pointer', transition: 'background 0.2s,transform 0.1s' }} onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#ffe033'; }} onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = accent; }} onClick={onCheckout} onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)'; }} onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}>
              PAGAR AHORA
            </button>
            <button onClick={onClose} style={{ width: '100%', marginTop: '10px', padding: '12px', background: 'none', color: 'var(--text-muted)', border: '1px solid #2e2e2e', fontFamily: '"DM Mono", monospace', fontSize: '12px', letterSpacing: '1px', cursor: 'pointer', transition: 'border-color 0.2s,color 0.2s' }} onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = accent; (e.currentTarget as HTMLButtonElement).style.color = accent; }} onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#2e2e2e'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}>
              SEGUIR COMPRANDO
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const accent = '#FFD400';
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);

  const hasDiscount = !!(product.discount_percentage && product.discount_percentage > 0);
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

  useEffect(() => {
    const load = () => {
      try {
        const stored = localStorage.getItem('ts_cart');
        if (stored) {
          const c: CartItem[] = JSON.parse(stored);
          setCart(c);
          setCartCount(c.reduce((s, i) => s + i.qty, 0));
        }
      } catch {}
    };
    load();
    window.addEventListener('storage', load);
    return () => window.removeEventListener('storage', load);
  }, []);

  const handleAddToCart = () => {
    try {
      const stored = localStorage.getItem('ts_cart');
      const cart: CartItem[] = stored ? JSON.parse(stored) : [];
      const existing = cart.find((i) => i.id === product.id);
      let updated: CartItem[];
      if (existing) {
        updated = cart.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i));
      } else {
        updated = [...cart, { ...product, qty }];
      }
      localStorage.setItem('ts_cart', JSON.stringify(updated));
      setCartCount(updated.reduce((s, i) => s + i.qty, 0));
    } catch {}
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    try {
      const stored = localStorage.getItem('ts_cart');
      const c: CartItem[] = stored ? JSON.parse(stored) : [];
      const existing = c.find((i) => i.id === product.id);
      const updated = existing
        ? c.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i))
        : [...c, { ...product, qty }];
      localStorage.setItem('ts_cart', JSON.stringify(updated));
    } catch {}
    router.push('/checkout');
  };

  const removeFromCart = (id: string) => {
    const updated = cart.filter((i) => i.id !== id);
    setCart(updated);
    localStorage.setItem('ts_cart', JSON.stringify(updated));
    setCartCount(updated.reduce((s, i) => s + i.qty, 0));
  };

  const changeQty = (id: string, delta: number) => {
    const updated = cart.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)).filter((i) => i.qty > 0);
    setCart(updated);
    localStorage.setItem('ts_cart', JSON.stringify(updated));
    setCartCount(updated.reduce((s, i) => s + i.qty, 0));
  };

  // Parsear specs: si *texto* está en misma línea, hace BOLD grande. Si * está en líneas separadas, hace pequeño
  interface SpecItem { text: string; isSubItem: boolean; isBold: boolean; }
  const specsItems: SpecItem[] = (() => {
    if (!product.specs) return [];
    const raw = product.specs.includes('\n')
      ? product.specs.split('\n').map((s) => s.trim()).filter(Boolean)
      : product.specs.split(/[,|·]/).map((s) => s.trim()).filter(Boolean);
    const result: SpecItem[] = [];
    let inSub = false;
    for (const line of raw) {
      if (line === '*') { inSub = !inSub; }
      else {
        // Si está rodeado de * en la misma línea (*texto*), es BOLD
        const boldMatch = line.match(/^\*(.+)\*$/);
        if (boldMatch) {
          result.push({ text: boldMatch[1], isSubItem: false, isBold: true });
        } else {
          result.push({ text: line, isSubItem: inSub, isBold: false });
        }
      }
    }
    return result;
  })();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* NAV */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 700,
          background: 'rgba(18,18,18,0.97)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid #2e2e2e',
          padding: '0 clamp(20px,5vw,80px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', color: accent, textDecoration: 'none' }}>
          <BrandLogo size={32} />
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link
            href="/"
            style={{
              color: 'var(--text-muted)',
              fontFamily: '"DM Mono", monospace',
              fontSize: '10px',
              letterSpacing: '1.5px',
              textDecoration: 'none',
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = accent; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'; }}
          >
            ← Volver al catálogo
          </Link>

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
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>CARRITO</span>
            {cartCount > 0 && <span style={{ fontWeight: 700 }}>{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* BREADCRUMB */}
      <div
        style={{
          padding: '16px clamp(20px,5vw,80px)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: '"DM Mono", monospace',
          fontSize: '10px',
          color: 'var(--text-dim)',
          letterSpacing: '1px',
        }}
      >
        <Link href="/" style={{ color: 'var(--text-dim)', textDecoration: 'none' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = accent; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-dim)'; }}
        >INICIO</Link>
        <span>›</span>
        <span style={{ color: 'var(--text-muted)' }}>{product.category.toUpperCase()}</span>
        <span>›</span>
        <span style={{ color: 'var(--text-muted)' }}>{product.name.toUpperCase()}</span>
      </div>

      {/* MAIN CONTENT */}
      <div
        data-product-detail=""
        style={{
          padding: 'clamp(32px,6vw,72px) clamp(20px,5vw,80px)',
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.1fr) minmax(0,0.9fr)',
          gap: '1px',
          background: 'var(--border)',
          alignItems: 'start',
        }}
      >
        {/* IMAGE PANEL */}
        <div style={{ background: 'var(--bg)', position: 'static' }}>

          {/* Botón atrás encima de la foto */}
          <Link
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              marginBottom: '8px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontFamily: '"DM Mono", monospace',
              fontSize: '10px',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = accent; (e.currentTarget as HTMLAnchorElement).style.borderColor = accent; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'; }}
          >
            ← ATRÁS
          </Link>
          <div
            style={{
              aspectRatio: '4/3',
              overflow: 'hidden',
              position: 'relative',
              background: 'var(--surface)',
            }}
          >
            {(product.discount_percentage && product.discount_percentage > 0) && (
              <div
                style={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                  zIndex: 2,
                  background: '#e55',
                  color: '#fff',
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '11px',
                  letterSpacing: '2px',
                  padding: '5px 12px',
                  textTransform: 'uppercase',
                  fontWeight: '700',
                }}
              >
                -{product.discount_percentage}% DESCUENTO
              </div>
            )}
            {product.tag && !(product.discount_percentage && product.discount_percentage > 0) && (
              <div
                style={{
                  position: 'absolute',
                  top: 20,
                  left: 20,
                  zIndex: 2,
                  background: accent,
                  color: '#111',
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '11px',
                  letterSpacing: '2px',
                  padding: '5px 12px',
                  textTransform: 'uppercase',
                }}
              >
                {product.tag}
              </div>
            )}
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <ProductPlaceholderLarge icon={getCategoryIcon(product.category)} category={product.category} accent={accent} />
            )}
          </div>

          {/* Guarantee strip */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: '1px',
              background: 'var(--border)',
              marginTop: '1px',
            }}
          >
            {[
              { icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <path d="M12 2L2 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
                </svg>
              ), label: 'GARANTÍA', sub: '100% original' },
              { icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              ), label: 'ENVÍO', sub: 'Todo Colombia' },
              { icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
                </svg>
              ), label: 'PAGO', sub: 'Contraentrega' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: 'var(--surface)',
                  padding: '16px 12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '4px', color: accent }}>{item.icon}</div>
                <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: accent, letterSpacing: '2px' }}>{item.label}</div>
                <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: 'var(--text-dim)', marginTop: '2px', letterSpacing: '0.5px' }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* INFO PANEL */}
        <div style={{ background: 'var(--bg)', padding: 'clamp(24px,4vw,56px)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Category + ID */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: accent, letterSpacing: '3px', textTransform: 'uppercase' }}>
              {getCategoryIcon(product.category)} {product.category}
            </div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '8px', color: 'var(--text-dim)', letterSpacing: '0.5px', textAlign: 'right', opacity: 0.5 }}>
              SKU {String(product.id).slice(0, 8).toUpperCase()}
            </div>
          </div>

          {/* Name */}
          <div>
            <h1
              style={{
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: 'clamp(40px,6vw,72px)',
                lineHeight: 0.92,
                color: 'var(--text)',
                letterSpacing: '0.5px',
              }}
            >
              {product.name}
            </h1>
          </div>

          {/* Price */}
          <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
            {/* Fila principal: precio amarillo + precio tachado en el mismo eje horizontal */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontFamily: '"Bebas Neue", sans-serif',
                  fontSize: 'clamp(36px,5vw,56px)',
                  color: accent,
                  lineHeight: 1,
                }}
              >
                {fmt(salePrice)}
              </span>
              {hasDiscount && originalPrice && (
                <span
                  style={{
                    fontFamily: '"DM Mono", monospace',
                    fontSize: '16px',
                    color: 'var(--text-dim)',
                    textDecoration: 'line-through',
                    lineHeight: 1,
                  }}
                >
                  {fmt(originalPrice)}
                </span>
              )}
            </div>
            {/* Badge AHORRAS debajo, alineado a la izquierda bajo el precio */}
            {hasDiscount && originalPrice && (
              <div style={{ marginTop: '8px' }}>
                <span
                  style={{
                    fontFamily: '"DM Mono", monospace',
                    fontSize: '11px',
                    color: '#e55',
                    letterSpacing: '1px',
                    background: 'rgba(229,85,85,0.12)',
                    border: '1px solid rgba(229,85,85,0.25)',
                    padding: '5px 10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                  }}
                >
                  AHORRAS {fmt(originalPrice - salePrice)}
                </span>
              </div>
            )}
          </div>

          {/* Specs */}
          {specsItems.length > 0 && (
            <div>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: accent, letterSpacing: '3px', marginBottom: '16px' }}>
                ESPECIFICACIONES DEL KIT
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {specsItems.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: item.isBold ? '14px 0' : item.isSubItem ? '7px 0 7px 16px' : '11px 0',
                      borderBottom: i < specsItems.length - 1 ? `1px solid ${item.isSubItem ? 'rgba(46,46,46,0.5)' : 'var(--border)'}` : 'none',
                      background: item.isSubItem ? 'rgba(255,255,255,0.015)' : 'transparent',
                    }}
                  >
                    {!item.isBold && <span style={{ color: item.isSubItem ? 'var(--text-dim)' : accent, fontSize: item.isSubItem ? '8px' : '10px', marginTop: '2px', flexShrink: 0 }}>
                      {item.isSubItem ? '›' : '✦'}
                    </span>}
                    <span style={{
                      fontFamily: item.isBold ? '"Bebas Neue", sans-serif' : '"DM Mono", monospace',
                      fontSize: item.isBold ? '16px' : item.isSubItem ? '10px' : '12px',
                      color: item.isBold ? accent : item.isSubItem ? 'var(--text-dim)' : 'var(--text-muted)',
                      letterSpacing: item.isBold ? '1px' : item.isSubItem ? '0' : '0.5px',
                      lineHeight: 1.5,
                      fontStyle: item.isSubItem && !item.isBold ? 'italic' : 'normal',
                      fontWeight: item.isBold ? 'bold' : 'normal',
                    }}>
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Qty + Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '3px' }}>CANTIDAD</div>

            {/* Qty selector */}
            <div
              style={{
                display: 'flex',
                border: '1px solid var(--border)',
                background: 'var(--surface)',
                alignSelf: 'flex-start',
              }}
            >
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                style={{ width: '48px', height: '48px', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = accent; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'; }}
              >−</button>
              <div style={{ width: '60px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Bebas Neue", sans-serif', fontSize: '26px', color: 'var(--text)', borderLeft: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                {qty}
              </div>
              <button
                onClick={() => setQty((q) => q + 1)}
                style={{ width: '48px', height: '48px', background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer', fontSize: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = accent; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'; }}
              >+</button>
            </div>

            {/* COMPRAR — botón principal, el más llamativo */}
            <button
              onClick={handleBuyNow}
              style={{
                width: '100%',
                padding: '20px',
                background: accent,
                color: '#111',
                border: 'none',
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: '28px',
                letterSpacing: '2px',
                cursor: 'pointer',
                transition: 'background 0.2s, transform 0.1s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: `0 0 32px ${accent}44`,
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = '#ffe033'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = accent; }}
              onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)'; }}
              onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96C5 16.1 6.1 17 7.4 17H19v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63H15.5c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1 1 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>
              COMPRAR AHORA
            </button>

            {/* Agregar al carrito — secundario */}
            <button
              onClick={handleAddToCart}
              style={{
                width: '100%',
                padding: '14px',
                background: added ? accent : 'transparent',
                color: added ? '#111' : accent,
                border: `1px solid ${accent}`,
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: '18px',
                letterSpacing: '1px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => { if (!added) { (e.currentTarget as HTMLButtonElement).style.background = accent; (e.currentTarget as HTMLButtonElement).style.color = '#111'; } }}
              onMouseLeave={(e) => { if (!added) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = accent; } }}
            >
              {added ? '✓ AGREGADO AL CARRITO' : '+ AGREGAR AL CARRITO'}
            </button>

            {/* WhatsApp — terciario */}
            <a
              href={`https://wa.me/573000000000?text=Hola%2C%20quiero%20pedir%3A%20${encodeURIComponent(product.name)}%20x${qty}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                background: 'transparent',
                color: '#25d366',
                textDecoration: 'none',
                fontFamily: '"DM Mono", monospace',
                fontSize: '12px',
                letterSpacing: '1px',
                border: '1px solid #25d36644',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#25d36618'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#25d366'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; (e.currentTarget as HTMLAnchorElement).style.borderColor = '#25d36644'; }}
            >
              <WhatsAppLogo size="16px" />
              PEDIR POR WHATSAPP
            </a>
          </div>

          {/* Sub-info — envíos */}
          <div
            style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: '10px',
              color: 'var(--text-dim)',
              letterSpacing: '0.5px',
              lineHeight: 1.9,
              borderTop: '1px solid var(--border)',
              paddingTop: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
            }}
          >
            <div style={{ color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '2px', fontSize: '9px' }}>INFORMACIÓN DE ENVÍO</div>
            <div>✓ Envíos a todo Colombia</div>
            <div style={{ paddingLeft: '14px', color: 'var(--text-dim)', fontSize: '9px' }}>
              · 1–3 días hábiles en ciudades capitales
            </div>
            <div style={{ paddingLeft: '14px', color: 'var(--text-dim)', fontSize: '9px' }}>
              · 3–5 días hábiles en el resto del país
            </div>
            <div style={{ marginTop: '4px' }}>
              ✓ Pago contraentrega disponible{' '}
              <span style={{ color: '#e55', fontSize: '9px' }}>*</span>
            </div>
            <div style={{ paddingLeft: '14px', color: 'var(--text-dim)', fontSize: '9px', fontStyle: 'italic', lineHeight: 1.5, marginBottom: '4px' }}>
              * Disponible en algunas zonas — no aplica para todas las ciudades.
            </div>
            <a
              href={`https://wa.me/573000000000?text=Hola%21%20Para%20verificar%20si%20en%20mi%20zona%20hay%20cobertura%20de%20contra%20entrega%2C%20me%20encuentro%20en%E2%80%A6`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                paddingLeft: '14px',
                color: '#25d366',
                fontSize: '9px',
                textDecoration: 'none',
                letterSpacing: '1px',
                transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.7'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '12px', height: '12px' }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004c-1.025 0-2.04-.312-2.926-.902L6.583 3.715l1.922 6.155c-.727 1.195-1.11 2.569-1.11 4.001 0 4.495 3.665 8.16 8.16 8.16s8.16-3.665 8.16-8.16-3.665-8.159-8.16-8.159"/></svg> Verifica aquí →
            </a>
            <div style={{ marginTop: '4px' }}>✓ Garantía directa con nosotros</div>
            <div>✓ Producto 100% original</div>
          </div>

          {/* Total if qty > 1 */}
          {qty > 1 && (
            <div
              style={{
                background: 'var(--surface)',
                border: `1px solid ${accent}33`,
                padding: '16px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
                TOTAL ({qty} unidades)
              </span>
              <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '28px', color: accent }}>
                {fmt(salePrice * qty)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER MINI */}
      <footer
        style={{
          borderTop: '1px solid var(--border)',
          padding: '20px clamp(20px,5vw,80px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--surface)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '1px' }}>
          TattooShop Colombia ©2026 — Todos los derechos reservados
        </div>
        <Link
          href="/"
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '10px',
            color: accent,
            letterSpacing: '2px',
            textDecoration: 'none',
            textTransform: 'uppercase',
          }}
        >
          ← Ver todos los productos
        </Link>
      </footer>

      {cartOpen && <CartDrawer cart={cart} onClose={() => setCartOpen(false)} onRemove={removeFromCart} onQty={changeQty} accent={accent} onCheckout={() => { setCartOpen(false); router.push('/checkout'); }} />}
    </div>
  );
}
