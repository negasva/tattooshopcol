-- Add unidades_devueltas column to monthly_sales
ALTER TABLE monthly_sales ADD COLUMN IF NOT EXISTS unidades_devueltas integer NOT NULL DEFAULT 0;
