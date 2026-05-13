import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const reference = req.nextUrl.searchParams.get('reference');

  if (!reference) {
    return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
  }

  const privateKey = process.env.WOMPI_PRIVATE_KEY;
  if (!privateKey) {
    console.error('WOMPI_PRIVATE_KEY not configured');
    return NextResponse.json({ error: 'Payment verification not configured' }, { status: 500 });
  }

  try {
    // Llamar a Wompi API para verificar el estado de la transacción
    const response = await fetch(`https://api.wompi.co/v1/transactions?reference=${reference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${privateKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Wompi API error:', response.status, response.statusText);
      return NextResponse.json({ error: 'Failed to verify transaction' }, { status: 500 });
    }

    const data = await response.json();
    const transaction = data.data?.[0];

    if (!transaction) {
      return NextResponse.json({ status: 'not_found', transaction: null });
    }

    // Devolver información de la transacción
    return NextResponse.json({
      status: 'found',
      transaction: {
        id: transaction.id,
        reference: transaction.reference,
        status: transaction.status,
        amount: transaction.amount_in_cents,
        currency: transaction.currency,
        payment_method: transaction.payment_method?.type,
        created_at: transaction.created_at,
      },
    });
  } catch (error) {
    console.error('Error checking transaction:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
