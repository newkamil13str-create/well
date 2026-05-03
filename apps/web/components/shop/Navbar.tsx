// apps/web/components/shop/Navbar.tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, User, Menu, X } from 'lucide-react'
import { useCartStore } from '@/store/cartStore'
import CartDrawer from './CartDrawer'

export default function Navbar() {
  const [cartOpen, setCartOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const count = useCartStore((s) => s.count())

  return (
    <>
      <nav className="bg-white shadow-sm sticky top-0 z-30 border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-blue-600">
            🛍️ KamilShop
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-600 hover:text-blue-600 text-sm font-medium">Beranda</Link>
            <Link href="/?kategori=" className="text-gray-600 hover:text-blue-600 text-sm font-medium">Katalog</Link>
          </div>

          <div className="flex items-center gap-3">
            {/* Cart */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 hover:bg-gray-100 rounded-lg"
            >
              <ShoppingCart size={22} className="text-gray-700" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {count > 99 ? '99+' : count}
                </span>
              )}
            </button>
            <Link href="/login" className="hidden md:flex items-center gap-1 p-2 hover:bg-gray-100 rounded-lg text-gray-700">
              <User size={22} />
            </Link>
            {/* Mobile menu */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg">
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {menuOpen && (
          <div className="md:hidden border-t bg-white px-4 py-3 space-y-2">
            <Link href="/" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 hover:text-blue-600">Beranda</Link>
            <Link href="/keranjang" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 hover:text-blue-600">Keranjang</Link>
            <Link href="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-gray-700 hover:text-blue-600">Login / Daftar</Link>
          </div>
        )}
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
