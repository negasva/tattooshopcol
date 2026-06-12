import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/app/lib/crmOrder';

// Carritos del checkout web (abandonados, pendientes y completados)
// para mostrarlos en el panel CRM
export async function GET(req: NextRequest) {
  const token = req.cookies.get('admin_session')?.value;
  const expected = process.env.ADMIN_SESSION_TOKEN;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const supabase = getServiceClient();
    const { data, error } = await supabase
      .from('abandoned_carts')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(200);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ carts: data || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}
