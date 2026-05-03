// apps/web/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateOTP, sendOTPWhatsApp } from '@/lib/otp'

export async function POST(req: NextRequest) {
  try {
    const { nama, email, password, noWhatsapp } = await req.json()

    if (!nama || !email || !password || !noWhatsapp) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 })
    }

    // Cek email sudah terdaftar
    const existingEmail = await prisma.user.findUnique({ where: { email } })
    if (existingEmail) {
      return NextResponse.json({ error: 'Email sudah terdaftar' }, { status: 400 })
    }

    // Cek nomor WA sudah terdaftar
    const existingWA = await prisma.user.findUnique({ where: { noWhatsapp } })
    if (existingWA) {
      return NextResponse.json({ error: 'Nomor WhatsApp sudah terdaftar' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    // Buat user (belum verified)
    const user = await prisma.user.create({
      data: { nama, email, password: hashedPassword, noWhatsapp },
    })

    // Kirim OTP verifikasi
    const kode = generateOTP()
    const expiredAt = new Date(Date.now() + 5 * 60 * 1000)

    await prisma.oTP.create({
      data: { userId: user.id, kode, tipe: 'REGISTER', expiredAt },
    })

    await sendOTPWhatsApp(noWhatsapp, kode, 'REGISTER')

    return NextResponse.json({ success: true, message: 'OTP dikirim ke WhatsApp' })
  } catch (error) {
    console.error('[REGISTER]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
