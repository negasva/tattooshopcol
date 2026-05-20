-- Migration Phase 2: Add operational cost fields to products table
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)

ALTER TABLE products ADD COLUMN IF NOT EXISTS costo_envio INTEGER DEFAULT 40000;
ALTER TABLE products ADD COLUMN IF NOT EXISTS tasa_devolucion NUMERIC DEFAULT 25;
ALTER TABLE products ADD COLUMN IF NOT EXISTS costo_devolucion INTEGER DEFAULT 36000;

COMMENT ON COLUMN products.costo_envio IS 'Costo promedio de envío por unidad en COP (solo admin)';
COMMENT ON COLUMN products.tasa_devolucion IS 'Tasa de devolución esperada en % (0-100, solo admin)';
COMMENT ON COLUMN products.costo_devolucion IS 'Costo por gestión de devolución en COP (solo admin)';
