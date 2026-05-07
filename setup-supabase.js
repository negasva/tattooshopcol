const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ifnaczaqxahrenktxcsg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbmFjemFxeGFocmVua3R4Y3NnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc4OTY5NSwiZXhwIjoyMDkyMzY1Njk1fQ.jW__WW65mbinVLpG3m8vVMMCAWAyH4x3NYIHF0Jp1cw';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function setupSupabase() {
  console.log('🚀 Iniciando configuración de Supabase...\n');

  try {
    // 1. Crear bucket de imágenes
    console.log('📂 Creando bucket product-images...');

    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.log('⚠️  No se pudo listar buckets, pero continuaremos...');
    }

    const bucketExists = buckets?.some(b => b.name === 'product-images');

    if (!bucketExists) {
      const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('product-images', {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });

      if (bucketError && !bucketError.message.includes('already exists')) {
        console.warn('⚠️  Error creando bucket:', bucketError.message);
      } else {
        console.log('✅ Bucket product-images creado\n');
      }
    } else {
      console.log('✅ Bucket product-images ya existe\n');
    }

    // 2. Verificar y mostrar SQL para migrar la tabla
    console.log('📦 Verificando tabla products...');
    const { data: products, error: queryError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (!queryError) {
      console.log('✅ Tabla products accesible\n');

      // Mostrar el SQL que necesita ejecutar
      console.log('📝 Ejecuta el siguiente SQL en Supabase (SQL Editor):\n');
      console.log('---');
      console.log(`ALTER TABLE products
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS original_price INTEGER,
ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC;`);
      console.log('---\n');
    }

    console.log('✨ ¡Configuración completada!\n');
    console.log('Próximos pasos:');
    console.log('1. ✅ Bucket product-images creado y público');
    console.log('2. ⏳ Ejecuta el SQL anterior en tu dashboard Supabase (SQL Editor)');
    console.log('3. ✅ Ya puedes usar el panel de admin para subir imágenes\n');
    console.log('Para ejecutar el SQL:');
    console.log('- Ve a https://app.supabase.com/project/ifnaczaqxahrenktxcsg/sql/new');
    console.log('- Pega el SQL anterior');
    console.log('- Haz clic en "Execute"\n');

  } catch (error) {
    console.error('❌ Error durante la configuración:', error.message);
    process.exit(1);
  }
}

setupSupabase();
