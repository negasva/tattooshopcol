export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { createClient } = await import('@supabase/supabase-js');

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return;

    const supabase = createClient(url, key);

    // Check if original_price column exists by trying to select it
    const { error } = await supabase
      .from('products')
      .select('original_price')
      .limit(1);

    // Column doesn't exist — create it via direct HTTP call to Supabase DB API
    if (error && error.message.includes('original_price')) {
      const migrations = [
        'ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price INTEGER DEFAULT 0',
        'ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC DEFAULT 0',
        'ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT',
      ];

      for (const sql of migrations) {
        await fetch(`${url}/rest/v1/rpc/run_sql`, {
          method: 'POST',
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sql }),
        }).catch(() => {});
      }
    }
  }
}
