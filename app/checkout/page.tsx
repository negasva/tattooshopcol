'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CitySelector from '../components/CitySelector';
import PaymentMethods, { COD_FEE } from '../components/PaymentMethods';
import WhatsAppLogo from '../components/WhatsAppLogo';
import BrandLogo from '../components/BrandLogo';

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
  inventory?: number;
}


export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [cashEligible, setCashEligible] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [email, setEmail] = useState('');
  const [emailSaved, setEmailSaved] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState<{ text: string; ok: boolean } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

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
  const total = subtotal + codFee - couponDiscount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMsg(null);
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal, cart, paymentMethod: selectedMethod }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setCouponDiscount(data.discount);
        setCouponMsg({ text: `✓ ${data.description || `Descuento de ${fmt(data.discount)} aplicado`}`, ok: true });
      } else {
        setCouponDiscount(0);
        setCouponMsg({ text: data.error || 'Cupón no válido', ok: false });
      }
    } catch {
      setCouponMsg({ text: 'Error validando el cupón', ok: false });
    } finally {
      setCouponLoading(false);
    }
  };

  const methods = cashEligible
    ? ['card', 'pse', 'transfer', 'cash']
    : ['card', 'pse', 'transfer'];

  const handleMethodSelect = (method: string, sub?: string) => {
    setSelectedMethod(method);
    setSelectedSub(sub || '');
    // Limpiar cupones online_only si el usuario cambia a contraentrega
    if (method === 'cash' && couponDiscount > 0) {
      setCouponDiscount(0);
      setCouponMsg({ text: 'Cupón removido: no aplica para pago contra entrega', ok: false });
    }
  };

  const outOfStockItems = cart.filter((i) => (i.inventory ?? 0) <= 0);
  const overStockItems = cart.filter((i) => (i.inventory ?? 0) > 0 && i.qty > (i.inventory ?? 0));
  const hasStockIssues = outOfStockItems.length > 0 || overStockItems.length > 0;

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const canCheckout = selectedCity && selectedMethod &&
    (selectedMethod !== 'transfer' || selectedSub) &&
    cart.length > 0 && !hasStockIssues && emailValid;

  const saveCartToDb = async (ref: string) => {
    if (!emailValid) return;
    try {
      await fetch('/api/save-cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          reference: ref,
          cart,
          total,
          city: selectedCity,
          method: selectedMethod,
        }),
      });
    } catch {}
  };

  const isCash = selectedMethod === 'cash';

  const handleCheckout = async () => {
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
      // Wompi widget checkout con auto-redirect
      const reference = `order-${Date.now()}`;
      const amountCents = total * 100;
      const currency = 'COP';
      const redirectUrl = `${window.location.origin}/checkout/exito?ref=${reference}`;

      // Guardar resumen del pedido para mostrarlo en la página de éxito
      try {
        localStorage.setItem('ts_pending_order', JSON.stringify({
          reference,
          cart,
          subtotal,
          codFee,
          total,
          city: selectedCity,
          method: selectedMethod,
          createdAt: new Date().toISOString(),
        }));
      } catch {}

      // Crear contenedor para el widget de Wompi
      const wompiContainer = document.createElement('div');
      wompiContainer.id = 'wompi-checkout-container';
      wompiContainer.style.display = 'none';
      document.body.appendChild(wompiContainer);

      // Guardar carrito en DB para recordatorio en caso de abandono
      await saveCartToDb(reference);

      // Obtener firma de integridad del servidor
      let integritySignature = '';
      try {
        const sigRes = await fetch('/api/wompi-integrity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference, amountInCents: amountCents, currency }),
        });
        const sigData = await sigRes.json();
        if (!sigRes.ok || !sigData.signature) {
          console.error('Error obteniendo firma de integridad:', sigData);
          setIsProcessing(false);
          return;
        }
        integritySignature = sigData.signature;
      } catch (err) {
        console.error('Error obteniendo firma de integridad:', err);
        setIsProcessing(false);
        return;
      }

      // Crear script del widget de Wompi
      const script = document.createElement('script');
      script.src = 'https://checkout.wompi.co/widget.js';
      script.async = true;
      script.dataset.render = 'button';
      script.dataset.publicKey = WOMPI_PUBLIC_KEY;
      script.dataset.currency = currency;
      script.dataset.amountInCents = amountCents.toString();
      script.dataset.reference = reference;
      script.dataset.redirectUrl = redirectUrl;
      script.setAttribute('data-signature:integrity', integritySignature);
      if (selectedMethod === 'pse') {
        script.dataset.paymentMethod = 'PSE';
      }

      script.onload = () => {
        // El widget está listo, buscar el botón y hacerle click automáticamente
        setTimeout(() => {
          const button = wompiContainer.querySelector('button');
          if (button) {
            button.click();

            // Iniciar polling para detectar cuando el pago se completa
            let pollCount = 0;
            const maxPolls = 120; // máximo 2 minutos (120 * 1 segundo)
            const pollInterval = 1000; // 1 segundo

            const pollTransaction = async () => {
              try {
                const res = await fetch(`/api/check-wompi-transaction?reference=${reference}`);
                const data = await res.json();

                if (data.status === 'found' && data.transaction?.status === 'APPROVED') {
                  // Pago completado exitosamente, redirigir a la página de éxito
                  window.location.href = redirectUrl;
                  return;
                } else if (data.status === 'found' && data.transaction?.status && data.transaction.status !== 'PENDING') {
                  // Pago rechazado o cancelado
                  window.location.href = `${redirectUrl}&status=${data.transaction.status}`;
                  return;
                }
              } catch (error) {
                console.error('Error polling transaction:', error);
              }

              pollCount++;
              if (pollCount < maxPolls) {
                setTimeout(pollTransaction, pollInterval);
              } else {
                setIsProcessing(false);
                // Timeout alcanzado, el usuario debe hacer click en "Volver al comercio" manualmente
              }
            };

            // Esperar 2 segundos antes de empezar a hacer polling (dar tiempo para que Wompi procese)
            setTimeout(pollTransaction, 2000);
          } else {
            setIsProcessing(false);
            alert('Error inicializando el sistema de pago. Por favor intenta de nuevo.');
          }
        }, 500);
      };

      script.onerror = () => {
        setIsProcessing(false);
        alert('Error cargando el sistema de pago. Por favor intenta de nuevo.');
      };

      wompiContainer.appendChild(script);
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
        <Link href="/" style={{ display: 'flex', alignItems: 'center', color: accent, textDecoration: 'none' }}>
          <BrandLogo size={32} />
        </Link>
        <Link href="/" style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1.5px', textDecoration: 'none', textTransform: 'uppercase', transition: 'color 0.2s' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = accent; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'; }}
        >
          ← Seguir comprando
        </Link>
      </nav>

      {/* HEADER */}
      <div style={{ padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,80px) 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: accent, letterSpacing: '3px', marginBottom: '8px', fontWeight: '700' }}>CHECKOUT</div>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(36px,6vw,72px)', lineHeight: 0.92, color: 'var(--text)', paddingBottom: 'clamp(24px,4vw,40px)', fontWeight: '900' }}>
          FINALIZAR<br /><span style={{ color: accent }}>COMPRA</span>
        </h1>
      </div>

      {/* MAIN GRID */}
      <div data-checkout-grid="" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1px', background: 'var(--border)' }}>

        {/* LEFT */}
        <div style={{ background: 'var(--bg)', padding: 'clamp(24px,4vw,56px)', display: 'flex', flexDirection: 'column', gap: '32px' }}>

          <CitySelector onCitySelect={(city, eligible) => { setSelectedCity(city); setCashEligible(eligible); setSelectedMethod(''); setSelectedSub(''); }} />

          {selectedCity && !cashEligible && (
            <div style={{ background: 'rgba(255,212,0,0.06)', border: `1px solid ${accent}33`, padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text)', lineHeight: 1.7 }}>
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
                  fontSize: '13px',
                  fontWeight: 'bold',
                  letterSpacing: '1px',
                  transition: 'background 0.2s',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                }}>
                <WhatsAppLogo size="16px" />
                VERIFICA CON NOSOTROS
              </a>
            </div>
          )}

          {selectedCity && cashEligible && (
            <div style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.25)', padding: '10px 16px', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: '#25d366', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '16px', height: '16px', flexShrink: 0 }}>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Pago contra entrega disponible en {selectedCity}
            </div>
          )}

          {/* Email */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Correo electrónico
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setEmailSaved(false); }}
                onBlur={() => {
                  if (emailValid) setEmailSaved(true);
                }}
                placeholder="tu@correo.com"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  background: 'var(--surface)',
                  border: `1px solid ${email && !emailValid ? '#e55' : emailSaved ? '#25d366' : 'var(--border)'}`,
                  color: 'var(--text)',
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '14px',
                  padding: '12px 16px',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
              />
              {emailSaved && (
                <svg viewBox="0 0 24 24" fill="none" stroke="#25d366" strokeWidth="2.5"
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', pointerEvents: 'none' }}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
            <p style={{ margin: 0, fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              Te enviaremos la confirmación y guía de envío a este correo.
            </p>
          </div>

          {/* Cupón de descuento */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '2px', textTransform: 'uppercase' }}>
              Cupón de descuento
            </label>
            <div style={{ display: 'flex', gap: '1px' }}>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponMsg(null); if (!e.target.value) setCouponDiscount(0); }}
                onKeyDown={(e) => { if (e.key === 'Enter') applyCoupon(); }}
                placeholder="CÓDIGO"
                style={{
                  flex: 1, background: 'var(--surface)', border: '1px solid var(--border)',
                  color: 'var(--text)', fontFamily: '"DM Mono", monospace', fontSize: '13px',
                  padding: '10px 14px', outline: 'none', letterSpacing: '2px',
                }}
              />
              <button
                onClick={applyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                style={{
                  background: accent, color: '#111', border: 'none',
                  fontFamily: '"DM Mono", monospace', fontSize: '11px', letterSpacing: '1.5px',
                  padding: '10px 16px', cursor: couponLoading || !couponCode.trim() ? 'not-allowed' : 'pointer',
                  textTransform: 'uppercase', opacity: couponLoading || !couponCode.trim() ? 0.5 : 1,
                }}
              >
                {couponLoading ? '...' : 'Aplicar'}
              </button>
            </div>
            {couponMsg && (
              <p style={{ margin: 0, fontFamily: '"DM Mono", monospace', fontSize: '11px', color: couponMsg.ok ? '#25d366' : '#e55' }}>
                {couponMsg.text}
              </p>
            )}
          </div>

          <PaymentMethods
            availableMethods={methods}
            selectedMethod={selectedMethod}
            selectedSub={selectedSub}
            onSelectMethod={handleMethodSelect}
            cashEligible={cashEligible}
          />

          {/* Info Wompi */}
          {(selectedMethod === 'card' || selectedMethod === 'pse') && (
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '12px 14px', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.7, display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
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
              <WhatsAppLogo size="18px" />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}>
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            )}
            {btnLabel}
          </button>

          {hasStockIssues && (
            <div style={{ background: '#2a1a1a', border: '1px solid #e55', padding: '12px 16px', borderRadius: '4px', marginTop: '-16px' }}>
              <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: '#e88', letterSpacing: '1px', marginBottom: '6px', fontWeight: '700' }}>⚠ PROBLEMA DE INVENTARIO</p>
              {outOfStockItems.map((i) => (
                <p key={i.id} style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: '#e55', lineHeight: 1.5 }}>
                  "{i.name}" está agotado — elimínalo del carrito para continuar.
                </p>
              ))}
              {overStockItems.map((i) => (
                <p key={i.id} style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: '#e88', lineHeight: 1.5 }}>
                  "{i.name}" solo tiene {i.inventory} unidad(es) disponible(s).
                </p>
              ))}
            </div>
          )}
          {!canCheckout && !hasStockIssues && (
            <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', letterSpacing: '1px', marginTop: '-16px' }}>
              {!selectedCity ? 'Selecciona tu ciudad para continuar' : !selectedMethod ? 'Selecciona un método de pago' : 'Selecciona la plataforma de transferencia'}
            </p>
          )}
        </div>

        {/* RIGHT — Resumen */}
        <div style={{ background: 'var(--surface)', padding: 'clamp(24px,4vw,56px)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: accent, letterSpacing: '3px', marginBottom: '16px', fontWeight: '700' }}>RESUMEN DEL PEDIDO</div>
            {cart.length === 0 ? (
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '14px', color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', opacity: 0.3, marginBottom: '12px' }}>∅</div>Tu carrito está vacío
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
                {cart.map((item) => {
                  const sp = salePrice(item);
                  const hasDisc = sp < item.price;
                  return (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border)', gap: '12px' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text)', lineHeight: 1.4 }}>{item.name}</div>
                        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text-muted)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                          <span>
                            {item.qty > 1 ? `${item.qty} uds × ${fmt(sp)}` : '1 unidad'}
                            {hasDisc && <span style={{ color: '#e55' }}> -{item.discount_percentage}%</span>}
                          </span>
                          {(item.inventory ?? 0) <= 0 && (
                            <span style={{ color: '#e55', fontSize: '11px', fontWeight: '700' }}>AGOTADO</span>
                          )}
                          {(item.inventory ?? 0) > 0 && item.qty > (item.inventory ?? 0) && (
                            <span style={{ color: '#e88', fontSize: '11px', fontWeight: '700' }}>Stock disponible: {item.inventory}</span>
                          )}
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i).filter(i => i.qty > 0))} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '12px', padding: '0 4px', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = '#e55'} onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'}>−</button>
                            <button onClick={() => setCart(prev => prev.map(i => i.id === item.id ? { ...i, qty: Math.min(i.qty + 1, i.inventory ?? 0) } : i))} disabled={(item.inventory ?? 0) <= 0 || item.qty >= (item.inventory ?? 0)} style={{ background: 'none', border: 'none', color: (item.inventory ?? 0) <= 0 || item.qty >= (item.inventory ?? 0) ? '#444' : 'var(--text-muted)', cursor: (item.inventory ?? 0) <= 0 || item.qty >= (item.inventory ?? 0) ? 'not-allowed' : 'pointer', fontSize: '12px', padding: '0 4px', transition: 'color 0.2s' }} onMouseEnter={(e) => { if ((item.inventory ?? 0) > 0 && item.qty < (item.inventory ?? 0)) (e.currentTarget as HTMLButtonElement).style.color = accent; }} onMouseLeave={(e) => { if ((item.inventory ?? 0) > 0 && item.qty < (item.inventory ?? 0)) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}>+</button>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                        <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', color: accent, flexShrink: 0 }}>{fmt(sp * item.qty)}</div>
                        <button onClick={() => setCart(prev => prev.filter(i => i.id !== item.id))} style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', transition: 'color 0.2s' }} onMouseEnter={(e) => (e.currentTarget as HTMLButtonElement).style.color = '#e55'} onMouseLeave={(e) => (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'}>Eliminar</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Totales */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', fontWeight: '700' }}>
              <span>SUBTOTAL</span><span>{fmt(subtotal)}</span>
            </div>
            {codFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: '#e88', fontWeight: '700' }}>
                <span>SERVICIO CONTRA ENTREGA</span><span>+ {fmt(COD_FEE)}</span>
              </div>
            )}
            {couponDiscount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: '#25d366', fontWeight: '700' }}>
                <span>CUPÓN {couponCode}</span><span>- {fmt(couponDiscount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
              <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text-muted)', letterSpacing: '2px', fontWeight: '700' }}>TOTAL</span>
              <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '36px', color: accent, fontWeight: '900' }}>{fmt(total)}</span>
            </div>
          </div>

          {selectedCity && (
            <div style={{ background: 'var(--bg)', border: `1px solid ${accent}33`, padding: '12px 16px' }}>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: accent, letterSpacing: '2px', marginBottom: '4px', fontWeight: '700' }}>ENTREGA EN</div>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '14px', color: 'var(--text)' }}>{selectedCity}</div>
            </div>
          )}

          {/* Sellos */}
          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '3px', marginBottom: '12px', fontWeight: '700' }}>COMPRA SEGURA</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)' }}>
              {[
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, label: 'SSL', sub: 'Encriptado' },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, label: 'Wompi', sub: 'Seguro' },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>, label: 'PSE', sub: 'Bancario' },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '18px', height: '18px' }}><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>, label: 'Billeteras', sub: 'Digitales' },
              ].map((b) => (
                <div key={b.label} style={{ background: 'var(--bg)', padding: '12px', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', marginBottom: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'var(--text-muted)' }}>{b.icon}</div>
                  <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: accent, letterSpacing: '1px' }}>{b.label}</div>
                  <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>{b.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px clamp(20px,5vw,80px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1px' }}>TattooShop Colombia ©2026</div>
        <Link href="/" style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: accent, letterSpacing: '2px', textDecoration: 'none' }}>← Ver todos los productos</Link>
      </footer>
    </div>
  );
}
