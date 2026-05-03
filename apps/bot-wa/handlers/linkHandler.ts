// apps/bot-wa/handlers/linkHandler.ts
import { WASocket } from '@whiskeysockets/baileys'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://kamilshop.my.id'

export async function handleSendProductLink(
  sock: WASocket,
  jid: string,
  produk: {
    nama: string
    slug: string
    harga: number
    stok: number | null
    deskripsi: string
  }
) {
  const harga = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(produk.harga)

  await sock.sendMessage(jid, {
    text:
      `🛍️ *${produk.nama}*\n\n` +
      `💰 Harga: *${harga}*\n` +
      `📦 Stok: ${produk.stok !== null ? `${produk.stok} pcs` : 'Unlimited'}\n\n` +
      `${produk.deskripsi?.substring(0, 200)}...\n\n` +
      `🔗 Klik untuk memesan:\n${APP_URL}/produk/${produk.slug}`,
  })
}

export async function handleSendOrderNotif(
  sock: WASocket,
  jid: string,
  order: any
) {
  const appUrl = APP_URL
  const itemList = order.items
    ?.map((i: any) => `  • ${i.produk?.nama} x${i.qty}`)
    .join('\n') || ''

  await sock.sendMessage(jid, {
    text:
      `✅ *Pembayaran Berhasil!*\n\n` +
      `Invoice: \`${order.invoiceId}\`\n` +
      `Total: *Rp ${order.totalBayar?.toLocaleString('id-ID')}*\n\n` +
      `🛍️ Item:\n${itemList}\n\n` +
      `🔗 Detail pesanan:\n${appUrl}/pesanan/${order.invoiceId}\n\n` +
      `Terima kasih berbelanja di *KamilShop*! 🎉`,
  })
}
