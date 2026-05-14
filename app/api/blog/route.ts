import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get('slug');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  if (slug) {
    const { data } = await supabase.from('blog_posts').select('*').eq('slug', slug).eq('published', true).single();
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(data);
  }

  const { data } = await supabase
    .from('blog_posts')
    .select('id, title, slug, excerpt, cover_image, published_at, read_time')
    .eq('published', true)
    .order('published_at', { ascending: false });

  return NextResponse.json(data ?? []);
}
