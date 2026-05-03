// apps/web/lib/otp.ts
import { sendOTPMessage } from './whatsapp'

/**
 * Generate 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

/**
 * Kirim OTP via WhatsApp Bot
 */
export async function sendOTPWhatsApp(
  noWhatsapp: string,
  kode: string,
  tipe: string
): Promise<void> {
  await sendOTPMessage(noWhatsapp, kode, tipe)
}

/**
 * Kirim OTP via Email (backup)
 */
export async function sendOTPEmail(
  email: string,
  kode: string,
  tipe: string
): Promise<void> {
  const nodemailer = await import('nodemailer')
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })

  const tipePesan: Record<string, string> = {
    LOGIN: 'masuk ke akun',
    REGISTER: 'verifikasi pendaftaran',
    FORGOT_PASSWORD: 'reset kata sandi',
  }

  await transporter.sendMail({
    from: `"KamilShop" <${process.env.SMTP_USER}>`,
    to: email,
    subject: `Kode OTP KamilShop - ${tipePesan[tipe] || tipe}`,
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:auto">
        <h2 style="color:#1d4ed8">KamilShop</h2>
        <p>Kode OTP untuk <strong>${tipePesan[tipe] || tipe}</strong>:</p>
        <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#1d4ed8;padding:16px;background:#f0f4ff;border-radius:8px;text-align:center">
          ${kode}
        </div>
        <p style="color:#6b7280;font-size:13px">Berlaku 5 menit. Jangan bagikan ke siapapun.</p>
      </div>
    `,
  })
}
