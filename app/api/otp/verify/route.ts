// app/api/otp/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = (body.email || '').toLowerCase()
    const otp = body.otp || ''

    if (!email || !otp) {
      return NextResponse.json({ success: false, error: 'Email dan OTP wajib diisi' }, { status: 400 })
    }

    const otpDoc = await adminDb.collection('otpRequests').doc(email).get()
    if (!otpDoc.exists) {
      return NextResponse.json({ success: false, error: 'OTP tidak ditemukan' }, { status: 400 })
    }

    const data = otpDoc.data()!
    if (data.used) return NextResponse.json({ success: false, error: 'OTP sudah digunakan' }, { status: 400 })
    if (new Date(data.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, error: 'OTP sudah kadaluarsa' }, { status: 400 })
    }
    if (data.otp !== otp) {
      return NextResponse.json({ success: false, error: 'OTP salah' }, { status: 400 })
    }

    return NextResponse.json({ success: true, message: 'OTP valid' })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
