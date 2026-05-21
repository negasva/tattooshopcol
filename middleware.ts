import { NextRequest, NextResponse } from 'next/server';

// W9: allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://tattooshopcol.vercel.app',
  'http://localhost:3000',
];

// A2: admin routes that require a valid session cookie
const ADMIN_API_PATHS = ['/api/admin/'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get('origin') ?? '';

  // ── A2: block admin API calls without valid session ──────────────────────
  if (ADMIN_API_PATHS.some((p) => pathname.startsWith(p))) {
    const token = req.cookies.get('admin_session')?.value;
    const expected = process.env.ADMIN_SESSION_TOKEN;
    if (!expected || token !== expected) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  // ── W9: CORS for public API routes ───────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    // Preflight
    if (req.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 204,
        headers: corsHeaders(origin),
      });
    }

    const res = NextResponse.next();
    const cors = corsHeaders(origin);
    for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
    return res;
  }

  return NextResponse.next();
}

function corsHeaders(origin: string): Record<string, string> {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Vary': 'Origin',
  };
}

export const config = {
  matcher: ['/api/:path*'],
};
