// bot/index.js
// Run: node bot/index.js  OR  npm run bot
require('dotenv').config({ path: '.env.local' })

const { Telegraf } = require('telegraf')
const admin = require('firebase-admin')

// Init Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  })
}

const db = admin.firestore()
const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN)
const OWNER_ID = Number(process.env.TELEGRAM_OWNER_CHAT_ID)

// Middleware: Only owner
bot.use(async (ctx, next) => {
  if (ctx.from?.id !== OWNER_ID) {
    return ctx.reply('⛔ Akses ditolak. Bot ini hanya untuk owner KamilShop.')
  }
  return next()
})

function formatIDR(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

// /start
bot.start(ctx => ctx.replyWithHTML(`
🚀 <b>KamilShop Admin Bot</b>

Selamat datang, Owner! Berikut daftar perintah:

<b>📊 Statistik</b>
/stats — Statistik lengkap
/revenue — Detail revenue
/topproducts — 5 produk terlaris

<b>📦 Order</b>
/orders — 10 order terbaru
/order [id] — Detail order
/pending — Order pending
/deliver [orderId] [content] — Manual deliver
/cancelorder [orderId] — Cancel order

<b>👥 User</b>
/users — Info user
/user [id/uniqueId] — Detail user
/banuser [userId] — Ban user
/unbanuser [userId] — Unban user

<b>🛍️ Produk</b>
/products — List produk aktif
/toggleproduct [productId] — Toggle aktif
/updatestock [productId] [jumlah] — Update stok
`))

// /stats
bot.command('stats', async ctx => {
  const [ordersSnap, usersSnap] = await Promise.all([
    db.collection('orders').get(),
    db.collection('users').get(),
  ])

  const orders = ordersSnap.docs.map(d => d.data())
  const now = new Date()
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const paidOrders = orders.filter(o => o.status === 'paid' || o.status === 'delivered')
  const revenueAll = paidOrders.reduce((s, o) => s + o.amount, 0)
  const revenueToday = paidOrders.filter(o => o.paidAt && new Date(o.paidAt) >= startToday).reduce((s, o) => s + o.amount, 0)
  const revenueMonth = paidOrders.filter(o => o.paidAt && new Date(o.paidAt) >= startMonth).reduce((s, o) => s + o.amount, 0)

  ctx.replyWithHTML(`📊 <b>STATISTIK KAMILSHOP</b>

💰 <b>Revenue</b>
├ Hari ini: <b>${formatIDR(revenueToday)}</b>
├ Bulan ini: <b>${formatIDR(revenueMonth)}</b>
└ All time: <b>${formatIDR(revenueAll)}</b>

📦 <b>Order</b>
├ Total: <b>${orders.length}</b>
├ Pending: <b>${orders.filter(o => o.status === 'pending').length}</b>
├ Paid: <b>${orders.filter(o => o.status === 'paid').length}</b>
├ Delivered: <b>${orders.filter(o => o.status === 'delivered').length}</b>
└ Cancelled: <b>${orders.filter(o => o.status === 'cancelled').length}</b>

👥 <b>User</b>
└ Total: <b>${usersSnap.size}</b>`)
})

// /orders
bot.command('orders', async ctx => {
  const snap = await db.collection('orders').orderBy('createdAt', 'desc').limit(10).get()
  if (snap.empty) return ctx.reply('Tidak ada order.')

  const lines = snap.docs.map(d => {
    const o = d.data()
    const emoji = { pending: '⏳', paid: '💰', delivered: '✅', cancelled: '❌' }[o.status] || '❓'
    return `${emoji} <code>${d.id.slice(0, 8)}</code> | ${o.productName} | ${formatIDR(o.amount)} | ${o.userName}`
  }).join('\n')

  ctx.replyWithHTML(`📦 <b>10 ORDER TERBARU</b>\n\n${lines}`)
})

// /order [id]
bot.command('order', async ctx => {
  const id = ctx.message.text.split(' ')[1]
  if (!id) return ctx.reply('Usage: /order [orderId]')

  const snap = await db.collection('orders').doc(id).get()
  if (!snap.exists) return ctx.reply('Order tidak ditemukan.')

  const o = snap.data()
  ctx.replyWithHTML(`📦 <b>DETAIL ORDER</b>

🆔 ID: <code>${id}</code>
📦 Produk: ${o.productName}
👤 User: ${o.userName} (${o.userUniqueId})
📧 Email: ${o.userEmail}
💰 Nominal: ${formatIDR(o.amount)}
📌 Status: <b>${o.status.toUpperCase()}</b>
📅 Tanggal: ${new Date(o.createdAt).toLocaleString('id-ID')}
${o.deliveryContent ? `\n📬 Konten:\n<code>${o.deliveryContent}</code>` : ''}`)
})

// /pending
bot.command('pending', async ctx => {
  const snap = await db.collection('orders').where('status', '==', 'pending').orderBy('createdAt', 'desc').get()
  if (snap.empty) return ctx.reply('✅ Tidak ada order pending!')

  const lines = snap.docs.map(d => {
    const o = d.data()
    return `⏳ <code>${d.id.slice(0, 8)}</code> | ${o.productName} | ${formatIDR(o.amount)}`
  }).join('\n')

  ctx.replyWithHTML(`⏳ <b>ORDER PENDING (${snap.size})</b>\n\n${lines}`)
})

// /deliver [orderId] [content...]
bot.command('deliver', async ctx => {
  const parts = ctx.message.text.split(' ')
  const orderId = parts[1]
  const content = parts.slice(2).join(' ')

  if (!orderId || !content) return ctx.reply('Usage: /deliver [orderId] [konten delivery]')

  const orderRef = db.collection('orders').doc(orderId)
  const snap = await orderRef.get()
  if (!snap.exists) return ctx.reply('Order tidak ditemukan.')

  await orderRef.update({ status: 'delivered', deliveryContent: content, deliveredAt: new Date().toISOString() })
  ctx.reply(`✅ Order ${orderId.slice(0, 8)} berhasil dikirim!`)
})

// /cancelorder [orderId]
bot.command('cancelorder', async ctx => {
  const orderId = ctx.message.text.split(' ')[1]
  if (!orderId) return ctx.reply('Usage: /cancelorder [orderId]')

  const orderRef = db.collection('orders').doc(orderId)
  const snap = await orderRef.get()
  if (!snap.exists) return ctx.reply('Order tidak ditemukan.')

  await orderRef.update({ status: 'cancelled' })
  ctx.reply(`❌ Order ${orderId.slice(0, 8)} dibatalkan.`)
})

// /users
bot.command('users', async ctx => {
  const snap = await db.collection('users').orderBy('createdAt', 'desc').limit(5).get()
  const total = (await db.collection('users').get()).size

  const lines = snap.docs.map(d => {
    const u = d.data()
    return `👤 <code>${u.uniqueId}</code> — ${u.name} — ${u.email}`
  }).join('\n')

  ctx.replyWithHTML(`👥 <b>USER (Total: ${total})</b>\n\nTerbaru:\n${lines}`)
})

// /user [id]
bot.command('user', async ctx => {
  const query = ctx.message.text.split(' ')[1]
  if (!query) return ctx.reply('Usage: /user [userId atau uniqueId]')

  let snap = await db.collection('users').where('uniqueId', '==', query.toUpperCase()).get()
  if (snap.empty) snap = await db.collection('users').doc(query).get().then(d => d.exists ? { docs: [d], empty: false } : { docs: [], empty: true }) as any

  if (snap.empty) return ctx.reply('User tidak ditemukan.')
  const u = snap.docs[0].data()
  const uid = snap.docs[0].id

  const ordersSnap = await db.collection('orders').where('userId', '==', uid).get()
  const totalSpent = ordersSnap.docs.filter(d => ['paid','delivered'].includes(d.data().status)).reduce((s, d) => s + d.data().amount, 0)

  ctx.replyWithHTML(`👤 <b>DETAIL USER</b>

🆔 UID: <code>${uid}</code>
🏷 Unique ID: <code>${u.uniqueId}</code>
👋 Nama: ${u.name}
📧 Email: ${u.email}
📱 HP: ${u.phone}
🔑 Role: ${u.role}
🚫 Banned: ${u.isBanned ? 'Ya' : 'Tidak'}
📦 Total Order: ${ordersSnap.size}
💰 Total Spent: ${formatIDR(totalSpent)}`)
})

// /banuser [id]
bot.command('banuser', async ctx => {
  const uid = ctx.message.text.split(' ')[1]
  if (!uid) return ctx.reply('Usage: /banuser [userId]')
  await db.collection('users').doc(uid).update({ isBanned: true })
  ctx.reply(`🚫 User ${uid} di-ban.`)
})

// /unbanuser [id]
bot.command('unbanuser', async ctx => {
  const uid = ctx.message.text.split(' ')[1]
  if (!uid) return ctx.reply('Usage: /unbanuser [userId]')
  await db.collection('users').doc(uid).update({ isBanned: false })
  ctx.reply(`✅ User ${uid} di-unban.`)
})

// /products
bot.command('products', async ctx => {
  const snap = await db.collection('products').where('isActive', '==', true).get()
  if (snap.empty) return ctx.reply('Tidak ada produk aktif.')

  const lines = snap.docs.map(d => {
    const p = d.data()
    return `✅ <code>${d.id.slice(0,8)}</code> | ${p.name} | ${formatIDR(p.price)} | Stok: ${p.stock}`
  }).join('\n')

  ctx.replyWithHTML(`🛍️ <b>PRODUK AKTIF (${snap.size})</b>\n\n${lines}`)
})

// /toggleproduct [id]
bot.command('toggleproduct', async ctx => {
  const id = ctx.message.text.split(' ')[1]
  if (!id) return ctx.reply('Usage: /toggleproduct [productId]')

  const ref = db.collection('products').doc(id)
  const snap = await ref.get()
  if (!snap.exists) return ctx.reply('Produk tidak ditemukan.')

  const current = snap.data().isActive
  await ref.update({ isActive: !current })
  ctx.reply(`${!current ? '✅' : '❌'} Produk ${current ? 'dinonaktifkan' : 'diaktifkan'}.`)
})

// /updatestock [id] [jumlah]
bot.command('updatestock', async ctx => {
  const parts = ctx.message.text.split(' ')
  const id = parts[1]
  const jumlah = parseInt(parts[2])

  if (!id || isNaN(jumlah)) return ctx.reply('Usage: /updatestock [productId] [jumlah]')

  const ref = db.collection('products').doc(id)
  const snap = await ref.get()
  if (!snap.exists) return ctx.reply('Produk tidak ditemukan.')

  await ref.update({ stock: jumlah })
  ctx.reply(`📦 Stok ${snap.data().name} diperbarui → ${jumlah}`)
})

// /topproducts
bot.command('topproducts', async ctx => {
  const snap = await db.collection('orders').where('status', 'in', ['paid','delivered']).get()
  const counts = {}
  snap.docs.forEach(d => {
    const o = d.data()
    if (!counts[o.productName]) counts[o.productName] = { name: o.productName, count: 0, revenue: 0 }
    counts[o.productName].count++
    counts[o.productName].revenue += o.amount
  })

  const sorted = Object.values(counts).sort((a, b) => (b as any).count - (a as any).count).slice(0, 5)
  const lines = sorted.map((p: any, i) => `${i + 1}. ${p.name} — ${p.count}x — ${formatIDR(p.revenue)}`).join('\n')

  ctx.replyWithHTML(`🏆 <b>TOP 5 PRODUK TERLARIS</b>\n\n${lines || 'Belum ada data'}`)
})

bot.launch()
console.log('🤖 KamilShop Bot berjalan...')

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
