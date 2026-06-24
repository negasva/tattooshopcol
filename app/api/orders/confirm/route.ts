import { NextRequest, NextResponse } from 'next/server';
import { confirmWebOrderFromCart } from '@/app/lib/crmOrder';
import { rateLimit, getIP, rateLimitResponse } from '@/app/lib/ratelimit';
import { sendPurchaseEvent } from '@/app/lib/metaCapi';

// Respaldo del webhook de Wompi: la página /checkout/exito llama aquí tras un
// pago aprobado para garantizar que el pedido quede registrado en el CRM.
// Verificamos el estado directamente con Wompi para que no se pueda falsificar.
export async function POST(req: NextRequest) {
  const rl = rateLimit(getIP(req), 'order-confirm', 10, 60_000);
  if (!rl.ok) return rateLimitResponse(rl);

  let body: { reference?: string };
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const reference = body.reference;
  if (!reference) {
    return NextResponse.json({ error: 'reference es requerido' }, { status: 400 });
  }

  const privateKey = process.env.WOMPI_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json({ error: 'Verificación de pagos no configurada' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.wompi.co/v1/transactions?reference=${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${privateKey}` },
    });
    if (!response.ok) {
      return NextResponse.json({ error: 'No se pudo verificar la transacción' }, { status: 502 });
    }
    const data = await response.json();
    const tx = (data.data || []).find((t: any) => t.status === 'APPROVED');
    if (!tx) {
      return NextResponse.json({ error: 'La transacción no está aprobada' }, { status: 400 });
    }

    const result = await confirmWebOrderFromCart(reference, tx);

    // Meta Conversions API: dispara Purchase solo para pedidos nuevos aprobados.
    if (!result.alreadyExisted) {
      await sendPurchaseEvent({
        value: tx.amount_in_cents ? tx.amount_in_cents / 100 : 0,
        currency: tx.currency || 'COP',
        email: tx.customer_email || null,
        phone: tx.customer_data?.phone_number || tx.customer_data?.phoneNumber || null,
        eventId: result.orderId || reference,
        clientIp: getIP(req),
        userAgent: req.headers.get('user-agent') || undefined,
      });
    }

    return NextResponse.json({ ok: true, order_id: result.orderId, already_existed: result.alreadyExisted });
  } catch (error: any) {
    console.error('orders/confirm error:', error);
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
