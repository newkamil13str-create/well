// lib/telegram.ts
export async function sendTelegramNotification(message: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_OWNER_CHAT_ID
  if (!token || !chatId) return

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })
  } catch (error) {
    console.error('Telegram notification error:', error)
  }
}

export function newOrderMessage(order: {
  id: string
  userUniqueId: string
  userName: string
  productName: string
  amount: number
}): string {
  const amount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.amount)
  return `🛒 <b>ORDER BARU MASUK!</b>

📦 Produk: ${order.productName}
👤 User: ${order.userName} (${order.userUniqueId})
💰 Nominal: ${amount}
🆔 Order ID: <code>${order.id.slice(0,12)}</code>

⏳ Menunggu pembayaran...`
}

export function paymentSuccessMessage(order: {
  id: string
  userUniqueId: string
  userName: string
  userEmail: string
  productName: string
  amount: number
}): string {
  const amount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.amount)
  return `💰 <b>PEMBAYARAN BERHASIL!</b>

📦 Produk: ${order.productName}
👤 User: ${order.userName} (${order.userUniqueId})
📧 Email: ${order.userEmail}
💵 Nominal: ${amount}
🆔 Order ID: <code>${order.id.slice(0,12)}</code>

✅ Produk akan segera dikirim`
}

export function deliverySuccessMessage(order: {
  id: string
  userName: string
  productName: string
}): string {
  return `📬 <b>AUTO DELIVERY BERHASIL!</b>

📦 Produk: ${order.productName}
👤 User: ${order.userName}
🆔 Order ID: <code>${order.id.slice(0,12)}</code>

✅ Konten telah dikirim ke user`
}

export function newUserMessage(user: {
  name: string
  uniqueId: string
  email: string
}): string {
  return `👤 <b>USER BARU MENDAFTAR!</b>

👋 Nama: ${user.name}
🆔 ID: <code>${user.uniqueId}</code>
📧 Email: ${user.email}

Selamat bergabung di KamilShop!`
}

export function resetPasswordMessage(email: string): string {
  return `🔑 <b>REQUEST RESET PASSWORD</b>

📧 Email: ${email}
⏰ Waktu: ${new Date().toLocaleString('id-ID')}

OTP telah dikirim ke email user.`
}

export function orderCancelledMessage(order: {
  id: string
  userName: string
  productName: string
  amount: number
}): string {
  const amount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(order.amount)
  return `❌ <b>ORDER DIBATALKAN/EXPIRED</b>

📦 Produk: ${order.productName}
👤 User: ${order.userName}
💰 Nominal: ${amount}
🆔 Order ID: <code>${order.id.slice(0,12)}</code>`
}
