// apps/web/components/admin/AdminSidebar.tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingBag, Users, Settings,
  LogOut, ExternalLink,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const menu = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/produk', label: 'Produk', icon: Package },
  { href: '/admin/pesanan', label: 'Pesanan', icon: ShoppingBag },
  { href: '/admin/pengguna', label: 'Pengguna', icon: Users },
]

export default function AdminSidebar() {
  const path = usePathname()

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">🛍️ KamilShop</h1>
        <p className="text-gray-400 text-xs mt-1">Admin Panel</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menu.map((m) => {
          const active = path === m.href || (m.href !== '/admin' && path.startsWith(m.href))
          return (
            <Link
              key={m.href}
              href={m.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                active
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <m.icon size={18} />
              {m.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom actions */}
      <div className="p-4 border-t border-gray-800 space-y-1">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition"
        >
          <ExternalLink size={18} /> Buka Toko
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-400 hover:bg-red-900 hover:text-red-400 transition"
        >
          <LogOut size={18} /> Keluar
        </button>
      </div>
    </aside>
  )
}
