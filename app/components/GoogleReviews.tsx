'use client';

const accent = '#FFD400';

// Enlace general a tus reseñas en Google (botón "Ver en Google").
// Reemplázalo por el enlace directo a tu perfil/reseñas si lo tienes.
const GOOGLE_PROFILE_URL = 'https://www.google.com/search?q=Tattoo+Shop+Colombia';

// Reseñas reales de Google.
// - photo: deja '' para mostrar un avatar con iniciales (estilo Google sin foto);
//   pon una URL de imagen para mostrar la foto real del cliente.
// - link: a dónde lleva al hacer clic en la reseña (idealmente el enlace directo
//   a esa reseña en Google; por defecto va al perfil general).
const reviews = [
  { id: 'review1', author: 'Yordano Gonzalez',        rating: 5, when: 'hace 1 año',   text: 'Amo la máquina que recibí 🤗',                                              photo: '', link: GOOGLE_PROFILE_URL },
  { id: 'review2', author: 'Camilo "Camiloni" Tique', rating: 5, when: 'hace 2 años',  text: 'Envíos rápidos y responsables.',                                            photo: '', link: GOOGLE_PROFILE_URL },
  { id: 'review3', author: 'Felipe Madrid Arenas',    rating: 5, when: 'hace 2 años',  text: 'Súper buena máquina, muy ligera y económica, llegan súper rápido!.',        photo: '', link: GOOGLE_PROFILE_URL },
  { id: 'review4', author: 'Mar Portela',             rating: 5, when: 'hace 2 años',  text: 'Excelente servicio, calidad total en los productos. Recomendado',           photo: '', link: GOOGLE_PROFILE_URL },
  { id: 'review5', author: '_eljuanes _',             rating: 5, when: 'hace 8 meses', text: 'Confiables, rápidos y muy buen servicio 👌 recomendados',                   photo: '', link: GOOGLE_PROFILE_URL },
  { id: 'review6', author: 'Yonny Parra Varela',      rating: 5, when: 'hace 1 año',   text: 'Estoy muy contento con lo que compré 🙏',                                   photo: '', link: GOOGLE_PROFILE_URL },
];

const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

const avatarPalette = ['#7E57C2', '#F4511E', '#1E88E5', '#43A047', '#00897B', '#E53935', '#8E24AA', '#FB8C00'];
function initials(name: string) {
  const parts = name.replace(/[_"]/g, ' ').trim().split(/\s+/).filter(Boolean);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
}
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return avatarPalette[Math.abs(h) % avatarPalette.length];
}

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

function Avatar({ author, photo }: { author: string; photo: string }) {
  if (photo) {
    return <img src={photo} alt={author} width={44} height={44} loading="lazy" style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />;
  }
  return (
    <div style={{ width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0, background: avatarColor(author), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"DM Sans", sans-serif', fontSize: '17px', fontWeight: 600 }}>
      {initials(author)}
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
        {reviews.map((r) => (
          <a
            key={r.id}
            href={r.link}
            target="_blank"
            rel="noopener noreferrer"
            style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px', textDecoration: 'none', color: 'inherit', cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = accent; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-3px)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'; (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar author={r.author} photo={r.photo} />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>{r.author}</div>
                <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-muted)' }}>{r.when}</div>
              </div>
              <span style={{ marginLeft: 'auto' }}><GoogleLogo /></span>
            </div>
            <Stars n={r.rating} />
            <p style={{ margin: 0, fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text)', lineHeight: 1.6 }}>{r.text}</p>
          </a>
        ))}
      </div>
    </section>
  );
}
