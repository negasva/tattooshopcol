-- Crear tabla de categorías
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT now()
);

-- Insertar categorías por defecto
INSERT INTO categories (name) VALUES
  ('Kits'),
  ('Máquinas'),
  ('Insumos')
ON CONFLICT (name) DO NOTHING;

-- Actualizar tabla de productos con nuevos campos
ALTER TABLE products ADD COLUMN IF NOT EXISTS image_url VARCHAR;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price_original INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percent INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- Crear tabla para gestionar imágenes (opcional, para Supabase Storage)
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url VARCHAR NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
