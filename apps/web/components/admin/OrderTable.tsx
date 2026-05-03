// apps/web/components/admin/OrderTable.tsx
'use client'
import { useState } from 'react'
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR, type Order, type OrderStatus } from '@/types'
import toast from 'react-hot-toast'
import { RefreshCw } from 'lucide-react'

const ALL_STATUS: OrderStatus[] = ['PENDING','PAID','PROCESSING','SHIPPED','DONE','CANCELLED']

export default function OrderTable({ orders: initial }: { orders: Order[] }) {
  const [orders, setOrders] = useState(initial)
  const [loading, setLoading] = useState<string | null>(null)

  const updateStatus = async (orderId: string, status: OrderStatus) => {
    setLoading(orderId)
    try {
      const res = await fetch(`/api/order/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Gagal update')
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status } : o))
      )
      toast.success('Status diperbarui!')
    } catch {
      toast.error('Gagal update status')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          <tr>
            {['Invoice', 'Pelanggan', 'Total', 'Metode', 'Status', 'Tanggal', 'Aksi'].map((h) => (
              <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50">
              <td className="px-4 py-3">
                <code className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {order.invoiceId.slice(0, 12)}...
                </code>
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-800">{order.namaLengkap}</div>
                <div className="text-xs text-gray-400">{order.noWhatsapp}</div>
              </td>
              <td className="px-4 py-3 font-semibold text-gray-800">
                Rp {order.totalHarga.toLocaleString('id-ID')}
              </td>
              <td className="px-4 py-3">
                <span className="uppercase text-xs font-medium text-gray-600">
                  {order.metodePembayaran || '-'}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLOR[order.status]}`}>
                  {ORDER_STATUS_LABEL[order.status]}
                </span>
              </td>
              <td className="px-4 py-3 text-xs text-gray-400">
                {new Date(order.createdAt).toLocaleDateString('id-ID', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)}
                    disabled={loading === order.id}
                    className="text-xs border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {ALL_STATUS.map((s) => (
                      <option key={s} value={s}>{ORDER_STATUS_LABEL[s]}</option>
                    ))}
                  </select>
                  {loading === order.id && (
                    <RefreshCw size={12} className="animate-spin text-blue-500" />
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && (
        <div className="text-center py-12 text-gray-400">Belum ada pesanan</div>
      )}
    </div>
  )
}
