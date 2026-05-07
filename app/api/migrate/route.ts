import { NextResponse } from 'next/server';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json({ error: 'Missing env vars' }, { status: 500 });
  }

  const sqls = [
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price INTEGER DEFAULT 0;`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC DEFAULT 0;`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url TEXT;`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS specs TEXT DEFAULT '';`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT '';`,
    `ALTER TABLE products ADD COLUMN IF NOT EXISTS inventory INTEGER DEFAULT 0;`,
  ];

  const results = [];

  for (const sql of sqls) {
    const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'apikey': key,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql }),
    });
    results.push({ sql: sql.slice(0, 50), status: res.status });
  }

  return NextResponse.json({ done: true, results });
}
