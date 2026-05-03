'use client'
// app/orders/[orderId]/page.tsx
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { Order } from '@/types'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import Navbar from '@/components/layout/Navbar'
import { ArrowLeft, Package, CheckCircle, Clock, XCircle, CreditCard, Copy } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OrderDetailPage() {
  const { orderId } = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/login'); return }
      if (!orderId) return
      const snap = await getDoc(doc(db, 'orders', orderId as string))
      if (!snap.exists() || snap.data().userId !== user.uid) {
        router.push('/orders')
        return
      }
      setOrder({ ...snap.data(), id: snap.id } as Order)
      setLoading(false)
    })
    return unsub
  }, [orderId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-ks-darker">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 pt-24 pb-20 space-y-4">
          <div className="skeleton h-8 rounded w-48" />
          <div className="skeleton h-64 rounded-2xl" />
          <div className="skeleton h-48 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!order) return null

  const statusIcons = {
    pending: <Clock className="w-5 h-5 text-yellow-400" />,
    paid: <CreditCard className="w-5 h-5 text-blue-400" />,
    delivered: <CheckCircle className="w-5 h-5 text-green-400" />,
    cancelled: <XCircle className="w-5 h-5 text-red-400" />,
  }

  return (
    <div className="min-h-screen bg-ks-darker">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <Link href="/orders" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Semua Order
        </Link>

        <h1 className="text-xl font-display font-bold mb-6">
          Detail Order <span className="text-blue-400">#{order.id.slice(0, 8).toUpperCase()}</span>
        </h1>

        {/* Status */}
        <div className={`flex items-center gap-3 p-4 rounded-xl border mb-6 ${getStatusColor(order.status)}`}>
          {statusIcons[order.status]}
          <div>
            <div className="font-semibold">{getStatusLabel(order.status)}</div>
            <div className="text-xs opacity-70">
              {order.status === 'pending' && 'Menunggu pembayaran dari Anda'}
              {order.status === 'paid' && 'Pembayaran diterima, memproses pengiriman'}
              {order.status === 'delivered' && 'Produk telah dikirimkan'}
              {order.status === 'cancelled' && 'Order dibatalkan'}
            </div>
          </div>
        </div>

        {/* Pay button for pending */}
        {order.status === 'pending' && order.paymentUrl && (
          <a
            href={order.paymentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3.5 mb-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-center hover:scale-[1.01] transition-all"
          >
            Bayar Sekarang → {formatCurrency(order.amount)}
          </a>
        )}

        {/* Order Info */}
        <div className="bg-ks-surface border border-ks-border rounded-2xl p-6 mb-6">
          <h2 className="font-semibold mb-4 text-sm text-gray-300 uppercase tracking-wide">Info Order</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Produk</span><span className="font-medium text-right max-w-48 truncate">{order.productName}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold text-blue-400">{formatCurrency(order.amount)}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Tanggal</span><span>{formatDate(order.createdAt as string)}</span></div>
            {order.paidAt && (
              <div className="flex justify-between"><span className="text-gray-500">Dibayar</span><span>{formatDate(order.paidAt as string)}</span></div>
            )}
          </div>
        </div>

        {/* Delivery Content */}
        {order.status === 'delivered' && order.deliveryContent && (
          <div className="bg-ks-surface border border-green-500/20 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-green-400 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Detail Produk / Akun
              </h2>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(order.deliveryContent || '')
                  toast.success('Disalin!')
                }}
                className="flex items-center gap-1.5 text-gray-500 hover:text-gray-300 text-xs"
              >
                <Copy className="w-3.5 h-3.5" /> Salin
              </button>
            </div>
            <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed bg-ks-darker rounded-xl p-4 border border-ks-border">
              {order.deliveryContent}
            </pre>
          </div>
        )}
      </div>
    </div>
  )
}
