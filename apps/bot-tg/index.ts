// apps/bot-tg/index.ts
import { Telegraf, session, Markup, Context } from 'telegraf'
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.join(__dirname, '../../.env.local') })

const prisma = new PrismaClient()
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!)
const ADMIN_IDS = process.env.TELEGRAM_ADMIN_IDS?.split(',').map(Number) || []
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kamilshop.my.id'

bot.use(session())

// ─── Helper ─────────────────────────────────────────────────

function isAdmin(ctx: Context): boolean {
  return ADMIN_IDS.includes(ctx.from?.id || 0)
}

function formatRupiah(n: number): string {
  return `Rp ${n.toLocaleString('id-ID')}`
}

// ─── /start ─────────────────────────────────────────────────

bot.start(async (ctx) => {
  const nama = ctx.from?.first_name || 'Kamu'
  await ctx.reply(
    `Halo ${nama}! 👋\n\n` +
    `Selamat datang di *KamilShop Bot* 🛍️\n\n` +
    `*Perintah tersedia:*\n` +
    `/katalog — Lihat semua produk\n` +
    `/pesanan [invoice] — Cek status pesanan\n` +
    `/cari [nama] — Cari produk\n` +
    (isAdmin(ctx) ? `/admin — Panel admin\n` : '') +
    `\n_Powered by KamilShop_`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url('🛍️ Buka Website', APP_URL)],
        [Markup.button.url('📦 Lihat Katalog', `${APP_URL}`)],
      ]),
    }
  )
})

// ─── /katalog ────────────────────────────────────────────────

bot.command('katalog', async (ctx) => {
  await ctx.reply('⏳ Mengambil katalog...')

  const produk = await prisma.produk.findMany({
    where: { aktif: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
  })

  if (!produk.length) {
    return ctx.reply('😔 Belum ada produk tersedia.')
  }

  await ctx.reply(`*📦 Katalog KamilShop* (${produk.length} produk)\n`, { parse_mode: 'Markdown' })

  for (const p of produk) {
    const stokText = p.stok !== null ? `${p.stok} pcs` : 'Unlimited'
    const caption =
      `*${p.nama}*\n\n` +
      `💰 Harga: *${formatRupiah(p.harga)}*\n` +
      `📦 Stok: ${stokText}\n` +
      (p.kategori ? `🏷️ Kategori: ${p.kategori}\n` : '') +
      `\n${p.deskripsi.substring(0, 120)}...`

    try {
      await ctx.replyWithPhoto(
        { url: p.gambar[0] || 'https://via.placeholder.com/400x400?text=KamilShop' },
        {
          caption,
          parse_mode: 'Markdown',
          ...Markup.inlineKeyboard([[
            Markup.button.url('🛒 Beli Sekarang', `${APP_URL}/produk/${p.slug}`),
          ]]),
        }
      )
    } catch {
      await ctx.reply(caption, {
        parse_mode: 'Markdown',
        ...Markup.inlineKeyboard([[
          Markup.button.url('🛒 Beli Sekarang', `${APP_URL}/produk/${p.slug}`),
        ]]),
      })
    }

    // Delay agar tidak flood
    await new Promise((r) => setTimeout(r, 300))
  }
})

// ─── /cari ───────────────────────────────────────────────────

bot.command('cari', async (ctx) => {
  const args = (ctx.message as any)?.text?.split(' ').slice(1).join(' ')
  if (!args) return ctx.reply('Format: /cari [nama produk]\nContoh: /cari kaos')

  const produk = await prisma.produk.findMany({
    where: { aktif: true, nama: { contains: args, mode: 'insensitive' } },
    take: 5,
  })

  if (!produk.length) {
    return ctx.reply(`❌ Produk "${args}" tidak ditemukan.`)
  }

  const text =
    `🔍 *Hasil pencarian "${args}":*\n\n` +
    produk.map((p, i) =>
      `${i + 1}. *${p.nama}*\n   💰 ${formatRupiah(p.harga)} | 📦 ${p.stok ?? '∞'} pcs\n   🔗 ${APP_URL}/produk/${p.slug}`
    ).join('\n\n')

  await ctx.reply(text, { parse_mode: 'Markdown' })
})

// ─── /pesanan ────────────────────────────────────────────────

bot.command('pesanan', async (ctx) => {
  const args = (ctx.message as any)?.text?.split(' ')
  const invoiceId = args?.[1]

  if (!invoiceId) {
    return ctx.reply(
      '📋 Format: /pesanan [invoice]\n' +
      'Contoh: /pesanan cld1234abcd'
    )
  }

  const order = await prisma.order.findUnique({
    where: { invoiceId },
    include: { items: { include: { produk: true } } },
  })

  if (!order) {
    return ctx.reply(`❌ Pesanan dengan invoice \`${invoiceId}\` tidak ditemukan.`, { parse_mode: 'Markdown' })
  }

  const statusEmoji: Record<string, string> = {
    PENDING: '⏳ Menunggu Pembayaran',
    PAID: '✅ Sudah Dibayar',
    PROCESSING: '🔄 Sedang Diproses',
    SHIPPED: '🚚 Sedang Dikirim',
    DONE: '🎉 Selesai',
    CANCELLED: '❌ Dibatalkan',
  }

  const itemList = order.items
    .map((i) => `  • ${i.produk.nama} x${i.qty} = ${formatRupiah(i.subtotal)}`)
    .join('\n')

  await ctx.reply(
    `📦 *Detail Pesanan*\n\n` +
    `Invoice: \`${order.invoiceId}\`\n` +
    `Status: *${statusEmoji[order.status]}*\n` +
    `Nama: ${order.namaLengkap}\n` +
    `Metode: ${order.metodePembayaran?.toUpperCase() || '-'}\n` +
    `Total: *${formatRupiah(order.totalHarga)}*\n` +
    (order.paidAt ? `Dibayar: ${new Date(order.paidAt).toLocaleString('id-ID')}\n` : '') +
    `\n🛍️ *Item Pesanan:*\n${itemList}\n\n` +
    `🔗 ${APP_URL}/pesanan/${order.invoiceId}`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([[
        Markup.button.url('📋 Lihat Detail', `${APP_URL}/pesanan/${order.invoiceId}`),
      ]]),
    }
  )
})

// ─── /admin ──────────────────────────────────────────────────

bot.command('admin', async (ctx) => {
  if (!isAdmin(ctx)) {
    return ctx.reply('⛔ Akses ditolak. Anda bukan admin.')
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [totalProduk, totalOrder, orderPending, orderPaid, totalUser, pendapatan] = await Promise.all([
    prisma.produk.count({ where: { aktif: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DONE'] } } }),
    prisma.user.count(),
    prisma.order.aggregate({
      where: { status: { in: ['PAID', 'PROCESSING', 'SHIPPED', 'DONE'] }, paidAt: { gte: today } },
      _sum: { totalHarga: true },
    }),
  ])

  const pendapatanHariIni = pendapatan._sum.totalHarga || 0

  await ctx.reply(
    `📊 *Dashboard Admin KamilShop*\n` +
    `${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n` +
    `👤 Total User: *${totalUser}*\n` +
    `📦 Produk Aktif: *${totalProduk}*\n` +
    `🛒 Total Order: *${totalOrder}*\n` +
    `⏳ Pending: *${orderPending}*\n` +
    `✅ Dibayar: *${orderPaid}*\n\n` +
    `💰 Pendapatan Hari Ini:\n*${formatRupiah(pendapatanHariIni)}*`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url('📋 Kelola Pesanan', `${APP_URL}/admin/pesanan`)],
        [Markup.button.url('📦 Kelola Produk', `${APP_URL}/admin/produk`)],
        [Markup.button.url('🖥️ Buka Admin Panel', `${APP_URL}/admin`)],
      ]),
    }
  )
})

// ─── /produk (admin) ─────────────────────────────────────────

bot.command('produk', async (ctx) => {
  if (!isAdmin(ctx)) return ctx.reply('⛔ Akses ditolak.')

  const produk = await prisma.produk.findMany({
    where: { aktif: true },
    take: 10,
    orderBy: { createdAt: 'desc' },
  })

  const text =
    `📦 *Daftar Produk (${produk.length})*\n\n` +
    produk.map((p, i) =>
      `${i + 1}. ${p.nama}\n` +
      `   💰 ${formatRupiah(p.harga)} | 📦 ${p.stok !== null ? p.stok : '∞'} pcs`
    ).join('\n\n') +
    `\n\n_Kelola produk di admin panel_`

  await ctx.reply(text, {
    parse_mode: 'Markdown',
    ...Markup.inlineKeyboard([[
      Markup.button.url('➕ Tambah Produk', `${APP_URL}/admin/produk/tambah`),
    ]]),
  })
})

// ─── Inline Query — cari produk ──────────────────────────────

bot.on('inline_query', async (ctx) => {
  const query = ctx.inlineQuery.query
  const produk = await prisma.produk.findMany({
    where: {
      aktif: true,
      ...(query && { nama: { contains: query, mode: 'insensitive' } }),
    },
    take: 10,
  })

  const results = produk.map((p) => ({
    type: 'article' as const,
    id: p.id,
    title: p.nama,
    description: `${formatRupiah(p.harga)} | Stok: ${p.stok ?? 'Unlimited'}`,
    thumb_url: p.gambar[0] || undefined,
    input_message_content: {
      message_text:
        `*${p.nama}*\n\n` +
        `💰 Harga: ${formatRupiah(p.harga)}\n` +
        `📦 Stok: ${p.stok ?? 'Unlimited'}\n\n` +
        `🔗 ${APP_URL}/produk/${p.slug}`,
      parse_mode: 'Markdown' as const,
    },
    reply_markup: {
      inline_keyboard: [[
        { text: '🛒 Beli Sekarang', url: `${APP_URL}/produk/${p.slug}` },
      ]],
    },
  }))

  await ctx.answerInlineQuery(results, { cache_time: 30 })
})

// ─── Notifikasi ke admin (dipanggil dari webhook) ─────────────

export async function notifyAdminTelegram(order: any) {
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID
  if (!chatId) return

  const itemList = order.items
    ?.map((i: any) => `  • ${i.produk?.nama} x${i.qty} = ${formatRupiah(i.subtotal)}`)
    .join('\n') || '-'

  try {
    await bot.telegram.sendMessage(
      chatId,
      `🛍️ *Order Baru Dibayar!*\n\n` +
      `Invoice: \`${order.invoiceId}\`\n` +
      `Nama: ${order.namaLengkap}\n` +
      `WA: ${order.noWhatsapp}\n` +
      `Metode: ${order.metodePembayaran?.toUpperCase()}\n` +
      `Total: *${formatRupiah(order.totalBayar || order.totalHarga)}*\n\n` +
      `🛍️ *Item:*\n${itemList}`,
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '📋 Lihat Pesanan', url: `${APP_URL}/admin/pesanan` },
          ]],
        },
      }
    )
  } catch (err) {
    console.error('[TG_NOTIFY]', err)
  }
}

// ─── Jalankan bot ─────────────────────────────────────────────

bot.launch()
console.log('✅ Telegram Bot aktif!')
console.log(`Admin IDs: ${ADMIN_IDS.join(', ')}`)

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
