// lib/email.ts
import nodemailer from 'nodemailer'

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  })
}

export async function sendOTPEmail(email: string, otp: string, name: string): Promise<void> {
  const transporter = getTransporter()
  await transporter.sendMail({
    from: `"KamilShop" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: '🔐 Kode OTP Reset Password - KamilShop',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: 'Segoe UI', sans-serif; background: #0A0A0F; color: #fff; padding: 40px 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: #111118; border: 1px solid #1E1E2E; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">KamilShop</h1>
            <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">kamilshop.my.id</p>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="margin: 0 0 10px; font-size: 20px;">Reset Password</h2>
            <p style="color: #888; margin: 0 0 30px; line-height: 1.6;">Halo <strong style="color: #fff;">${name}</strong>,<br>
            Gunakan kode OTP berikut untuk mereset password akun Anda.</p>
            <div style="background: #0A0A0F; border: 2px solid #3B82F6; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 30px;">
              <div style="font-size: 42px; font-weight: 900; letter-spacing: 12px; color: #3B82F6; font-family: monospace;">${otp}</div>
              <p style="color: #888; margin: 12px 0 0; font-size: 13px;">⏱ Berlaku 5 menit</p>
            </div>
            <p style="color: #666; font-size: 13px; margin: 0; line-height: 1.6;">Jika Anda tidak meminta reset password, abaikan email ini.<br>
            Jangan bagikan kode OTP ini kepada siapapun.</p>
          </div>
          <div style="padding: 20px 30px; border-top: 1px solid #1E1E2E; text-align: center;">
            <p style="color: #555; font-size: 12px; margin: 0;">© 2024 KamilShop · kamilshop.my.id</p>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

export async function sendOrderDeliveryEmail(
  email: string,
  name: string,
  order: {
    id: string
    productName: string
    amount: number
    deliveryContent: string
    createdAt: string
  }
): Promise<void> {
  const transporter = getTransporter()
  const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.amount)

  await transporter.sendMail({
    from: `"KamilShop" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `✅ Pesanan #${order.id.slice(0, 8).toUpperCase()} Berhasil Dikirim - KamilShop`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: 'Segoe UI', sans-serif; background: #0A0A0F; color: #fff; padding: 40px 20px;">
        <div style="max-width: 560px; margin: 0 auto; background: #111118; border: 1px solid #1E1E2E; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 800;">KamilShop</h1>
            <p style="margin: 8px 0 0; opacity: 0.8; font-size: 14px;">Pesanan Telah Dikirim! 🎉</p>
          </div>
          <div style="padding: 40px 30px;">
            <p style="color: #888; margin: 0 0 24px;">Halo <strong style="color: #fff;">${name}</strong>, pesanan Anda telah berhasil diproses!</p>
            <div style="background: #0A0A0F; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="color: #666; padding: 6px 0; font-size: 13px;">ID Order</td><td style="text-align: right; color: #fff; font-weight: 600; font-size: 13px;">#${order.id.slice(0, 8).toUpperCase()}</td></tr>
                <tr><td style="color: #666; padding: 6px 0; font-size: 13px;">Produk</td><td style="text-align: right; color: #fff; font-weight: 600; font-size: 13px;">${order.productName}</td></tr>
                <tr><td style="color: #666; padding: 6px 0; font-size: 13px;">Total</td><td style="text-align: right; color: #3B82F6; font-weight: 700; font-size: 15px;">${formattedAmount}</td></tr>
              </table>
            </div>
            <div style="background: #0A0A0F; border: 1px solid #1E1E2E; border-radius: 12px; padding: 20px; margin: 0 0 24px;">
              <h3 style="margin: 0 0 12px; color: #3B82F6; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Detail Produk / Akun</h3>
              <pre style="margin: 0; color: #fff; font-family: monospace; font-size: 14px; white-space: pre-wrap; line-height: 1.6;">${order.deliveryContent}</pre>
            </div>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL}/orders/${order.id}" 
               style="display: block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; text-align: center; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
              Lihat Detail Order
            </a>
          </div>
          <div style="padding: 20px 30px; border-top: 1px solid #1E1E2E; text-align: center;">
            <p style="color: #555; font-size: 12px; margin: 0;">© 2024 KamilShop · kamilshop.my.id<br>CS: admin@kamilshop.my.id</p>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}

export async function sendVerificationEmail(email: string, name: string, verificationLink: string): Promise<void> {
  const transporter = getTransporter()
  await transporter.sendMail({
    from: `"KamilShop" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: '✉️ Verifikasi Email Anda - KamilShop',
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family: 'Segoe UI', sans-serif; background: #0A0A0F; color: #fff; padding: 40px 20px;">
        <div style="max-width: 500px; margin: 0 auto; background: #111118; border: 1px solid #1E1E2E; border-radius: 16px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 800;">KamilShop</h1>
          </div>
          <div style="padding: 40px 30px;">
            <h2 style="margin: 0 0 16px;">Selamat Datang, ${name}! 🎉</h2>
            <p style="color: #888; margin: 0 0 30px; line-height: 1.6;">Akun Anda berhasil dibuat. Klik tombol di bawah untuk memverifikasi email Anda.</p>
            <a href="${verificationLink}" style="display: block; background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; text-align: center; padding: 14px; border-radius: 10px; text-decoration: none; font-weight: 600;">
              Verifikasi Email
            </a>
          </div>
        </div>
      </body>
      </html>
    `,
  })
}
