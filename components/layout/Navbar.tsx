'use client'
// components/layout/Navbar.tsx
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { User as UserIcon, ShoppingBag, LogOut, LayoutDashboard, Menu, X, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      if (firebaseUser) {
        const docSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
        if (docSnap.exists()) setUserData(docSnap.data())
      } else {
        setUserData(null)
      }
    })
    return unsub
  }, [])

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler)
    return () => window.removeEventListener('scroll', handler)
  }, [])

  async function handleSignOut() {
    await signOut(auth)
    toast.success('Berhasil logout')
    router.push('/')
  }

  const navLinks = [
    { href: '/products', label: 'Produk' },
    { href: '/products?category=hosting-web', label: 'Hosting' },
    { href: '/products?category=bot-whatsapp', label: 'Bot WA' },
    { href: '/products?category=akun-premium', label: 'Premium' },
  ]

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-ks-darker/95 backdrop-blur-xl border-b border-ks-border' : 'bg-transparent'
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-display font-800 text-xl tracking-tight">
              Kamil<span className="gradient-text">Shop</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  pathname === link.href
                    ? 'text-white bg-white/10'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{userData?.uniqueId || 'Dashboard'}</span>
                </Link>
                <Link href="/orders" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
                  <ShoppingBag className="w-4 h-4" />
                  Pesanan
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors px-3 py-2 rounded-lg hover:bg-red-400/5"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
                  Masuk
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all"
                >
                  Daftar Gratis
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-ks-darker/98 backdrop-blur-xl border-b border-ks-border">
          <div className="px-4 py-4 space-y-2">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="border-t border-ks-border pt-3 mt-3 space-y-2">
              {user ? (
                <>
                  <Link href="/dashboard" className="block px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link href="/orders" className="block px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setMenuOpen(false)}>
                    Pesanan
                  </Link>
                  <button onClick={() => { handleSignOut(); setMenuOpen(false) }} className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-400/5 transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="block px-4 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors" onClick={() => setMenuOpen(false)}>
                    Masuk
                  </Link>
                  <Link href="/register" className="block px-4 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center transition-all" onClick={() => setMenuOpen(false)}>
                    Daftar Gratis
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
