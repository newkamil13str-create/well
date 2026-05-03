// apps/web/app/api/otp/verify/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { noWhatsapp, kode, tipe } = await req.json()

    if (!noWhatsapp || !kode || !tipe) {
      return NextResponse.json({ error: 'Data tidak lengkap' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { noWhatsapp } })
    if (!user) {
      return NextResponse.json({ error: 'Pengguna tidak ditemukan' }, { status: 404 })
    }

    const otp = await prisma.oTP.findFirst({
      where: {
        userId: user.id,
        kode,
        tipe,
        digunakan: false,
        expiredAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!otp) {
      return NextResponse.json({ error: 'OTP tidak valid atau sudah kadaluarsa' }, { status: 400 })
    }

    await prisma.oTP.update({
      where: { id: otp.id },
      data: { digunakan: true },
    })

    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    console.error('[OTP_VERIFY]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
