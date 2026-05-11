import { createHash } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const eventsSecret = process.env.WOMPI_EVENTS_SECRET;
    if (!eventsSecret) {
      return NextResponse.json({ error: 'Missing events secret' }, { status: 500 });
    }

    // Validate Wompi signature
    const { signature, data, timestamp } = body;
    if (!signature?.checksum || !data?.transaction || !timestamp) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { id, status, amount_in_cents } = data.transaction;
    const raw = `${id}${status}${amount_in_cents}${timestamp}${eventsSecret}`;
    const expected = createHash('sha256').update(raw).digest('hex');

    if (expected !== signature.checksum) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Handle transaction events
    if (body.event === 'transaction.updated') {
      const { reference } = data.transaction;
      console.log(`[Wompi] Transaction ${reference}: ${status}`);

      if (status === 'APPROVED') {
        // TODO: mark order as paid in Supabase using reference
      } else if (status === 'DECLINED' || status === 'ERROR' || status === 'VOIDED') {
        // TODO: mark order as failed
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Wompi webhook error]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
