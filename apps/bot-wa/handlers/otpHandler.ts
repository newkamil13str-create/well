// apps/bot-wa/handlers/otpHandler.ts
import { WASocket } from '@whiskeysockets/baileys'

export async function handleOTPRequest(
  sock: WASocket,
  jid: string,
  noWhatsapp: string,
  kode: string,
  tipe: string
) {
  const tipePesan: Record<string, string> = {
    LOGIN: 'masuk ke akun',
    REGISTER: 'verifikasi pendaftaran',
    FORGOT_PASSWORD: 'reset kata sandi',
  }

  await sock.sendMessage(jid, {
    text:
      `*KamilShop - Kode OTP* 🔐\n\n` +
      `Kode OTP untuk *${tipePesan[tipe] || tipe}*:\n\n` +
      `━━━━━━━━━━━━━\n` +
      `   *${kode}*\n` +
      `━━━━━━━━━━━━━\n\n` +
      `⏰ Berlaku *5 menit*\n` +
      `🚫 Jangan bagikan ke siapapun!\n\n` +
      `_KamilShop.my.id_`,
  })
}
