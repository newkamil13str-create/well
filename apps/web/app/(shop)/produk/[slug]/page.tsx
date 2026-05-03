// apps/web/app/(shop)/produk/[slug]/page.tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductDetail from '@/components/shop/ProductDetail'
import type { Metadata } from 'next'

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const produk = await prisma.produk.findUnique({ where: { slug: params.slug } })
  if (!produk) return { title: 'Produk tidak ditemukan' }
  return {
    title: `${produk.nama} - KamilShop`,
    description: produk.deskripsi.substring(0, 160),
    openGraph: {
      title: produk.nama,
      description: produk.deskripsi.substring(0, 160),
      images: produk.gambar[0] ? [produk.gambar[0]] : [],
    },
  }
}

export default async function ProdukDetailPage({
  params,
}: {
  params: { slug: string }
}) {
  const produk = await prisma.produk.findUnique({
    where: { slug: params.slug, aktif: true },
  })

  if (!produk) notFound()

  return <ProductDetail produk={produk} />
}
