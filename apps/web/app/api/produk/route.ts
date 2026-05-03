// apps/web/app/api/produk/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import slugify from 'slugify'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const kategori = searchParams.get('kategori')
    const search = searchParams.get('q')
    const limit = searchParams.get('limit')
    const page = Number(searchParams.get('page') || 1)
    const take = limit ? Number(limit) : undefined

    const produk = await prisma.produk.findMany({
      where: {
        aktif: true,
        ...(kategori && { kategori }),
        ...(search && { nama: { contains: search, mode: 'insensitive' } }),
      },
      orderBy: { createdAt: 'desc' },
      ...(take && { take, skip: (page - 1) * take }),
    })

    const total = await prisma.produk.count({
      where: {
        aktif: true,
        ...(kategori && { kategori }),
        ...(search && { nama: { contains: search, mode: 'insensitive' } }),
      },
    })

    return NextResponse.json({ produk, total, page })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data produk' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { nama, harga, stok, deskripsi, gambar, kategori, aktif } = await req.json()

    if (!nama || !harga || !deskripsi || !gambar?.length) {
      return NextResponse.json({ error: 'Field wajib tidak lengkap' }, { status: 400 })
    }

    const baseSlug = slugify(nama, { lower: true, strict: true })
    const slug = `${baseSlug}-${Date.now()}`

    const produk = await prisma.produk.create({
      data: {
        nama,
        slug,
        harga: Number(harga),
        stok: stok !== null && stok !== undefined && stok !== '' ? Number(stok) : null,
        deskripsi,
        gambar: Array.isArray(gambar) ? gambar : [gambar],
        kategori: kategori || null,
        aktif: aktif ?? true,
      },
    })

    return NextResponse.json(produk, { status: 201 })
  } catch (error) {
    console.error('[PRODUK_POST]', error)
    return NextResponse.json({ error: 'Gagal menambah produk' }, { status: 500 })
  }
}
