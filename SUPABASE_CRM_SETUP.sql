-- ============================================================
-- CRM: tablas y columnas para ligar la web, el admin y el CRM
-- Ejecutar en el SQL Editor de Supabase (es idempotente)
-- ============================================================

-- Clientes del CRM (compartidos por pedidos web y WhatsApp)
CREATE TABLE IF NOT EXISTS crm_customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  phone VARCHAR,
  email VARCHAR,
  city VARCHAR,
  created_at TIMESTAMP DEFAULT now()
);

-- Pedidos del CRM
CREATE TABLE IF NOT EXISTS crm_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES crm_customers(id),
  source VARCHAR NOT NULL DEFAULT 'WHATSAPP',
  payment_method VARCHAR,
  status VARCHAR NOT NULL DEFAULT 'PENDING',
  tracking_number VARCHAR,
  total_amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- Items de cada pedido (liga pedidos con la tabla products de la tienda)
CREATE TABLE IF NOT EXISTS crm_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES crm_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_purchase NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- Referencia de pago Wompi: permite ligar el pedido CRM con la transacción
-- de la web y evita pedidos duplicados (webhook + página de éxito)
ALTER TABLE crm_orders ADD COLUMN IF NOT EXISTS reference VARCHAR;
CREATE UNIQUE INDEX IF NOT EXISTS idx_crm_orders_reference
  ON crm_orders(reference) WHERE reference IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_crm_orders_customer ON crm_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_crm_order_items_order ON crm_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_crm_order_items_product ON crm_order_items(product_id);

-- Datos del cliente capturados en el checkout (para contraentrega/transferencia)
ALTER TABLE abandoned_carts ADD COLUMN IF NOT EXISTS customer_name VARCHAR;
ALTER TABLE abandoned_carts ADD COLUMN IF NOT EXISTS customer_phone VARCHAR;

-- RLS: lectura pública (el panel CRM usa la anon key para leer),
-- escritura solo con service role (las APIs del servidor)
ALTER TABLE crm_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_order_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "crm_customers_read" ON crm_customers;
CREATE POLICY "crm_customers_read" ON crm_customers FOR SELECT USING (true);

DROP POLICY IF EXISTS "crm_orders_read" ON crm_orders;
CREATE POLICY "crm_orders_read" ON crm_orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "crm_order_items_read" ON crm_order_items;
CREATE POLICY "crm_order_items_read" ON crm_order_items FOR SELECT USING (true);
