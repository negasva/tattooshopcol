import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { rateLimit, getIP, rateLimitResponse } from '@/app/lib/ratelimit';

function getServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(req: NextRequest) {
  // W1: 60 reads per minute per IP
  const rl = rateLimit(getIP(req), 'reviews-get', 60, 60_000);
  if (!rl.ok) return rateLimitResponse(rl);

  const productId = req.nextUrl.searchParams.get('product_id');
  const supabase = getServiceClient();

  let query = supabase
    .from('reviews')
    .select('id, author, rating, comment, created_at, product_id')
    .eq('approved', true)
    .order('created_at', { ascending: false })
    .limit(50);

  if (productId) query = query.eq('product_id', productId);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'DB error' }, { status: 500 });

  // W2: cache reviews for 5 min
  return NextResponse.json(data, {
    headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
  });
}

export async function POST(req: NextRequest) {
  // W1: 3 reviews per hour per IP (prevents spam)
  const ip = getIP(req);
  const rl = rateLimit(ip, 'reviews-post', 3, 60 * 60_000);
  if (!rl.ok) return rateLimitResponse(rl);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { product_id, author, rating, comment } = body;

  // W5: strict validation
  if (!author || typeof author !== 'string' || author.trim().length < 2)
    return NextResponse.json({ error: 'Nombre inválido' }, { status: 400 });
  if (typeof rating !== 'number' || rating < 1 || rating > 5)
    return NextResponse.json({ error: 'Rating inválido' }, { status: 400 });
  if (!comment || typeof comment !== 'string' || comment.trim().length < 5)
    return NextResponse.json({ error: 'Comentario demasiado corto' }, { status: 400 });
  if ((comment as string).length > 500)
    return NextResponse.json({ error: 'Comentario demasiado largo' }, { status: 400 });

  const supabase = getServiceClient();
  const { error } = await supabase.from('reviews').insert({
    product_id: product_id || null,
    author: (author as string).trim().slice(0, 60),
    rating,
    comment: (comment as string).trim(),
    approved: false,
  });

  if (error) return NextResponse.json({ error: 'Error al guardar' }, { status: 500 });
  return NextResponse.json({ ok: true, message: 'Reseña recibida, aparecerá en cuanto sea aprobada.' });
}
