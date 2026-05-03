// app/api/otp/send/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { generateOTP, sanitizeInput } from '@/lib/utils'
import { sendOTPEmail } from '@/lib/email'
import { checkRateLimit } from '@/lib/rate-limiter'
import { sendTelegramNotification, resetPasswordMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = sanitizeInput(body.email || '').toLowerCase()

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ success: false, error: 'Email tidak valid' }, { status: 400 })
    }

    // Rate limit: max 3 per 10 minutes per email
    const rateKey = `otp:${email}`
    const rateCheck = await checkRateLimit(rateKey, 3, 10 * 60 * 1000)
    if (!rateCheck.allowed) {
      const resetIn = Math.ceil((rateCheck.resetAt - Date.now()) / 60000)
      return NextResponse.json({
        success: false,
        error: `Terlalu banyak permintaan OTP. Coba lagi dalam ${resetIn} menit.`
      }, { status: 429 })
    }

    // Check user exists
    const usersSnap = await adminDb.collection('users').where('email', '==', email).get()
    if (usersSnap.empty) {
      return NextResponse.json({ success: false, error: 'Email tidak terdaftar' }, { status: 404 })
    }

    const userData = usersSnap.docs[0].data()
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    // Save OTP
    await adminDb.collection('otpRequests').doc(email).set({
      otp,
      expiresAt: expiresAt.toISOString(),
      used: false,
      createdAt: new Date().toISOString(),
    })

    // Send email
    await sendOTPEmail(email, otp, userData.name)

    // Notify Telegram owner
    await sendTelegramNotification(resetPasswordMessage(email))

    return NextResponse.json({ success: true, message: 'OTP berhasil dikirim ke email Anda' })
  } catch (error: any) {
    console.error('OTP send error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mengirim OTP' }, { status: 500 })
  }
}
