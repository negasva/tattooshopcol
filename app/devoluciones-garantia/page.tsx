'use client';

import Link from 'next/link';
import { BrandLogo } from '@/app/components/BrandLogo';

export default function DevolucionesGarantia() {
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
          DEVOLUCIONES Y<br /><span style={{ color: accent }}>GARANTÍA</span>
        </h1>
      </div>

      {/* CONTENT */}
      <div style={{ padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,80px)', maxWidth: '900px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
              PERÍODO DE DEVOLUCIÓN
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '16px', color: 'var(--text)', lineHeight: 1.8 }}>
              Tienes <span style={{ color: accent, fontWeight: '700' }}>30 días</span> desde la recepción de tu pedido para solicitar una devolución o cambio sin costo adicional.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
              CONDICIONES PARA DEVOLUCIÓN
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '16px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '12px' }}>
              Para que tu devolución sea válida, el producto debe:
            </p>
            <ul style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: '24px', gap: '8px', display: 'flex', flexDirection: 'column' }}>
              <li>✓ Estar sin usar y en perfecto estado</li>
              <li>✓ Tener su embalaje original</li>
              <li>✓ Incluir todos los accesorios y documentación</li>
              <li>✓ Contar con comprobante de compra</li>
              <li>✓ No tener daños por negligencia del cliente</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
              PROCESO DE DEVOLUCIÓN
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { step: '1', title: 'Contacta Soporte', desc: 'Envía un mensaje a nuestro equipo con tu número de pedido y foto del producto.' },
                { step: '2', title: 'Aprobación', desc: 'Revisamos tu solicitud y confirmamos si es válida.' },
                { step: '3', title: 'Envío del Retorno', desc: 'Te proporcionamos los datos para enviar el producto de vuelta.' },
                { step: '4', title: 'Verificación', desc: 'Inspeccionamos el producto y procesamos tu reembolso o cambio.' }
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
              GARANTÍA DE PRODUCTOS
            </h2>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px', borderRadius: '8px' }}>
              <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: accent, fontWeight: '700', marginBottom: '12px' }}>MÁQUINAS DE TATUAJE</h3>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
                Garantía de 1 año contra defectos de fabricación. Cubre componentes defectuosos pero no daños por mal uso.
              </p>

              <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: accent, fontWeight: '700', marginBottom: '12px' }}>AGUJAS Y CARTUCHOS</h3>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '16px' }}>
                Reemplazo inmediato si llegan defectuosos o dañados. No aplica para usar productos.
              </p>

              <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: accent, fontWeight: '700', marginBottom: '12px' }}>INSUMOS EN GENERAL</h3>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Garantía de calidad al momento de recepción. Verifícalo antes de aceptar el envío.
              </p>
            </div>
          </section>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
              ¿NECESITAS AYUDA?
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '16px', color: 'var(--text)', lineHeight: 1.8 }}>
              Contacta a nuestro equipo de soporte por WhatsApp: <span style={{ color: accent, fontWeight: '700' }}>+57 3001234567</span>
            </p>
          </section>

        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px clamp(20px,5vw,80px)', background: 'var(--surface)' }}>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
          TattooShop Colombia ©2026 — Devoluciones y Garantía
        </div>
      </footer>
    </div>
  );
}
