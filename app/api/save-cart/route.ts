import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key);
}

export async function POST(req: NextRequest) {
  const { email, reference, cart, total, city, method } = await req.json();

  if (!email || !reference || !cart || !total) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
  }

  const supabase = getServiceClient();

  const { error } = await supabase.from('abandoned_carts').upsert(
    { email, reference, cart, total, city, method, status: 'pending', updated_at: new Date().toISOString() },
    { onConflict: 'reference' }
  );

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
