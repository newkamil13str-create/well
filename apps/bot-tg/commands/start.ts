// apps/bot-tg/commands/start.ts
import { Context, Markup } from 'telegraf'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kamilshop.my.id'
const ADMIN_IDS = process.env.TELEGRAM_ADMIN_IDS?.split(',').map(Number) || []

export async function startCommand(ctx: Context) {
  const nama = ctx.from?.first_name || 'Kamu'
  const isAdmin = ADMIN_IDS.includes(ctx.from?.id || 0)

  await ctx.reply(
    `Halo, *${nama}!* 👋\n\n` +
    `Selamat datang di *KamilShop Bot* 🛍️\n` +
    `Toko online terpercaya di kamilshop.my.id\n\n` +
    `*📋 Perintah tersedia:*\n` +
    `/katalog — Lihat semua produk\n` +
    `/cari [nama] — Cari produk\n` +
    `/pesanan [invoice] — Cek status pesanan\n` +
    (isAdmin
      ? `\n*⚙️ Admin:*\n/admin — Dashboard\n/produk — List produk\n`
      : '') +
    `\n💡 Atau gunakan inline: \`@nama_bot [kata kunci]\``,
    {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.url('🛍️ Buka Website', APP_URL)],
        [Markup.button.url('📦 Lihat Katalog', APP_URL)],
      ]),
    }
  )
}
