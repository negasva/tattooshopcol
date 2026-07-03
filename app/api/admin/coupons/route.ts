import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Admin CRUD para cupones de descuento.
// Protegido por middleware (requiere cookie admin_session válida en /api/admin/*).
// Usa el service role key porque la tabla `coupons` tiene RLS activado.

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// ── Validación ────────────────────────────────────────────────────────────────
function normalizeCode(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const code = v.trim().toUpperCase();
  if (code.length < 2 || code.length > 30) return null;
  if (!/^[A-Z0-9_-]+$/.test(code)) return null;
  return code;
}

function toIntOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : null;
}

// Construye el payload a partir del body validado. `partial` permite updates parciales.
function buildPayload(body: Record<string, unknown>, partial: boolean): { data?: Record<string, unknown>; error?: string } {
  const data: Record<string, unknown> = {};

  if (!partial || 'code' in body) {
    const code = normalizeCode(body.code);
    if (!code) return { error: 'Código inválido (2-30 caracteres, solo letras, números, - y _)' };
    data.code = code;
  }
  if (!partial || 'discount_type' in body) {
    if (body.discount_type !== 'percent' && body.discount_type !== 'fixed') {
      return { error: 'Tipo de descuento inválido' };
    }
    data.discount_type = body.discount_type;
  }
  if (!partial || 'discount_value' in body) {
    const val = toIntOrNull(body.discount_value);
    if (val === null || val <= 0) return { error: 'Valor de descuento inválido' };
    const type = data.discount_type ?? body.discount_type;
    if (type === 'percent' && val > 100) return { error: 'El porcentaje no puede superar 100%' };
    data.discount_value = val;
  }
  if ('description' in body) {
    data.description = typeof body.description === 'string' ? body.description.trim().slice(0, 200) : null;
  }
  if ('min_order' in body) data.min_order = toIntOrNull(body.min_order);
  if ('uses_limit' in body) data.uses_limit = toIntOrNull(body.uses_limit);
  if ('expires_at' in body) {
    if (!body.expires_at) {
      data.expires_at = null;
    } else {
      const d = new Date(body.expires_at as string);
      if (isNaN(d.getTime())) return { error: 'Fecha de expiración inválida' };
      data.expires_at = d.toISOString();
    }
  }
  if ('active' in body) data.active = Boolean(body.active);
  if ('kit_only' in body) data.kit_only = Boolean(body.kit_only);
  if ('online_only' in body) data.online_only = Boolean(body.online_only);

  return { data };
}

// ── GET: listar todos los cupones ──────────────────────────────────────────────
export async function GET() {
  const { data, error } = await admin()
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ coupons: data ?? [] });
}

// ── POST: crear cupón ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const { data, error } = buildPayload(body, false);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const { data: created, error: dbErr } = await admin()
    .from('coupons')
    .insert([{ ...data, uses_count: 0, active: data!.active ?? true }])
    .select()
    .single();

  if (dbErr) {
    const msg = dbErr.code === '23505' ? 'Ya existe un cupón con ese código' : dbErr.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ coupon: created });
}

// ── PATCH: actualizar cupón ─────────────────────────────────────────────────────
export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 });
  }

  const id = body.id;
  if (typeof id !== 'string' || !id) {
    return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
  }
  delete body.id;

  const { data, error } = buildPayload(body, true);
  if (error) return NextResponse.json({ error }, { status: 400 });
  if (!data || Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Nada para actualizar' }, { status: 400 });
  }

  const { data: updated, error: dbErr } = await admin()
    .from('coupons')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (dbErr) {
    const msg = dbErr.code === '23505' ? 'Ya existe un cupón con ese código' : dbErr.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }
  return NextResponse.json({ coupon: updated });
}

// ── DELETE: eliminar cupón (?id=...) ────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requerido' }, { status: 400 });

  const { error } = await admin().from('coupons').delete().eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
