// lib/rate-limiter.ts
import { adminDb } from './firebase-admin'

interface RateLimitEntry {
  count: number
  resetAt: number
}

export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const now = Date.now()
  const docRef = adminDb.collection('rateLimits').doc(key.replace(/[^a-zA-Z0-9]/g, '_'))

  const doc = await docRef.get()
  const data = doc.data() as RateLimitEntry | undefined

  if (!data || now > data.resetAt) {
    // New window
    const resetAt = now + windowMs
    await docRef.set({ count: 1, resetAt })
    return { allowed: true, remaining: maxRequests - 1, resetAt }
  }

  if (data.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: data.resetAt }
  }

  await docRef.update({ count: data.count + 1 })
  return { allowed: true, remaining: maxRequests - data.count - 1, resetAt: data.resetAt }
}
