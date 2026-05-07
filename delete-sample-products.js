const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ifnaczaqxahrenktxcsg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlmbmFjemFxeGFocmVua3R4Y3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3ODk2OTUsImV4cCI6MjA5MjM2NTY5NX0.2C63fmqD3130hxxCKl_oCsnUOlbajch5kNcAA48eOgA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function deleteProducts() {
  try {
    // Obtener todos los productos
    const { data: products, error: listError } = await supabase
      .from('products')
      .select('id, name');

    if (listError) throw listError;

    console.log(`\n📋 Encontrados ${products?.length || 0} productos:`);
    products?.forEach(p => console.log(`  - ${p.name} (${p.id})`));

    // Eliminar todos
    if (products && products.length > 0) {
      const { error: deleteError } = await supabase
        .from('products')
        .delete()
        .gte('id', '0'); // Esto elimina todo

      if (deleteError) throw deleteError;
      console.log('\n✅ Todos los productos han sido eliminados correctamente\n');
    } else {
      console.log('\n✅ No hay productos para eliminar\n');
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteProducts();
