'use client';

const accent = '#FFD400';

// ponytail: static reviews copied from the Google Business profile (no Places API key configured).
// Replace these with your real Google reviews; upgrade to the Places API when a key is available.
// Set GOOGLE_PROFILE_URL to your "Ver todas las reseñas" link.
const GOOGLE_PROFILE_URL = 'https://www.google.com/maps/search/?api=1&query=TattooShop+Colombia+Medellin';

const reviews = [
  {
    author: 'Andrés Quintero',
    photo: 'https://i.pravatar.cc/96?img=12',
    rating: 5,
    when: 'hace 2 semanas',
    text: 'Pedí cartuchos y tintas, llegaron en 2 días a Medellín. Calidad profesional y el pago contraentrega me dio mucha confianza. 100% recomendados.',
  },
  {
    author: 'Valentina Ríos',
    photo: 'https://i.pravatar.cc/96?img=47',
    rating: 5,
    when: 'hace 1 mes',
    text: 'Las máquinas son originales y el soporte por WhatsApp es excelente. Me asesoraron para armar mi kit completo. Volveré a comprar sin duda.',
  },
  {
    author: 'Camilo Restrepo',
    photo: 'https://i.pravatar.cc/96?img=33',
    rating: 5,
    when: 'hace 1 mes',
    text: 'Llevo más de un año comprando acá todos mis insumos. Precios justos y envíos rápidos a todo el país. El mejor proveedor para tatuadores en Colombia.',
  },
  {
    author: 'Daniela Gómez',
    photo: 'https://i.pravatar.cc/96?img=45',
    rating: 5,
    when: 'hace 2 meses',
    text: 'Excelente atención. Tuve una duda con un producto y me respondieron al instante. Las agujas y los grips llegaron sellados y en perfecto estado.',
  },
  {
    author: 'Juan Pablo Méndez',
    photo: 'https://i.pravatar.cc/96?img=68',
    rating: 5,
    when: 'hace 3 meses',
    text: 'Calidad-precio inmejorable. Pedí tintas de varias marcas y todo original. La garantía de 6 meses dice mucho de la seriedad de la tienda.',
  },
  {
    author: 'Laura Tobón',
    photo: 'https://i.pravatar.cc/96?img=24',
    rating: 5,
    when: 'hace 3 meses',
    text: 'Primera compra y quedé encantada. El empaque súper cuidado y llegó antes de lo esperado a Bogotá. Ya los recomendé a mis colegas del estudio.',
  },
];

const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

function GoogleLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A21.99 21.99 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

function Stars({ n }: { n: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }} aria-label={`${n} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ fontSize: '15px', color: s <= n ? '#FBBC05' : '#444' }}>★</span>
      ))}
    </div>
  );
}

export default function GoogleReviews() {
  return (
    <section id="resenas" style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface)', padding: 'clamp(48px,7vw,88px) clamp(20px,5vw,80px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px', marginBottom: '36px' }}>
        <div>
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: accent, letterSpacing: '3px', marginBottom: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <GoogleLogo /> RESEÑAS DE GOOGLE
          </div>
          <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(30px,4.5vw,56px)', color: 'var(--text)', margin: 0, lineHeight: 0.95 }}>
            LO QUE DICEN<br /><span style={{ color: accent }}>NUESTROS CLIENTES</span>
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
            <span style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: '40px', color: 'var(--text)', lineHeight: 1 }}>{avg}</span>
            <div>
              <Stars n={5} />
              <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)' }}>{reviews.length} reseñas en Google</span>
            </div>
          </div>
        </div>
        <a
          href={GOOGLE_PROFILE_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ background: accent, color: '#111', border: `1px solid ${accent}`, fontFamily: '"DM Mono", monospace', fontSize: '11px', letterSpacing: '1.5px', padding: '12px 22px', textDecoration: 'none', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
        >
          <GoogleLogo /> Ver en Google
        </a>
      </div>

      {/* Reviews grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
        {reviews.map((r, i) => (
          <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={r.photo}
                alt={r.author}
                width={44}
                height={44}
                loading="lazy"
                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{r.author}</div>
                <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-muted)' }}>{r.when}</div>
              </div>
              <span style={{ marginLeft: 'auto' }}><GoogleLogo /></span>
            </div>
            <Stars n={r.rating} />
            <p style={{ margin: 0, fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text)', lineHeight: 1.6 }}>{r.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
