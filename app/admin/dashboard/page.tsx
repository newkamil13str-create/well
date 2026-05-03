'use client'
// app/admin/dashboard/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { TrendingUp, Users, ShoppingBag, Package, ArrowRight, Zap } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'

export default function AdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    revenueToday: 0,
    revenueMonth: 0,
    revenueAll: 0,
    totalOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalUsers: 0,
  })
  const [recentOrders, setRecentOrders] = useState<any[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/admin'); return }
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (!userDoc.exists() || userDoc.data()?.role !== 'admin') {
        router.push('/admin')
        return
      }
      await loadData()
      setLoading(false)
    })
    return unsub
  }, [router])

  async function loadData() {
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const ordersSnap = await getDocs(collection(db, 'orders'))
    const allOrders = ordersSnap.docs.map(d => ({ ...d.data(), id: d.id })) as any[]

    const revenueAll = allOrders.filter(o => o.status === 'paid' || o.status === 'delivered').reduce((sum, o) => sum + o.amount, 0)
    const revenueToday = allOrders.filter(o =>
      (o.status === 'paid' || o.status === 'delivered') &&
      o.paidAt?.toDate?.() >= startOfToday
    ).reduce((sum, o) => sum + o.amount, 0)
    const revenueMonth = allOrders.filter(o =>
      (o.status === 'paid' || o.status === 'delivered') &&
      o.paidAt?.toDate?.() >= startOfMonth
    ).reduce((sum, o) => sum + o.amount, 0)

    const usersSnap = await getDocs(collection(db, 'users'))

    setStats({
      revenueToday,
      revenueMonth,
      revenueAll,
      totalOrders: allOrders.length,
      pendingOrders: allOrders.filter(o => o.status === 'pending').length,
      deliveredOrders: allOrders.filter(o => o.status === 'delivered').length,
      totalUsers: usersSnap.size,
    })

    setRecentOrders(allOrders.sort((a, b) => {
      const aTime = a.createdAt?.toDate?.()?.getTime() || 0
      const bTime = b.createdAt?.toDate?.()?.getTime() || 0
      return bTime - aTime
    }).slice(0, 10))

    setRecentUsers(usersSnap.docs.map(d => ({ ...d.data(), id: d.id })).slice(0, 5))
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-display font-bold">Dashboard Admin</h1>
        <p className="text-gray-500 text-sm mt-1">Overview KamilShop</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Revenue Hari Ini', value: formatCurrency(stats.revenueToday), icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' },
          { label: 'Revenue Bulan Ini', value: formatCurrency(stats.revenueMonth), icon: TrendingUp, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Total Order', value: stats.totalOrders.toString(), icon: ShoppingBag, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          { label: 'Total User', value: stats.totalUsers.toString(), icon: Users, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        ].map(stat => (
          <div key={stat.label} className="bg-ks-surface border border-ks-border rounded-xl p-5">
            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center mb-3`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div className="text-2xl font-display font-bold mb-1">{stat.value}</div>
            <div className="text-gray-500 text-xs">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Order status */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Pending', value: stats.pendingOrders, color: 'text-yellow-400' },
          { label: 'Delivered', value: stats.deliveredOrders, color: 'text-green-400' },
          { label: 'All Time Revenue', value: formatCurrency(stats.revenueAll), color: 'gradient-text' },
        ].map(item => (
          <div key={item.label} className="bg-ks-surface border border-ks-border rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold mb-1 ${item.color}`}>{item.value}</div>
            <div className="text-gray-500 text-xs">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-ks-surface border border-ks-border rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-ks-border">
            <h2 className="font-semibold">Order Terbaru</h2>
            <Link href="/admin/orders" className="text-blue-400 text-sm flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-ks-border">
            {recentOrders.slice(0, 5).map(order => (
              <div key={order.id} className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{order.productName}</div>
                  <div className="text-xs text-gray-500">{order.userName}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-semibold">{formatCurrency(order.amount)}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-ks-surface border border-ks-border rounded-xl">
          <div className="flex items-center justify-between p-5 border-b border-ks-border">
            <h2 className="font-semibold">User Terbaru</h2>
            <Link href="/admin/users" className="text-blue-400 text-sm flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="divide-y divide-ks-border">
            {recentUsers.map(user => (
              <div key={user.id} className="flex items-center gap-3 p-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold gradient-text">{user.name?.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{user.name}</div>
                  <div className="text-xs text-gray-500 truncate">{user.email}</div>
                </div>
                <div className="text-xs font-mono text-blue-400 flex-shrink-0">{user.uniqueId}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
