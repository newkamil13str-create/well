// lib/auth-middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from './firebase-admin'

export async function verifyAuthToken(req: NextRequest): Promise<{
  uid: string
  role: string
  isBanned: boolean
} | null> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.split('Bearer ')[1]
  try {
    const decoded = await adminAuth.verifyIdToken(token)
    const userDoc = await adminDb.collection('users').doc(decoded.uid).get()
    if (!userDoc.exists) return null
    const userData = userDoc.data()!
    return {
      uid: decoded.uid,
      role: userData.role || 'user',
      isBanned: userData.isBanned || false,
    }
  } catch {
    return null
  }
}

export async function requireAuth(req: NextRequest) {
  const user = await verifyAuthToken(req)
  if (!user) {
    return { error: NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 }), user: null }
  }
  if (user.isBanned) {
    return { error: NextResponse.json({ success: false, error: 'Akun Anda telah dibanned' }, { status: 403 }), user: null }
  }
  return { error: null, user }
}

export async function requireAdmin(req: NextRequest) {
  const { error, user } = await requireAuth(req)
  if (error) return { error, user: null }
  if (user!.role !== 'admin') {
    return { error: NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 }), user: null }
  }
  return { error: null, user }
}
