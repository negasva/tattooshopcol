import { NextRequest, NextResponse } from 'next/server';
import { rateLimit, getIP, rateLimitResponse } from '@/app/lib/ratelimit';

export async function POST(req: NextRequest) {
  // A5: rate limit login attempts — 5 tries per 15 minutes per IP
  const ip = getIP(req);
  const rl = rateLimit(ip, 'admin-login', 5, 15 * 60_000);
  if (!rl.ok) return rateLimitResponse(rl);

  const { password } = await req.json().catch(() => ({ password: '' }));

  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionToken = process.env.ADMIN_SESSION_TOKEN;

  if (!adminPassword || !sessionToken) {
    return NextResponse.json({ error: 'Admin no configurado' }, { status: 500 });
  }

  if (!password || password !== adminPassword) {
    return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('admin_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8, // 8 hours
    path: '/',
  });
  return res;
}
