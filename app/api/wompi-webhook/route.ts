import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';
import { sendPaymentFailedEmail } from '@/app/lib/email';

// Wompi firma el payload con HMAC-SHA256 usando el integrity secret
function verifySignature(payload: string, receivedSig: string): boolean {
  const secret = process.env.WOMPI_INTEGRITY_SECRET;
  if (!secret) return false;
  const expected = createHash('sha256').update(payload + secret).digest('hex');
  return expected === receivedSig;
}

// W8: reject webhooks older than 5 minutes (replay attack prevention)
const MAX_WEBHOOK_AGE_MS = 5 * 60_000;

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get('x-wompi-signature') || '';
  const tsHeader = req.headers.get('x-wompi-timestamp') || '';

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // W8: timestamp guard against replay attacks
  if (tsHeader) {
    const ts = parseInt(tsHeader, 10);
    if (!isNaN(ts) && Math.abs(Date.now() - ts * 1000) > MAX_WEBHOOK_AGE_MS) {
      return NextResponse.json({ error: 'Webhook expired' }, { status: 400 });
    }
  }

  let event: Record<string, unknown>;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Wompi envía eventos con event.data.transaction
  const tx = (event?.data as Record<string, unknown>)?.transaction as Record<string, unknown> | undefined;
  if (!tx) return NextResponse.json({ ok: true });

  const reference = tx.reference as string | undefined;
  const status = tx.status as string | undefined;
  const email = (tx.customer_email as string | undefined) ||
    ((tx.customer_data as Record<string, unknown> | undefined)?.email as string | undefined);
  const statusMessage = tx.status_message as string | undefined;

  if (!reference || !status) return NextResponse.json({ ok: true });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  if (status === 'APPROVED') {
    await supabase
      .from('abandoned_carts')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('reference', reference);
    return NextResponse.json({ ok: true });
  }

  if (status === 'DECLINED' || status === 'ERROR') {
    // Buscar el carrito en la DB para obtener el email si Wompi no lo envió
    const { data: cart } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('reference', reference)
      .single();

    const toEmail = email || cart?.email;

    if (toEmail && cart) {
      try {
        await sendPaymentFailedEmail({
          to: toEmail,
          reference,
          cart: cart.cart,
          total: cart.total,
          reason: statusMessage,
        });

        await supabase
          .from('abandoned_carts')
          .update({
            status: 'error_reminded',
            reminder_sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('reference', reference);
      } catch (err) {
        console.error('wompi-webhook: failed to send email', err);
      }
    }
  }

  return NextResponse.json({ ok: true });
}
