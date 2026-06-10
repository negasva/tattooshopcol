import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

function normalizeStatus(status: string | null | undefined) {
  if (status === 'PAID') return 'PENDING';
  if (status === 'PENDING' || status === 'SHIPPED' || status === 'DELIVERED' || status === 'RETURNED') return status;
  return 'PENDING';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, products, total, payment_method, status = 'PENDING' } = body;

    if (!customer || !products || !Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: 'Datos de cliente y productos requeridos' }, { status: 400 });
    }

    const { name, phone, email, city } = customer;
    if (!name) {
      return NextResponse.json({ error: 'Nombre del cliente requerido' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const finalStatus = normalizeStatus(status);

    const productIds = products.map((p: any) => p.id || p.product_id);
    const { data: dbProducts, error: prodError } = await supabase
      .from('products')
      .select('id, name, inventory, price')
      .in('id', productIds);

    if (prodError || !dbProducts) {
      return NextResponse.json({ error: 'Error al consultar productos en la base de datos' }, { status: 500 });
    }

    const productMap = new Map(dbProducts.map(p => [p.id, p]));

    for (const item of products) {
      const pId = item.id || item.product_id;
      const qty = item.quantity || item.qty || 1;
      const dbProd = productMap.get(pId);
      if (!dbProd) return NextResponse.json({ error: `Producto con ID ${pId} no encontrado` }, { status: 404 });
      if ((dbProd.inventory ?? 0) < qty) {
        return NextResponse.json({
          error: `Stock insuficiente para ${dbProd.name}. Disponible: ${dbProd.inventory ?? 0}, Solicitado: ${qty}`,
        }, { status: 400 });
      }
    }

    let customerId: string | null = null;

    if (email) {
      const { data: existingCust } = await supabase.from('crm_customers').select('id').eq('email', email).maybeSingle();
      if (existingCust) customerId = existingCust.id;
    }

    if (!customerId && phone) {
      const { data: existingCust } = await supabase.from('crm_customers').select('id').eq('phone', phone).maybeSingle();
      if (existingCust) customerId = existingCust.id;
    }

    if (!customerId) {
      const { data: newCust, error: custError } = await supabase
        .from('crm_customers')
        .insert({ name, phone, email, city })
        .select('id')
        .single();
      if (custError || !newCust) {
        return NextResponse.json({ error: 'Error al crear cliente en CRM' }, { status: 500 });
      }
      customerId = newCust.id;
    }

    for (const item of products) {
      const pId = item.id || item.product_id;
      const qty = item.quantity || item.qty || 1;
      const dbProd = productMap.get(pId);
      const { error: updateStockError } = await supabase
        .from('products')
        .update({ inventory: (dbProd.inventory ?? 0) - qty })
        .eq('id', pId);
      if (updateStockError) {
        return NextResponse.json({ error: `Error al actualizar inventario para ${dbProd.name}` }, { status: 500 });
      }
    }

    const { data: newOrder, error: orderError } = await supabase
      .from('crm_orders')
      .insert({
        customer_id: customerId,
        source: 'WHATSAPP',
        payment_method,
        status: finalStatus,
        total_amount: total || 0,
      })
      .select('id')
      .single();

    if (orderError || !newOrder) {
      return NextResponse.json({ error: 'Error al registrar la orden en CRM' }, { status: 500 });
    }

    const orderItemsToInsert = products.map((item: any) => {
      const pId = item.id || item.product_id;
      const qty = item.quantity || item.qty || 1;
      const dbProd = productMap.get(pId);
      return { order_id: newOrder.id, product_id: pId, quantity: qty, price_at_purchase: dbProd.price };
    });

    const { error: itemsError } = await supabase.from('crm_order_items').insert(orderItemsToInsert);
    if (itemsError) {
      return NextResponse.json({ error: 'Error al registrar los items de la orden' }, { status: 500 });
    }

    return NextResponse.json({ success: true, order_id: newOrder.id, customer_id: customerId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, status, tracking_number } = body || {};
    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId y status son requeridos' }, { status: 400 });
    }

    const supabase = getServiceClient();
    const finalStatus = normalizeStatus(status);
    const payload: Record<string, string | null> = { status: finalStatus };
    if (tracking_number !== undefined) payload.tracking_number = tracking_number || null;

    const { error } = await supabase.from('crm_orders').update(payload).eq('id', orderId);
    if (error) return NextResponse.json({ error: error.message || 'Error al actualizar la orden' }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
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
