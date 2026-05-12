'use client';

import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';

export default function MetodosPago() {
  const accent = '#FFD400';

  const metodos = [
    {
      icon: '💳',
      title: 'Tarjeta de Crédito/Débito',
      desc: 'Visa, Mastercard, American Express',
      detalles: 'Procesa inmediatamente. Pago seguro con encriptación SSL 256-bit a través de Wompi.',
    },
    {
      icon: '🏦',
      title: 'PSE',
      desc: 'Transferencia bancaria inmediata',
      detalles: 'Conecta directamente con tu banco. Seguro y rápido. Disponible de lun-vie 7am-11pm.',
    },
    {
      icon: '📱',
      title: 'Nequi',
      desc: 'Billetera digital',
      detalles: 'Pago inmediato desde tu aplicación Nequi. Ideal para pagos rápidos y seguros.',
    },
    {
      icon: '💰',
      title: 'Daviplata',
      desc: 'Billetera Davivienda',
      detalles: 'Transferencia digital segura. Proceso inmediato desde tu app Daviplata.',
    },
    {
      icon: '🏠',
      title: 'Pago Contra Entrega',
      desc: 'Paga al recibir tu pedido',
      detalles: 'Disponible en ciudades seleccionadas. Costo adicional de $18.000. Efectivo o tarjeta.',
    },
    {
      icon: '🏪',
      title: 'Efecty / Baloto',
      desc: 'Pagos en corresponsal',
      detalles: 'Puedes pagar en puntos Efecty o Baloto en toda Colombia. Recibida de pago como comprobante.',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* NAV */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 700,
        background: 'var(--bg)',
        borderBottom: '1px solid var(--border)',
        padding: '0 clamp(20px,5vw,80px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', color: accent, textDecoration: 'none' }}>
          <BrandLogo size={32} />
        </Link>
        <Link href="/" style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1.5px', textDecoration: 'none', textTransform: 'uppercase', transition: 'color 0.2s' }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = accent; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-muted)'; }}
        >
          ← Volver al inicio
        </Link>
      </nav>

      {/* HEADER */}
      <div style={{ padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,80px) 0', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: accent, letterSpacing: '3px', marginBottom: '8px', fontWeight: '700' }}>INFORMACIÓN</div>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(36px,6vw,72px)', lineHeight: 0.92, color: 'var(--text)', paddingBottom: 'clamp(24px,4vw,40px)', fontWeight: '900' }}>
          MÉTODOS DE<br /><span style={{ color: accent }}>PAGO</span>
        </h1>
      </div>

      {/* CONTENT */}
      <div style={{ padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,80px)', maxWidth: '1000px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '48px' }}>
          {metodos.map((metodo, idx) => (
            <div key={idx} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              padding: '24px',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div style={{ fontSize: '32px' }}>{metodo.icon}</div>
              <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: accent, fontWeight: '700' }}>
                {metodo.title}
              </h3>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>
                {metodo.desc}
              </p>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                {metodo.detalles}
              </p>
            </div>
          ))}
        </div>

        <section>
          <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
            SEGURIDAD
          </h2>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '24px', borderRadius: '8px' }}>
            <ul style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text)', lineHeight: 1.8, gap: '12px', display: 'flex', flexDirection: 'column' }}>
              <li>✓ Encriptación SSL 256-bit en todos los pagos</li>
              <li>✓ Procesador de pagos certificado (Wompi - Bancolombia)</li>
              <li>✓ Cumplimiento con estándares PCI DSS</li>
              <li>✓ Tus datos bancarios nunca se comparten con nosotros</li>
              <li>✓ Protección contra fraude 24/7</li>
            </ul>
          </div>
        </section>

        <section style={{ marginTop: '32px' }}>
          <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
            PREGUNTAS SOBRE PAGO
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text)', fontWeight: '700', marginBottom: '8px' }}>¿Mi pago es seguro?</h3>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Totalmente. Usamos tecnología de encriptación de nivel bancario. Tus datos están protegidos.
              </p>
            </div>
            <div>
              <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text)', fontWeight: '700', marginBottom: '8px' }}>¿Cuándo se procesa mi pago?</h3>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                La mayoría de pagos se procesan inmediatamente. Algunos pueden tardar 24-48 horas según tu banco.
              </p>
            </div>
            <div>
              <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text)', fontWeight: '700', marginBottom: '8px' }}>¿Puedo usar múltiples tarjetas?</h3>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                No, por ahora cada compra requiere un único método de pago. Pero puedes usar diferentes métodos en compras diferentes.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px clamp(20px,5vw,80px)', background: 'var(--surface)' }}>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
          TattooShop Colombia ©2026 — Métodos de Pago
        </div>
      </footer>
    </div>
  );
}
