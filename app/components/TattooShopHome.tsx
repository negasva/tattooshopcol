'use client';

import { useState, useEffect } from 'react';

interface Product {
  id: string;
  name: string;
  category: 'Kits' | 'Máquinas' | 'Insumos';
  price: number;
  tag: string;
  specs: string;
  icon: string;
  slug: string;
}

const PRODUCTS: Product[] = [
  {
    id: 'k1',
    slug: 'kit-iniciacion-profesional',
    name: 'Kit Iniciación Pro',
    category: 'Kits',
    price: 289000,
    tag: 'Más vendido',
    specs: '12 piezas — Completo',
    icon: '',
  },
  {
    id: 'k2',
    slug: 'kit-rotary-completo',
    name: 'Kit Rotary Completo',
    category: 'Kits',
    price: 520000,
    tag: 'Premium',
    specs: '18 piezas — Pro',
    icon: '',
  },
  {
    id: 'm1',
    slug: 'maquina-rotary-dragonfly',
    name: 'Dragonfly X2 Rotary',
    category: 'Máquinas',
    price: 680000,
    tag: 'Top rated',
    specs: '4.0mm — Inalámbrica',
    icon: '',
  },
  {
    id: 'm2',
    slug: 'maquina-pen-wireless',
    name: 'Pen Inalámbrica Pro',
    category: 'Máquinas',
    price: 420000,
    tag: 'Nueva',
    specs: '3.5mm — Batería 8h',
    icon: '',
  },
  {
    id: 'i1',
    slug: 'tintas-set-world-famous',
    name: 'Set Tintas World Famous',
    category: 'Insumos',
    price: 195000,
    tag: 'Oferta',
    specs: '20 colores — 30ml c/u',
    icon: '',
  },
  {
    id: 'i2',
    slug: 'agujas-cartridge-mixed',
    name: 'Agujas Cartridge Mixed',
    category: 'Insumos',
    price: 98000,
    tag: 'Pack',
    specs: '50 unidades — Surtidas',
    icon: '',
  },
];

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(n);

interface CartItem extends Product {
  qty: number;
}

export default function TattooShopHome() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [navScrolled, setNavScrolled] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterDone, setNewsletterDone] = useState(false);

  const accent = '#FFD400';
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const filtered =
    activeFilter === 'all'
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category.toLowerCase() === activeFilter.toLowerCase());

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { ...product, qty: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((i) => i.id !== id));
  const changeQty = (id: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i))
        .filter((i) => i.qty > 0);
    });
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setNewsletterDone(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterDone(false), 2000);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#141414' }}>
      {/* NAV */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 700,
          background: navScrolled ? 'rgba(18,18,18,0.97)' : 'transparent',
          backdropFilter: navScrolled ? 'blur(12px)' : 'none',
          borderBottom: navScrolled ? '1px solid #2e2e2e' : '1px solid transparent',
          transition: 'all .35s ease',
          padding: '0 clamp(20px,5vw,80px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 64,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 50, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M256 160c16-63.1 48-72 48-72s-8.9 32-72 48c-63.1 16-72 48-72 48s32-8.9 48-72c16-63.1 48-72 48-72s-8.9 32-72 48c-63.1 16-72 48-72 48s32-8.9 48-72zm0 192c-16 63.1-48 72-48 72s8.9-32 72-48c63.1-16 72-48 72-48s-32 8.9-48 72c-16 63.1-48 72-48 72s8.9-32 72-48c63.1-16 72-48 72-48s-32 8.9-48 72z"></path></svg>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#e8e8e8', letterSpacing: 1, lineHeight: 1 }}>
              TATTOOSHOP
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: accent, letterSpacing: 3 }}>COLOMBIA</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {['Kits', 'Máquinas', 'Insumos'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveFilter(cat.toLowerCase());
                document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#888',
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: 1.5,
                cursor: 'pointer',
                textTransform: 'uppercase',
                padding: '4px 0',
                borderBottom: '1px solid transparent',
                transition: 'all .2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = accent;
                e.currentTarget.style.borderBottomColor = accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#888';
                e.currentTarget.style.borderBottomColor = 'transparent';
              }}
            >
              {cat}
            </button>
          ))}
          <button
            onClick={() => setCartOpen(true)}
            style={{
              background: cartCount > 0 ? accent : 'transparent',
              color: cartCount > 0 ? '#111' : '#e8e8e8',
              border: `1px solid ${cartCount > 0 ? accent : '#2e2e2e'}`,
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: 1,
              padding: '8px 16px',
              cursor: 'pointer',
              transition: 'all .25s',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            onMouseEnter={(e) => {
              if (cartCount === 0) {
                e.currentTarget.style.borderColor = accent;
                e.currentTarget.style.color = accent;
              }
            }}
            onMouseLeave={(e) => {
              if (cartCount === 0) {
                e.currentTarget.style.borderColor = '#2e2e2e';
                e.currentTarget.style.color = '#e8e8e8';
              }
            }}
          >
            <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.4-11.3 2.5-2.4 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.5-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.3 5.7 23.7 9.1 31.7 11.7 13.3 4.2 25.5 3.6 35.2 2.1 10.8-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg>
            <span>CARRITO</span>
            {cartCount > 0 && <span style={{ fontWeight: 700 }}>{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: 'clamp(80px, 15vw, 160px) clamp(20px,5vw,80px)', textAlign: 'center', borderBottom: '1px solid #2e2e2e' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(48px,12vw,96px)', lineHeight: 1.1, color: '#e8e8e8', letterSpacing: 2, marginBottom: 8 }}>
          TATTOOSHOP
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: accent, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 60 }}>
          COLOMBIA
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, justifyContent: 'center', maxWidth: 960, margin: '0 auto' }}>
          {['Kits', 'Máquinas', 'Insumos'].map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveFilter(cat.toLowerCase());
                document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
              }}
              style={{
                flex: '1 1 120px',
                padding: '40px 24px',
                background: '#1c1c1c',
                border: '1px solid #2e2e2e',
                cursor: 'pointer',
                transition: 'all .3s',
                fontFamily: 'var(--font-display)',
                fontSize: 28,
                color: '#e8e8e8',
                letterSpacing: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#222';
                e.currentTarget.style.borderColor = accent;
                e.currentTarget.style.color = accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#1c1c1c';
                e.currentTarget.style.borderColor = '#2e2e2e';
                e.currentTarget.style.color = '#e8e8e8';
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* PRODUCTOS */}
      <section id="productos" style={{ padding: 'clamp(60px,10vw,120px) clamp(20px,5vw,80px)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, maxWidth: 1400, margin: '0 auto' }}>
          {filtered.map((product, idx) => (
            <ProductCard key={product.id} product={product} idx={idx} onAdd={addToCart} accent={accent} />
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: 'clamp(60px,10vw,120px) clamp(20px,5vw,80px)', borderTop: '1px solid #2e2e2e' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          {/* Newsletter */}
          <div style={{ marginBottom: 80, paddingBottom: 80, borderBottom: '1px solid #2e2e2e' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#e8e8e8', marginBottom: 20 }}>
              Newsletter
            </h3>
            <p style={{ color: '#888', marginBottom: 20, maxWidth: 500 }}>
              Recibe las últimas novedades, ofertas y lanzamientos directo en tu inbox.
            </p>
            <form onSubmit={handleNewsletter} style={{ display: 'flex', gap: 12, maxWidth: 400 }}>
              <input
                type="email"
                placeholder="tu@email.com"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  background: '#1c1c1c',
                  border: '1px solid #2e2e2e',
                  color: '#e8e8e8',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
              <button
                type="submit"
                style={{
                  padding: '12px 24px',
                  background: accent,
                  color: '#111',
                  border: 'none',
                  fontFamily: 'var(--font-display)',
                  fontSize: 16,
                  cursor: 'pointer',
                  transition: 'all .2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = '#ffe033')}
                onMouseLeave={(e) => (e.currentTarget.style.background = accent)}
              >
                {newsletterDone ? 'Suscrito' : 'Suscribirse'}
              </button>
            </form>
          </div>

          {/* Grid Footer */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 40 }}>
            <div>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
                Catálogo
              </h4>
              <ul style={{ listStyle: 'none' }}>
                {['Kits', 'Máquinas', 'Insumos'].map((cat) => (
                  <li key={cat} style={{ marginBottom: 8 }}>
                    <button
                      onClick={() => setActiveFilter(cat.toLowerCase())}
                      style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 14, transition: 'color .2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = accent)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}
                    >
                      {cat}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
                Información
              </h4>
              <ul style={{ listStyle: 'none' }}>
                {['Sobre nosotros', 'Envíos', 'Política de privacidad', 'FAQ'].map((item) => (
                  <li key={item} style={{ marginBottom: 8 }}>
                    <a href="#" style={{ color: '#888', textDecoration: 'none', fontSize: 14, transition: 'color .2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = accent)} onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}>
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
                Contacto
              </h4>
              <p style={{ color: '#888', fontSize: 14, marginBottom: 12 }}>+57 300 123 4567</p>
              <a
                href="https://wa.me/573001234567"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  background: '#25D366',
                  color: 'white',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontSize: 12,
                  fontFamily: 'var(--font-mono)',
                  transition: 'opacity .2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.8')}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
              >
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: 8 }}><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.4-11.3 2.5-2.4 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.5-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.3 5.7 23.7 9.1 31.7 11.7 13.3 4.2 25.5 3.6 35.2 2.1 10.8-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg>
                WhatsApp
              </a>
            </div>

            <div>
              <h4 style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: accent, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>
                Redes
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', gap: 12 }}>
                {['Instagram', 'TikTok', 'Facebook'].map((social) => (
                  <li key={social}>
                    <a href="#" style={{ color: '#888', textDecoration: 'none', fontSize: 14, transition: 'color .2s' }} onMouseEnter={(e) => (e.currentTarget.style.color = accent)} onMouseLeave={(e) => (e.currentTarget.style.color = '#888')}>
                      {social}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div style={{ marginTop: 60, paddingTop: 20, borderTop: '1px solid #2e2e2e', textAlign: 'center', color: '#555', fontSize: 12, fontFamily: 'var(--font-mono)' }}>
            © 2026 TattooShop Colombia. Todos los derechos reservados.
          </div>
        </div>
      </footer>

      {/* CART DRAWER */}
      {cartOpen && (
        <>
          <div
            onClick={() => setCartOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              zIndex: 800,
              backdropFilter: 'blur(4px)',
            }}
          />
          <div
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
            {/* Header */}
            <div style={{ padding: '28px', borderBottom: '1px solid #2e2e2e', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: accent, letterSpacing: 2, textTransform: 'uppercase' }}>Carrito</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, lineHeight: 1, marginTop: 4, color: '#e8e8e8' }}>
                  {cart.length}
                </div>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                style={{
                  background: 'none',
                  border: '1px solid #2e2e2e',
                  color: '#e8e8e8',
                  cursor: 'pointer',
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  transition: 'border-color .2s',
                }}
              >
                ✕
              </button>
            </div>

            {/* Items */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '0 28px' }}>
              {cart.length === 0 ? (
                <div style={{ paddingTop: 60, textAlign: 'center', color: '#888' }}>
                  <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.3 }}>
                    <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M6 18L18 6M6 6l12 12"></path></svg>
                  </div>
                  <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: 1 }}>Tu carrito está vacío</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} style={{ padding: '20px 0', borderBottom: '1px solid #2a2a2a', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                    <div style={{ fontSize: 24, opacity: 0.3, minWidth: 32 }}>{item.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#888', letterSpacing: 1, marginBottom: 3, textTransform: 'uppercase' }}>
                        {item.category}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 500, color: '#e8e8e8' }}>{item.name}</div>
                      <div style={{ color: accent, fontFamily: 'var(--font-mono)', fontSize: 13, marginTop: 4 }}>{fmt(item.price)}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 0, border: '1px solid #2e2e2e' }}>
                        <button onClick={() => changeQty(item.id, -1)} style={{ width: 28, height: 28, background: 'none', border: 'none', color: '#e8e8e8', cursor: 'pointer', fontSize: 16 }}>
                          −
                        </button>
                        <span style={{ width: 28, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{item.qty}</span>
                        <button onClick={() => changeQty(item.id, 1)} style={{ width: 28, height: 28, background: 'none', border: 'none', color: '#e8e8e8', cursor: 'pointer', fontSize: 16 }}>
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 11, fontFamily: 'var(--font-mono)', transition: 'color .2s' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#e55')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = '#555')}
                      >
                        eliminar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div style={{ padding: '24px 28px', borderTop: '1px solid #2e2e2e' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#888', letterSpacing: 1, textTransform: 'uppercase' }}>SUBTOTAL</span>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: accent }}>{fmt(total)}</span>
                </div>
                <p style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#555', marginBottom: 20 }}>Envío calculado al pagar · IVA incluido</p>
                <button
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: accent,
                    color: '#111',
                    border: 'none',
                    fontFamily: 'var(--font-display)',
                    fontSize: 22,
                    letterSpacing: 1,
                    cursor: 'pointer',
                    transition: 'background .2s,transform .1s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#ffe033')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = accent)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                    <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="0.8em" width="0.8em" xmlns="http://www.w3.org/2000/svg"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.4-11.3 2.5-2.4 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.5-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.3 5.7 23.7 9.1 31.7 11.7 13.3 4.2 25.5 3.6 35.2 2.1 10.8-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg>
                    PAGAR POR WHATSAPP
                  </div>
                </button>
                <button
                  onClick={() => setCartOpen(false)}
                  style={{
                    width: '100%',
                    marginTop: 10,
                    padding: '12px',
                    background: 'none',
                    color: '#888',
                    border: '1px solid #2e2e2e',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 12,
                    letterSpacing: 1,
                    cursor: 'pointer',
                    transition: 'border-color .2s,color .2s',
                    textTransform: 'uppercase',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = accent;
                    e.currentTarget.style.color = accent;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#2e2e2e';
                    e.currentTarget.style.color = '#888';
                  }}
                >
                  SEGUIR COMPRANDO
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
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

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? '#222222' : '#1c1c1c',
        border: `1px solid ${hovered ? accent + '33' : '#2e2e2e'}`,
        transition: 'all .25s ease',
        cursor: 'default',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Tag */}
      {product.tag && (
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            zIndex: 2,
            background: accent,
            color: '#111',
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: 2,
            padding: '3px 8px',
            textTransform: 'uppercase',
          }}
        >
          {product.tag}
        </div>
      )}

      {/* Index */}
      <div
        style={{
          position: 'absolute',
          top: 12,
          right: 14,
          zIndex: 2,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: hovered ? accent : '#555',
          transition: 'color .25s',
        }}
      >
        0{idx + 1}
      </div>

      {/* Image area */}
      <div
        style={{
          aspectRatio: '4/3',
          overflow: 'hidden',
          position: 'relative',
          background: '#1a1e22',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: 56,
            opacity: hovered ? 0.4 : 0.25,
            transition: 'opacity .25s',
          }}
        >
          {product.icon}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: '#888', letterSpacing: 2, textTransform: 'uppercase' }}>
          {product.category} — {product.specs}
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, lineHeight: 1.1, color: '#e8e8e8', letterSpacing: 0.5 }}>
          {product.name}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, color: accent }}>{fmt(product.price)}</span>
          <button
            onClick={handleAdd}
            style={{
              background: added ? accent : 'transparent',
              color: added ? '#111' : accent,
              border: `1px solid ${accent}`,
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              letterSpacing: 1.5,
              padding: '8px 14px',
              cursor: 'pointer',
              transition: 'all .2s',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              if (!added) {
                e.currentTarget.style.background = accent;
                e.currentTarget.style.color = '#111';
              }
            }}
            onMouseLeave={(e) => {
              if (!added) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = accent;
              }
            }}
          >
            {added ? 'Agregado' : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 448 512" height="1.2em" width="1.2em" xmlns="http://www.w3.org/2000/svg"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-5.5-2.8-23.2-8.5-44.2-27.1-16.4-14.6-27.4-32.7-30.6-38.2-3.2-5.6-.3-8.6 2.4-11.3 2.5-2.4 5.5-6.5 8.3-9.7 2.8-3.3 3.7-5.6 5.5-9.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 13.3 5.7 23.7 9.1 31.7 11.7 13.3 4.2 25.5 3.6 35.2 2.1 10.8-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"></path></svg>
                Carrito
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function useTweaks(defaults: Record<string, string>) {
  const [tweaks] = useState(defaults);
  return { tweaks, setTweak: () => {} };
}
