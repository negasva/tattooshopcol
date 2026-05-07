'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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

function LogoMark({ accent }: { accent: string }) {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style={{ width: 48, height: 48 }}>
      <circle cx="60" cy="60" r="55" fill="none" stroke={accent} strokeWidth="2" opacity="0.6" />
      <circle cx="60" cy="60" r="44" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.3" />
      <line x1="60" y1="20" x2="60" y2="90" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="60,90 55,75 65,75" fill={accent} />
      <line x1="38" y1="45" x2="82" y2="45" stroke={accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="44" y1="36" x2="76" y2="36" stroke={accent} strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

export default function ProductDetailClient({ product }: { product: Product }) {
  const accent = '#FFD400';
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [cartCount, setCartCount] = useState(0);

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
    try {
      const stored = localStorage.getItem('ts_cart');
      if (stored) {
        const cart: CartItem[] = JSON.parse(stored);
        setCartCount(cart.reduce((s, i) => s + i.qty, 0));
      }
    } catch {}
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

  const specsLines = product.specs
    ? product.specs.split(/[,|·\n]/).map((s) => s.trim()).filter(Boolean)
    : [];

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
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <LogoMark accent={accent} />
          <div>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', color: 'var(--text)', letterSpacing: '1px', lineHeight: 1 }}>TATTOOSHOP</div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '8px', color: accent, letterSpacing: '3px' }}>COLOMBIA</div>
          </div>
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

          <Link
            href="/"
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
          </Link>
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
        <div style={{ background: 'var(--bg)', position: 'sticky', top: '80px' }}>
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
              gridTemplateColumns: 'repeat(3,1fr)',
              gap: '1px',
              background: 'var(--border)',
              marginTop: '1px',
            }}
          >
            {[
              { icon: '🛡', label: 'GARANTÍA', sub: '100% original' },
              { icon: '🚚', label: 'ENVÍO', sub: 'Todo Colombia' },
              { icon: '💳', label: 'PAGO', sub: 'Contraentrega' },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  background: 'var(--surface)',
                  padding: '16px 12px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '20px', marginBottom: '4px' }}>{item.icon}</div>
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
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '1px' }}>
              SKU-{String(product.id).padStart(4, '0')}
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
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '16px', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '20px 0' }}>
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
                }}
              >
                {fmt(originalPrice)}
              </span>
            )}
            {hasDiscount && originalPrice && (
              <span
                style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '11px',
                  color: '#e55',
                  letterSpacing: '1px',
                  background: 'rgba(229,85,85,0.12)',
                  padding: '4px 8px',
                }}
              >
                AHORRAS {fmt(originalPrice - salePrice)}
              </span>
            )}
          </div>

          {/* Specs */}
          {specsLines.length > 0 && (
            <div>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: accent, letterSpacing: '3px', marginBottom: '16px' }}>
                ESPECIFICACIONES DEL KIT
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {specsLines.map((spec, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 0',
                      borderBottom: i < specsLines.length - 1 ? '1px solid var(--border)' : 'none',
                    }}
                  >
                    <span style={{ color: accent, fontSize: '10px', marginTop: '2px', flexShrink: 0 }}>✦</span>
                    <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '0.5px', lineHeight: 1.5 }}>
                      {spec}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Qty + Add to cart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '3px' }}>CANTIDAD</div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
              <div
                style={{
                  display: 'flex',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                }}
              >
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  style={{
                    width: '44px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = accent; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'; }}
                >
                  −
                </button>
                <div
                  style={{
                    width: '56px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: '"Bebas Neue", sans-serif',
                    fontSize: '24px',
                    color: 'var(--text)',
                    borderLeft: '1px solid var(--border)',
                    borderRight: '1px solid var(--border)',
                  }}
                >
                  {qty}
                </div>
                <button
                  onClick={() => setQty((q) => q + 1)}
                  style={{
                    width: '44px',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text)',
                    cursor: 'pointer',
                    fontSize: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = accent; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text)'; }}
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                style={{
                  flex: 1,
                  background: added ? accent : 'transparent',
                  color: added ? '#111' : accent,
                  border: `1px solid ${accent}`,
                  fontFamily: '"Bebas Neue", sans-serif',
                  fontSize: '22px',
                  letterSpacing: '1px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  padding: '0 24px',
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
                {added ? '✓ AGREGADO AL CARRITO' : '+ AGREGAR AL CARRITO'}
              </button>
            </div>

            {/* WhatsApp CTA */}
            <a
              href={`https://wa.me/573000000000?text=Hola%2C%20quiero%20pedir%3A%20${encodeURIComponent(product.name)}%20x${qty}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                padding: '16px',
                background: '#25d366',
                color: '#fff',
                textDecoration: 'none',
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: '22px',
                letterSpacing: '1px',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#1fba58'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = '#25d366'; }}
            >
              <span>💬</span> PEDIR POR WHATSAPP
            </a>
          </div>

          {/* Sub-info */}
          <div
            style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: '10px',
              color: 'var(--text-dim)',
              letterSpacing: '0.5px',
              lineHeight: 1.8,
              borderTop: '1px solid var(--border)',
              paddingTop: '20px',
            }}
          >
            <div>✓ Envío a todo Colombia — 1 a 3 días hábiles</div>
            <div>✓ Pago contraentrega disponible</div>
            <div>✓ Garantía del fabricante incluida</div>
            <div>✓ Producto 100% original certificado</div>
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
    </div>
  );
}
