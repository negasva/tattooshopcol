'use client';

import Link from 'next/link';
import { BrandLogo } from '@/app/components/BrandLogo';

export default function PoliticaEnvios() {
  const accent = '#FFD400';

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
          POLÍTICA DE<br /><span style={{ color: accent }}>ENVÍOS</span>
        </h1>
      </div>

      {/* CONTENT */}
      <div style={{ padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,80px)', maxWidth: '900px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
              COBERTURA DE ENVÍO
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '16px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '12px' }}>
              Realizamos envíos a nivel nacional a través de nuestros aliados logísticos confiables. Contamos con opciones de envío exprés y estándar según tu necesidad.
            </p>
            <ul style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: '24px', gap: '8px', display: 'flex', flexDirection: 'column' }}>
              <li>✓ Envíos a todo Colombia</li>
              <li>✓ Entrega a domicilio en Bogotá (24-48 horas)</li>
              <li>✓ Envío a nivel nacional (3-5 días hábiles)</li>
              <li>✓ Pago contra entrega disponible en ciudades seleccionadas</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
              COSTOS DE ENVÍO
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '16px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '12px' }}>
              Los costos de envío varían según el destino y el peso del pedido:
            </p>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px', borderRadius: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: accent, fontWeight: '700', marginBottom: '8px' }}>BOGOTÁ</h3>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)' }}>$5.000 - $15.000</p>
                </div>
                <div>
                  <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: accent, fontWeight: '700', marginBottom: '8px' }}>NACIONAL</h3>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)' }}>$8.000 - $25.000</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
              PROCESO DE ENVÍO
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { step: '1', title: 'Confirmación de Pedido', desc: 'Confirmamos tu compra y verificamos disponibilidad de productos.' },
                { step: '2', title: 'Preparación', desc: 'Embalamos tu pedido con cuidado en nuestras instalaciones.' },
                { step: '3', title: 'Envío', desc: 'Entregamos a la empresa de logística y recibes número de seguimiento.' },
                { step: '4', title: 'Entrega', desc: 'Tu pedido llega en perfectas condiciones a tu domicilio.' }
              ].map((item) => (
                <div key={item.step} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ background: accent, color: '#111', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', flexShrink: 0 }}>
                    {item.step}
                  </div>
                  <div>
                    <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text)', fontWeight: '700', marginBottom: '4px' }}>{item.title}</h3>
                    <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-muted)' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
              SEGUIMIENTO
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '16px', color: 'var(--text)', lineHeight: 1.8 }}>
              Recibirás un email con el número de seguimiento de tu envío. Puedes rastrearlo en tiempo real a través de la plataforma de logística. Si tienes dudas, contáctanos por WhatsApp: <span style={{ color: accent, fontWeight: '700' }}>+57 3001234567</span>
            </p>
          </section>

        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px clamp(20px,5vw,80px)', background: 'var(--surface)' }}>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
          TattooShop Colombia ©2026 — Política de Envíos
        </div>
      </footer>
    </div>
  );
}
