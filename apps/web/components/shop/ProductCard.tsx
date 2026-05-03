// apps/web/components/shop/ProductCard.tsx
'use client'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Package } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'
import type { Produk } from '@/types'

export default function ProductCard({ produk }: { produk: Produk }) {
  const addItem = useCartStore((s) => s.addItem)

  const handleAddCart = (e: React.MouseEvent) => {
    e.preventDefault()
    if (produk.stok !== null && produk.stok === 0) {
      return toast.error('Stok habis!')
    }
    addItem({
      id: produk.id,
      nama: produk.nama,
      harga: produk.harga,
      gambar: produk.gambar,
      slug: produk.slug,
    })
    toast.success('Ditambahkan ke keranjang!')
  }

  const hargaFmt = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(produk.harga)

  const habis = produk.stok !== null && produk.stok === 0

  return (
    <Link href={`/produk/${produk.slug}`}>
      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group cursor-pointer border border-gray-100">
        {/* Gambar */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {produk.gambar[0] ? (
            <Image
              src={produk.gambar[0]}
              alt={produk.nama}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="text-gray-300" size={48} />
            </div>
          )}
          {habis && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-white text-gray-800 font-bold px-3 py-1 rounded-full text-sm">
                Habis
              </span>
            </div>
          )}
          {produk.kategori && (
            <span className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
              {produk.kategori}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1 min-h-[2.5rem]">
            {produk.nama}
          </h3>
          <div className="flex items-center justify-between mt-2">
            <div>
              <p className="text-blue-600 font-bold text-base">{hargaFmt}</p>
              <p className="text-xs text-gray-400">
                Stok: {produk.stok !== null ? `${produk.stok} pcs` : '∞'}
              </p>
            </div>
            <button
              onClick={handleAddCart}
              disabled={habis}
              className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              title="Tambah ke keranjang"
            >
              <ShoppingCart size={16} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  )
}
