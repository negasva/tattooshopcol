import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { confirmWebOrderFromCart } from '@/app/lib/crmOrder';

function verifySignature(payload: string, receivedSig: string): boolean {
  const secret = process.env.WOMPI_INTEGRITY_SECRET;
  if (!secret) return false;
  const expected = createHash('sha256').update(payload + secret).digest('hex');
  return expected === receivedSig;
}

const MAX_WEBHOOK_AGE_MS = 5 * 60_000;

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-wompi-signature') || '';
    const tsHeader = req.headers.get('x-wompi-timestamp') || '';

    if (!verifySignature(rawBody, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    if (tsHeader) {
      const ts = parseInt(tsHeader, 10);
      if (!isNaN(ts) && Math.abs(Date.now() - ts * 1000) > MAX_WEBHOOK_AGE_MS) {
        return NextResponse.json({ error: 'Webhook expired' }, { status: 400 });
      }
    }

    let event: Record<string, any>;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const tx = event?.data?.transaction;
    if (!tx) {
      return NextResponse.json({ ok: true });
    }

    const reference = tx.reference;
    const status = tx.status;

    if (!reference || !status) {
      return NextResponse.json({ error: 'Missing reference or status' }, { status: 400 });
    }

    if (status !== 'APPROVED') {
      return NextResponse.json({ ok: true, message: `Status is ${status}, no action taken` });
    }

    const result = await confirmWebOrderFromCart(reference, tx);
    return NextResponse.json({ ok: true, order_id: result.orderId, already_existed: result.alreadyExisted });
  } catch (error: any) {
    console.error('Wompi webhook crash:', error);
    const notFound = (error.message || '').includes('No se encontró registro del carrito');
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: notFound ? 404 : 500 }
    );
  }
}
