// app/api/webhook/pakasir/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { verifyPakasirWebhookSignature } from '@/lib/pakasir'
import { sendOrderDeliveryEmail } from '@/lib/email'
import { sendTelegramNotification, paymentSuccessMessage, deliverySuccessMessage, orderCancelledMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-pakasir-signature') || ''

    // Verify signature
    if (!verifyPakasirWebhookSignature(body, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const data = JSON.parse(body)
    const { external_id: orderId, status, invoice_id } = data

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 })
    }

    const orderRef = adminDb.collection('orders').doc(orderId)
    const orderSnap = await orderRef.get()

    if (!orderSnap.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const order = { ...orderSnap.data()!, id: orderId } as any

    if (status === 'paid' || status === 'settlement') {
      // Update order to paid
      await orderRef.update({
        status: 'paid',
        pakasirInvoiceId: invoice_id || order.pakasirInvoiceId,
        paidAt: new Date().toISOString(),
      })

      // Notify owner
      await sendTelegramNotification(paymentSuccessMessage({
        id: orderId,
        userUniqueId: order.userUniqueId,
        userName: order.userName,
        userEmail: order.userEmail,
        productName: order.productName,
        amount: order.amount,
      }))

      // Auto delivery
      const productSnap = await adminDb.collection('products').doc(order.productId).get()
      const product = productSnap.data()

      if (product?.deliveryType === 'auto' && product?.deliveryContent) {
        // Deliver automatically
        await orderRef.update({
          status: 'delivered',
          deliveryContent: product.deliveryContent,
          deliveredAt: new Date().toISOString(),
        })

        // Reduce stock
        if (product.stock > 0) {
          await adminDb.collection('products').doc(order.productId).update({
            stock: product.stock - 1
          })
        }

        // Send delivery email
        await sendOrderDeliveryEmail(order.userEmail, order.userName, {
          id: orderId,
          productName: order.productName,
          amount: order.amount,
          deliveryContent: product.deliveryContent,
          createdAt: order.createdAt,
        })

        // Notify Telegram
        await sendTelegramNotification(deliverySuccessMessage({
          id: orderId,
          userName: order.userName,
          productName: order.productName,
        }))
      }

    } else if (status === 'expired' || status === 'cancelled') {
      await orderRef.update({ status: 'cancelled' })
      await sendTelegramNotification(orderCancelledMessage({
        id: orderId,
        userName: order.userName,
        productName: order.productName,
        amount: order.amount,
      }))
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
