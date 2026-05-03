// apps/web/app/api/otp/send/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, sendOTPWhatsApp } from '@/lib/otp'

export async function POST(req: NextRequest) {
  try {
    const { noWhatsapp, tipe } = await req.json()

    if (!noWhatsapp || !tipe) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { noWhatsapp } })
    if (!user) {
      return NextResponse.json({ error: 'Nomor WhatsApp tidak terdaftar' }, { status: 404 })
    }

    // Hapus OTP lama yang belum digunakan
    await prisma.oTP.deleteMany({
      where: { userId: user.id, tipe, digunakan: false },
    })

    const kode = generateOTP()
    const expiredAt = new Date(Date.now() + 5 * 60 * 1000) // 5 menit

    await prisma.oTP.create({
      data: { userId: user.id, kode, tipe, expiredAt },
    })

    await sendOTPWhatsApp(noWhatsapp, kode, tipe)

    return NextResponse.json({ success: true, message: 'OTP berhasil dikirim ke WhatsApp' })
  } catch (error) {
    console.error('[OTP_SEND]', error)
    return NextResponse.json({ error: 'Gagal mengirim OTP' }, { status: 500 })
  }
}
