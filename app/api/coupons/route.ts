import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: NextRequest) {
  const { code, subtotal, cart, paymentMethod } = await req.json();
  if (!code || !subtotal) return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code.toUpperCase().trim())
    .eq('active', true)
    .single();

  if (!coupon) return NextResponse.json({ error: 'Cupón no válido o expirado' }, { status: 404 });
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
    return NextResponse.json({ error: 'Cupón expirado' }, { status: 400 });
  if (coupon.uses_limit && coupon.uses_count >= coupon.uses_limit)
    return NextResponse.json({ error: 'Cupón agotado' }, { status: 400 });
  if (coupon.min_order && subtotal < coupon.min_order)
    return NextResponse.json({ error: `Mínimo de compra: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(coupon.min_order)}` }, { status: 400 });

  if (coupon.kit_only) {
    const hasKit = Array.isArray(cart) && cart.some((i: { category?: string }) => i.category === 'Kits');
    if (!hasKit) return NextResponse.json({ error: 'Este cupón aplica solo para Kits' }, { status: 400 });
  }
  if (coupon.online_only && paymentMethod === 'cash')
    return NextResponse.json({ error: 'Este cupón no aplica para pago contra entrega' }, { status: 400 });

  const discount = coupon.discount_type === 'percent'
    ? Math.round(subtotal * (coupon.discount_value / 100))
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
