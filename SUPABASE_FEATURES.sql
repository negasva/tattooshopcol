-- ============================================================
-- FEATURES: reviews, coupons, blog_posts
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- RESEÑAS
CREATE TABLE IF NOT EXISTS reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID REFERENCES products(id) ON DELETE SET NULL,
  author      TEXT NOT NULL,
  rating      SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT NOT NULL,
  approved    BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS reviews_product_id ON reviews (product_id);
CREATE INDEX IF NOT EXISTS reviews_approved ON reviews (approved, created_at DESC);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
-- Solo service role puede leer/escribir (todo pasa por /api/reviews)

-- CUPONES
CREATE TABLE IF NOT EXISTS coupons (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code           TEXT NOT NULL UNIQUE,
  description    TEXT,
  discount_type  TEXT NOT NULL CHECK (discount_type IN ('percent', 'fixed')),
  discount_value INTEGER NOT NULL,
  min_order      INTEGER,
  uses_limit     INTEGER,
  uses_count     INTEGER NOT NULL DEFAULT 0,
  expires_at     TIMESTAMPTZ,
  active         BOOLEAN NOT NULL DEFAULT true,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Cupón de ejemplo (10% de descuento, sin mínimo, sin expiración)
INSERT INTO coupons (code, description, discount_type, discount_value, active)
VALUES ('BIENVENIDO10', '10% de descuento en tu primera compra', 'percent', 10, true)
ON CONFLICT (code) DO NOTHING;

-- BLOG
CREATE TABLE IF NOT EXISTS blog_posts (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  excerpt      TEXT,
  content      TEXT NOT NULL,
  cover_image  TEXT,
  author       TEXT DEFAULT 'TattooShop Colombia',
  category     TEXT,
  read_time    INTEGER,
  published    BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS blog_posts_slug ON blog_posts (slug);
CREATE INDEX IF NOT EXISTS blog_posts_published ON blog_posts (published, published_at DESC);
-- RLS: lectura pública para posts publicados, escritura solo service role
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "blog_public_read" ON blog_posts FOR SELECT USING (published = true);

-- Artículo de ejemplo
INSERT INTO blog_posts (title, slug, excerpt, content, category, read_time, published, published_at)
VALUES (
  'Cómo elegir tu primera máquina de tatuaje',
  'como-elegir-primera-maquina-tatuaje',
  'Guía completa para tatuadores principiantes: diferencias entre máquinas rotativas y de bobina, cuál comprar primero y cómo cuidarla.',
  '<h2>Rotativa vs Bobina</h2>
<p>La primera gran decisión al empezar en el mundo del tatuaje es elegir entre una <strong>máquina rotativa</strong> y una <strong>máquina de bobina</strong>. Cada una tiene sus ventajas:</p>
<ul>
<li><strong>Rotativa:</strong> Silenciosa, liviana, ideal para principiantes. Menor vibración y mantenimiento.</li>
<li><strong>Bobina:</strong> Más fuerza para rellenos, preferida por muchos profesionales para trabajo en negro.</li>
</ul>
<h2>¿Qué necesitas realmente?</h2>
<p>Si estás empezando, te recomendamos un kit completo que incluya máquina, agujas y tinta. Así puedes practicar sin preocuparte por compatibilidades.</p>
<h2>Mantenimiento básico</h2>
<p>Limpia tu máquina después de cada sesión con alcohol isopropílico. Revisa las barras y resortes cada mes. Una máquina bien mantenida dura años.</p>',
  'Guías', 5, true, NOW()
) ON CONFLICT (slug) DO NOTHING;

-- Agregar columnas de restricción a coupons
ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS kit_only BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS online_only BOOLEAN DEFAULT false;

-- Cupón: 10% en kits con pago online
INSERT INTO coupons (code, description, discount_type, discount_value, active, kit_only, online_only)
VALUES ('KIT10', '10% de descuento en kits — solo pago online', 'percent', 10, true, true, true)
ON CONFLICT (code) DO NOTHING;
