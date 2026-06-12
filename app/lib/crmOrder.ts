import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lógica compartida para registrar pedidos en el CRM desde cualquier origen:
// webhook de Wompi, confirmación en /checkout/exito, o pedidos manuales/WhatsApp.

export function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

export interface CrmCustomerInput {
  name: string;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
}

export interface CrmItemInput {
  product_id: string;
  quantity: number;
  price?: number | null;
}

export interface CreateCrmOrderInput {
  source: 'WEB' | 'WHATSAPP';
  customer: CrmCustomerInput;
  items: CrmItemInput[];
  total: number;
  payment_method: string;
  status?: string;
  reference?: string | null;
  // Si false, no descuenta inventario (p. ej. cuando ya se descontó antes)
  adjustInventory?: boolean;
  // Si true, no falla cuando el stock es insuficiente (pagos ya aprobados)
  allowNegativeStock?: boolean;
}

export async function findOrCreateCustomer(
  supabase: SupabaseClient,
  customer: CrmCustomerInput
): Promise<string> {
  const { name, phone, email, city } = customer;

  if (email) {
    const { data } = await supabase.from('crm_customers').select('id').eq('email', email).maybeSingle();
    if (data) return data.id as string;
  }
  if (phone) {
    const { data } = await supabase.from('crm_customers').select('id').eq('phone', phone).maybeSingle();
    if (data) return data.id as string;
  }

  const { data: newCust, error } = await supabase
    .from('crm_customers')
    .insert({ name, phone: phone || null, email: email || null, city: city || null })
    .select('id')
    .single();
  if (error || !newCust) {
    throw new Error('Error al crear cliente en CRM');
  }
  return newCust.id as string;
}

export async function createCrmOrder(input: CreateCrmOrderInput) {
  const supabase = getServiceClient();
  const {
    source, customer, items, total, payment_method,
    status = 'PENDING', reference = null,
    adjustInventory = true, allowNegativeStock = false,
  } = input;

  // Idempotencia: si ya existe una orden con esta referencia, no duplicar
  if (reference) {
    const { data: existing, error: refErr } = await supabase
      .from('crm_orders')
      .select('id')
      .eq('reference', reference)
      .maybeSingle();
    // Si la columna reference no existe todavía (SQL sin ejecutar), seguimos sin idempotencia
    if (!refErr && existing) {
      return { orderId: existing.id as string, customerId: null, alreadyExisted: true };
    }
  }

  const productIds = items.map((i) => i.product_id);
  const { data: dbProducts, error: prodError } = await supabase
    .from('products')
    .select('id, name, inventory, price')
    .in('id', productIds);
  if (prodError || !dbProducts) {
    throw new Error('Error al consultar productos en la base de datos');
  }
  const productMap = new Map(dbProducts.map((p) => [p.id, p]));

  if (adjustInventory && !allowNegativeStock) {
    for (const item of items) {
      const dbProd = productMap.get(item.product_id);
      if (!dbProd) throw new Error(`Producto con ID ${item.product_id} no encontrado`);
      if (((dbProd.inventory as number) ?? 0) < item.quantity) {
        throw new Error(
          `Stock insuficiente para ${dbProd.name}. Disponible: ${dbProd.inventory ?? 0}, Solicitado: ${item.quantity}`
        );
      }
    }
  }

  const customerId = await findOrCreateCustomer(supabase, customer);

  if (adjustInventory) {
    for (const item of items) {
      const dbProd = productMap.get(item.product_id);
      if (!dbProd) continue;
      await supabase
        .from('products')
        .update({ inventory: ((dbProd.inventory as number) ?? 0) - item.quantity })
        .eq('id', item.product_id);
    }
  }

  const orderPayload: Record<string, unknown> = {
    customer_id: customerId,
    source,
    payment_method,
    status,
    total_amount: total,
    tracking_number: null,
  };
  if (reference) orderPayload.reference = reference;

  let { data: newOrder, error: orderError } = await supabase
    .from('crm_orders')
    .insert(orderPayload)
    .select('id')
    .single();

  // Reintento sin reference por si la columna aún no existe en la BD
  if (orderError && reference) {
    delete orderPayload.reference;
    const retry = await supabase.from('crm_orders').insert(orderPayload).select('id').single();
    newOrder = retry.data;
    orderError = retry.error;
  }

  if (orderError || !newOrder) {
    throw new Error('Error al registrar la orden en CRM');
  }

  const orderItems = items.map((item) => {
    const dbProd = productMap.get(item.product_id);
    return {
      order_id: newOrder!.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_at_purchase: item.price ?? (dbProd?.price as number) ?? 0,
    };
  });
  const { error: itemsError } = await supabase.from('crm_order_items').insert(orderItems);
  if (itemsError) {
    throw new Error('Error al registrar los items de la orden');
  }

  return { orderId: newOrder.id as string, customerId, alreadyExisted: false };
}

interface WompiTxInfo {
  customer_email?: string;
  customer_data?: { full_name?: string; fullName?: string; phone_number?: string; phoneNumber?: string };
  payment_method_type?: string;
  amount_in_cents?: number;
}

// Registra en el CRM un pedido web pagado por Wompi a partir del carrito
// guardado en abandoned_carts. Idempotente por referencia.
export async function confirmWebOrderFromCart(reference: string, tx: WompiTxInfo = {}) {
  const supabase = getServiceClient();

  const { data: cartData, error: cartError } = await supabase
    .from('abandoned_carts')
    .select('*')
    .eq('reference', reference)
    .maybeSingle();

  if (cartError || !cartData) {
    throw new Error(`No se encontró registro del carrito para la referencia ${reference}`);
  }

  // Si el carrito ya se procesó, verificar si la orden CRM existe para no duplicar
  if (cartData.status === 'completed') {
    const { data: existing, error: refErr } = await supabase
      .from('crm_orders')
      .select('id')
      .eq('reference', reference)
      .maybeSingle();
    if (refErr || existing) {
      // Columna reference inexistente (no podemos verificar) u orden ya creada
      return { orderId: existing?.id as string | undefined, customerId: null, alreadyExisted: true };
    }
    // Carrito marcado como completado pero sin orden CRM: la creamos sin tocar inventario
  }

  const cartItems: CrmItemInput[] = (cartData.cart || []).map((item: any) => ({
    product_id: item.id || item.product_id,
    quantity: item.quantity || item.qty || 1,
    price: item.price ?? null,
  }));

  const result = await createCrmOrder({
    source: 'WEB',
    reference,
    customer: {
      name: tx.customer_data?.full_name || tx.customer_data?.fullName || cartData.customer_name || 'Cliente Web',
      phone: tx.customer_data?.phone_number || tx.customer_data?.phoneNumber || cartData.customer_phone || null,
      email: tx.customer_email || cartData.email || null,
      city: cartData.city || null,
    },
    items: cartItems,
    total: tx.amount_in_cents ? tx.amount_in_cents / 100 : cartData.total,
    payment_method: tx.payment_method_type || cartData.method || 'WOMPI',
    status: 'PENDING',
    // El pago ya está aprobado: descontamos inventario aunque quede negativo
    adjustInventory: cartData.status !== 'completed',
    allowNegativeStock: true,
  });

  await supabase
    .from('abandoned_carts')
    .update({ status: 'completed', updated_at: new Date().toISOString() })
    .eq('reference', reference);

  return result;
}
