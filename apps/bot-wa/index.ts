// apps/bot-wa/index.ts
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  proto,
} from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import pino from 'pino'
import path from 'path'

const logger = pino({ level: 'silent' })
export let waSocket: ReturnType<typeof makeWASocket> | null = null

const SESSION_DIR = path.join(process.cwd(), 'wa-session')

export async function startWhatsAppBot() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)
  const { version, isLatest } = await fetchLatestBaileysVersion()
  console.log(`[WA] Menggunakan Baileys v${version.join('.')} ${isLatest ? '(latest)' : ''}`)

  const sock = makeWASocket({
    version,
    logger,
    auth: state,
    printQRInTerminal: true,
    browser: ['KamilShop', 'Chrome', '3.0'],
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
    keepAliveIntervalMs: 10000,
  })

  waSocket = sock

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
    if (qr) {
      console.log('\n[WA] Scan QR Code di atas dengan WhatsApp Anda\n')
    }

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut
      console.log(`[WA] Koneksi terputus (${statusCode}). Reconnect: ${shouldReconnect}`)
      if (shouldReconnect) {
        setTimeout(startWhatsAppBot, 3000)
      } else {
        console.log('[WA] Logged out! Hapus folder wa-session dan jalankan ulang.')
      }
    } else if (connection === 'open') {
      console.log('[WA] ✅ WhatsApp Bot terhubung!')
    } else if (connection === 'connecting') {
      console.log('[WA] Menghubungkan...')
    }
  })

  // Handle pesan masuk (auto-reply selain OTP)
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    for (const msg of messages) {
      if (msg.key.fromMe || !msg.message) continue
      const from = msg.key.remoteJid!
      if (from.endsWith('@g.us')) continue // skip grup

      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        ''

      console.log(`[WA] Pesan dari ${from}: ${text}`)

      // Auto-reply: arahkan ke website
      await sock.sendMessage(from, {
        text:
          `Halo! Selamat datang di *KamilShop* 🛍️\n\n` +
          `Bot ini khusus untuk:\n` +
          `✅ Kirim kode OTP login/daftar\n` +
          `✅ Notifikasi pembayaran\n\n` +
          `Untuk berbelanja, kunjungi:\n` +
          `🔗 ${process.env.NEXT_PUBLIC_APP_URL || 'https://kamilshop.my.id'}\n\n` +
          `_Pesan ini dikirim otomatis oleh sistem_`,
      })
    }
  })
}

// ─── Fungsi yang dipanggil dari web ───────────────────────────

/**
 * Kirim OTP via WhatsApp
 */
export async function sendOTPMessage(
  noWhatsapp: string,
  kode: string,
  tipe: string
): Promise<void> {
  if (!waSocket) throw new Error('WhatsApp bot belum terhubung')

  const jid = noWhatsapp.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

  const tipePesan: Record<string, string> = {
    LOGIN: 'masuk ke akun',
    REGISTER: 'verifikasi pendaftaran',
    FORGOT_PASSWORD: 'reset kata sandi',
  }

  await waSocket.sendMessage(jid, {
    text:
      `*KamilShop - Kode OTP* 🔐\n\n` +
      `Kode OTP untuk *${tipePesan[tipe] || tipe}* Anda:\n\n` +
      `━━━━━━━━━━━━━\n` +
      `   *${kode}*\n` +
      `━━━━━━━━━━━━━\n\n` +
      `⏰ Berlaku *5 menit*\n` +
      `🚫 Jangan bagikan kode ini ke siapapun!\n\n` +
      `_Jika tidak merasa meminta OTP, abaikan pesan ini._`,
  })

  console.log(`[WA] OTP dikirim ke ${noWhatsapp} (${tipe})`)
}

/**
 * Notifikasi order berhasil dibayar ke pembeli
 */
export async function notifyOrderPaidWA(
  noWhatsapp: string,
  order: any
): Promise<void> {
  if (!waSocket) {
    console.error('[WA] Bot belum terhubung, skip notif order')
    return
  }

  const jid = noWhatsapp.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kamilshop.my.id'

  const itemList = order.items
    ?.map((i: any) => `  - ${i.produk?.nama} x${i.qty}`)
    .join('\n') || ''

  await waSocket.sendMessage(jid, {
    text:
      `✅ *Pembayaran Berhasil!*\n\n` +
      `Halo *${order.namaLengkap}*,\n` +
      `pembayaran Anda telah kami terima.\n\n` +
      `📋 *Detail Pesanan:*\n` +
      `Invoice: \`${order.invoiceId}\`\n` +
      `Metode: ${order.metodePembayaran?.toUpperCase()}\n` +
      `Total: *Rp ${order.totalBayar?.toLocaleString('id-ID')}*\n\n` +
      `🛍️ *Item:*\n${itemList}\n\n` +
      `🔗 Lacak pesanan:\n${appUrl}/pesanan/${order.invoiceId}\n\n` +
      `Terima kasih sudah berbelanja di *KamilShop*! 🎉`,
  })

  console.log(`[WA] Notif pembayaran dikirim ke ${noWhatsapp}`)
}

/**
 * Kirim link produk via WhatsApp
 */
export async function sendProductLink(
  noWhatsapp: string,
  produk: any
): Promise<void> {
  if (!waSocket) return

  const jid = noWhatsapp.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kamilshop.my.id'

  const harga = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(produk.harga)

  await waSocket.sendMessage(jid, {
    text:
      `🛍️ *${produk.nama}*\n\n` +
      `💰 Harga: ${harga}\n` +
      `📦 Stok: ${produk.stok !== null ? `${produk.stok} pcs` : 'Unlimited'}\n\n` +
      `${produk.deskripsi?.substring(0, 200)}...\n\n` +
      `🔗 Klik untuk memesan:\n${appUrl}/produk/${produk.slug}`,
  })
}

// Jalankan bot saat file dieksekusi langsung
startWhatsAppBot().catch(console.error)
