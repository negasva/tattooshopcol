import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';

export async function POST(req: NextRequest) {
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET;
  if (!integritySecret) {
    return NextResponse.json({ error: 'WOMPI_INTEGRITY_SECRET not configured' }, { status: 500 });
  }

  const { reference, amountInCents, currency } = await req.json();
  if (!reference || !amountInCents || !currency) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const signature = createHash('sha256')
    .update(`${reference}${amountInCents}${currency}${integritySecret}`)
    .digest('hex');

  return NextResponse.json({ signature });
}
