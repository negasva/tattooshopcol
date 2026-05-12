'use client';

import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';

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
          POLÍTICA DE<br /><span style={{ color: accent }}>GARANTÍA</span>
        </h1>
      </div>

      {/* CONTENT */}
      <div style={{ padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,80px)', maxWidth: '900px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

          {/* COBERTURA DE GARANTÍA */}
          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
              COBERTURA DE GARANTÍA
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '16px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '20px' }}>
              Todos nuestros productos cuentan con respaldo de garantía según su categoría. A continuación encontrarás los detalles para cada tipo de producto:
            </p>

            {/* Máquinas, fuentes y baterías */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `4px solid ${accent}`, padding: '20px 24px', borderRadius: '8px' }}>
                <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '20px', color: accent, marginBottom: '6px' }}>MÁQUINAS, FUENTES DE PODER Y BATERÍAS</h3>
                <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: accent, fontWeight: '700', marginBottom: '10px' }}>6 meses de garantía</p>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  Cubre únicamente defectos de fábrica. No aplica para daños causados por mal uso, caídas, humedad, modificaciones no autorizadas o desgaste natural del producto.
                </p>
              </div>

              {/* Agujas y cartuchos */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '4px solid var(--border)', padding: '20px 24px', borderRadius: '8px' }}>
                <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '20px', color: 'var(--text)', marginBottom: '6px' }}>AGUJAS Y CARTUCHOS</h3>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  Si llegan defectuosos al momento de la recepción, los reemplazamos sin costo adicional. Es indispensable reportarlo antes de usar el producto y enviar evidencia fotográfica o en video del defecto.
                </p>
              </div>

              {/* Insumos */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '4px solid var(--border)', padding: '20px 24px', borderRadius: '8px' }}>
                <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '20px', color: 'var(--text)', marginBottom: '6px' }}>INSUMOS EN GENERAL</h3>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  Los insumos (tintas, cremas, guantes, papel transfer, etc.) no cuentan con garantía una vez entregados. Te recomendamos revisar tu pedido al momento de recibirlo.
                </p>
              </div>
            </div>
          </section>

          {/* CONDICIONES */}
          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
              CONDICIONES DE GARANTÍA
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '16px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '16px' }}>
              Para que la garantía sea válida, se deben cumplir las siguientes condiciones:
            </p>
            <ul style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 2, paddingLeft: '0', gap: '4px', display: 'flex', flexDirection: 'column', listStyle: 'none' }}>
              <li>✓ El fallo debe ser por defecto de fábrica, no por mal uso</li>
              <li>✓ El producto debe estar dentro del período de garantía vigente</li>
              <li>✓ Se debe presentar comprobante de compra</li>
              <li>✓ El producto no debe haber sido intervenido, reparado o modificado por terceros</li>
              <li>✓ El daño no debe ser consecuencia de caídas, humedad, sobrecargas eléctricas o uso inadecuado</li>
              <li>✓ Se debe enviar evidencia clara (foto o video) del defecto reportado</li>
            </ul>
          </section>

          {/* PROCESO */}
          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
              PROCESO DE GARANTÍA
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ background: accent, color: '#111', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', flexShrink: 0, fontFamily: '"DM Mono", monospace' }}>1</div>
                <div>
                  <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text)', fontWeight: '700', marginBottom: '4px' }}>Contáctanos por WhatsApp</h3>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    Escríbenos directamente indicando tu número de pedido y una descripción del problema.{' '}
                    <a href="https://wa.me/573332910220" target="_blank" rel="noopener noreferrer" style={{ color: accent, fontWeight: '700', textDecoration: 'none' }}>
                      Abrir WhatsApp →
                    </a>
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ background: accent, color: '#111', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', flexShrink: 0, fontFamily: '"DM Mono", monospace' }}>2</div>
                <div>
                  <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text)', fontWeight: '700', marginBottom: '4px' }}>Envía la evidencia del fallo</h3>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    Comparte fotos o videos claros que muestren el defecto del producto. Esto nos permite evaluar tu caso de forma rápida.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ background: accent, color: '#111', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', flexShrink: 0, fontFamily: '"DM Mono", monospace' }}>3</div>
                <div>
                  <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text)', fontWeight: '700', marginBottom: '4px' }}>Envío del producto</h3>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    Una vez aprobado el caso, te indicamos la dirección para enviar el producto. <strong style={{ color: 'var(--text)' }}>Los costos de envío corren por cuenta del cliente.</strong> Si la garantía es aprobada, te reembolsamos el valor del envío.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ background: accent, color: '#111', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', flexShrink: 0, fontFamily: '"DM Mono", monospace' }}>4</div>
                <div>
                  <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text)', fontWeight: '700', marginBottom: '4px' }}>Revisión general</h3>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    Inspeccionamos el producto para determinar si el fallo corresponde a un defecto de fábrica. Según el resultado, procedemos a repararlo o a enviarte uno nuevo.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ background: accent, color: '#111', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', flexShrink: 0, fontFamily: '"DM Mono", monospace' }}>5</div>
                <div>
                  <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text)', fontWeight: '700', marginBottom: '4px' }}>Te enviamos el producto de regreso</h3>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                    Una vez resuelto el caso, despachamos el producto a tu dirección. Si la garantía fue aprobada, el costo del envío de retorno corre por nuestra cuenta y te reembolsamos el envío inicial que tú asumiste.
                  </p>
                </div>
              </div>

            </div>
          </section>

          {/* AYUDA */}
          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
              ¿TIENES DUDAS?
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '16px', color: 'var(--text)', lineHeight: 1.8 }}>
              Nuestro equipo está disponible para orientarte. Escríbenos por WhatsApp:{' '}
              <a href="https://wa.me/573332910220" target="_blank" rel="noopener noreferrer" style={{ color: accent, fontWeight: '700', textDecoration: 'none' }}>
                +57 333 291 0220
              </a>
            </p>
          </section>

          {/* BOTÓN VOLVER */}
          <div style={{ paddingTop: '8px', paddingBottom: '16px' }}>
            <Link
              href="/"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: accent, color: '#111',
                fontFamily: '"DM Mono", monospace', fontSize: '13px', fontWeight: '700',
                letterSpacing: '1.5px', textTransform: 'uppercase',
                padding: '14px 28px', borderRadius: '4px',
                textDecoration: 'none', transition: 'opacity 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
            >
              ← Volver a la página principal
            </Link>
          </div>

        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px clamp(20px,5vw,80px)', background: 'var(--surface)' }}>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
          TattooShop Colombia ©2026 — Garantía
        </div>
      </footer>
    </div>
  );
}
