-- Migración para agregar campos de imagen y descuento a productos
-- Ejecuta este script en el SQL Editor de Supabase

-- 1. Agregar columnas a la tabla products si no existen
ALTER TABLE products
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS original_price INTEGER,
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC;

-- 2. Crear bucket de storage si no existe (nota: esto debe hacerse desde la UI o CLI)
-- Para crear el bucket, usa el dashboard de Supabase: Storage > New bucket
-- Nombre: product-images
-- Acceso: Público
-- Límite de archivo: 5MB

-- 3. Configurar políticas RLS para storage (ejecuta esto en SQL)
-- DELETE existing policies if they exist
DROP POLICY IF EXISTS "Enable public read access" ON storage.objects;
DROP POLICY IF EXISTS "Enable authenticated uploads" ON storage.objects;

-- CREATE new policies
CREATE POLICY "Enable public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Enable authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Enable delete for authenticated users"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');
