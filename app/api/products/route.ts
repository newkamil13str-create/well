// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase-admin'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')

    let query = adminDb.collection('products').where('isActive', '==', true)

    if (category) query = query.where('category', '==', category) as any
    if (featured) query = query.where('isFeatured', '==', true) as any

    const snap = await (query as any).get()
    const products = snap.docs.map((d: any) => ({
      ...d.data(),
      id: d.id,
      createdAt: d.data().createdAt?.toDate?.()?.toISOString?.() || d.data().createdAt,
      updatedAt: d.data().updatedAt?.toDate?.()?.toISOString?.() || d.data().updatedAt,
    }))

    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    console.error('Products GET error:', error)
    return NextResponse.json({ success: false, error: 'Gagal memuat produk' }, { status: 500 })
  }
}
