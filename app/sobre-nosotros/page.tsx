'use client';

import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';

export default function SobreNosotros() {
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
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: accent, letterSpacing: '3px', marginBottom: '8px', fontWeight: '700' }}>NUESTRA HISTORIA</div>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(36px,6vw,72px)', lineHeight: 0.92, color: 'var(--text)', paddingBottom: 'clamp(24px,4vw,40px)', fontWeight: '900' }}>
          SOBRE<br /><span style={{ color: accent }}>NOSOTROS</span>
        </h1>
      </div>

      {/* CONTENT */}
      <div style={{ padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,80px)', maxWidth: '900px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
              ¿QUIÉNES SOMOS?
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '16px', color: 'var(--text)', lineHeight: 1.8 }}>
              TattooShop Colombia es el proveedor líder de insumos profesionales para tatuaje en Colombia. Desde 2020, nos hemos dedicado a ofrecer productos de la más alta calidad para artistas del tatuaje y profesionales de la industria.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
              NUESTRA MISIÓN
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '16px', color: 'var(--text)', lineHeight: 1.8 }}>
              Proporcionar a los tatuadores colombianos acceso a equipos y insumos de clase mundial, con precios competitivos y servicio excepcional. Creemos que el arte del tatuaje merece las mejores herramientas.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
              NUESTROS VALORES
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              {[
                { title: 'CALIDAD', desc: 'Vendemos solo productos auténticos y verificados' },
                { title: 'CONFIANZA', desc: 'Garantía en todos nuestros productos' },
                { title: 'PROFESIONALISMO', desc: 'Atención experta y dedicada' },
                { title: 'INNOVACIÓN', desc: 'Siempre ofrecemos lo más nuevo' },
              ].map((val) => (
                <div key={val.title} style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px', borderRadius: '8px' }}>
                  <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: accent, fontWeight: '700', marginBottom: '8px' }}>
                    {val.title}
                  </h3>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                    {val.desc}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
              ¿POR QUÉ ELEGIRNOS?
            </h2>
            <ul style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: '24px', gap: '8px', display: 'flex', flexDirection: 'column' }}>
              <li>✓ Más de 1000+ tatuadores confían en nosotros</li>
              <li>✓ Catálogo actualizado con los mejores productos</li>
              <li>✓ Precios competitivos y promociones regulares</li>
              <li>✓ Envío rápido a todo Colombia</li>
              <li>✓ Atención al cliente dedicada 24/7</li>
              <li>✓ Garantía de autenticidad en todos los productos</li>
              <li>✓ Garantía de 6 meses en equipos</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
              CONTACTO
            </h2>
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '24px', borderRadius: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: accent, fontWeight: '700', marginBottom: '4px' }}>UBICACIÓN</h3>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-muted)' }}>Medellín, Antioquia, Colombia</p>
                </div>
                <div>
                  <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: accent, fontWeight: '700', marginBottom: '4px' }}>HORARIO</h3>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-muted)' }}>Lunes - Viernes: 8:00 AM - 6:00 PM<br/>Sábado: 10:00 AM - 2:00 PM<br/>Domingo: Cerrado</p>
                </div>
                <div>
                  <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: accent, fontWeight: '700', marginBottom: '4px' }}>WHATSAPP</h3>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-muted)' }}>+57 333 291 0220</p>
                </div>
                <div>
                  <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: accent, fontWeight: '700', marginBottom: '4px' }}>REDES SOCIALES</h3>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-muted)' }}>
                    Instagram • TikTok • Facebook • YouTube
                  </p>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px clamp(20px,5vw,80px)', background: 'var(--surface)' }}>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
          TattooShop Colombia ©2026 — Sobre Nosotros
        </div>
      </footer>
    </div>
  );
}
