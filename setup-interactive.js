#!/usr/bin/env node

const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.clear();
  console.log('\n╔════════════════════════════════════════════════════╗');
  console.log('║  🚀 Configuración Automática - Tattoo Shop Admin  ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  console.log('Este script te guiará por los pasos necesarios para');
  console.log('configurar tu base de datos de Supabase.\n');

  console.log('Los siguientes pasos deben ejecutarse en tu dashboard:\n');

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // Paso 1
  console.log('📋 PASO 1: Migración de Base de Datos');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('1. Ve a: https://app.supabase.com/project/ifnaczaqxahrenktxcsg/sql/new\n');
  console.log('2. Copia este SQL y ejecútalo:\n');
  console.log('┌─────────────────────────────────────────────────┐');
  console.log('│ ALTER TABLE products                            │');
  console.log('│ ADD COLUMN IF NOT EXISTS image_url TEXT,        │');
  console.log('│ ADD COLUMN IF NOT EXISTS original_price INTEGER,│');
  console.log('│ ADD COLUMN IF NOT EXISTS discount_percentage    │');
  console.log('│ NUMERIC;                                        │');
  console.log('└─────────────────────────────────────────────────┘\n');

  const step1Done = await question('¿Ya ejecutaste el SQL del Paso 1? (s/n): ');

  if (step1Done.toLowerCase() !== 's') {
    console.log('\n⚠️  Por favor ejecuta el SQL primero.\n');
    rl.close();
    return;
  }

  console.log('✅ Paso 1 completado!\n');

  // Paso 2
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📁 PASO 2: Crear Bucket de Imágenes');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('1. Ve a: https://app.supabase.com/project/ifnaczaqxahrenktxcsg/storage/buckets\n');
  console.log('2. Haz clic en "New bucket"\n');
  console.log('3. Completa los campos así:');
  console.log('   • Bucket name: product-images');
  console.log('   • Public bucket: ✅ (marca el checkbox)');
  console.log('   • File size limit: (deja en blanco)\n');

  console.log('4. Haz clic en "Create bucket"\n');

  const step2Done = await question('¿Ya creaste el bucket? (s/n): ');

  if (step2Done.toLowerCase() !== 's') {
    console.log('\n⚠️  Por favor crea el bucket primero.\n');
    rl.close();
    return;
  }

  console.log('✅ Paso 2 completado!\n');

  // Paso 3
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🔐 PASO 3: Configurar Seguridad RLS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log('1. Ve a: https://app.supabase.com/project/ifnaczaqxahrenktxcsg/sql/new\n');
  console.log('2. Haz clic en "New query"\n');
  console.log('3. Copia y pega este SQL:\n');
  console.log('┌─────────────────────────────────────────────────┐');
  console.log('│ DROP POLICY IF EXISTS "Enable public read      │');
  console.log('│ access" ON storage.objects;                     │');
  console.log('│ DROP POLICY IF EXISTS "Enable authenticated    │');
  console.log('│ uploads" ON storage.objects;                    │');
  console.log('│ DROP POLICY IF EXISTS "Enable delete for auth  │');
  console.log('│ users" ON storage.objects;                      │');
  console.log('│                                                 │');
  console.log('│ CREATE POLICY "Enable public read access"       │');
  console.log('│ ON storage.objects FOR SELECT                   │');
  console.log('│ USING (bucket_id = \'product-images\');         │');
  console.log('│                                                 │');
  console.log('│ CREATE POLICY "Enable authenticated uploads"    │');
  console.log('│ ON storage.objects FOR INSERT                   │');
  console.log('│ WITH CHECK (bucket_id = \'product-images\');    │');
  console.log('│                                                 │');
  console.log('│ CREATE POLICY "Enable delete for authenticated" │');
  console.log('│ ON storage.objects FOR DELETE                   │');
  console.log('│ USING (bucket_id = \'product-images\');         │');
  console.log('└─────────────────────────────────────────────────┘\n');

  console.log('4. Haz clic en "Execute"\n');

  const step3Done = await question('¿Ya ejecutaste el SQL del Paso 3? (s/n): ');

  if (step3Done.toLowerCase() !== 's') {
    console.log('\n⚠️  Por favor ejecuta el SQL primero.\n');
    rl.close();
    return;
  }

  console.log('✅ Paso 3 completado!\n');

  // Finalización
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('✨ ¡Configuración completada exitosamente!\n');
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║  🎉 Tu panel de admin está listo para usar        ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  console.log('Puedes ahora:');
  console.log('✅ Subir imágenes desde el panel de admin');
  console.log('✅ Crear nuevas categorías dinámicamente');
  console.log('✅ Establecer precios con descuentos\n');

  console.log('Para probar, ejecuta:');
  console.log('  npm run dev\n');
  console.log('Luego ve a: http://localhost:3000/admin\n');

  rl.close();
}

main();
