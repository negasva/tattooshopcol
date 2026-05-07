import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import { toSlug } from '@/app/lib/utils';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    notFound();
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const { data: products, error } = await supabase
    .from('products')
    .select('*');

  if (error || !products) {
    notFound();
  }

  const product = products.find((p) => toSlug(p.name) === slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
