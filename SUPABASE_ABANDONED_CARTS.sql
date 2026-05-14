-- Tabla para carritos abandonados y recordatorios de pago
CREATE TABLE IF NOT EXISTS abandoned_carts (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email            TEXT NOT NULL,
  reference        TEXT NOT NULL UNIQUE,
  cart             JSONB NOT NULL,
  total            INTEGER NOT NULL,
  city             TEXT,
  method           TEXT,
  status           TEXT NOT NULL DEFAULT 'pending',
  -- pending | completed | reminded | error_reminded
  reminder_sent_at TIMESTAMPTZ,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS abandoned_carts_status_created ON abandoned_carts (status, created_at);
CREATE INDEX IF NOT EXISTS abandoned_carts_reference ON abandoned_carts (reference);

-- RLS: solo el service role puede leer/actualizar (cron, webhook)
-- El cliente inserta via API route, nunca directamente
ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;
