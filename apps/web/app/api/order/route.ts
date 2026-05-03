// apps/web/app/api/order/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 })

    const { items, namaLengkap, noWhatsapp, alamat, catatan, totalHarga } = await req.json()

    if (!items?.length || !namaLengkap || !noWhatsapp || !alamat) {
      return NextResponse.json({ error: 'Data order tidak lengkap' }, { status: 400 })
    }

    // Validasi stok untuk setiap produk
    for (const item of items) {
      const produk = await prisma.produk.findUnique({ where: { id: item.produkId } })
      if (!produk) return NextResponse.json({ error: `Produk tidak ditemukan` }, { status: 404 })
      if (!produk.aktif) return NextResponse.json({ error: `Produk ${produk.nama} tidak aktif` }, { status: 400 })
      if (produk.stok !== null && produk.stok < item.qty) {
        return NextResponse.json({ error: `Stok ${produk.nama} tidak mencukupi (tersisa ${produk.stok})` }, { status: 400 })
      }
    }

    const order = await prisma.order.create({
      data: {
        userId: (session.user as any).id,
        namaLengkap,
        noWhatsapp,
        alamat,
        catatan: catatan || null,
        totalHarga,
        items: {
          create: items.map((item: any) => ({
            produkId: item.produkId,
            qty: item.qty,
            harga: item.harga,
            subtotal: item.harga * item.qty,
          })),
        },
      },
      include: { items: { include: { produk: true } } },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('[ORDER_CREATE]', error)
    return NextResponse.json({ error: 'Gagal membuat order' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Login diperlukan' }, { status: 401 })

    const isAdmin = (session.user as any)?.role === 'ADMIN'
    const userId = (session.user as any)?.id

    const orders = await prisma.order.findMany({
      where: isAdmin ? undefined : { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { produk: true } } },
    })

    return NextResponse.json(orders)
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil data order' }, { status: 500 })
  }
}
