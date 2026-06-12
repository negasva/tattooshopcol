import { NextRequest, NextResponse } from 'next/server';
import { createCrmOrder, getServiceClient } from '@/app/lib/crmOrder';
import { rateLimit, getIP, rateLimitResponse } from '@/app/lib/ratelimit';

function isAdmin(req: NextRequest) {
  const token = req.cookies.get('admin_session')?.value;
  const expected = process.env.ADMIN_SESSION_TOKEN;
  return Boolean(expected && token === expected);
}

function normalizeStatus(status: string | null | undefined) {
  if (status === 'PAID') return 'PENDING';
  if (status === 'PENDING' || status === 'SHIPPED' || status === 'DELIVERED' || status === 'RETURNED') return status;
  return 'PENDING';
}

// Lista los pedidos del CRM con cliente e items (productos de la tienda)
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('crm_orders')
      .select(`
        id,
        customer_id,
        source,
        payment_method,
        status,
        tracking_number,
        total_amount,
        created_at,
        crm_customers (
          id,
          name,
          phone,
          email,
          city
        ),
        crm_order_items (
          id,
          product_id,
          quantity,
          price_at_purchase,
          products ( id, name )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ orders: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Pedidos desde el checkout público (contraentrega/transferencia) también
    // entran por aquí: límite por IP para evitar abuso
    if (!isAdmin(req)) {
      const rl = rateLimit(getIP(req), 'crm-order-create', 5, 10 * 60_000);
      if (!rl.ok) return rateLimitResponse(rl);
    }

    const body = await req.json();
    const { customer, products, total, payment_method, status = 'PENDING', source, reference } = body;

    if (!customer || !products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Datos de cliente y productos requeridos' }, { status: 400 });
    }
    if (!customer.name) {
      return NextResponse.json({ error: 'Nombre del cliente requerido' }, { status: 400 });
    }

    const result = await createCrmOrder({
      source: source === 'WEB' ? 'WEB' : 'WHATSAPP',
      reference: reference || null,
      customer: {
        name: customer.name,
        phone: customer.phone || null,
        email: customer.email || null,
        city: customer.city || null,
      },
      items: products.map((item: any) => ({
        product_id: item.id || item.product_id,
        quantity: item.quantity || item.qty || 1,
        price: item.price ?? null,
      })),
      total: total || 0,
      payment_method,
      status: normalizeStatus(status),
    });

    return NextResponse.json({ success: true, order_id: result.orderId, customer_id: result.customerId });
  } catch (error: any) {
    const msg = error.message || 'Error interno del servidor';
    const isClientError = msg.includes('Stock insuficiente') || msg.includes('no encontrado');
    return NextResponse.json({ error: msg }, { status: isClientError ? 400 : 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { orderId, status, tracking_number, payment_method, customer } = body || {};
    if (!orderId) {
      return NextResponse.json({ error: 'orderId es requerido' }, { status: 400 });
    }

    const supabase = getServiceClient();

    const payload: Record<string, string | null> = {};
    if (status !== undefined) payload.status = normalizeStatus(status);
    if (tracking_number !== undefined) payload.tracking_number = tracking_number || null;
    if (payment_method !== undefined) payload.payment_method = payment_method;

    if (Object.keys(payload).length > 0) {
      const { error } = await supabase.from('crm_orders').update(payload).eq('id', orderId);
      if (error) return NextResponse.json({ error: error.message || 'Error al actualizar la orden' }, { status: 400 });
    }

    // Actualización de los datos del cliente asociado al pedido
    if (customer && customer.id) {
      const { error: custErr } = await supabase
        .from('crm_customers')
        .update({
          name: customer.name,
          phone: customer.phone || null,
          email: customer.email || null,
          city: customer.city || null,
        })
        .eq('id', customer.id);
      if (custErr) return NextResponse.json({ error: custErr.message || 'Error al actualizar el cliente' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('orderId');
    if (!orderId) {
      return NextResponse.json({ error: 'orderId es requerido' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const { data: order, error: orderErr } = await supabase
      .from('crm_orders')
      .select('id')
      .eq('id', orderId)
      .single();
    if (orderErr || !order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    const { data: items, error: itemsErr } = await supabase
      .from('crm_order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId);
    if (itemsErr) return NextResponse.json({ error: 'Error al leer los items de la orden' }, { status: 500 });

    for (const item of items || []) {
      const { data: prod, error: prodErr } = await supabase
        .from('products')
        .select('inventory')
        .eq('id', item.product_id)
        .single();
      if (prodErr) return NextResponse.json({ error: 'Error al consultar inventario' }, { status: 500 });
      await supabase
        .from('products')
        .update({ inventory: (prod.inventory ?? 0) + (item.quantity || 0) })
        .eq('id', item.product_id);
    }

    await supabase.from('crm_order_items').delete().eq('order_id', orderId);
    const { error: delErr } = await supabase.from('crm_orders').delete().eq('id', orderId);
    if (delErr) return NextResponse.json({ error: delErr.message || 'Error al borrar la orden' }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
