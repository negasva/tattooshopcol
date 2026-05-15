-- Agregar campos de calculadora a la tabla products
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS nivel_recomendado TEXT CHECK (nivel_recomendado IN ('principiante', 'intermedio', 'profesional')),
  ADD COLUMN IF NOT EXISTS tipo_uso TEXT CHECK (tipo_uso IN ('liner', 'shader', 'ambos', 'colorear')),
  ADD COLUMN IF NOT EXISTS complejidad_uso INTEGER CHECK (complejidad_uso BETWEEN 1 AND 5);
