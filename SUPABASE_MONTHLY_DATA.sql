-- Migration Phase 3: Monthly performance and sales tracking
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)

-- Monthly Meta Ads spend and lead data (one row per month)
CREATE TABLE IF NOT EXISTS monthly_performance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mes VARCHAR(7) NOT NULL,           -- 'YYYY-MM' e.g. '2025-05'
  gasto_meta INTEGER NOT NULL DEFAULT 0,
  leads INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(mes)
);

-- Monthly units sold per product (one row per product per month)
CREATE TABLE IF NOT EXISTS monthly_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mes VARCHAR(7) NOT NULL,           -- 'YYYY-MM'
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  unidades_vendidas INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(mes, product_id)
);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE monthly_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_sales ENABLE ROW LEVEL SECURITY;

-- Allow all operations for authenticated service role (admin uses anon key with RLS bypass via service role)
-- If using anon key directly, you may need to add policies or disable RLS:
-- ALTER TABLE monthly_performance DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE monthly_sales DISABLE ROW LEVEL SECURITY;
