import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, getIP, rateLimitResponse } from '@/app/lib/ratelimit';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  // W1: 20 cart saves per 10 minutes per IP
  const ip = getIP(req);
  const rl = rateLimit(ip, 'save-cart', 20, 10 * 60_000);
  if (!rl.ok) return rateLimitResponse(rl);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { email, reference, cart, total, city, method, customer_name, customer_phone } = body;

  // W5: validate required fields
  if (!email || !reference || !cart || !total) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  if (typeof total !== 'number' || total <= 0 || total > 100_000_000) {
    return NextResponse.json({ error: 'Total inválido' }, { status: 400 });
  }
  if (!Array.isArray(cart) || cart.length === 0 || cart.length > 50) {
    return NextResponse.json({ error: 'Carrito inválido' }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const supabase = getServiceClient();

  const record: Record<string, unknown> = {
    email, reference, cart, total, city, method,
    status: 'pending', updated_at: new Date().toISOString(),
  };
  if (customer_name) record.customer_name = String(customer_name).slice(0, 120);
  if (customer_phone) record.customer_phone = String(customer_phone).slice(0, 30);

  let { error } = await supabase.from('abandoned_carts').upsert(record, { onConflict: 'reference' });

  // Compatibilidad: si las columnas customer_name/customer_phone aún no existen
  if (error && (customer_name || customer_phone)) {
    delete record.customer_name;
    delete record.customer_phone;
    ({ error } = await supabase.from('abandoned_carts').upsert(record, { onConflict: 'reference' }));
  }

  if (error) {
    console.error('save-cart error:', error);
    return NextResponse.json({ error: 'Failed to save cart' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const { reference, status } = await req.json();

  if (!reference || !status) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { error } = await supabase
    .from('abandoned_carts')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('reference', reference);

  if (error) {
    console.error('save-cart PATCH error:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
