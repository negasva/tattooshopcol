import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const results: string[] = [];

  // Add columns one by one
  const columns = [
    { name: 'original_price', type: 'INTEGER' },
    { name: 'discount_percentage', type: 'NUMERIC' },
    { name: 'image_url', type: 'TEXT' },
  ];

  for (const col of columns) {
    const { error } = await supabase.rpc('exec_sql', {
      sql: `ALTER TABLE products ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};`
    });
    if (error) {
      results.push(`⚠️ ${col.name}: ${error.message}`);
    } else {
      results.push(`✅ ${col.name} OK`);
    }
  }

  // Create storage bucket
  const { error: bucketError } = await supabase.storage.createBucket('product-images', {
    public: true,
    fileSizeLimit: 5242880,
  });
  results.push(bucketError ? `⚠️ bucket: ${bucketError.message}` : '✅ bucket OK');

  return NextResponse.json({ status: 'done', results });
}
