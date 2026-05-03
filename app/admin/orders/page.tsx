'use client'
// app/admin/orders/page.tsx
import { useState, useEffect } from 'react'
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, doc, updateDoc, serverTimestamp, orderBy, query } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { Order } from '@/types'
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from '@/lib/utils'
import { Search, Eye, Send, X, Loader2, Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [deliverModal, setDeliverModal] = useState<Order | null>(null)
  const [deliveryContent, setDeliveryContent] = useState('')
  const [delivering, setDelivering] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/admin'); return }
      fetchOrders()
    })
    return unsub
  }, [router])

  async function fetchOrders() {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'))
    const snap = await getDocs(q)
    setOrders(snap.docs.map(d => ({ ...d.data(), id: d.id } as Order)))
    setLoading(false)
  }

  async function manualDeliver() {
    if (!deliverModal || !deliveryContent.trim()) return toast.error('Isi konten delivery')
    setDelivering(true)
    try {
      const token = await auth.currentUser?.getIdToken()
      const res = await fetch('/api/admin/orders/deliver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ orderId: deliverModal.id, deliveryContent }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Order berhasil dikirim')
        setDeliverModal(null)
        fetchOrders()
      } else toast.error(data.error || 'Gagal')
    } catch { toast.error('Terjadi kesalahan') }
    finally { setDelivering(false) }
  }

  async function cancelOrder(orderId: string) {
    if (!confirm('Cancel order ini?')) return
    await updateDoc(doc(db, 'orders', orderId), { status: 'cancelled' })
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o))
    toast.success('Order dibatalkan')
  }

  function exportCSV() {
    const rows = [
      ['ID', 'User', 'Email', 'Produk', 'Nominal', 'Status', 'Tanggal'],
      ...filtered.map(o => [o.id, o.userName, o.userEmail, o.productName, o.amount, o.status, formatDate(o.createdAt as string)])
    ]
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `orders-${Date.now()}.csv`; a.click()
  }

  const filtered = orders.filter(o => {
    const matchSearch = o.productName?.toLowerCase().includes(search.toLowerCase()) ||
      o.userName?.toLowerCase().includes(search.toLowerCase()) ||
      o.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
      o.id.includes(search)
    const matchStatus = !filterStatus || o.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-bold">Manajemen Order</h1>
        <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-ks-border text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari order, user, email..." className="w-full pl-9 pr-4 py-2.5 bg-ks-surface border border-ks-border rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2.5 bg-ks-surface border border-ks-border rounded-xl text-sm text-white focus:outline-none">
          <option value="">Semua Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-ks-surface border border-ks-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-ks-border">
            <tr className="text-gray-500 text-xs uppercase">
              <th className="text-left p-4">Order</th>
              <th className="text-left p-4 hidden md:table-cell">User</th>
              <th className="text-left p-4 hidden lg:table-cell">Nominal</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ks-border">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}><td colSpan={5} className="p-4"><div className="skeleton h-4 rounded" /></td></tr>
              ))
            ) : filtered.map(order => (
              <tr key={order.id} className="hover:bg-white/2">
                <td className="p-4">
                  <div className="font-medium text-xs font-mono text-gray-400 mb-0.5">#{order.id.slice(0, 8).toUpperCase()}</div>
                  <div className="font-medium">{order.productName}</div>
                  <div className="text-xs text-gray-500">{formatDate(order.createdAt as string)}</div>
                </td>
                <td className="p-4 hidden md:table-cell">
                  <div className="text-sm">{order.userName}</div>
                  <div className="text-xs text-gray-500">{order.userEmail}</div>
                  <div className="text-xs text-blue-400 font-mono">{order.userUniqueId}</div>
                </td>
                <td className="p-4 hidden lg:table-cell font-semibold text-blue-400">{formatCurrency(order.amount)}</td>
                <td className="p-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    {(order.status === 'paid') && (
                      <button onClick={() => { setDeliverModal(order); setDeliveryContent('') }} className="p-1.5 rounded-lg hover:bg-blue-500/10 text-gray-400 hover:text-blue-400 transition-colors" title="Manual Deliver">
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    {order.status === 'pending' && (
                      <button onClick={() => cancelOrder(order.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors" title="Cancel">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">Tidak ada order</div>
        )}
      </div>

      {/* Manual Deliver Modal */}
      {deliverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-ks-surface border border-ks-border rounded-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-ks-border">
              <h2 className="font-bold">Manual Deliver</h2>
              <button onClick={() => setDeliverModal(null)}><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-400 mb-4">Order: <span className="text-white font-medium">{deliverModal.productName}</span> — {deliverModal.userName}</p>
              <label className="text-xs text-gray-400 mb-2 block">Konten Delivery</label>
              <textarea value={deliveryContent} onChange={e => setDeliveryContent(e.target.value)} rows={6} className="w-full px-4 py-3 bg-ks-darker border border-ks-border rounded-xl text-white text-sm font-mono focus:outline-none focus:border-blue-500/50 resize-none" placeholder="Email: xxx@gmail.com&#10;Password: abc123&#10;..." />
            </div>
            <div className="flex gap-3 p-6 border-t border-ks-border">
              <button onClick={() => setDeliverModal(null)} className="flex-1 py-2.5 rounded-xl border border-ks-border text-gray-400 text-sm">Batal</button>
              <button onClick={manualDeliver} disabled={delivering} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {delivering ? <><Loader2 className="w-4 h-4 animate-spin" />Mengirim...</> : <><Send className="w-4 h-4" />Kirim</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
