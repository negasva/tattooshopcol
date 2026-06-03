import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createHash } from 'crypto';

function verifySignature(payload: string, receivedSig: string): boolean {
  const secret = process.env.WOMPI_INTEGRITY_SECRET;
  if (!secret) return false;
  const expected = createHash('sha256').update(payload + secret).digest('hex');
  return expected === receivedSig;
}

const MAX_WEBHOOK_AGE_MS = 5 * 60_000;

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

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

    const supabase = getServiceClient();

    // 1. Obtener la información del carrito/pedido desde abandoned_carts
    const { data: cartData, error: cartError } = await supabase
      .from('abandoned_carts')
      .select('*')
      .eq('reference', reference)
      .maybeSingle();

    if (cartError || !cartData) {
      console.error(`Wompi webhook: No se encontró registro del carrito para la referencia ${reference}`);
      return NextResponse.json({ error: 'Cart reference not found' }, { status: 404 });
    }

    // Si el carrito ya se procesó previamente, retornar éxito para evitar duplicaciones
    if (cartData.status === 'completed') {
      return NextResponse.json({ ok: true, message: 'Order already processed' });
    }

    const email = tx.customer_email || cartData.email;
    const customerData = tx.customer_data || {};
    const name = customerData.full_name || customerData.fullName || 'Cliente Web';
    const phone = customerData.phone_number || customerData.phoneNumber || null;
    const city = cartData.city || null;
    const paymentMethod = tx.payment_method_type || cartData.method || 'WOMPI';
    const totalAmount = tx.amount_in_cents ? (tx.amount_in_cents / 100) : cartData.total;

    // 2. Crear o buscar cliente en CRM
    let customerId: string | null = null;

    if (email) {
      const { data: existingCust } = await supabase
        .from('crm_customers')
        .select('id')
        .eq('email', email)
        .maybeSingle();
      if (existingCust) customerId = existingCust.id;
    }

    if (!customerId) {
      const { data: newCust, error: custError } = await supabase
        .from('crm_customers')
        .insert({ name, phone, email, city })
        .select('id')
        .single();

      if (custError || !newCust) {
        console.error('Wompi webhook: Error al registrar cliente en CRM', custError);
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
      }
      customerId = newCust.id;
    }

    // 3. Procesar productos y actualizar inventario
    const cartItems = cartData.cart || [];
    const productIds = cartItems.map((item: any) => item.id || item.product_id);

    const { data: dbProducts, error: prodError } = await supabase
      .from('products')
      .select('id, name, inventory, price')
      .in('id', productIds);

    if (prodError || !dbProducts) {
      console.error('Wompi webhook: Error consultando stock de productos', prodError);
      return NextResponse.json({ error: 'Failed to query products' }, { status: 500 });
    }

    const productMap = new Map(dbProducts.map(p => [p.id, p]));

    // Descontar inventario (permitimos que baje de cero si ya está pagado para no perder el pedido)
    for (const item of cartItems) {
      const pId = item.id || item.product_id;
      const qty = item.quantity || item.qty || 1;
      const dbProd = productMap.get(pId);

      if (dbProd) {
        const currentStock = dbProd.inventory ?? 0;
        await supabase
          .from('products')
          .update({ inventory: currentStock - qty })
          .eq('id', pId);
      }
    }

    // 4. Crear la orden en crm_orders como PAID
    const { data: newOrder, error: orderError } = await supabase
      .from('crm_orders')
      .insert({
        customer_id: customerId,
        source: 'WEB',
        payment_method: paymentMethod,
        status: 'PAID',
        total_amount: totalAmount,
        tracking_number: null
      })
      .select('id')
      .single();

    if (orderError || !newOrder) {
      console.error('Wompi webhook: Error creando orden en crm_orders', orderError);
      return NextResponse.json({ error: 'Failed to create CRM order' }, { status: 500 });
    }

    // 5. Crear los items de la orden en crm_order_items
    const orderItemsToInsert = cartItems.map((item: any) => {
      const pId = item.id || item.product_id;
      const qty = item.quantity || item.qty || 1;
      const dbProd = productMap.get(pId);
      return {
        order_id: newOrder.id,
        product_id: pId,
        quantity: qty,
        price_at_purchase: item.price || dbProd?.price || 0
      };
    });

    const { error: itemsError } = await supabase
      .from('crm_order_items')
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error('Wompi webhook: Error insertando items de orden en crm_order_items', itemsError);
      return NextResponse.json({ error: 'Failed to create CRM order items' }, { status: 500 });
    }

    // 6. Marcar el carrito abandonado como completado
    await supabase
      .from('abandoned_carts')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('reference', reference);

    return NextResponse.json({ ok: true, order_id: newOrder.id });

  } catch (error: any) {
    console.error('Wompi webhook crash:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
