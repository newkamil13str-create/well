'use client'
// app/orders/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { Order } from '@/types'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import Navbar from '@/components/layout/Navbar'
import { ShoppingBag, ExternalLink, Filter } from 'lucide-react'

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/login'); return }
      const q = query(collection(db, 'orders'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setOrders(snap.docs.map(d => ({ ...d.data(), id: d.id } as Order)))
      setLoading(false)
    })
    return unsub
  }, [router])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div className="min-h-screen bg-ks-darker">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-display font-bold">Riwayat Order</h1>
            <p className="text-gray-500 text-sm mt-1">{orders.length} total order</p>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap mb-6">
          {[
            { value: 'all', label: 'Semua' },
            { value: 'pending', label: 'Menunggu' },
            { value: 'paid', label: 'Dibayar' },
            { value: 'delivered', label: 'Terkirim' },
            { value: 'cancelled', label: 'Dibatalkan' },
          ].map(tab => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === tab.value ? 'bg-blue-500 text-white' : 'bg-ks-surface border border-ks-border text-gray-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-20 rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-ks-surface border border-ks-border rounded-2xl p-16 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada order</p>
            <Link href="/products" className="mt-4 inline-block text-blue-400 hover:underline text-sm">
              Mulai belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(order => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="flex items-center gap-4 p-5 bg-ks-surface border border-ks-border rounded-xl hover:border-blue-500/20 transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm truncate">{order.productName}</div>
                  <div className="text-gray-500 text-xs mt-1">
                    #{order.id.slice(0, 8).toUpperCase()} · {formatDate(order.createdAt as string)}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 flex flex-col items-end gap-1.5">
                  <div className="font-bold text-sm">{formatCurrency(order.amount)}</div>
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-gray-300 flex-shrink-0 ml-2" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
