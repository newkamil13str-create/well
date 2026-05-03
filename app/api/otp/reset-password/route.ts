// app/api/otp/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = (body.email || '').toLowerCase()
    const otp = body.otp || ''
    const newPassword = body.newPassword || ''

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ success: false, error: 'Data tidak lengkap' }, { status: 400 })
    }
    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, error: 'Password minimal 6 karakter' }, { status: 400 })
    }

    // Re-verify OTP
    const otpDoc = await adminDb.collection('otpRequests').doc(email).get()
    if (!otpDoc.exists) return NextResponse.json({ success: false, error: 'OTP tidak valid' }, { status: 400 })

    const data = otpDoc.data()!
    if (data.used || new Date(data.expiresAt) < new Date() || data.otp !== otp) {
      return NextResponse.json({ success: false, error: 'OTP tidak valid atau kadaluarsa' }, { status: 400 })
    }

    // Get user from Firebase Auth
    const userRecord = await adminAuth.getUserByEmail(email)

    // Update password
    await adminAuth.updateUser(userRecord.uid, { password: newPassword })

    // Mark OTP as used
    await adminDb.collection('otpRequests').doc(email).update({ used: true })

    return NextResponse.json({ success: true, message: 'Password berhasil direset' })
  } catch (error: any) {
    console.error('Reset password error:', error)
    return NextResponse.json({ success: false, error: 'Gagal mereset password' }, { status: 500 })
  }
}
