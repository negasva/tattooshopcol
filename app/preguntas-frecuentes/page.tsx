'use client';

import { useState } from 'react';
import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';

export default function PreguntasFrecuentes() {
  const accent = '#FFD400';
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      q: '¿Cuánto tiempo demora la entrega?',
      a: 'Bogotá: 24-48 horas. Nivel nacional: 3-5 días hábiles. El tiempo puede variar según la logística.',
    },
    {
      q: '¿Puedo cambiar mi pedido después de haberlo hecho?',
      a: 'Sí, si nos contactas dentro de 2 horas después de la compra. Después de ese tiempo, solo aceptamos cambios al recibir el producto.',
    },
    {
      q: '¿Qué métodos de pago aceptan?',
      a: 'Aceptamos tarjeta de crédito/débito, PSE, Nequi, Daviplata, transferencia bancaria y pago contra entrega (en ciudades seleccionadas).',
    },
    {
      q: '¿Los productos son originales?',
      a: 'Sí, todos nuestros productos son originales y de marcas reconocidas. Tenemos certificados de autenticidad.',
    },
    {
      q: '¿Ofrecen garantía en máquinas de tatuaje?',
      a: 'Sí, nuestras máquinas tienen garantía de 1 año contra defectos de fabricación.',
    },
    {
      q: '¿Puedo devolver un producto si cambio de opinión?',
      a: 'Sí, tienes 30 días desde la recepción para solicitar devolución o cambio sin costo adicional, siempre que el producto esté sin usar.',
    },
    {
      q: '¿Hacen envíos internacionales?',
      a: 'Por el momento solo hacemos envíos a nivel nacional. Estamos evaluando opciones para envíos internacionales.',
    },
    {
      q: '¿Cómo puedo rastrear mi pedido?',
      a: 'Recibirás un email con el número de seguimiento. Puedes rastrearlo en la plataforma de logística o escribirnos por WhatsApp.',
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
            Nuestro equipo está disponible para ayudarte. Contáctanos por WhatsApp: <span style={{ color: accent, fontWeight: '700' }}>+57 333 291 0220</span>
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
