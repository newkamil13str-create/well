// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'
import { generateUniqueId, sanitizeInput } from '@/lib/utils'
import { sendTelegramNotification, newUserMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const name = sanitizeInput(body.name || '')
    const email = sanitizeInput(body.email || '')
    const password = body.password || ''
    const phone = sanitizeInput(body.phone || '')

    if (!name || !email || !password || !phone) {
      return NextResponse.json({ success: false, error: 'Semua field wajib diisi' }, { status: 400 })
    }
    if (password.length < 6) {
      return NextResponse.json({ success: false, error: 'Password minimal 6 karakter' }, { status: 400 })
    }

    // Check if email already exists
    try {
      await adminAuth.getUserByEmail(email)
      return NextResponse.json({ success: false, error: 'Email sudah terdaftar' }, { status: 400 })
    } catch (e: any) {
      if (e.code !== 'auth/user-not-found') throw e
    }

    // Create Firebase Auth user
    const userRecord = await adminAuth.createUser({ email, password, displayName: name })

    // Generate unique ID
    const firstName = name.trim().split(' ')[0]
    let uniqueId = generateUniqueId(firstName)

    // Ensure uniqueness
    let attempts = 0
    while (attempts < 10) {
      const existing = await adminDb.collection('users').where('uniqueId', '==', uniqueId).get()
      if (existing.empty) break
      uniqueId = generateUniqueId(firstName)
      attempts++
    }

    // Save to Firestore
    await adminDb.collection('users').doc(userRecord.uid).set({
      uniqueId,
      name,
      email,
      phone,
      role: 'user',
      isBanned: false,
      emailVerified: false,
      createdAt: new Date().toISOString(),
    })

    // Notify Telegram
    await sendTelegramNotification(newUserMessage({ name, uniqueId, email }))

    return NextResponse.json({ success: true, data: { uid: userRecord.uid, uniqueId }, message: 'Registrasi berhasil' })
  } catch (error: any) {
    console.error('Register error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan' }, { status: 500 })
  }
}
