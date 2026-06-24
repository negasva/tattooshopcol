import crypto from 'crypto';

// Meta Conversions API (server-side). Es solo un POST a la Graph API, así que
// no usamos el SDK de Facebook. No-op si falta META_CAPI_ACCESS_TOKEN, para
// que nunca rompa el checkout.
//
// Configura en las variables de entorno:
//   META_CAPI_ACCESS_TOKEN  (obligatorio para enviar)
//   META_PIXEL_ID           (opcional; por defecto el pixel del sitio)

const PIXEL_ID = process.env.META_PIXEL_ID || '1019528647699315';
const API_VERSION = 'v21.0';

// Meta exige email/teléfono normalizados y hasheados con SHA-256.
function hash(value: string) {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}
function hashPhone(phone: string) {
  // Solo dígitos (con indicativo de país si lo tiene), luego SHA-256.
  return crypto.createHash('sha256').update(phone.replace(/\D/g, '')).digest('hex');
}

export interface PurchaseEventInput {
  value: number;
  currency: string;
  email?: string | null;
  phone?: string | null;
  eventId?: string;        // para deduplicar con el pixel del navegador
  eventSourceUrl?: string;
  clientIp?: string;
  userAgent?: string;
}

export async function sendPurchaseEvent(input: PurchaseEventInput) {
  const token = process.env.META_CAPI_ACCESS_TOKEN;
  if (!token) return; // sin token configurado: no enviamos nada

  const user_data: Record<string, unknown> = {};
  if (input.email) user_data.em = [hash(input.email)];
  if (input.phone) user_data.ph = [hashPhone(input.phone)];
  if (input.clientIp) user_data.client_ip_address = input.clientIp;
  if (input.userAgent) user_data.client_user_agent = input.userAgent;

  const event = {
    event_name: 'Purchase',
    event_time: Math.floor(Date.now() / 1000),
    action_source: 'website',
    ...(input.eventId ? { event_id: input.eventId } : {}),
    ...(input.eventSourceUrl ? { event_source_url: input.eventSourceUrl } : {}),
    user_data,
    custom_data: { value: input.value, currency: input.currency },
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: [event] }),
      },
    );
    if (!res.ok) {
      console.error('Meta CAPI error:', res.status, await res.text());
    }
  } catch (err) {
    console.error('Meta CAPI request failed:', err);
  }
}
