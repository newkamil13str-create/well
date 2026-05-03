// apps/web/lib/whatsapp.ts
// Wrapper untuk komunikasi dengan WhatsApp Bot (Baileys)
// Bot berjalan di apps/bot-wa/index.ts

/**
 * Kirim OTP via WhatsApp
 * Dipanggil dari /api/otp/send
 */
export async function sendOTPMessage(
  noWhatsapp: string,
  kode: string,
  tipe: string
): Promise<void> {
  // Import fungsi dari bot-wa jika running dalam 1 proses
  // Atau kirim HTTP request ke bot server jika terpisah
  try {
    const { sendOTPMessage: botSendOTP } = await import(
      '../../bot-wa/index'
    )
    await botSendOTP(noWhatsapp, kode, tipe)
  } catch {
    console.error('[WA] Bot belum terhubung, OTP tidak terkirim via WA')
    // Fallback: log ke console saat development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV OTP] No: ${noWhatsapp} | Kode: ${kode} | Tipe: ${tipe}`)
    }
  }
}

/**
 * Notifikasi order terbayar ke pembeli
 */
export async function notifyOrderPaidWA(
  noWhatsapp: string,
  order: any
): Promise<void> {
  try {
    const { notifyOrderPaidWA: botNotify } = await import(
      '../../bot-wa/index'
    )
    await botNotify(noWhatsapp, order)
  } catch {
    console.error('[WA] Gagal kirim notif WA:', noWhatsapp)
  }
}

/**
 * Kirim link produk via WhatsApp
 */
export async function sendProductLinkWA(
  noWhatsapp: string,
  produk: any
): Promise<void> {
  try {
    const { sendProductLink } = await import('../../bot-wa/index')
    await sendProductLink(noWhatsapp, produk)
  } catch {
    console.error('[WA] Gagal kirim link produk:', noWhatsapp)
  }
}
