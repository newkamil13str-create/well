// apps/web/app/api/payment/callback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { notifyOrderPaidWA } from '@/lib/whatsapp'

// Kirim notif ke Telegram admin
async function notifyAdminTelegram(order: any) {
  try {
    const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID
    const token = process.env.TELEGRAM_BOT_TOKEN
    if (!chatId || !token) return

    const itemList = order.items
      ?.map((i: any) => `- ${i.produk?.nama} x${i.qty} = Rp ${i.subtotal.toLocaleString('id-ID')}`)
      .join('\n') || '-'

    const text =
      `🛍️ *Order Baru Dibayar!*\n\n` +
      `Invoice: \`${order.invoiceId}\`\n` +
      `Nama: ${order.namaLengkap}\n` +
      `WA: ${order.noWhatsapp}\n` +
      `Metode: ${order.metodePembayaran?.toUpperCase()}\n` +
      `Total: Rp ${order.totalBayar?.toLocaleString('id-ID')}\n\n` +
      `*Item:*\n${itemList}`

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '📋 Lihat Admin Panel', url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/pesanan` },
          ]],
        },
      }),
    })
  } catch (err) {
    console.error('[NOTIFY_TG]', err)
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[CALLBACK] Pakasir webhook:', JSON.stringify(body))

    const { order_id, status } = body

    if (!order_id) {
      return NextResponse.json({ error: 'order_id diperlukan' }, { status: 400 })
    }

    const isPaid = status === 'PAID' || status === 'paid' || status === 'success'

    if (isPaid) {
      const order = await prisma.order.update({
        where: { invoiceId: order_id },
        data: { status: 'PAID', paidAt: new Date() },
        include: {
          user: true,
          items: { include: { produk: true } },
        },
      })

      // Kurangi stok setiap produk
      for (const item of order.items) {
        if (item.produk.stok !== null) {
          await prisma.produk.update({
            where: { id: item.produkId },
            data: { stok: { decrement: item.qty } },
          })
        }
      }

      // Notif WhatsApp ke pembeli
      if (order.user.noWhatsapp) {
        await notifyOrderPaidWA(order.user.noWhatsapp, order)
      }

      // Notif Telegram ke admin
      await notifyAdminTelegram(order)

      console.log(`[CALLBACK] Order ${order_id} berhasil PAID`)
    }

    return NextResponse.json({ received: true, status: isPaid ? 'processed' : 'ignored' })
  } catch (error) {
    console.error('[PAYMENT_CALLBACK]', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
