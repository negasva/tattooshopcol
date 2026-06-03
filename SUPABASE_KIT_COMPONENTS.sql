-- Migration Phase 4: Kit component breakdown table
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)

CREATE TABLE IF NOT EXISTS kit_components (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kit_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  source_product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  nombre VARCHAR NOT NULL,
  cantidad NUMERIC NOT NULL DEFAULT 1,
  costo_unitario INTEGER NOT NULL DEFAULT 0,
  tipo VARCHAR NOT NULL DEFAULT 'insumo',  -- 'máquina', 'insumo', 'accesorio', 'otro'
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kit_components_kit ON kit_components(kit_product_id);

-- Disable RLS for admin access (same pattern as other tables)
-- If you have RLS enabled on products, you may need to add a policy here.
-- ALTER TABLE kit_components DISABLE ROW LEVEL SECURITY;
