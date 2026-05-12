'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';

export default function PreguntasFrecuentes() {
  const accent = '#FFD400';
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: { q: string; a: React.ReactNode }[] = [
    {
      q: '¿Cuánto tiempo demora la entrega?',
      a: 'En Medellín hacemos entrega el mismo día para pedidos realizados antes de las 2:00 p.m. Para comunas o barrios con acceso especial, puede tomar entre 1 y 2 días hábiles. Para ciudades capitales y principales de cada departamento: 2 a 4 días hábiles. Para municipios y pueblos: 3 a 5 días hábiles.',
    },
    {
      q: '¿Qué métodos de pago aceptan?',
      a: 'Aceptamos pago en línea a través de la página web (tarjeta de crédito/débito, PSE, Nequi, Daviplata, transferencia bancaria) y pago contra entrega. Los pedidos pagados por la página o transferencia bancaria desde $200.000 tienen envío gratis.',
    },
    {
      q: '¿Hacen contra entrega?',
      a: 'Sí, manejamos pago contra entrega en todo el país. En Medellín tiene un costo adicional de $10.000 y en el resto del país $18.000. Para pedidos pagados en línea o por transferencia desde $200.000 el envío es gratis.',
    },
    {
      q: '¿Los productos son originales?',
      a: 'Sí, todos nuestros productos son originales y de marcas reconocidas. Trabajamos directamente con fabricantes y distribuidores certificados para garantizar la autenticidad de cada artículo.',
    },
    {
      q: '¿Ofrecen garantía en máquinas de tatuaje?',
      a: 'Sí, las máquinas, fuentes de poder y baterías tienen garantía de 6 meses por defectos de fábrica. Las agujas y cartuchos tienen garantía si llegan defectuosos al momento de la recepción. Los insumos en general no cuentan con garantía. Puedes consultar todos los detalles en nuestra política de garantía.',
    },
    {
      q: '¿Hacen envíos a batallones militares?',
      a: 'No realizamos envíos a instalaciones militares. Lamentablemente los paquetes no logran ingresar a estos recintos y terminan perdiéndose, por lo que para evitar inconvenientes con tu pedido no podemos despachar a ese tipo de direcciones.',
    },
    {
      q: '¿En qué parte del país están ubicados?',
      a: 'Estamos ubicados en Medellín, Antioquia. Desde aquí despachamos a todo el país a través de nuestros aliados logísticos Coordinadora e Interrapidísimo.',
    },
    {
      q: '¿Tienen punto físico?',
      a: 'No contamos con punto físico de venta. Manejamos exclusivamente tienda virtual y entregas presenciales en Medellín y el área metropolitana. Para el resto del país realizamos envíos a domicilio con la opción de pago contra entrega.',
    },
    {
      q: '¿Se puede revisar el paquete antes de pagarlo?',
      a: (
        <>
          Las empresas transportadoras no permiten abrir o modificar el paquete antes de cancelar el contraentrega, sin embargo tu compra está completamente respaldada. Las transportadoras ofrecen protección al cliente y además cuentas con nuestra garantía directa. Para darte total tranquilidad, puedes solicitarnos videos del producto exacto que vas a recibir y del proceso de empaquetado — lo que ves en el video es exactamente lo que te llega. Escríbenos por{' '}
          <a href="https://wa.me/573332910220" target="_blank" rel="noopener noreferrer" style={{ color: accent, fontWeight: '700', textDecoration: 'none' }}>WhatsApp</a>
          {' '}antes de tu pedido y con gusto te lo enviamos.
        </>
      ),
    },
    {
      q: '¿Hacen envíos internacionales?',
      a: 'Por el momento solo realizamos envíos dentro de Colombia. Si tienes alguna consulta especial escríbenos por WhatsApp.',
    },
    {
      q: '¿Cómo puedo rastrear mi pedido?',
      a: (
        <>
          Una vez despachado tu pedido recibirás el número de guía por correo y WhatsApp. Puedes rastrearlo en tiempo real en:{' '}
          <a href="https://www.coordinadora.com/portafolio-de-servicios/servicios-en-linea/rastrear-guias/" target="_blank" rel="noopener noreferrer" style={{ color: accent, fontWeight: '700', textDecoration: 'none' }}>Coordinadora</a>
          {' '}o{' '}
          <a href="https://www.interrapidisimo.com/rastrea-tu-envio/" target="_blank" rel="noopener noreferrer" style={{ color: accent, fontWeight: '700', textDecoration: 'none' }}>Interrapidísimo</a>.
        </>
      ),
    },
    {
      q: '¿Cómo compro?',
      a: (
        <>
          Tienes dos opciones: <strong style={{ color: 'var(--text)' }}>comprar por la página web</strong> de forma rápida y segura, con un <strong style={{ color: accent }}>descuento del 10%</strong> en tu pedido; o <strong style={{ color: 'var(--text)' }}>escribirnos por WhatsApp</strong> al{' '}
          <a href="https://wa.me/573332910220" target="_blank" rel="noopener noreferrer" style={{ color: accent, fontWeight: '700', textDecoration: 'none' }}>+57 333 291 0220</a>
          {' '}para coordinar tu pedido personalmente y resolver cualquier duda antes de comprar.
        </>
      ),
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
          PREGUNTAS<br /><span style={{ color: accent }}>FRECUENTES</span>
        </h1>
      </div>

      {/* CONTENT */}
      <div style={{ padding: 'clamp(32px,5vw,56px) clamp(20px,5vw,80px)', maxWidth: '900px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {faqs.map((faq, idx) => (
            <div key={idx} style={{ border: '1px solid var(--border)', borderRadius: '4px', overflow: 'hidden' }}>
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                style={{
                  width: '100%',
                  padding: '20px',
                  background: 'var(--surface)',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface2)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--surface)'; }}
              >
                <h3 style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: accent, fontWeight: '700', textAlign: 'left' }}>
                  {faq.q}
                </h3>
                <svg viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" style={{
                  width: '20px', height: '20px', flexShrink: 0,
                  transform: openIndex === idx ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s'
                }}>
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {openIndex === idx && (
                <div style={{
                  padding: '20px',
                  background: 'var(--bg)',
                  borderTop: '1px solid var(--border)',
                }}>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8 }}>
                    {faq.a}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        <section style={{ marginTop: '48px', padding: '32px', background: 'var(--surface)', borderRadius: '8px', border: `1px solid var(--border)` }}>
          <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '28px', color: accent, marginBottom: '12px', fontWeight: '900' }}>
            ¿NO ENCONTRASTE RESPUESTA?
          </h2>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '15px', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '16px' }}>
            Nuestro equipo está disponible para ayudarte. Escríbenos directamente por WhatsApp:{' '}
            <a href="https://wa.me/573332910220" target="_blank" rel="noopener noreferrer" style={{ color: accent, fontWeight: '700', textDecoration: 'none' }}>+57 333 291 0220</a>
          </p>
        </section>

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

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '20px clamp(20px,5vw,80px)', background: 'var(--surface)' }}>
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: 'var(--text-muted)', letterSpacing: '1px' }}>
          TattooShop Colombia ©2026 — Preguntas Frecuentes
        </div>
      </footer>
    </div>
  );
}
