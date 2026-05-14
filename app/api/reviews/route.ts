import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getServiceClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
}

export async function GET(req: NextRequest) {
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
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const { product_id, author, rating, comment } = await req.json();
  if (!author || !rating || !comment)
    return NextResponse.json({ error: 'Faltan campos' }, { status: 400 });
  if (rating < 1 || rating > 5)
    return NextResponse.json({ error: 'Rating inválido' }, { status: 400 });
  if (comment.length > 500)
    return NextResponse.json({ error: 'Comentario demasiado largo' }, { status: 400 });

  const supabase = getServiceClient();
  const { error } = await supabase.from('reviews').insert({
    product_id: product_id || null,
    author: author.trim().slice(0, 60),
    rating,
    comment: comment.trim(),
    approved: false, // requiere aprobación manual
  });

  if (error) return NextResponse.json({ error: 'Error al guardar' }, { status: 500 });
  return NextResponse.json({ ok: true, message: 'Reseña recibida, aparecerá en cuanto sea aprobada.' });
}
