import { Resend } from 'resend';

// Lazy init — evita error en build cuando RESEND_API_KEY no está definida
function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

const FROM = process.env.RESEND_FROM_EMAIL || 'TattooShop Colombia <noreply@tattooshopcol.shop>';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tattooshopcol.shop';

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  discount_percentage?: number;
}

function itemTotal(item: CartItem) {
  const price = item.discount_percentage && item.discount_percentage > 0
    ? Math.round(item.price - item.price * (item.discount_percentage / 100))
    : item.price;
  return price * item.qty;
}

function cartRows(cart: CartItem[]) {
  return cart.map((i) => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #222;font-family:'DM Mono',monospace;font-size:13px;color:#e0e0e0;">${i.name}${i.qty > 1 ? ` ×${i.qty}` : ''}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #222;font-family:'DM Mono',monospace;font-size:13px;color:#FFD400;text-align:right;">${fmt(itemTotal(i))}</td>
    </tr>`).join('');
}

function baseTemplate(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:'DM Sans',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#111;border:1px solid #222;">
        <!-- HEADER -->
        <tr><td style="background:#111;padding:28px 32px;border-bottom:2px solid #FFD400;">
          <span style="font-family:'Bebas Neue',Arial,sans-serif;font-size:28px;color:#FFD400;letter-spacing:2px;">TattooShop Colombia</span>
        </td></tr>
        <!-- BODY -->
        <tr><td style="padding:32px;">
          ${body}
        </td></tr>
        <!-- FOOTER -->
        <tr><td style="padding:20px 32px;border-top:1px solid #222;background:#0d0d0d;">
          <p style="margin:0;font-size:12px;color:#555;font-family:'DM Mono',monospace;">
            TattooShop Colombia &mdash; Kits, máquinas e insumos profesionales.<br>
            Si no reconoces este mensaje, ignóralo.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export async function sendAbandonedCartEmail(opts: {
  to: string;
  reference: string;
  cart: CartItem[];
  total: number;
  city?: string;
}) {
  const { to, reference, cart, total, city } = opts;
  const checkoutUrl = `${SITE_URL}/checkout`;

  const body = `
    <h1 style="margin:0 0 8px;font-family:'Bebas Neue',Arial,sans-serif;font-size:32px;color:#fff;line-height:1;">¿Olvidaste algo?</h1>
    <p style="margin:0 0 24px;color:#aaa;font-size:15px;line-height:1.6;">
      Dejaste productos en tu carrito. Están reservados para ti — completa tu compra antes de que se agoten.
    </p>
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #222;margin-bottom:24px;">
      <thead>
        <tr style="background:#1a1a1a;">
          <th style="padding:10px 16px;text-align:left;font-family:'DM Mono',monospace;font-size:11px;color:#555;letter-spacing:2px;text-transform:uppercase;">Producto</th>
          <th style="padding:10px 16px;text-align:right;font-family:'DM Mono',monospace;font-size:11px;color:#555;letter-spacing:2px;text-transform:uppercase;">Total</th>
        </tr>
      </thead>
      <tbody>${cartRows(cart)}</tbody>
      <tfoot>
        <tr style="background:#1a1a1a;">
          <td style="padding:12px 16px;font-family:'Bebas Neue',Arial,sans-serif;font-size:16px;color:#aaa;letter-spacing:1px;">TOTAL</td>
          <td style="padding:12px 16px;font-family:'Bebas Neue',Arial,sans-serif;font-size:22px;color:#FFD400;text-align:right;">${fmt(total)}</td>
        </tr>
      </tfoot>
    </table>
    ${city ? `<p style="margin:0 0 24px;font-family:'DM Mono',monospace;font-size:13px;color:#777;">Ciudad seleccionada: <span style="color:#e0e0e0;">${city}</span></p>` : ''}
    <a href="${checkoutUrl}" style="display:inline-block;background:#FFD400;color:#111;padding:14px 32px;font-family:'Bebas Neue',Arial,sans-serif;font-size:20px;letter-spacing:1.5px;text-decoration:none;">
      COMPLETAR COMPRA →
    </a>`;

  return getResend().emails.send({
    from: FROM,
    to,
    subject: '¿Olvidaste tu carrito? 🛒 Tus productos te esperan',
    html: baseTemplate('Carrito abandonado — TattooShop Colombia', body),
  });
}

export async function sendPaymentFailedEmail(opts: {
  to: string;
  reference: string;
  cart: CartItem[];
  total: number;
  reason?: string;
}) {
  const { to, reference, cart, total, reason } = opts;
  const checkoutUrl = `${SITE_URL}/checkout`;

  const body = `
    <h1 style="margin:0 0 8px;font-family:'Bebas Neue',Arial,sans-serif;font-size:32px;color:#fff;line-height:1;">Tu pago no se completó</h1>
    <p style="margin:0 0 8px;color:#aaa;font-size:15px;line-height:1.6;">
      Ref: <span style="color:#FFD400;font-family:'DM Mono',monospace;">${reference}</span>
    </p>
    ${reason ? `<p style="margin:0 0 24px;color:#e55;font-size:14px;font-family:'DM Mono',monospace;">${reason}</p>` : '<p style="margin:0 0 24px;color:#aaa;font-size:14px;">Ocurrió un problema al procesar el pago, pero tus productos siguen disponibles.</p>'}
    <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #222;margin-bottom:24px;">
      <thead>
        <tr style="background:#1a1a1a;">
          <th style="padding:10px 16px;text-align:left;font-family:'DM Mono',monospace;font-size:11px;color:#555;letter-spacing:2px;text-transform:uppercase;">Producto</th>
          <th style="padding:10px 16px;text-align:right;font-family:'DM Mono',monospace;font-size:11px;color:#555;letter-spacing:2px;text-transform:uppercase;">Total</th>
        </tr>
      </thead>
      <tbody>${cartRows(cart)}</tbody>
      <tfoot>
        <tr style="background:#1a1a1a;">
          <td style="padding:12px 16px;font-family:'Bebas Neue',Arial,sans-serif;font-size:16px;color:#aaa;letter-spacing:1px;">TOTAL</td>
          <td style="padding:12px 16px;font-family:'Bebas Neue',Arial,sans-serif;font-size:22px;color:#FFD400;text-align:right;">${fmt(total)}</td>
        </tr>
      </tfoot>
    </table>
    <a href="${checkoutUrl}" style="display:inline-block;background:#FFD400;color:#111;padding:14px 32px;font-family:'Bebas Neue',Arial,sans-serif;font-size:20px;letter-spacing:1.5px;text-decoration:none;">
      INTENTAR DE NUEVO →
    </a>`;

  return getResend().emails.send({
    from: FROM,
    to,
    subject: `Tu pago no se completó — ref ${reference}`,
    html: baseTemplate('Pago fallido — TattooShop Colombia', body),
  });
}
