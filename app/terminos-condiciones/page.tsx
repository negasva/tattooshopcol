'use client';

import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';

export default function TerminosCondiciones() {
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
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: accent, letterSpacing: '3px', marginBottom: '8px', fontWeight: '700' }}>LEGAL</div>
        <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(36px,6vw,72px)', lineHeight: 0.92, color: 'var(--text)', paddingBottom: 'clamp(24px,4vw,40px)', fontWeight: '900' }}>
          TÉRMINOS Y<br /><span style={{ color: accent }}>CONDICIONES</span>
        </h1>
      </div>

      {/* CONTENT */}
      <div style={{ padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,80px)', maxWidth: '900px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '28px', color: accent, marginBottom: '12px', fontWeight: '900' }}>
              1. ACEPTACIÓN DE TÉRMINOS
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              Al acceder y utilizar TattooShop Colombia, aceptas estar sujeto a estos términos y condiciones. Si no estás de acuerdo con alguno de estos términos, no debes usar este sitio.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '28px', color: accent, marginBottom: '12px', fontWeight: '900' }}>
              2. DESCRIPCIÓN DEL SERVICIO
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              TattooShop Colombia ofrece venta online de insumos y equipos para tatuaje. Nos comprometemos a mantener la precisión en la descripción de los productos, aunque no garantizamos la exactitud completa de toda la información publicada.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '28px', color: accent, marginBottom: '12px', fontWeight: '900' }}>
              3. USO PERMITIDO
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '12px' }}>
              Aceptas no utilizar nuestro sitio para:
            </p>
            <ul style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: '24px', gap: '6px', display: 'flex', flexDirection: 'column' }}>
              <li>• Actividades ilegales o fraudulentas</li>
              <li>• Interferir con la operación de nuestros servidores</li>
              <li>• Publicar contenido ofensivo o discriminatorio</li>
              <li>• Infringir derechos de propiedad intelectual</li>
              <li>• Acosar o amenazar a otros usuarios</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '28px', color: accent, marginBottom: '12px', fontWeight: '900' }}>
              4. INFORMACIÓN DE CUENTA
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              Al crear una cuenta, eres responsable de mantener la confidencialidad de tu contraseña y de toda actividad que ocurra bajo tu cuenta. Debes notificarnos inmediatamente de cualquier acceso no autorizado.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '28px', color: accent, marginBottom: '12px', fontWeight: '900' }}>
              5. PRECIOS Y DISPONIBILIDAD
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              Nos reservamos el derecho de cambiar precios en cualquier momento. La disponibilidad de productos está sujeta a cambios sin previo aviso. Confirmamos la disponibilidad en el momento de la compra.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '28px', color: accent, marginBottom: '12px', fontWeight: '900' }}>
              6. LIMITACIÓN DE RESPONSABILIDAD
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              TattooShop Colombia no se responsabiliza por daños incidentales, consequentes o punitivos que resulten del uso de nuestros productos o servicios. Nuestra responsabilidad está limitada al monto pagado por el cliente.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '28px', color: accent, marginBottom: '12px', fontWeight: '900' }}>
              7. POLÍTICA DE PRIVACIDAD
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              Tu privacidad es importante para nosotros. Protegemos tus datos personales con encriptación de nivel bancario. No compartimos tu información con terceros sin consentimiento.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '28px', color: accent, marginBottom: '12px', fontWeight: '900' }}>
              8. CAMBIOS A LOS TÉRMINOS
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entran en vigor inmediatamente tras su publicación. Tu uso continuo del sitio implica aceptación de los cambios.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '28px', color: accent, marginBottom: '12px', fontWeight: '900' }}>
              9. LEY APLICABLE
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              Estos términos se rigen por las leyes de la República de Colombia. Cualquier disputa será resuelta en los juzgados competentes de Bogotá.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '28px', color: accent, marginBottom: '12px', fontWeight: '900' }}>
              10. CONTACTO
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              Si tienes preguntas sobre estos términos, contáctanos en: <span style={{ color: accent, fontWeight: '700' }}>info@tattooshopcolombia.com</span> o por WhatsApp: <span style={{ color: accent, fontWeight: '700' }}>+57 3001234567</span>
            </p>
          </section>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '16px', borderRadius: '4px', marginTop: '16px' }}>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '12px', color: 'var(--text-muted)' }}>
              Última actualización: 2026-05-12
            </p>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px clamp(20px,5vw,80px)', background: 'var(--surface)' }}>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
          TattooShop Colombia ©2026 — Términos y Condiciones
        </div>
      </footer>
    </div>
  );
}
