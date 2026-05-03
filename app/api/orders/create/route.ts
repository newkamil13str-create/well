// app/api/orders/create/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'
import { requireAuth } from '@/lib/auth-middleware'
import { createPakasirInvoice } from '@/lib/pakasir'
import { sendTelegramNotification, newOrderMessage } from '@/lib/telegram'

export async function POST(req: NextRequest) {
  const { error, user } = await requireAuth(req)
  if (error) return error

  try {
    const body = await req.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json({ success: false, error: 'Product ID wajib diisi' }, { status: 400 })
    }

    // Get product
    const productSnap = await adminDb.collection('products').doc(productId).get()
    if (!productSnap.exists) {
      return NextResponse.json({ success: false, error: 'Produk tidak ditemukan' }, { status: 404 })
    }
    const product = { ...productSnap.data()!, id: productSnap.id } as any

    if (!product.isActive) {
      return NextResponse.json({ success: false, error: 'Produk tidak aktif' }, { status: 400 })
    }
    if (product.stock <= 0) {
      return NextResponse.json({ success: false, error: 'Stok habis' }, { status: 400 })
    }

    // Get user data
    const userSnap = await adminDb.collection('users').doc(user!.uid).get()
    const userData = userSnap.data()!

    // Create order in Firestore
    const orderData = {
      userId: user!.uid,
      userUniqueId: userData.uniqueId,
      userName: userData.name,
      userEmail: userData.email,
      productId,
      productName: product.name,
      productCategory: product.category,
      amount: product.price,
      status: 'pending',
      paymentUrl: '',
      pakasirInvoiceId: '',
      deliveryContent: '',
      createdAt: new Date().toISOString(),
    }

    const orderRef = await adminDb.collection('orders').add(orderData)
    const orderId = orderRef.id

    // Create Pakasir invoice
    const invoice = await createPakasirInvoice({
      orderId,
      amount: product.price,
      productName: product.name,
      customerName: userData.name,
      customerEmail: userData.email,
      returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}`,
    })

    let paymentUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${orderId}`
    let pakasirInvoiceId = ''

    if (invoice.success && invoice.data) {
      paymentUrl = invoice.data.payment_url
      pakasirInvoiceId = invoice.data.invoice_id
    }

    // Update order with payment URL
    await orderRef.update({ paymentUrl, pakasirInvoiceId })

    // Notify Telegram
    await sendTelegramNotification(newOrderMessage({
      id: orderId,
      userUniqueId: userData.uniqueId,
      userName: userData.name,
      productName: product.name,
      amount: product.price,
    }))

    return NextResponse.json({
      success: true,
      data: { orderId, paymentUrl },
      message: 'Order berhasil dibuat'
    })
  } catch (err: any) {
    console.error('Create order error:', err)
    return NextResponse.json({ success: false, error: 'Gagal membuat order' }, { status: 500 })
  }
}
