'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import BrandLogo from '../../components/BrandLogo';

const accent = '#FFD400';

export default function CheckoutSuccessPage() {
  const params = useSearchParams();
  const ref = params.get('id');
  const [status, setStatus] = useState<'loading' | 'approved' | 'pending' | 'declined'>('loading');

  useEffect(() => {
    if (!ref) { setStatus('pending'); return; }

    // Verify transaction status with Wompi API
    fetch(`https://sandbox.wompi.co/v1/transactions/${ref}`)
      .then((r) => r.json())
      .then((data) => {
        const s = data?.data?.status;
        if (s === 'APPROVED') setStatus('approved');
        else if (s === 'DECLINED' || s === 'ERROR' || s === 'VOIDED') setStatus('declined');
        else setStatus('pending');
      })
      .catch(() => setStatus('pending'));
  }, [ref]);

  const cleared = () => {
    try { localStorage.removeItem('ts_cart'); } catch {}
  };

  useEffect(() => {
    if (status === 'approved') cleared();
  }, [status]);

  const states = {
    loading: {
      icon: (
        <div style={{ width: 64, height: 64, border: `3px solid ${accent}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      ),
      title: 'Verificando pago...',
      sub: '',
      color: accent,
    },
    approved: {
      icon: (
        <svg viewBox="0 0 64 64" fill="none" stroke={accent} strokeWidth="3" style={{ width: 64, height: 64 }}>
          <circle cx="32" cy="32" r="30" />
          <polyline points="20,34 28,42 44,24" />
        </svg>
      ),
      title: '¡PAGO APROBADO!',
      sub: 'Tu pedido fue confirmado. Recibirás los detalles por WhatsApp.',
      color: accent,
    },
    pending: {
      icon: (
        <svg viewBox="0 0 64 64" fill="none" stroke="#FFD400" strokeWidth="3" style={{ width: 64, height: 64 }}>
          <circle cx="32" cy="32" r="30" />
          <line x1="32" y1="18" x2="32" y2="36" />
          <circle cx="32" cy="44" r="2" fill="#FFD400" />
        </svg>
      ),
      title: 'PAGO EN REVISIÓN',
      sub: 'El pago está siendo procesado. Te notificaremos por WhatsApp en breve.',
      color: '#FFD400',
    },
    declined: {
      icon: (
        <svg viewBox="0 0 64 64" fill="none" stroke="#e55555" strokeWidth="3" style={{ width: 64, height: 64 }}>
          <circle cx="32" cy="32" r="30" />
          <line x1="20" y1="20" x2="44" y2="44" />
          <line x1="44" y1="20" x2="20" y2="44" />
        </svg>
      ),
      title: 'PAGO RECHAZADO',
      sub: 'Hubo un problema con tu pago. Intenta de nuevo o elige otro método.',
      color: '#e55555',
    },
  };

  const s = states[status];

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
        <nav style={{ borderBottom: '1px solid var(--border)', padding: '0 clamp(20px,5vw,80px)', height: '64px', display: 'flex', alignItems: 'center' }}>
          <Link href="/" style={{ color: accent, display: 'flex', alignItems: 'center' }}>
            <BrandLogo size={32} />
          </Link>
        </nav>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(40px,8vw,80px) clamp(20px,5vw,80px)' }}>
          <div style={{ maxWidth: 480, width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28 }}>
            {s.icon}

            <div>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: 10, color: s.color, letterSpacing: '3px', marginBottom: 12 }}>
                TATTOOSHOP COLOMBIA
              </div>
              <h1 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(36px,6vw,64px)', color: s.color, lineHeight: 0.95 }}>
                {s.title}
              </h1>
              {s.sub && (
                <p style={{ fontFamily: '"DM Mono", monospace', fontSize: 12, color: 'var(--text-muted)', marginTop: 16, lineHeight: 1.7 }}>
                  {s.sub}
                </p>
              )}
              {ref && (
                <p style={{ fontFamily: '"DM Mono", monospace', fontSize: 10, color: 'var(--text-dim)', marginTop: 12, letterSpacing: '1px' }}>
                  Referencia: {ref}
                </p>
              )}
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
              {status === 'declined' && (
                <Link href="/checkout" style={{
                  background: accent, color: '#111', textDecoration: 'none',
                  fontFamily: '"Bebas Neue", sans-serif', fontSize: 20, padding: '14px 32px',
                  letterSpacing: '1px',
                }}>
                  INTENTAR DE NUEVO
                </Link>
              )}
              <Link href="/" style={{
                background: 'transparent', color: accent, textDecoration: 'none',
                fontFamily: '"DM Mono", monospace', fontSize: 11, padding: '14px 24px',
                border: `1px solid ${accent}`, letterSpacing: '1.5px', textTransform: 'uppercase',
              }}>
                Ver más productos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
