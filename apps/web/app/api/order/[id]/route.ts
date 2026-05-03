// apps/web/app/api/order/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

// GET — cek status (dipakai polling dari QrisDisplay)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: { include: { produk: true } } },
    })
    if (!order) return NextResponse.json({ error: 'Order tidak ditemukan' }, { status: 404 })
    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil order' }, { status: 500 })
  }
}

// PATCH — update status order (admin)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status } = await req.json()
    const validStatus = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DONE', 'CANCELLED']
    if (!validStatus.includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status,
        ...(status === 'PAID' && { paidAt: new Date() }),
      },
    })

    return NextResponse.json(order)
  } catch {
    return NextResponse.json({ error: 'Gagal update status' }, { status: 500 })
  }
}
