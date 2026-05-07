#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://ifnaczaqxahrenktxcsg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbmFjemFxeGFocmVua3R4Y3NnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc4OTY5NSwiZXhwIjoyMDkyMzY1Njk1fQ.jW__WW65mbinVLpG3m8vVMMCAWAyH4x3NYIHF0Jp1cw';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupSupabase() {
  console.log('\n🚀 Iniciando configuración automática de Supabase...\n');

  try {
    // 1. Migrar tabla products
    console.log('📦 Paso 1: Verificando tabla products...');
    const migrationSQL = `
      ALTER TABLE products
      ADD COLUMN IF NOT EXISTS image_url TEXT,
      ADD COLUMN IF NOT EXISTS original_price INTEGER,
      ADD COLUMN IF NOT EXISTS discount_percentage NUMERIC;
    `;

    let needsMigration = false;
    try {
      // Verificar si ya existen las columnas
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .limit(1);

      if (!error && data && data.length > 0) {
        const product = data[0];
        const hasNewFields = 'image_url' in product && 'original_price' in product && 'discount_percentage' in product;

        if (hasNewFields) {
          console.log('  ✅ Tabla products ya tiene todas las columnas\n');
        } else {
          needsMigration = true;
          console.log('  ⚠️  Las columnas no existen. Necesitarás ejecutar SQL manualmente.\n');
        }
      }
    } catch (error) {
      console.log('  ⚠️  No se pudo verificar. Necesitarás ejecutar SQL manualmente.\n');
      needsMigration = true;
    }

    // 2. Intentar crear bucket
    console.log('📂 Paso 2: Creando bucket product-images...');

    let bucketCreated = false;
    try {
      const { error: bucketError } = await supabase.storage.createBucket('product-images', {
        public: true,
        fileSizeLimit: 5242880 // 5MB
      });

      if (!bucketError) {
        console.log('  ✅ Bucket product-images creado\n');
        bucketCreated = true;
      } else if (bucketError.message.includes('already exists')) {
        console.log('  ✅ Bucket product-images ya existe\n');
        bucketCreated = true;
      } else {
        console.log(`  ⚠️  Error: ${bucketError.message}\n`);
      }
    } catch (err) {
      console.log(`  ℹ️  Bucket podría ya existir o requiere configuración manual\n`);
    }

    // 3. Mostrar instrucciones finales
    console.log('📋 Instrucciones finales:\n');
    console.log('1️⃣  Ejecuta el SQL en tu dashboard Supabase:');
    console.log('   • Ve a: https://app.supabase.com/project/ifnaczaqxahrenktxcsg/sql/new');
    console.log('   • Copia y pega el SQL siguiente:');
    console.log('\n   ---SQL---');
    console.log(migrationSQL.trim());
    console.log('   ---FIN---\n');

    if (!bucketCreated) {
      console.log('2️⃣  Crea el bucket manualmente:');
      console.log('   • Ve a: https://app.supabase.com/project/ifnaczaqxahrenktxcsg/storage/buckets');
      console.log('   • Haz clic en "New bucket"');
      console.log('   • Nombre: product-images');
      console.log('   • Haz público ✓');
      console.log('   • Límite de 5MB por archivo\n');
    }

    console.log('3️⃣  Configura RLS (seguridad) en el SQL editor:');
    console.log('   • Haz clic en "New query"');
    console.log('   • Pega este SQL:\n');
    console.log(`   CREATE POLICY "Enable public read access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'product-images');

   CREATE POLICY "Enable authenticated uploads"
   ON storage.objects FOR INSERT
   WITH CHECK (bucket_id = 'product-images');`);
    console.log('\n');

    console.log('✨ ¡Listo! Una vez completes los pasos anteriores, el panel de admin funcionará perfectamente.\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n💡 Intenta ejecutar el SQL manualmente en tu dashboard Supabase\n');
    process.exit(1);
  }
}

setupSupabase();
