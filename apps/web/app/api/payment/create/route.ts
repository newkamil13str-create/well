// apps/web/app/api/payment/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 })

    const { orderId, metode } = await req.json()

    if (!orderId || !metode) {
      return NextResponse.json({ error: 'orderId dan metode wajib diisi' }, { status: 400 })
    }

    const validMetode = ['qris', 'transfer']
    if (!validMetode.includes(metode)) {
      return NextResponse.json({ error: 'Metode pembayaran tidak valid' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { produk: true } }, user: true },
    })

    if (!order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })

    // Hit Pakasir API
    const pakasirRes = await fetch(
      `https://app.pakasir.com/api/transactioncreate/${metode}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project: process.env.PAKASIR_PROJECT,
          order_id: order.invoiceId,
          amount: order.totalHarga,
          api_key: process.env.PAKASIR_API_KEY,
        }),
      }
    )

    if (!pakasirRes.ok) {
      const errText = await pakasirRes.text()
      console.error('[PAKASIR]', errText)
      return NextResponse.json({ error: 'Gagal membuat pembayaran di Pakasir' }, { status: 502 })
    }

    const pakasirData = await pakasirRes.json()
    const payment = pakasirData.payment || pakasirData

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        metodePembayaran: metode,
        totalBayar: payment.total_payment || order.totalHarga,
        feePayment: payment.fee || 0,
        paymentData: payment,
        expiredAt: payment.expired_at ? new Date(payment.expired_at) : null,
        status: 'PENDING',
      },
    })

    return NextResponse.json({ success: true, payment, order: updatedOrder })
  } catch (error) {
    console.error('[PAYMENT_CREATE]', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
