'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import BrandLogo from '../../components/BrandLogo';
import WhatsAppLogo from '../../components/WhatsAppLogo';
import { track } from '../../lib/metaPixel';

const accent = '#FFD400';
const WHATSAPP = '573000000000';
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

interface PendingOrder {
  reference: string;
  cart: CartItem[];
  subtotal: number;
  codFee: number;
  total: number;
  city: string;
  method: string;
  createdAt: string;
}

interface WompiTransaction {
  id: string;
  status: 'APPROVED' | 'DECLINED' | 'VOIDED' | 'ERROR' | 'PENDING';
  status_message?: string | null;
  reference: string;
  amount_in_cents: number;
  currency: string;
  customer_email?: string;
  customer_data?: {
    full_name?: string;
    phone_number?: string;
    legal_id?: string;
    legal_id_type?: string;
  };
  payment_method?: {
    type?: string;
    extra?: {
      brand?: string;
      last_four?: string;
      name?: string;
      bank_name?: string;
    };
  };
  payment_method_type?: string;
  created_at?: string;
  finalized_at?: string;
}

const statusMeta: Record<string, { label: string; color: string; sub: string }> = {
  APPROVED: { label: 'PAGO APROBADO', color: '#25d366', sub: 'Tu pago fue procesado correctamente' },
  PENDING:  { label: 'PAGO PENDIENTE', color: '#f5a623', sub: 'Estamos esperando confirmación del banco' },
  DECLINED: { label: 'PAGO RECHAZADO', color: '#e55',    sub: 'Tu banco rechazó la transacción' },
  VOIDED:   { label: 'PAGO ANULADO',   color: '#e55',    sub: 'La transacción fue anulada' },
  ERROR:    { label: 'ERROR EN EL PAGO', color: '#e55',  sub: 'Ocurrió un error procesando el pago' },
};

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontFamily: '"DM Mono", monospace' }}>Cargando…</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

function CheckoutSuccessContent() {
  const params = useSearchParams();
  const transactionId = params.get('id');
  const envFromUrl = params.get('env');
  const referenceFromUrl = params.get('ref');
  const statusFromUrl = params.get('status')?.toUpperCase() as WompiTransaction['status'] | undefined;
  const statusMessageFromUrl = params.get('status_message') || null;

  const [order, setOrder] = useState<PendingOrder | null>(null);
  const [tx, setTx] = useState<WompiTransaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ts_pending_order');
      if (stored) setOrder(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    if (!transactionId) {
      setLoading(false);
      return;
    }

    const isSandbox = envFromUrl === 'test' || WOMPI_PUBLIC_KEY.startsWith('pub_test_');
    const apiBase = isSandbox ? 'https://sandbox.wompi.co/v1' : 'https://production.wompi.co/v1';

    fetch(`${apiBase}/transactions/${transactionId}`)
      .then((r) => r.json())
      .then((json) => {
        if (json?.data) {
          setTx(json.data as WompiTransaction);
          if (json.data.status === 'APPROVED') {
            try { localStorage.removeItem('ts_cart'); } catch {}
            // Confirmar el pedido en el servidor: registra la venta en el CRM
            // (idempotente, respaldo del webhook de Wompi) y marca el carrito como completado
            const ref = json.data.reference || referenceFromUrl;
            if (ref) {
              fetch('/api/orders/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reference: ref }),
              })
                .then((r) => r.json())
                .then((res) => {
                  // Meta Pixel: Purchase deduplicado con la CAPI vía order_id.
                  let contentIds: string[] = [];
                  try {
                    const pending = JSON.parse(localStorage.getItem('ts_pending_order') || '{}');
                    contentIds = Array.isArray(pending.cart) ? pending.cart.map((i: { id: string }) => i.id) : [];
                  } catch {}
                  track('Purchase', {
                    content_ids: contentIds,
                    content_type: 'product',
                    value: json.data.amount_in_cents / 100,
                    currency: json.data.currency || 'COP',
                  }, res?.order_id || ref);
                })
                .catch(() => {});
            }
          }
        } else {
          setError('No pudimos leer los datos de la transacción.');
        }
      })
      .catch(() => setError('No pudimos conectarnos con la pasarela de pago.'))
      .finally(() => setLoading(false));
  }, [transactionId, envFromUrl]);

  const status = tx?.status || statusFromUrl || (transactionId ? 'PENDING' : 'PENDING');
  const meta = statusMeta[status] || statusMeta.PENDING;
  const isApproved = status === 'APPROVED';
  const reference = tx?.reference || referenceFromUrl || order?.reference || '—';
  const paidAmount = isApproved ? (tx ? tx.amount_in_cents / 100 : order?.total ?? 0) : 0;

  const customerName = tx?.customer_data?.full_name || '';
  const customerEmail = tx?.customer_email || '';
  const customerPhone = tx?.customer_data?.phone_number || '';
  const customerId = tx?.customer_data?.legal_id || '';

  const methodType = tx?.payment_method?.type || tx?.payment_method_type || order?.method?.toUpperCase() || '';
  const methodExtra = tx?.payment_method?.extra;
  const methodLine = (() => {
    if (!methodType) return '—';
    if (methodType === 'CARD' && methodExtra) {
      return `${methodExtra.brand || 'Tarjeta'} •••• ${methodExtra.last_four || ''}`.trim();
    }
    if (methodType === 'PSE' && methodExtra?.bank_name) {
      return `PSE — ${methodExtra.bank_name}`;
    }
    return methodType;
  })();

  const finalizedAt = tx?.finalized_at || tx?.created_at || order?.createdAt;
  const finalizedLabel = finalizedAt
    ? new Date(finalizedAt).toLocaleString('es-CO', { dateStyle: 'medium', timeStyle: 'short' })
    : '';

  const waMsg = encodeURIComponent(
    `Hola! Acabo de hacer una compra.\n\n` +
    `Referencia: ${reference}\n` +
    `Total: ${fmt(paidAmount)}\n` +
    (customerName ? `Nombre: ${customerName}\n` : '') +
    (order?.city ? `Ciudad: ${order.city}\n` : '') +
    `\nQuisiera confirmar el envío.`
  );

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 700,
        background: 'rgba(18,18,18,0.97)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '0 clamp(20px,5vw,80px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', color: accent, textDecoration: 'none' }}>
          <BrandLogo size={32} />
        </Link>
        <Link href="/" style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1.5px', textDecoration: 'none', textTransform: 'uppercase' }}>
          ← Volver al inicio
        </Link>
      </nav>

      {/* HEADER / STATUS */}
      <section style={{ padding: 'clamp(40px,6vw,72px) clamp(20px,5vw,80px) clamp(24px,4vw,40px)', borderBottom: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{
          width: '88px', height: '88px', margin: '0 auto 24px',
          borderRadius: '50%',
          background: isApproved ? 'rgba(37,211,102,0.12)' : 'rgba(229,85,85,0.10)',
          border: `2px solid ${meta.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 0 32px ${meta.color}44`,
        }}>
          {isApproved ? (
            <svg viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2.5" style={{ width: '44px', height: '44px' }}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : status === 'PENDING' ? (
            <svg viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2.5" style={{ width: '44px', height: '44px' }}>
              <circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke={meta.color} strokeWidth="2.5" style={{ width: '44px', height: '44px' }}>
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          )}
        </div>

        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: meta.color, letterSpacing: '3px', marginBottom: '10px', fontWeight: 700 }}>
          {meta.label}
        </div>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(36px,6vw,64px)', lineHeight: 0.95, color: 'var(--text)', fontWeight: 900 }}>
          {isApproved ? <>¡GRACIAS POR TU<br/><span style={{ color: accent }}>COMPRA!</span></> : meta.label}
        </h1>
        <p style={{ marginTop: '18px', fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', maxWidth: '560px', margin: '18px auto 0', lineHeight: 1.6 }}>
          {isApproved
            ? `Recibimos tu pedido y ya está en proceso. Te enviaremos la guía de envío a tu correo apenas despachemos. Si necesitas ayuda, escríbenos por WhatsApp.`
            : (statusMessageFromUrl || tx?.status_message || meta.sub)}
        </p>
      </section>

      {/* CONTENT GRID */}
      <div data-checkout-grid="" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1px', background: 'var(--border)' }}>

        {/* LEFT — Detalles del pedido y transacción */}
        <div style={{ background: 'var(--bg)', padding: 'clamp(24px,4vw,56px)', display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Transacción */}
          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: accent, letterSpacing: '3px', marginBottom: '16px', fontWeight: 700 }}>DETALLES DEL PAGO</div>
            {loading ? (
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text-muted)' }}>Consultando con Wompi…</div>
            ) : error ? (
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: '#e88', lineHeight: 1.6 }}>{error}</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                {[
                  { k: 'Referencia', v: reference },
                  ...(tx?.id ? [{ k: 'ID transacción', v: tx.id }] : []),
                  { k: 'Estado', v: meta.label, color: meta.color },
                  { k: 'Método', v: methodLine },
                  { k: 'Monto', v: fmt(paidAmount), bold: true },
                  ...(finalizedLabel ? [{ k: 'Fecha', v: finalizedLabel }] : []),
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '12px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                    <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1px' }}>{row.k.toUpperCase()}</span>
                    <span style={{
                      fontFamily: '"DM Mono", monospace',
                      fontSize: row.bold ? '15px' : '13px',
                      color: row.color || (row.bold ? accent : 'var(--text)'),
                      fontWeight: row.bold ? 700 : 400,
                      textAlign: 'right',
                      overflowWrap: 'anywhere',
                    }}>{row.v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cliente */}
          {(customerName || customerEmail || customerPhone || customerId) && (
            <div>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: accent, letterSpacing: '3px', marginBottom: '16px', fontWeight: 700 }}>DATOS DEL CLIENTE</div>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                {[
                  ...(customerName ? [{ k: 'Nombre', v: customerName }] : []),
                  ...(customerId ? [{ k: 'Documento', v: `${tx?.customer_data?.legal_id_type || ''} ${customerId}`.trim() }] : []),
                  ...(customerEmail ? [{ k: 'Correo', v: customerEmail }] : []),
                  ...(customerPhone ? [{ k: 'Teléfono', v: customerPhone }] : []),
                  ...(order?.city ? [{ k: 'Ciudad de envío', v: order.city }] : []),
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '12px 16px', borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                    <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1px' }}>{row.k.toUpperCase()}</span>
                    <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text)', textAlign: 'right', overflowWrap: 'anywhere' }}>{row.v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Próximos pasos */}
          {isApproved && (
            <div>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: accent, letterSpacing: '3px', marginBottom: '16px', fontWeight: 700 }}>PRÓXIMOS PASOS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[
                  { n: 1, t: 'Confirmación por correo', d: 'Te enviamos un comprobante a tu email registrado.' },
                  { n: 2, t: 'Preparación del pedido', d: 'Empacamos en máximo 24h hábiles.' },
                  { n: 3, t: 'Envío con guía', d: 'Recibirás el número de guía para hacer seguimiento.' },
                  { n: 4, t: 'Entrega', d: 'Entre 2 y 5 días hábiles según tu ciudad.' },
                ].map((step) => (
                  <div key={step.n} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', background: 'var(--surface)', border: '1px solid var(--border)', padding: '14px 16px' }}>
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: accent, color: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Bebas Neue", sans-serif', fontSize: '16px', flexShrink: 0 }}>
                      {step.n}
                    </div>
                    <div>
                      <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text)', letterSpacing: '1px', fontWeight: 700, marginBottom: '4px' }}>{step.t}</div>
                      <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{step.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Soporte */}
          <div style={{ background: 'rgba(37,211,102,0.06)', border: '1px solid rgba(37,211,102,0.25)', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text)', lineHeight: 1.6 }}>
              ¿Tienes alguna duda sobre tu pedido? Escríbenos por WhatsApp con tu referencia <strong style={{ color: accent }}>{reference}</strong>.
            </div>
            <a
              href={`https://wa.me/${WHATSAPP}?text=${waMsg}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: '#25d366', color: '#fff',
                padding: '12px 16px', borderRadius: '4px', textDecoration: 'none',
                fontFamily: '"DM Mono", monospace', fontSize: '13px', fontWeight: 'bold',
                letterSpacing: '1px', display: 'inline-flex', alignItems: 'center', gap: '8px',
                alignSelf: 'flex-start',
              }}
            >
              <WhatsAppLogo size="16px" />
              CONTACTAR POR WHATSAPP
            </a>
          </div>

          {/* CTAs */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/"
              style={{
                flex: '1 1 200px',
                textAlign: 'center',
                padding: '16px',
                background: accent,
                color: '#111',
                border: `1px solid ${accent}`,
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: '20px',
                letterSpacing: '1.5px',
                textDecoration: 'none',
                boxShadow: `0 0 24px ${accent}33`,
              }}
            >
              VOLVER AL INICIO
            </Link>
            <Link
              href="/#productos"
              style={{
                flex: '1 1 200px',
                textAlign: 'center',
                padding: '16px',
                background: 'transparent',
                color: 'var(--text)',
                border: '1px solid var(--border)',
                fontFamily: '"Bebas Neue", sans-serif',
                fontSize: '20px',
                letterSpacing: '1.5px',
                textDecoration: 'none',
              }}
            >
              SEGUIR COMPRANDO
            </Link>
          </div>
        </div>

        {/* RIGHT — Resumen del pedido */}
        <div style={{ background: 'var(--surface)', padding: 'clamp(24px,4vw,56px)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: accent, letterSpacing: '3px', fontWeight: 700 }}>RESUMEN DEL PEDIDO</div>

          {order && order.cart.length > 0 ? (
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
              {order.cart.map((item) => {
                const itemTotal = item.price * item.qty;
                return (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text)', lineHeight: 1.4 }}>{item.name}</div>
                      <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {item.qty > 1 ? `${item.qty} uds × ${fmt(item.price)}` : '1 unidad'}
                      </div>
                    </div>
                    <div style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', color: accent, flexShrink: 0 }}>{fmt(itemTotal)}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text-muted)', padding: '12px 0' }}>
              No tenemos el detalle de productos en este dispositivo, pero tu pago quedó registrado bajo la referencia <strong style={{ color: accent }}>{reference}</strong>.
            </div>
          )}

          {/* Totales */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            {order && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', fontWeight: 700 }}>
                  <span>SUBTOTAL</span><span>{fmt(order.subtotal)}</span>
                </div>
                {order.codFee > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"DM Mono", monospace', fontSize: '12px', color: '#e88', fontWeight: 700 }}>
                    <span>SERVICIO CONTRA ENTREGA</span><span>+ {fmt(order.codFee)}</span>
                  </div>
                )}
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '8px' }}>
              <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text-muted)', letterSpacing: '2px', fontWeight: 700 }}>TOTAL PAGADO</span>
              {isApproved ? (
                <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '36px', color: accent, fontWeight: 900 }}>{fmt(paidAmount)}</span>
              ) : (
                <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '24px', color: '#e55', fontWeight: 900, letterSpacing: '1px' }}>ANULADO</span>
              )}
            </div>
          </div>

          {/* Sellos */}
          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '3px', marginBottom: '12px', fontWeight: 700 }}>TRANSACCIÓN SEGURA</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: 'var(--border)' }}>
              {[
                { label: 'SSL', sub: 'Encriptado' },
                { label: 'Wompi', sub: 'Bancolombia' },
                { label: 'PCI-DSS', sub: 'Certificado' },
                { label: '100%', sub: 'Seguro' },
              ].map((b) => (
                <div key={b.label} style={{ background: 'var(--bg)', padding: '12px', textAlign: 'center' }}>
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
