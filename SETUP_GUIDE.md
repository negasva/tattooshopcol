# 🚀 Guía de Configuración Automática - Supabase

Esta guía te ayudará a configurar automáticamente todo lo necesario para que el panel de admin funcione con imágenes, categorías y precios con descuento.

## ✅ Paso 1: Ejecutar las Migraciones SQL

1. Ve a tu dashboard de Supabase: https://app.supabase.com/project/ifnaczaqxahrenktxcsg/sql/new

2. Copia y pega el siguiente SQL:

```sql
-- Agregar columnas a la tabla products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS original_price INTEGER,
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC;
```

3. Haz clic en **"Execute"** (o presiona Ctrl+Enter)

4. Si ves "SUCCESS", ¡listo el paso 1! ✅

---

## ✅ Paso 2: Crear el Bucket para Imágenes

1. Ve a Storage: https://app.supabase.com/project/ifnaczaqxahrenktxcsg/storage/buckets

2. Haz clic en el botón **"New bucket"**

3. Completa así:
   - **Bucket name**: `product-images`
   - **Public bucket**: ✅ (Marca el checkbox)
   - **File size limit**: Deja en blanco o `5242880` (5MB)

4. Haz clic en **"Create bucket"**

---

## ✅ Paso 3: Configurar Seguridad RLS

1. Ve a SQL Editor: https://app.supabase.com/project/ifnaczaqxahrenktxcsg/sql/new

2. Haz clic en **"New query"**

3. Copia y pega esto:

```sql
-- Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "Enable public read access" ON storage.objects;
DROP POLICY IF EXISTS "Enable authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON storage.objects;

-- Crear nuevas políticas
CREATE POLICY "Enable public read access"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Enable authenticated uploads"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Enable delete for authenticated users"
ON storage.objects FOR DELETE
USING (bucket_id = 'product-images');
```

4. Haz clic en **"Execute"**

---

## ✅ ¡Listo!

Una vez completes los 3 pasos anteriores, tu panel de admin estará 100% funcional con:
- ✅ Upload de imágenes a Supabase Storage
- ✅ Gestión de categorías dinámicas
- ✅ Precios con descuento
- ✅ Visibilidad de imágenes en la tabla de productos

---

## 🎯 Verificación Rápida

Para verificar que todo está configurado:

```bash
npm run dev  # Inicia tu servidor de desarrollo
# Ve a http://localhost:3000/admin
# Intenta subir una imagen
```

Si puedes subir una imagen y verla en la tabla, ¡todo funciona perfecto! 🎉

---

## ❓ ¿Problemas?

Si encuentras errores:

1. **Error al subir imagen**: Verifica que el bucket `product-images` existe y es público
2. **Columnas no encontradas**: Ejecuta el SQL del Paso 1 nuevamente
3. **Problemas de RLS**: Asegúrate de ejecutar el SQL del Paso 3 sin errores

Para cualquier otra duda, revisa tu dashboard de Supabase y los logs de error en el navegador (F12).
