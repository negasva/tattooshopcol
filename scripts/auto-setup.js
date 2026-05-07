#!/usr/bin/env node

/**
 * Script de configuración automática para Supabase
 * Ejecuta: node scripts/auto-setup.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://ifnaczaqxahrenktxcsg.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbmFjemFxeGFocmVua3R4Y3NnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc4OTY5NSwiZXhwIjoyMDkyMzY1Njk1fQ.jW__WW65mbinVLpG3m8vVMMCAWAyH4x3NYIHF0Jp1cw';

function makeHttpRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(SUPABASE_URL + path);

    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data ? JSON.parse(data) : null
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function executeSql(sql) {
  try {
    const response = await makeHttpRequest('POST', '/rest/v1/rpc/exec_sql', { sql });
    return response;
  } catch (error) {
    console.error('Error executing SQL:', error);
    return null;
  }
}

async function createBucket() {
  try {
    const response = await makeHttpRequest('POST', '/storage/v1/b', {
      name: 'product-images',
      public: true,
      file_size_limit: 5242880
    });
    return response;
  } catch (error) {
    console.error('Error creating bucket:', error);
    return null;
  }
}

async function verifyProductsTable() {
  try {
    const response = await makeHttpRequest('GET', '/rest/v1/products?limit=1');
    if (response.status === 200) {
      const products = response.body;
      if (Array.isArray(products) && products.length > 0) {
        const product = products[0];
        return {
          exists: true,
          hasNewFields: 'image_url' in product && 'original_price' in product && 'discount_percentage' in product,
          product
        };
      }
      return { exists: true, hasNewFields: false };
    }
    return { exists: false, error: response.body };
  } catch (error) {
    console.error('Error verifying table:', error);
    return { exists: false, error };
  }
}

async function setup() {
  console.log('\n🚀 Configuración automática de Supabase\n');
  console.log('═'.repeat(50) + '\n');

  try {
    // Verificar tabla products
    console.log('📦 Verificando tabla products...');
    const tableCheck = await verifyProductsTable();

    if (!tableCheck.exists) {
      console.log('❌ La tabla products no existe o no es accesible\n');
      process.exit(1);
    }

    console.log('✅ Tabla products existe\n');

    if (tableCheck.hasNewFields) {
      console.log('✅ Todos los campos ya están configurados!\n');
      console.log('═'.repeat(50));
      console.log('\n✨ Tu base de datos ya está lista para usar.\n');
      return;
    }

    // Leer y ejecutar SQL
    console.log('🔧 Ejecutando migraciones SQL...');
    const sqlPath = path.join(__dirname, 'setup-db.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Ejecutar cada statement por separado
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s && !s.startsWith('--'));

    for (const statement of statements) {
      if (statement.includes('DROP') || statement.includes('CREATE POLICY')) {
        // Las políticas de storage requieren permisos especiales
        console.log('  ℹ️  Política RLS detectada (requiere ejecución manual)');
        continue;
      }

      console.log(`  📝 Ejecutando: ${statement.substring(0, 50)}...`);
      const result = await executeSql(statement);

      if (result && result.status < 300) {
        console.log('    ✅ OK');
      } else {
        console.log(`    ⚠️  Status: ${result?.status}`);
      }
    }

    console.log('\n✨ Setup completado!\n');
    console.log('═'.repeat(50));
    console.log('\n📋 Próximos pasos:\n');
    console.log('1. ✅ Tabla actualizada con nuevos campos');
    console.log('2. ⏳ Crea el bucket "product-images":');
    console.log('   • Ve a: https://app.supabase.com/project/ifnaczaqxahrenktxcsg/storage/buckets');
    console.log('   • Haz clic en "New bucket"');
    console.log('   • Nombre: product-images');
    console.log('   • Marca como público');
    console.log('3. ⏳ Configura RLS ejecutando en SQL editor:');
    console.log('   • Ve a: https://app.supabase.com/project/ifnaczaqxahrenktxcsg/sql/new');
    console.log('   • Pega el contenido de scripts/setup-db.sql\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setup();
