// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const snap = await adminDb.collection('products').doc(params.id).get()
    if (!snap.exists) {
      return NextResponse.json({ success: false, error: 'Produk tidak ditemukan' }, { status: 404 })
    }
    const data = snap.data()!
    return NextResponse.json({
      success: true,
      data: {
        ...data,
        id: snap.id,
        // Don't expose deliveryContent in public product detail
        deliveryContent: undefined,
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
      }
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Gagal memuat produk' }, { status: 500 })
  }
}
