import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, getIP, rateLimitResponse } from '@/app/lib/ratelimit';

// W5: input validation helpers
function isValidSubtotal(v: unknown): v is number {
  return typeof v === 'number' && v > 0 && v < 100_000_000;
}
function isValidCode(v: unknown): v is string {
  return typeof v === 'string' && v.trim().length >= 2 && v.trim().length <= 30;
}

export async function POST(req: NextRequest) {
  // W1: 8 coupon checks per minute per IP (prevents brute-force enumeration)
  const ip = getIP(req);
  const rl = rateLimit(ip, 'coupons', 8, 60_000);
  if (!rl.ok) return rateLimitResponse(rl);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { code, subtotal, cart, paymentMethod } = body;

  // W5: validate inputs
  if (!isValidCode(code)) return NextResponse.json({ error: 'Código de cupón inválido' }, { status: 400 });
  if (!isValidSubtotal(subtotal)) return NextResponse.json({ error: 'Subtotal inválido' }, { status: 400 });
  if (paymentMethod !== undefined && !['card', 'cash', 'nequi', 'pse', 'bancolombia'].includes(String(paymentMethod))) {
    return NextResponse.json({ error: 'Método de pago inválido' }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', (code as string).toUpperCase().trim())
    .eq('active', true)
    .single();

  if (!coupon) return NextResponse.json({ error: 'Cupón no válido o expirado' }, { status: 404 });
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
    return NextResponse.json({ error: 'Cupón expirado' }, { status: 400 });
  if (coupon.uses_limit && coupon.uses_count >= coupon.uses_limit)
    return NextResponse.json({ error: 'Cupón agotado' }, { status: 400 });
  if (coupon.min_order && (subtotal as number) < coupon.min_order)
    return NextResponse.json({ error: `Mínimo de compra: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(coupon.min_order)}` }, { status: 400 });

  if (coupon.kit_only) {
    const hasKit = Array.isArray(cart) && cart.some((i: { category?: string }) => i.category === 'Kits');
    if (!hasKit) return NextResponse.json({ error: 'Este cupón aplica solo para Kits' }, { status: 400 });
  }
  if (coupon.online_only && paymentMethod === 'cash')
    return NextResponse.json({ error: 'Este cupón no aplica para pago contra entrega' }, { status: 400 });

  const discount = coupon.discount_type === 'percent'
    ? Math.round((subtotal as number) * (coupon.discount_value / 100))
    : coupon.discount_value;

  return NextResponse.json({
    ok: true,
    code: coupon.code,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    discount,
    description: coupon.description,
  });
}
