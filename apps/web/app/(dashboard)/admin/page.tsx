// apps/web/app/(dashboard)/admin/page.tsx
import { prisma } from '@/lib/prisma'
import { ShoppingBag, Package, Users, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export default async function AdminDashboard() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    totalProduk, totalOrder, orderPending, orderPaid,
    totalUser, pendapatanHariIni, pendapatanTotal,
    orderTerbaru,
  ] = await Promise.all([
    prisma.produk.count({ where: { aktif: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'PAID' } }),
    prisma.user.count(),
    prisma.order.aggregate({
      where: { status: { in: ['PAID','PROCESSING','SHIPPED','DONE'] }, paidAt: { gte: today } },
      _sum: { totalHarga: true },
    }),
    prisma.order.aggregate({
      where: { status: { in: ['PAID','PROCESSING','SHIPPED','DONE'] } },
      _sum: { totalHarga: true },
    }),
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { items: { include: { produk: true } } },
    }),
  ])

  const stats = [
    { label: 'Total Pendapatan', value: `Rp ${(pendapatanTotal._sum.totalHarga || 0).toLocaleString('id-ID')}`, icon: TrendingUp, color: 'bg-green-500', sub: 'semua waktu' },
    { label: 'Pendapatan Hari Ini', value: `Rp ${(pendapatanHariIni._sum.totalHarga || 0).toLocaleString('id-ID')}`, icon: TrendingUp, color: 'bg-blue-500', sub: 'hari ini' },
    { label: 'Total Order', value: totalOrder.toLocaleString(), icon: ShoppingBag, color: 'bg-purple-500', sub: `${orderPending} pending · ${orderPaid} dibayar` },
    { label: 'Produk Aktif', value: totalProduk.toLocaleString(), icon: Package, color: 'bg-orange-500', sub: 'tampil di toko' },
    { label: 'Total Pengguna', value: totalUser.toLocaleString(), icon: Users, color: 'bg-indigo-500', sub: 'terdaftar' },
    { label: 'Order Pending', value: orderPending.toLocaleString(), icon: Clock, color: 'bg-yellow-500', sub: 'menunggu bayar' },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Selamat datang di KamilShop Admin Panel</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{s.value}</p>
                <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
              </div>
              <div className={`${s.color} p-2.5 rounded-xl`}>
                <s.icon size={20} className="text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Order terbaru */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Order Terbaru</h2>
          <a href="/admin/pesanan" className="text-blue-600 text-sm hover:underline">Lihat semua</a>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {['Invoice','Pelanggan','Total','Status'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orderTerbaru.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-5 py-3">
                  <code className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {o.invoiceId.slice(0, 10)}...
                  </code>
                </td>
                <td className="px-5 py-3 text-gray-700">{o.namaLengkap}</td>
                <td className="px-5 py-3 font-medium">Rp {o.totalHarga.toLocaleString('id-ID')}</td>
                <td className="px-5 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    o.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    o.status === 'PAID' ? 'bg-blue-100 text-blue-700' :
                    o.status === 'DONE' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {o.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orderTerbaru.length === 0 && (
          <p className="text-center py-8 text-gray-400">Belum ada order</p>
        )}
      </div>
    </div>
  )
}
