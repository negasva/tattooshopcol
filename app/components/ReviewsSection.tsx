'use client';

import { useEffect, useState } from 'react';

const accent = '#FFD400';

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  created_at: string;
  product_id?: string | null;
}

function Stars({ rating, interactive, onRate }: { rating: number; interactive?: boolean; onRate?: (r: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          onClick={() => interactive && onRate?.(s)}
          onMouseEnter={() => interactive && setHover(s)}
          onMouseLeave={() => interactive && setHover(0)}
          style={{ fontSize: '18px', color: s <= (hover || rating) ? accent : '#444', cursor: interactive ? 'pointer' : 'default', transition: 'color 0.1s' }}
        >★</span>
      ))}
    </div>
  );
}

export default function ReviewsSection({ productId }: { productId?: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [author, setAuthor] = useState('');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const url = productId ? `/api/reviews?product_id=${productId}` : '/api/reviews';
    fetch(url)
      .then((r) => r.json())
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId]);

  const avgRating = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  const handleSubmit = async () => {
    if (!author || !rating || !comment) { setSubmitError('Completa todos los campos'); return; }
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId || null, author, rating, comment }),
      });
      const data = await res.json();
      if (res.ok) { setSubmitted(true); setShowForm(false); }
      else setSubmitError(data.error || 'Error al enviar');
    } catch {
      setSubmitError('Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section style={{ borderTop: '1px solid var(--border)', padding: 'clamp(40px,5vw,64px) clamp(20px,5vw,80px)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: accent, letterSpacing: '3px', marginBottom: '8px', fontWeight: 700 }}>RESEÑAS</div>
          <h2 style={{ fontFamily: '"Bebas Neue", sans-serif', fontSize: 'clamp(28px,4vw,48px)', color: 'var(--text)', margin: 0, lineHeight: 0.95 }}>
            LO QUE DICEN<br /><span style={{ color: accent }}>NUESTROS CLIENTES</span>
          </h2>
          {reviews.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
              <Stars rating={Math.round(avgRating)} />
              <span style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text-muted)' }}>
                {avgRating.toFixed(1)} / 5 ({reviews.length} reseña{reviews.length !== 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setSubmitted(false); }}
          style={{ background: showForm ? 'var(--surface)' : accent, color: showForm ? 'var(--text)' : '#111', border: `1px solid ${accent}`, fontFamily: '"DM Mono", monospace', fontSize: '11px', letterSpacing: '1.5px', padding: '10px 20px', cursor: 'pointer', textTransform: 'uppercase' }}
        >
          {showForm ? 'Cancelar' : '+ Dejar reseña'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', padding: '24px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '560px' }}>
          <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '12px', color: accent, letterSpacing: '2px', fontWeight: 700 }}>NUEVA RESEÑA</div>
          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>TU NOMBRE</div>
            <input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Carlos M." maxLength={60}
              style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: '"DM Mono", monospace', fontSize: '13px', padding: '10px 12px', outline: 'none' }} />
          </div>
          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>CALIFICACIÓN</div>
            <Stars rating={rating} interactive onRate={setRating} />
          </div>
          <div>
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>COMENTARIO</div>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tu experiencia con el producto..." rows={4} maxLength={500}
              style={{ width: '100%', boxSizing: 'border-box', background: 'var(--bg)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: '"DM Mono", monospace', fontSize: '13px', padding: '10px 12px', outline: 'none', resize: 'vertical' }} />
            <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '10px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '4px' }}>{comment.length}/500</div>
          </div>
          {submitError && <p style={{ margin: 0, fontFamily: '"DM Mono", monospace', fontSize: '11px', color: '#e55' }}>{submitError}</p>}
          <button onClick={handleSubmit} disabled={submitting}
            style={{ background: accent, color: '#111', border: 'none', fontFamily: '"Bebas Neue", sans-serif', fontSize: '18px', letterSpacing: '1.5px', padding: '12px', cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1 }}>
            {submitting ? 'ENVIANDO...' : 'ENVIAR RESEÑA'}
          </button>
        </div>
      )}

      {submitted && (
        <div style={{ background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.3)', padding: '14px 18px', marginBottom: '24px', fontFamily: '"DM Mono", monospace', fontSize: '13px', color: '#25d366' }}>
          ✓ Reseña recibida. Aparecerá en las próximas horas.
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text-muted)' }}>Cargando reseñas...</div>
      ) : reviews.length === 0 ? (
        <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '13px', color: 'var(--text-muted)', padding: '32px 0' }}>
          Sé el primero en dejar una reseña.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1px', background: 'var(--border)' }}>
          {reviews.map((r) => (
            <div key={r.id} style={{ background: 'var(--surface)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Stars rating={r.rating} />
              <p style={{ margin: 0, fontFamily: '"DM Sans", sans-serif', fontSize: '14px', color: 'var(--text)', lineHeight: 1.6, fontStyle: 'italic' }}>"{r.comment}"</p>
              <div style={{ fontFamily: '"DM Mono", monospace', fontSize: '11px', color: 'var(--text-muted)', marginTop: 'auto' }}>
                — {r.author} · {new Date(r.created_at).toLocaleDateString('es-CO', { year: 'numeric', month: 'short' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
