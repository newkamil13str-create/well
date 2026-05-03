'use client'
// app/dashboard/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore'
import { User, Order } from '@/types'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import Navbar from '@/components/layout/Navbar'
import { Copy, ShoppingBag, User as UserIcon, ExternalLink, Zap } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<User | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/login'); return }
      const [userSnap] = await Promise.all([
        getDoc(doc(db, 'users', user.uid)),
      ])
      if (userSnap.exists()) setUserData({ ...userSnap.data() as User, uid: user.uid })

      // Fetch recent orders
      const ordersQ = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(5)
      )
      const ordersSnap = await getDocs(ordersQ)
      const orders = ordersSnap.docs.map(d => ({ ...d.data(), id: d.id } as Order))
      setRecentOrders(orders)
      setLoading(false)
    })
    return unsub
  }, [router])

  function copyId() {
    if (userData?.uniqueId) {
      navigator.clipboard.writeText(userData.uniqueId)
      toast.success('ID disalin!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ks-darker">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 pt-24 pb-20 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ks-darker">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold mb-1">Dashboard</h1>
            <p className="text-gray-500 text-sm">Selamat datang, {userData?.name?.split(' ')[0]}!</p>
          </div>
          <Link href="/profile" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-ks-surface border border-ks-border text-sm text-gray-400 hover:text-white hover:border-blue-500/30 transition-all">
            <UserIcon className="w-4 h-4" /> Edit Profil
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-ks-surface border border-ks-border rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold gradient-text">
                {userData?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-lg mb-1">{userData?.name}</div>
              <div className="text-gray-500 text-sm">{userData?.email}</div>
              <div className="text-gray-500 text-sm">{userData?.phone}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500 mb-1">ID Unik Anda</div>
              <button
                onClick={copyId}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-mono font-bold text-sm hover:bg-blue-500/20 transition-colors"
              >
                {userData?.uniqueId}
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { href: '/orders', icon: ShoppingBag, label: 'Semua Order', count: null },
            { href: '/products', icon: Zap, label: 'Beli Produk', count: null },
            { href: '/profile', icon: UserIcon, label: 'Edit Profil', count: null },
          ].map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="p-4 rounded-xl bg-ks-surface border border-ks-border hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-center group"
            >
              <Icon className="w-6 h-6 text-blue-400 mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <div className="text-sm font-medium">{label}</div>
            </Link>
          ))}
        </div>

        {/* Recent Orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-lg">Order Terbaru</h2>
            <Link href="/orders" className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1">
              Lihat Semua <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="bg-ks-surface border border-ks-border rounded-2xl p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500">Belum ada order</p>
              <Link href="/products" className="mt-4 inline-block text-blue-400 hover:underline text-sm">
                Mulai belanja
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="flex items-center gap-4 p-4 bg-ks-surface border border-ks-border rounded-xl hover:border-blue-500/20 transition-all group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{order.productName}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{formatDate(order.createdAt as string)}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-semibold text-sm">{formatCurrency(order.amount)}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
