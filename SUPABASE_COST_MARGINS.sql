-- Migration: Add cost and margin tracking to products table
-- Run this in the Supabase SQL editor (Dashboard → SQL Editor)

ALTER TABLE products ADD COLUMN IF NOT EXISTS costo INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS margen_deseado NUMERIC;

-- Optional: add a comment to document the columns
COMMENT ON COLUMN products.costo IS 'Costo de adquisición del producto en COP (solo visible en admin)';
COMMENT ON COLUMN products.margen_deseado IS 'Margen porcentual deseado (0-100). El margen real se calcula como (precio - costo) / precio * 100';
