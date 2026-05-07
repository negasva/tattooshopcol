'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CitySelector from '../components/CitySelector';
import PaymentMethods from '../components/PaymentMethods';

const accent = '#FFD400';
const WHATSAPP = '573000000000';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  category?: string;
  discount_percentage?: number;
  original_price?: number;
}

function LogoMark() {
  return (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style={{ width: 40, height: 40 }}>
      <circle cx="60" cy="60" r="55" fill="none" stroke={accent} strokeWidth="2" opacity="0.6" />
      <circle cx="60" cy="60" r="44" fill="none" stroke={accent} strokeWidth="0.5" opacity="0.3" />
      <line x1="60" y1="20" x2="60" y2="90" stroke={accent} strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="60,90 55,75 65,75" fill={accent} />
      <line x1="38" y1="45" x2="82" y2="45" stroke={accent} strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="44" y1="36" x2="76" y2="36" stroke={accent} strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [cashEligible, setCashEligible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ts_cart');
      if (stored) setCart(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const salePrice = (item: CartItem) => {
    if (item.discount_percentage && item.discount_percentage > 0) {
      if (item.original_price && item.original_price > item.price) return item.price;
      return Math.round(item.price - item.price * (item.discount_percentage / 100));
    }
    return item.price;
  };

  const total = cart.reduce((s, i) => s + salePrice(i) * i.qty, 0);

  const methods = cashEligible
    ? ['card', 'pse', 'nequi', 'daviplata', 'cash']
    : ['card', 'pse', 'nequi', 'daviplata'];

  const handleCitySelect = (city: string, eligible: boolean) => {
    setSelectedCity(city);
    setCashEligible(eligible);
    setSelectedPayment('');
  };

  const handleCheckout = () => {
    if (!selectedCity || !selectedPayment) {
      alert('Selecciona tu ciudad y método de pago para continuar');
      return;
    }
    setIsProcessing(true);
    const msg = encodeURIComponent(
      `Hola! Quiero finalizar mi compra.\n\nPedido:\n${cart.map((i) => `• ${i.name} x${i.qty} — ${fmt(salePrice(i) * i.qty)}`).join('\n')}\n\nTotal: ${fmt(total)}\nCiudad: ${selectedCity}\nMétodo de pago: ${selectedPayment}`
    );
    setTimeout(() => {
      window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank');
      setIsProcessing(false);
    }, 600);
  };

  const canCheckout = selectedCity && selectedPayment && cart.length > 0;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 700,
        background: navScrolled ? 'rgba(18,18,18,0.97)' : 'var(--bg)',
        backdropFilter: navScrolled ? 'blur(12px)' : 'none',
        borderBottom: '1px solid var(--border)',
        padding: '0 clamp(20px,5vw,80px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px',
        transition: 'all 0.3s ease',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
          <LogoMark />
          <div>
            <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', color: 'var(--text)', letterSpacing: '1px', lineHeight: 1 }}>TATTOOSHOP</div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '8px', color: accent, letterSpacing: '3px' }}>COLOMBIA</div>
          </div>
        </Link>
        <Link href="/" style={{
          fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-muted)',
          letterSpacing: '1.5px', textDecoration: 'none', textTransform: 'uppercase',
          display: 'flex', alignItems: 'center', gap: '6px', transition: 'color 0.2s',
        }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = accent; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'; }}
        >
          ← Seguir comprando
        </Link>
      </nav>

      {/* HEADER */}
      <div style={{ padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,80px) 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: accent, letterSpacing: '3px', marginBottom: '8px' }}>CHECKOUT</div>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(36px,6vw,72px)', lineHeight: 0.92, color: 'var(--text)', paddingBottom: 'clamp(24px,4vw,40px)' }}>
          FINALIZAR<br /><span style={{ color: accent }}>COMPRA</span>
        </h1>
      </div>

      {/* MAIN */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1px',
        background: 'var(--border)',
        padding: 0,
      }}>

        {/* LEFT — Formulario */}
        <div style={{ background: 'var(--bg)', padding: 'clamp(24px,4vw,56px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>

            {/* Ciudad */}
            <CitySelector onCitySelect={handleCitySelect} />

            {/* Pago contra entrega info */}
            {selectedCity && !cashEligible && (
              <div style={{
                background: 'rgba(255,212,0,0.06)',
                border: `1px solid ${accent}33`,
                padding: '14px 16px',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
                <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  Pago contra entrega no disponible en tu ciudad.{' '}
                  <a
                    href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hola! Para verificar si en mi zona hay cobertura de contra entrega, me encuentro en…')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#25d366', textDecoration: 'none', letterSpacing: '0.5px' }}
                  >
                    💬 Verifica con nosotros →
                  </a>
                </div>
              </div>
            )}

            {selectedCity && cashEligible && (
              <div style={{
                background: 'rgba(37,211,102,0.06)',
                border: '1px solid rgba(37,211,102,0.25)',
                padding: '10px 16px',
                fontFamily: '"DM Mono", monospace',
                fontSize: '10px',
                color: '#25d366',
                letterSpacing: '0.5px',
              }}>
                ✓ Pago contra entrega disponible en {selectedCity}
              </div>
            )}

            {/* Métodos de pago */}
            <PaymentMethods
              availableMethods={methods}
              selectedMethod={selectedPayment}
              onSelectMethod={setSelectedPayment}
            />

            {/* Botón finalizar */}
            <button
              onClick={handleCheckout}
              disabled={!canCheckout || isProcessing}
              style={{
                width: '100%',
                padding: '20px',
                background: canCheckout ? accent : 'var(--surface)',
                color: canCheckout ? '#111' : 'var(--text-dim)',
                border: `1px solid ${canCheckout ? accent : 'var(--border)'}`,
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: '26px',
                letterSpacing: '2px',
                cursor: canCheckout ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                boxShadow: canCheckout ? `0 0 28px ${accent}33` : 'none',
              }}
              onMouseEnter={(e) => { if (canCheckout) (e.currentTarget as HTMLButtonElement).style.background = '#ffe033'; }}
              onMouseLeave={(e) => { if (canCheckout) (e.currentTarget as HTMLButtonElement).style.background = accent; }}
            >
              {isProcessing ? (
                <><div className="spinner" style={{ borderTopColor: '#111' }} /> PROCESANDO...</>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.12-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z"/></svg>
                  FINALIZAR POR WHATSAPP
                </>
              )}
            </button>

            {!canCheckout && (
              <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: 'var(--text-dim)', textAlign: 'center', letterSpacing: '1px', marginTop: '-20px' }}>
                {!selectedCity ? 'Selecciona tu ciudad para continuar' : 'Selecciona un método de pago'}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT — Resumen del pedido */}
        <div style={{ background: 'var(--surface)', padding: 'clamp(24px,4vw,56px)', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: accent, letterSpacing: '3px', marginBottom: '16px' }}>RESUMEN DEL PEDIDO</div>

            {cart.length === 0 ? (
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-dim)', padding: '40px 0', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', opacity: 0.3, marginBottom: '12px' }}>∅</div>
                Tu carrito está vacío
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', background: 'var(--bg)' }}>
                {cart.map((item) => {
                  const sp = salePrice(item);
                  const hasDisc = sp < item.price;
                  return (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '14px 16px', borderBottom: '1px solid var(--border)', gap: '12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text)', lineHeight: 1.4 }}>{item.name}</div>
                        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: 'var(--text-dim)', marginTop: '3px' }}>
                          {item.qty > 1 ? `${item.qty} unidades × ${fmt(sp)}` : '1 unidad'}
                          {hasDisc && <span style={{ color: '#e55', marginLeft: '8px' }}>-{item.discount_percentage}%</span>}
                        </div>
                      </div>
                      <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', color: accent, flexShrink: 0 }}>
                        {fmt(sp * item.qty)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '2px' }}>TOTAL</span>
            <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '36px', color: accent }}>{fmt(total)}</span>
          </div>

          {/* Ciudad seleccionada */}
          {selectedCity && (
            <div style={{ background: 'var(--bg)', border: `1px solid ${accent}33`, padding: '12px 16px' }}>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: accent, letterSpacing: '2px', marginBottom: '4px' }}>ENTREGA EN</div>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text)' }}>{selectedCity}</div>
            </div>
          )}

          {/* Sellos de seguridad */}
          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '3px', marginBottom: '12px' }}>COMPRA SEGURA</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)' }}>
              {[
                { icon: '🔒', label: 'SSL', sub: 'Encriptado' },
                { icon: '💳', label: 'Wompi', sub: 'Seguro' },
                { icon: '🏦', label: 'PSE', sub: 'Bancario' },
                { icon: '📱', label: 'Nequi', sub: 'Billetera' },
              ].map((b) => (
                <div key={b.label} style={{ background: 'var(--bg)', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>{b.icon}</div>
                  <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: accent, letterSpacing: '1px' }}>{b.label}</div>
                  <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '8px', color: 'var(--text-dim)', marginTop: '2px' }}>{b.sub}</div>
                </div>
              ))}
            </div>
            <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '8px', color: 'var(--text-dim)', textAlign: 'center', marginTop: '12px', letterSpacing: '0.5px', lineHeight: 1.6 }}>
              Tu información está protegida con encriptación SSL
            </p>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px clamp(20px,5vw,80px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '1px' }}>
          TattooShop Colombia ©2026 — Todos los derechos reservados
        </div>
        <Link href="/" style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: accent, letterSpacing: '2px', textDecoration: 'none', textTransform: 'uppercase' }}>
          ← Ver todos los productos
        </Link>
      </footer>
    </div>
  );
}
