// apps/web/components/shop/CartDrawer.tsx
'use client'
import { Fragment } from 'react'
import { X, ShoppingCart, Trash2 } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import Image from 'next/image'
import Link from 'next/link'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQty, total } = useCartStore()

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col transition-transform duration-300 ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} />
            <span className="font-semibold">Keranjang ({items.length})</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <ShoppingCart size={48} className="mb-3" />
              <p>Keranjang kosong</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                  {item.gambar[0] && (
                    <Image src={item.gambar[0]} alt={item.nama} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.nama}</p>
                  <p className="text-blue-600 text-sm font-bold">
                    Rp {item.harga.toLocaleString('id-ID')}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => updateQty(item.id, item.qty - 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold hover:bg-gray-300">
                      -
                    </button>
                    <span className="text-sm font-medium w-4 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)}
                      className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold hover:bg-gray-300">
                      +
                    </button>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={14} />
                  </button>
                  <p className="text-sm font-bold text-gray-700">
                    Rp {(item.harga * item.qty).toLocaleString('id-ID')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-4 border-t space-y-3">
            <div className="flex justify-between font-bold text-gray-800">
              <span>Total</span>
              <span className="text-blue-600">Rp {total().toLocaleString('id-ID')}</span>
            </div>
            <Link href="/checkout" onClick={onClose}
              className="block w-full text-center py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
              Checkout Sekarang
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
