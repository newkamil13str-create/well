// app/api/admin/orders/deliver/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requireAdmin } from '@/lib/auth-middleware'
import { sendOrderDeliveryEmail } from '@/lib/email'
import { sendTelegramNotification, deliverySuccessMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  const { error } = await requireAdmin(req)
  if (error) return error

  try {
    const { orderId, deliveryContent } = await req.json()
    if (!orderId || !deliveryContent?.trim()) {
      return NextResponse.json({ success: false, error: 'orderId dan deliveryContent wajib diisi' }, { status: 400 })
    }

    const orderRef = adminDb.collection('orders').doc(orderId)
    const orderSnap = await orderRef.get()
    if (!orderSnap.exists) {
      return NextResponse.json({ success: false, error: 'Order tidak ditemukan' }, { status: 404 })
    }

    const order = orderSnap.data()!

    await orderRef.update({
      status: 'delivered',
      deliveryContent,
      deliveredAt: new Date().toISOString(),
    })

    // Reduce stock
    const productSnap = await adminDb.collection('products').doc(order.productId).get()
    if (productSnap.exists) {
      const product = productSnap.data()!
      if (product.stock > 0) {
        await adminDb.collection('products').doc(order.productId).update({ stock: product.stock - 1 })
      }
    }

    // Send email to user
    await sendOrderDeliveryEmail(order.userEmail, order.userName, {
      id: orderId,
      productName: order.productName,
      amount: order.amount,
      deliveryContent,
      createdAt: order.createdAt,
    })

    // Notify Telegram
    await sendTelegramNotification(deliverySuccessMessage({
      id: orderId,
      userName: order.userName,
      productName: order.productName,
    }))

    return NextResponse.json({ success: true, message: 'Order berhasil dikirim' })
  } catch (error) {
    console.error('Manual deliver error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan' }, { status: 500 })
  }
}
