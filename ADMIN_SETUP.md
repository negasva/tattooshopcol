# Admin Panel Setup Guide

## Paso 1: Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Guarda tu `SUPABASE_URL` y `SUPABASE_ANON_KEY` (los encontrarás en Settings → API)

## Paso 2: Crear tabla de productos

En Supabase, ve a SQL Editor y corre este comando:

```sql
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR NOT NULL,
  category VARCHAR NOT NULL,
  price INTEGER NOT NULL,
  specs VARCHAR,
  tag VARCHAR,
  inventory INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Crear índice para queries más rápidas
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at);
```

## Paso 3: Configurar variables de entorno

1. Copia `.env.local.example` a `.env.local`
2. Rellena con tus valores de Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   NEXT_PUBLIC_ADMIN_PASSWORD=tu_contraseña_admin
   ```

## Paso 4: Acceder al panel admin

1. Ve a `/admin`
2. Ingresa tu contraseña admin
3. Gestiona productos:
   - **Agregar**: Completa el formulario y haz clic "Agregar"
   - **Editar**: Haz clic "Editar" en la tabla
   - **Eliminar**: Haz clic "Eliminar" (pedirá confirmación)
   - **Inventario**: Actualiza el campo de inventario directamente

## Notas de seguridad

⚠️ **IMPORTANTE**: Esta es una implementación básica de autenticación. Para producción:

- Usa Row Level Security (RLS) en Supabase
- Implementa autenticación más robusta con JWT
- Usa Supabase Auth con email/password
- Protege mejor las variables de entorno
- Agrega logs de auditoría

## Integración con la tienda

Los productos se sincronizarán automáticamente en `/` y la página puede mostrar:
- Precio actual
- Inventario disponible
- Etiquetas y especificaciones

Para actualizar la tienda con datos en tiempo real, modifica `TattooShopHome.tsx` para cargar desde Supabase en lugar de datos estáticos.
