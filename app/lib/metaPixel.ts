'use client';

// Wrapper seguro para los eventos estándar del pixel de Meta en el navegador.
// No hace nada si fbq aún no ha cargado, así nunca rompe la página.
//
// El eventId sirve para DEDUPLICAR con la Conversions API (server-side):
// usa el mismo id (p.ej. el order_id) en ambos lados y Meta cuenta 1 solo evento.

type PixelParams = Record<string, unknown>;

export function track(event: string, params?: PixelParams, eventId?: string) {
  if (typeof window === 'undefined') return;
  const fbq = (window as { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq !== 'function') return;
  fbq('track', event, params || {}, eventId ? { eventID: eventId } : undefined);
}
