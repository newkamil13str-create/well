// apps/web/components/shop/ProductDetail.tsx
'use client'
import { useState } from 'react'
import Image from 'next/image'
import { ShoppingCart, Share2, Package, CheckCircle } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import toast from 'react-hot-toast'
import Link from 'next/link'
import type { Produk } from '@/types'

export default function ProductDetail({ produk }: { produk: Produk }) {
  const [activeImg, setActiveImg] = useState(0)
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const addItem = useCartStore((s) => s.addItem)

  const hargaFmt = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(produk.harga)

  const totalFmt = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0,
  }).format(produk.harga * qty)

  const habis = produk.stok !== null && produk.stok === 0

  const handleAddCart = () => {
    if (habis) return
    for (let i = 0; i < qty; i++) {
      addItem({ id: produk.id, nama: produk.nama, harga: produk.harga, gambar: produk.gambar, slug: produk.slug })
    }
    setAdded(true)
    toast.success(`${qty} item ditambahkan ke keranjang!`)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleShare = async () => {
    try {
      await navigator.share({
        title: produk.nama,
        text: `Cek produk ini di KamilShop: ${produk.nama}`,
        url: window.location.href,
      })
    } catch {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link disalin!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar breadcrumb */}
      <div className="bg-white border-b px-4 py-3 text-sm text-gray-500">
        <Link href="/" className="hover:text-blue-600">Beranda</Link>
        {' / '}
        {produk.kategori && (
          <>
            <Link href={`/?kategori=${produk.kategori}`} className="hover:text-blue-600">
              {produk.kategori}
            </Link>
            {' / '}
          </>
        )}
        <span className="text-gray-800 font-medium">{produk.nama}</span>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Galeri gambar */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 mb-3">
              {produk.gambar[activeImg] ? (
                <Image
                  src={produk.gambar[activeImg]}
                  alt={produk.nama}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="text-gray-300" size={80} />
                </div>
              )}
              {habis && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white font-bold px-6 py-2 rounded-full text-gray-800">Stok Habis</span>
                </div>
              )}
            </div>
            {produk.gambar.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {produk.gambar.map((g, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                      activeImg === i ? 'border-blue-500' : 'border-transparent'
                    }`}
                  >
                    <Image src={g} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info produk */}
          <div className="space-y-4">
            {produk.kategori && (
              <span className="inline-block bg-blue-100 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
                {produk.kategori}
              </span>
            )}
            <h1 className="text-2xl font-bold text-gray-800">{produk.nama}</h1>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-blue-600">{hargaFmt}</span>
              <span className="text-sm text-gray-400">/ item</span>
            </div>

            {/* Stok */}
            <div className="flex items-center gap-2">
              {habis ? (
                <span className="text-red-500 text-sm font-medium">● Stok Habis</span>
              ) : (
                <span className="text-green-600 text-sm font-medium">
                  ● Stok: {produk.stok !== null ? `${produk.stok} pcs tersedia` : 'Unlimited'}
                </span>
              )}
            </div>

            {/* Qty */}
            {!habis && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Jumlah:</span>
                <div className="flex items-center border rounded-lg overflow-hidden">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold"
                  >-</button>
                  <span className="px-4 py-2 font-medium">{qty}</span>
                  <button
                    onClick={() => setQty(produk.stok !== null ? Math.min(produk.stok, qty + 1) : qty + 1)}
                    className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold"
                  >+</button>
                </div>
                <span className="text-sm text-gray-500">Total: {totalFmt}</span>
              </div>
            )}

            {/* Tombol aksi */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleAddCart}
                disabled={habis}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white transition ${
                  added ? 'bg-green-500' : 'bg-blue-600 hover:bg-blue-700'
                } disabled:bg-gray-300 disabled:cursor-not-allowed`}
              >
                {added ? <CheckCircle size={20} /> : <ShoppingCart size={20} />}
                {added ? 'Ditambahkan!' : 'Tambah ke Keranjang'}
              </button>
              <button
                onClick={handleShare}
                className="p-3 border rounded-xl hover:bg-gray-50 text-gray-600"
                title="Bagikan produk"
              >
                <Share2 size={20} />
              </button>
            </div>

            <Link
              href="/keranjang"
              className="block w-full text-center py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition"
            >
              Lihat Keranjang
            </Link>

            {/* Deskripsi */}
            <div className="pt-4 border-t">
              <h2 className="font-semibold text-gray-800 mb-3">Deskripsi Produk</h2>
              <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {produk.deskripsi}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
