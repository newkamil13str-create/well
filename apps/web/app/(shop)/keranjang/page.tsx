// apps/web/app/(shop)/keranjang/page.tsx
'use client'
import { useCartStore } from '@/store/cartStore'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'

export default function KeranjangPage() {
  const { items, removeItem, updateQty, total } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Keranjang kosong</h2>
          <p className="text-gray-400 mb-6">Yuk mulai belanja!</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
          >
            Belanja Sekarang
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          🛒 Keranjang Belanja
        </h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Daftar item */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-sm p-4 flex gap-4"
              >
                <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  {item.gambar[0] && (
                    <Image
                      src={item.gambar[0]}
                      alt={item.nama}
                      fill
                      className="object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 text-sm">{item.nama}</h3>
                  <p className="text-blue-600 font-bold mt-1">
                    Rp {item.harga.toLocaleString('id-ID')}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-7 h-7 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="font-medium w-6 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-7 h-7 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-100"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-auto text-red-400 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">
                    Rp {(item.harga * item.qty).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Ringkasan */}
          <div className="bg-white rounded-xl shadow-sm p-6 h-fit sticky top-4">
            <h3 className="font-bold text-gray-800 mb-4">Ringkasan Pesanan</h3>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-gray-600">
                  <span>{item.nama} x{item.qty}</span>
                  <span>Rp {(item.harga * item.qty).toLocaleString('id-ID')}</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-4 mb-6">
              <div className="flex justify-between font-bold text-gray-800">
                <span>Total</span>
                <span>Rp {total().toLocaleString('id-ID')}</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Checkout <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
