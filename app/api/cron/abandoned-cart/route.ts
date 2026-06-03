import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendAbandonedCartEmail } from '@/app/lib/email';

// W6: always require CRON_SECRET — never open in production
function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // block if not configured
  return req.headers.get('authorization') === `Bearer ${secret}`;
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Buscar carritos pending de más de 1 hora sin reminder enviado
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { data: carts, error } = await supabase
    .from('abandoned_carts')
    .select('*')
    .eq('status', 'pending')
    .is('reminder_sent_at', null)
    .lt('created_at', oneHourAgo)
    .limit(50);

  if (error) {
    console.error('cron/abandoned-cart fetch error:', error);
    return NextResponse.json({ error: 'DB error' }, { status: 500 });
  }

  const results = await Promise.allSettled(
    (carts ?? []).map(async (cart) => {
      await sendAbandonedCartEmail({
        to: cart.email,
        reference: cart.reference,
        cart: cart.cart,
        total: cart.total,
        city: cart.city,
      });

      await supabase
        .from('abandoned_carts')
        .update({ reminder_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', cart.id);

      return cart.reference;
    })
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  return NextResponse.json({ processed: carts?.length ?? 0, sent, failed });
}
