// apps/bot-tg/commands/admin.ts
import { Context, Markup } from 'telegraf'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kamilshop.my.id'

function formatRupiah(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

export async function adminCommand(ctx: Context) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    totalProduk, totalOrder, orderPending,
    totalUser, pendapatanHariIni, pendapatanTotal,
    orderTerbaru,
  ] = await Promise.all([
    prisma.produk.count({ where: { aktif: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.user.count(),
    prisma.order.aggregate({
      where: { status: { in: ['PAID','PROCESSING','SHIPPED','DONE'] }, paidAt: { gte: today } },
      _sum: { totalHarga: true },
    }),
    prisma.order.aggregate({
      where: { status: { in: ['PAID','PROCESSING','SHIPPED','DONE'] } },
      _sum: { totalHarga: true },
    }),
    prisma.order.findMany({
      take: 3, orderBy: { createdAt: 'desc' },
      where: { status: { in: ['PENDING','PAID'] } },
    }),
  ])

  const tglHariIni = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  let text =
    `📊 *Dashboard Admin KamilShop*\n` +
    `${tglHariIni}\n\n` +
    `👤 Total User: *${totalUser}*\n` +
    `📦 Produk Aktif: *${totalProduk}*\n` +
    `🛒 Total Order: *${totalOrder}*\n` +
    `⏳ Order Pending: *${orderPending}*\n\n` +
    `💰 *Pendapatan:*\n` +
    `  Hari ini: *${formatRupiah(pendapatanHariIni._sum.totalHarga || 0)}*\n` +
    `  Total: *${formatRupiah(pendapatanTotal._sum.totalHarga || 0)}*\n`

  if (orderTerbaru.length > 0) {
    text += `\n📋 *Order Terbaru:*\n`
    for (const o of orderTerbaru) {
      text += `  • \`${o.invoiceId.slice(0, 10)}\` — ${o.namaLengkap} — ${o.status}\n`
    }
  }

  await ctx.reply(text, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([
      [Markup.button.url('📋 Kelola Pesanan', `${APP_URL}/admin/pesanan`)],
      [Markup.button.url('📦 Kelola Produk', `${APP_URL}/admin/produk`)],
      [Markup.button.url('🖥️ Admin Panel', `${APP_URL}/admin`)],
    ]),
  })
}
