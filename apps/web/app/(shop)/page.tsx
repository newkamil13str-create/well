// apps/web/app/(shop)/page.tsx
import { prisma } from '@/lib/prisma'
import ProductGrid from '@/components/shop/ProductGrid'
import Link from 'next/link'

export const revalidate = 60

export default async function BerandaPage({
  searchParams,
}: {
  searchParams: { q?: string; kategori?: string }
}) {
  const { q, kategori } = searchParams

  const produk = await prisma.produk.findMany({
    where: {
      aktif: true,
      ...(kategori && { kategori }),
      ...(q && { nama: { contains: q, mode: 'insensitive' } }),
    },
    orderBy: { createdAt: 'desc' },
  })

  const kategoris = await prisma.produk.findMany({
    where: { aktif: true, kategori: { not: null } },
    select: { kategori: true },
    distinct: ['kategori'],
  })

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">🛍️ KamilShop</h1>
          <p className="text-blue-100 text-lg mb-8">
            Belanja Online Mudah, Cepat & Terpercaya
          </p>
          {/* Search bar */}
          <form className="max-w-lg mx-auto">
            <div className="flex gap-2">
              <input
                name="q"
                defaultValue={q}
                placeholder="Cari produk..."
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition"
              >
                Cari
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Filter kategori */}
        <div className="flex gap-2 flex-wrap mb-6">
          <Link
            href="/"
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              !kategori
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 border hover:bg-gray-50'
            }`}
          >
            Semua
          </Link>
          {kategoris.map((k) => (
            <Link
              key={k.kategori}
              href={`/?kategori=${k.kategori}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                kategori === k.kategori
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              {k.kategori}
            </Link>
          ))}
        </div>

        {/* Header hasil */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {q ? `Hasil: "${q}"` : kategori ? kategori : 'Semua Produk'}
          </h2>
          <span className="text-sm text-gray-500">{produk.length} produk</span>
        </div>

        {produk.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">🔍</p>
            <p className="text-gray-500">Produk tidak ditemukan</p>
            <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
              Lihat semua produk
            </Link>
          </div>
        ) : (
          <ProductGrid produk={produk} />
        )}
      </div>
    </main>
  )
}
