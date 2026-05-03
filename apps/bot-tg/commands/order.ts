// apps/bot-tg/commands/order.ts
import { Context, Markup } from 'telegraf'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kamilshop.my.id'

const STATUS_LABEL: Record<string, string> = {
  PENDING: '⏳ Menunggu Pembayaran',
  PAID: '✅ Sudah Dibayar',
  PROCESSING: '🔄 Diproses',
  SHIPPED: '🚚 Dikirim',
  DONE: '🎉 Selesai',
  CANCELLED: '❌ Dibatalkan',
}

function formatRupiah(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

export async function orderCommand(ctx: Context, invoiceId: string) {
  const order = await prisma.order.findUnique({
    where: { invoiceId },
    include: { items: { include: { produk: true } } },
  })

  if (!order) {
    return ctx.reply(`❌ Pesanan \`${invoiceId}\` tidak ditemukan.`, { parse_mode: 'Markdown' })
  }

  const itemList = order.items
    .map((i) => `  • ${i.produk.nama} ×${i.qty} = ${formatRupiah(i.subtotal)}`)
    .join('\n')

  const text =
    `📦 *Detail Pesanan*\n\n` +
    `Invoice: \`${order.invoiceId}\`\n` +
    `Status: *${STATUS_LABEL[order.status]}*\n` +
    `Nama: ${order.namaLengkap}\n` +
    `WA: ${order.noWhatsapp}\n` +
    `Metode: ${order.metodePembayaran?.toUpperCase() || '-'}\n` +
    `Total: *${formatRupiah(order.totalHarga)}*\n` +
    (order.paidAt ? `Dibayar: ${new Date(order.paidAt).toLocaleString('id-ID')}\n` : '') +
    `\n🛍️ *Item:*\n${itemList}\n\n` +
    `Alamat: ${order.alamat}`

  await ctx.reply(text, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([[
      Markup.button.url('📋 Lihat Detail', `${APP_URL}/pesanan/${order.invoiceId}`),
    ]]),
  })
}
