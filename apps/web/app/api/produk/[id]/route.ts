// apps/web/app/api/produk/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import slugify from 'slugify'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const produk = await prisma.produk.findUnique({ where: { id: params.id } })
    if (!produk) return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })
    return NextResponse.json(produk)
  } catch {
    return NextResponse.json({ error: 'Gagal mengambil produk' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { nama, harga, stok, deskripsi, gambar, kategori, aktif } = await req.json()

    const existing = await prisma.produk.findUnique({ where: { id: params.id } })
    if (!existing) return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 })

    const produk = await prisma.produk.update({
      where: { id: params.id },
      data: {
        nama,
        harga: Number(harga),
        stok: stok !== null && stok !== undefined && stok !== '' ? Number(stok) : null,
        deskripsi,
        gambar: Array.isArray(gambar) ? gambar : [gambar],
        kategori: kategori || null,
        aktif: aktif ?? true,
      },
    })

    return NextResponse.json(produk)
  } catch (error) {
    console.error('[PRODUK_PUT]', error)
    return NextResponse.json({ error: 'Gagal update produk' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Soft delete: set aktif = false
    await prisma.produk.update({
      where: { id: params.id },
      data: { aktif: false },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Gagal menghapus produk' }, { status: 500 })
  }
}
