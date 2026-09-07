/** Rate limit sederhana in-memory (cukup untuk single-instance / MVP). */

type Bucket = {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | { allowed: false; retryAfterSec: number }

/**
 * Sliding fixed-window: max `limit` request per `windowMs` untuk `key`.
 */
export function checkRateLimit(
  key: string,
  limit = 20,
  windowMs = 60_000,
): RateLimitResult {
  const now = Date.now()
  const current = buckets.get(key)

  if (!current || now >= current.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1 }
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    }
  }

  current.count += 1
  return { allowed: true, remaining: limit - current.count }
}

export function clientKeyFromRequest(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  const realIp = request.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp
  return 'anonymous'
}
