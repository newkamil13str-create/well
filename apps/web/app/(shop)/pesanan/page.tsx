// apps/web/app/(shop)/pesanan/page.tsx
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '@/types'
import { Package, ChevronRight } from 'lucide-react'

export default async function PesananPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const orders = await prisma.order.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { produk: true } } },
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">📦 Riwayat Pesanan</h1>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package size={64} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 mb-4">Belum ada pesanan</p>
            <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
              Mulai Belanja
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <code className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded font-mono">
                      {order.invoiceId}
                    </code>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'long', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS_COLOR[order.status]}`}>
                    {ORDER_STATUS_LABEL[order.status]}
                  </span>
                </div>

                {/* Items preview */}
                <div className="space-y-1 mb-3">
                  {order.items.slice(0, 2).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm text-gray-600">
                      <span>{item.produk.nama} x{item.qty}</span>
                      <span>Rp {item.subtotal.toLocaleString('id-ID')}</span>
                    </div>
                  ))}
                  {order.items.length > 2 && (
                    <p className="text-xs text-gray-400">+{order.items.length - 2} item lainnya</p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div>
                    <span className="text-sm text-gray-500">Total: </span>
                    <span className="font-bold text-gray-800">
                      Rp {order.totalHarga.toLocaleString('id-ID')}
                    </span>
                    {order.metodePembayaran && (
                      <span className="ml-2 text-xs text-gray-400 uppercase">
                        ({order.metodePembayaran})
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/pesanan/${order.invoiceId}`}
                    className="flex items-center gap-1 text-blue-600 text-sm font-medium hover:underline"
                  >
                    Detail <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
