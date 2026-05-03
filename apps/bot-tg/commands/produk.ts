// apps/bot-tg/commands/produk.ts
import { Context, Markup } from 'telegraf'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kamilshop.my.id'

export async function produkCommand(ctx: Context) {
  const produk = await prisma.produk.findMany({
    where: { aktif: true },
    take: 10,
    orderBy: { createdAt: 'desc' },
  })

  if (!produk.length) {
    return ctx.reply('📦 Belum ada produk.')
  }

  const list = produk
    .map((p, i) =>
      `${i + 1}. *${p.nama}*\n` +
      `   💰 Rp ${p.harga.toLocaleString('id-ID')} | 📦 ${p.stok ?? '∞'} pcs`
    )
    .join('\n\n')

  await ctx.reply(
    `📦 *Daftar Produk (${produk.length})*\n\n${list}`,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url('➕ Tambah Produk', `${APP_URL}/admin/produk/tambah`)],
        [Markup.button.url('📋 Kelola Produk', `${APP_URL}/admin/produk`)],
      ]),
    }
  )
}
