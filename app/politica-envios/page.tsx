'use client';

import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

          {/* COBERTURA */}
          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
              COBERTURA DE ENVÍO
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '16px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '20px' }}>
              Realizamos envíos a todo Colombia a través de nuestros aliados logísticos Coordinadora e Interrapidísimo. Los tiempos de entrega varían según tu ubicación:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Medellín */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: `4px solid ${accent}`, padding: '20px 24px', borderRadius: '8px' }}>
                <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '22px', color: accent, marginBottom: '8px' }}>MEDELLÍN</h3>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text)', lineHeight: 1.7, marginBottom: '6px' }}>
                  <strong>Entrega el mismo día</strong> para pedidos realizados antes de las 2:00 p.m., sujeto a disponibilidad de domiciliario en tu sector.
                </p>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.7 }}>
                  Para comunas o barrios ubicados en zonas de alta pendiente o de acceso especial, el tiempo estimado puede extenderse entre <strong>1 y 2 días hábiles</strong> para garantizar que tu pedido llegue en perfectas condiciones.
                </p>
              </div>

              {/* Ciudades principales */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '4px solid var(--border)', padding: '20px 24px', borderRadius: '8px' }}>
                <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '22px', color: 'var(--text)', marginBottom: '8px' }}>CIUDADES PRINCIPALES</h3>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text)', lineHeight: 1.7, marginBottom: '4px' }}>
                  Capitales departamentales y ciudades principales a nivel nacional.
                </p>
                <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '14px', color: accent, fontWeight: '700' }}>2 a 4 días hábiles</p>
              </div>

              {/* Municipios */}
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderLeft: '4px solid var(--border)', padding: '20px 24px', borderRadius: '8px' }}>
                <h3 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '22px', color: 'var(--text)', marginBottom: '8px' }}>MUNICIPIOS Y PUEBLOS</h3>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text)', lineHeight: 1.7, marginBottom: '4px' }}>
                  Envíos a municipios y poblaciones en todo el territorio nacional.
                </p>
                <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '14px', color: accent, fontWeight: '700' }}>3 a 5 días hábiles</p>
              </div>

            </div>
          </section>

          {/* COSTOS */}
          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
              COSTOS DE ENVÍO
            </h2>

            {/* Envío gratis */}
            <div style={{ background: 'var(--surface)', border: `1px solid ${accent}`, padding: '20px 24px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '20px', color: accent }}>ENVÍO GRATIS</span>
              </div>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text)', lineHeight: 1.7 }}>
                En pedidos iguales o superiores a <strong>$200.000</strong> cuando el pago se realiza a través de la página web o por transferencia bancaria. Aplica para cualquier destino en Colombia, incluida Medellín.
              </p>
            </div>

            {/* Contra entrega */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '20px 24px', borderRadius: '8px' }}>
              <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: accent, fontWeight: '700', marginBottom: '12px', letterSpacing: '1px' }}>PAGO CONTRA ENTREGA</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '6px' }}>MEDELLÍN</p>
                  <p style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '26px', color: 'var(--text)' }}>+ $10.000</p>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>Costo adicional al valor del pedido</p>
                </div>
                <div>
                  <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '6px' }}>RESTO DEL PAÍS</p>
                  <p style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '26px', color: 'var(--text)' }}>+ $18.000</p>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>Costo adicional al valor del pedido</p>
                </div>
              </div>
            </div>
          </section>

          {/* PROCESO */}
          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
              PROCESO DE ENVÍO
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { step: '1', title: 'Confirmación de Pedido', desc: 'Confirmamos tu compra y verificamos disponibilidad de productos.' },
                { step: '2', title: 'Preparación', desc: 'Embalamos tu pedido con cuidado en nuestras instalaciones.' },
                { step: '3', title: 'Envío', desc: 'Entregamos a la empresa de logística y recibes tu número de guía por correo y WhatsApp.' },
                { step: '4', title: 'Entrega', desc: 'Tu pedido llega en perfectas condiciones a tu domicilio.' }
              ].map((item) => (
                <div key={item.step} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{ background: accent, color: '#111', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', flexShrink: 0, fontFamily: '"DM Mono", monospace' }}>
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

          {/* SEGUIMIENTO */}
          <section>
            <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '32px', color: accent, marginBottom: '16px', fontWeight: '900' }}>
              SEGUIMIENTO
            </h2>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '16px', color: 'var(--text)', lineHeight: 1.8, marginBottom: '20px' }}>
              Una vez despachado tu pedido, recibirás el <strong>número de guía de rastreo</strong> por correo electrónico y por WhatsApp. Con ese número puedes consultar el estado de tu envío en tiempo real directamente en la plataforma de la transportadora:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <a
                href="https://www.coordinadora.com/portafolio-de-servicios/servicios-en-linea/rastrear-guias/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  padding: '16px 20px', borderRadius: '8px',
                  textDecoration: 'none', transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = accent; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'; }}
              >
                <div>
                  <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: accent, fontWeight: '700', marginBottom: '2px' }}>COORDINADORA</p>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>Rastrear guía en coordinadora.com</p>
                </div>
                <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)' }}>→</span>
              </a>

              <a
                href="https://www.interrapidisimo.com/rastrea-tu-envio/"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  padding: '16px 20px', borderRadius: '8px',
                  textDecoration: 'none', transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = accent; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'; }}
              >
                <div>
                  <p style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: accent, fontWeight: '700', marginBottom: '2px' }}>INTERRAPIDÍSIMO</p>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '13px', color: 'var(--text-muted)' }}>Rastrear guía en interrapidisimo.com</p>
                </div>
                <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)' }}>→</span>
              </a>
            </div>

            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
              ¿Tienes alguna duda sobre tu envío? Escríbenos por WhatsApp:{' '}
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
          TattooShop Colombia ©2026 — Política de Envíos
        </div>
      </footer>
    </div>
  );
}
