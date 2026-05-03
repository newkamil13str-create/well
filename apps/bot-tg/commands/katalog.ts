// apps/bot-tg/commands/katalog.ts
import { Context, Markup } from 'telegraf'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kamilshop.my.id'

export async function katalogCommand(ctx: Context) {
  const produk = await prisma.produk.findMany({
    where: { aktif: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
  })

  if (!produk.length) return ctx.reply('😔 Belum ada produk tersedia.')

  await ctx.reply(
    `*📦 Katalog KamilShop*\n${produk.length} produk tersedia\n\nKunjungi website untuk memesan:`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([[
        Markup.button.url('🛍️ Buka Website', APP_URL),
      ]]),
    }
  )

  for (const p of produk) {
    const stokText = p.stok !== null ? `${p.stok} pcs` : '∞ Unlimited'
    const harga = `Rp ${p.harga.toLocaleString('id-ID')}`
    const caption =
      `*${p.nama}*\n\n` +
      `💰 ${harga}\n` +
      `📦 Stok: ${stokText}\n` +
      (p.kategori ? `🏷️ ${p.kategori}\n` : '') +
      `\n${p.deskripsi.substring(0, 100)}...`

    try {
      await ctx.replyWithPhoto(
        { url: p.gambar[0] },
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

    await new Promise((r) => setTimeout(r, 400))
  }
}
