'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CitySelector from '../components/CitySelector';
import PaymentMethods, { COD_FEE } from '../components/PaymentMethods';

const accent = '#FFD400';
const WHATSAPP = '573000000000';
// Wompi public key — reemplaza con tu llave real de producción
const WOMPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY || 'pub_test_XXXXXXXXXXXXXXXX';

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
    </svg>
  );
}

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [cashEligible, setCashEligible] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
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

  const subtotal = cart.reduce((s, i) => s + salePrice(i) * i.qty, 0);
  const codFee = selectedMethod === 'cash' ? COD_FEE : 0;
  const total = subtotal + codFee;

  const methods = cashEligible
    ? ['card', 'pse', 'transfer', 'cash']
    : ['card', 'pse', 'transfer'];

  const handleMethodSelect = (method: string, sub?: string) => {
    setSelectedMethod(method);
    setSelectedSub(sub || '');
  };

  const canCheckout = selectedCity && selectedMethod &&
    (selectedMethod !== 'transfer' || selectedSub) &&
    cart.length > 0;

  const isCash = selectedMethod === 'cash';

  const handleCheckout = () => {
    if (!canCheckout) return;
    setIsProcessing(true);

    if (isCash) {
      // Contra entrega → WhatsApp
      const msg = encodeURIComponent(
        `Hola! Quiero hacer un pedido con pago contra entrega.\n\n` +
        `Pedido:\n${cart.map((i) => `• ${i.name} x${i.qty} — ${fmt(salePrice(i) * i.qty)}`).join('\n')}\n\n` +
        `Subtotal: ${fmt(subtotal)}\nCosto contra entrega: ${fmt(COD_FEE)}\nTotal: ${fmt(total)}\n` +
        `Ciudad: ${selectedCity}`
      );
      setTimeout(() => {
        window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank');
        setIsProcessing(false);
      }, 400);
      return;
    }

    if (selectedMethod === 'card' || selectedMethod === 'pse') {
      // Wompi checkout
      const reference = `order-${Date.now()}`;
      const amountCents = total * 100;
      const currency = 'COP';
      // Redirect to Wompi hosted checkout
      const wompiUrl = selectedMethod === 'pse'
        ? `https://checkout.wompi.co/p/?public-key=${WOMPI_PUBLIC_KEY}&currency=${currency}&amount-in-cents=${amountCents}&reference=${reference}&redirect-url=${encodeURIComponent(window.location.origin + '/checkout?success=1')}&payment-method=PSE`
        : `https://checkout.wompi.co/p/?public-key=${WOMPI_PUBLIC_KEY}&currency=${currency}&amount-in-cents=${amountCents}&reference=${reference}&redirect-url=${encodeURIComponent(window.location.origin + '/checkout?success=1')}`;
      setTimeout(() => {
        window.location.href = wompiUrl;
        setIsProcessing(false);
      }, 400);
      return;
    }

    if (selectedMethod === 'transfer') {
      // Transferencia bancaria → WhatsApp con instrucciones
      const subLabels: Record<string, string> = { nequi: 'Nequi', daviplata: 'Daviplata', bancolombia: 'Bancolombia' };
      const msg = encodeURIComponent(
        `Hola! Quiero pagar por ${subLabels[selectedSub] || 'transferencia bancaria'}.\n\n` +
        `Pedido:\n${cart.map((i) => `• ${i.name} x${i.qty} — ${fmt(salePrice(i) * i.qty)}`).join('\n')}\n\n` +
        `Total: ${fmt(total)}\nCiudad: ${selectedCity}\n\n` +
        `Por favor envíenme los datos para realizar la transferencia.`
      );
      setTimeout(() => {
        window.open(`https://wa.me/${WHATSAPP}?text=${msg}`, '_blank');
        setIsProcessing(false);
      }, 400);
    }
  };

  const btnLabel = isProcessing
    ? 'PROCESANDO...'
    : isCash
    ? 'FINALIZAR POR WHATSAPP'
    : selectedMethod === 'transfer'
    ? 'FINALIZAR POR WHATSAPP'
    : 'FINALIZAR COMPRA';

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
        <Link href="/" style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1.5px', textDecoration: 'none', textTransform: 'uppercase', transition: 'color 0.2s' }}
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

      {/* MAIN GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1px', background: 'var(--border)' }}>

        {/* LEFT */}
        <div style={{ background: 'var(--bg)', padding: 'clamp(24px,4vw,56px)', display: 'flex', flexDirection: 'column', gap: '32px' }}>

          <CitySelector onCitySelect={(city, eligible) => { setSelectedCity(city); setCashEligible(eligible); setSelectedMethod(''); setSelectedSub(''); }} />

          {selectedCity && !cashEligible && (
            <div style={{ background: 'rgba(255,212,0,0.06)', border: `1px solid ${accent}33`, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text)', lineHeight: 1.7 }}>
                Para pago contra entrega en esta ciudad es necesario verificar via whatsapp
              </div>
              <a href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hola! Quiero verificar la disponibilidad de contra entrega en mi ciudad…')}`}
                target="_blank" rel="noopener noreferrer"
                style={{
                  background: '#25d366',
                  color: '#fff',
                  padding: '10px 16px',
                  borderRadius: '4px',
                  textDecoration: 'none',
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  transition: 'background 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px' }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004c-1.025 0-2.04-.312-2.926-.902L6.583 3.715l1.922 6.155c-.727 1.195-1.11 2.569-1.11 4.001 0 4.495 3.665 8.16 8.16 8.16s8.16-3.665 8.16-8.16-3.665-8.159-8.16-8.159"/>
                </svg>
                VERIFICA CON NOSOTROS
              </a>
            </div>
          )}

          {selectedCity && cashEligible && (
            <div style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.25)', padding: '10px 16px', fontFamily: '"DM Mono", monospace', fontSize: '10px', color: '#25d366', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', flexShrink: 0 }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Pago contra entrega disponible en {selectedCity}
            </div>
          )}

          <PaymentMethods
            availableMethods={methods}
            selectedMethod={selectedMethod}
            selectedSub={selectedSub}
            onSelectMethod={handleMethodSelect}
            cashEligible={cashEligible}
          />

          {/* Info Wompi */}
          {(selectedMethod === 'card' || selectedMethod === 'pse') && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '12px 14px', fontFamily: '"DM Mono", monospace', fontSize: '9px', color: 'var(--text-dim)', lineHeight: 1.7, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', flexShrink: 0, marginTop: '2px' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <span>
                Pago procesado de forma segura por{' '}
                <span style={{ color: accent }}>Wompi (Bancolombia)</span>
                {selectedMethod === 'pse' && ' — Serás redirigido a tu banco para completar la transferencia.'}
                {selectedMethod === 'card' && ' — Encriptación SSL 256-bit. Aceptamos Visa, Mastercard y Amex.'}
              </span>
            </div>
          )}

          {/* CTA */}
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
            onMouseDown={(e) => { if (canCheckout) (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)'; }}
            onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
          >
            {isCash || selectedMethod === 'transfer' ? (
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004c-1.025 0-2.04-.312-2.926-.902L6.583 3.715l1.922 6.155c-.727 1.195-1.11 2.569-1.11 4.001 0 4.495 3.665 8.16 8.16 8.16s8.16-3.665 8.16-8.16-3.665-8.159-8.16-8.159"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            )}
            {btnLabel}
          </button>

          {!canCheckout && (
            <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: 'var(--text-dim)', textAlign: 'center', letterSpacing: '1px', marginTop: '-16px' }}>
              {!selectedCity ? 'Selecciona tu ciudad para continuar' : !selectedMethod ? 'Selecciona un método de pago' : 'Selecciona la plataforma de transferencia'}
            </p>
          )}
        </div>

        {/* RIGHT — Resumen */}
        <div style={{ background: 'var(--surface)', padding: 'clamp(24px,4vw,56px)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: accent, letterSpacing: '3px', marginBottom: '16px' }}>RESUMEN DEL PEDIDO</div>
            {cart.length === 0 ? (
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-dim)', padding: '40px 0', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', opacity: 0.3, marginBottom: '12px' }}>∅</div>Tu carrito está vacío
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
                {cart.map((item) => {
                  const sp = salePrice(item);
                  const hasDisc = sp < item.price;
                  return (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '14px 16px', borderBottom: '1px solid var(--border)', gap: '12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text)', lineHeight: 1.4 }}>{item.name}</div>
                        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: 'var(--text-dim)', marginTop: '3px' }}>
                          {item.qty > 1 ? `${item.qty} uds × ${fmt(sp)}` : '1 unidad'}
                          {hasDisc && <span style={{ color: '#e55', marginLeft: '8px' }}>-{item.discount_percentage}%</span>}
                        </div>
                      </div>
                      <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', color: accent, flexShrink: 0 }}>{fmt(sp * item.qty)}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Totales */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-dim)' }}>
              <span>SUBTOTAL</span><span>{fmt(subtotal)}</span>
            </div>
            {codFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"DM Mono", monospace', fontSize: '10px', color: '#e88' }}>
                <span>CONTRA ENTREGA</span><span>+ {fmt(COD_FEE)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
              <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '2px' }}>TOTAL</span>
              <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '36px', color: accent }}>{fmt(total)}</span>
            </div>
          </div>

          {selectedCity && (
            <div style={{ background: 'var(--bg)', border: `1px solid ${accent}33`, padding: '12px 16px' }}>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: accent, letterSpacing: '2px', marginBottom: '4px' }}>ENTREGA EN</div>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text)' }}>{selectedCity}</div>
            </div>
          )}

          {/* Sellos */}
          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '3px', marginBottom: '12px' }}>COMPRA SEGURA</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)' }}>
              {[{ icon: '🔒', label: 'SSL', sub: 'Encriptado' }, { icon: '💳', label: 'Wompi', sub: 'Seguro' }, { icon: '🏦', label: 'PSE', sub: 'Bancario' }, { icon: '📱', label: 'Billeteras', sub: 'Digitales' }].map((b) => (
                <div key={b.label} style={{ background: 'var(--bg)', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>{b.icon}</div>
                  <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '9px', color: accent, letterSpacing: '1px' }}>{b.label}</div>
                  <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '8px', color: 'var(--text-dim)', marginTop: '2px' }}>{b.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px clamp(20px,5vw,80px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '1px' }}>TattooShop Colombia ©2026</div>
        <Link href="/" style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: accent, letterSpacing: '2px', textDecoration: 'none' }}>← Ver todos los productos</Link>
      </footer>
    </div>
  );
}
