// In-memory sliding-window rate limiter (best-effort on serverless — use KV for strict limits)
const store = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult { ok: boolean; remaining: number; retryAfter: number }

export function rateLimit(
  ip: string,
  endpoint: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const key = `${endpoint}:${ip}`;
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfter: 0 };
  }
  if (entry.count >= limit) {
    return { ok: false, remaining: 0, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  entry.count++;
  return { ok: true, remaining: limit - entry.count, retryAfter: 0 };
}

export function getIP(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

export function rateLimitResponse(result: RateLimitResult) {
  return new Response(
    JSON.stringify({ error: `Demasiadas peticiones. Intenta en ${result.retryAfter}s.` }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(result.retryAfter),
      },
    }
  );
}

// Prune expired entries every 2 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store) if (now >= v.resetAt) store.delete(k);
  }, 120_000);
}
