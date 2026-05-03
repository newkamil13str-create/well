// apps/web/app/(dashboard)/admin/pesanan/page.tsx
import { prisma } from '@/lib/prisma'
import OrderTable from '@/components/admin/OrderTable'

export default async function AdminPesananPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const orders = await prisma.order.findMany({
    where: searchParams.status ? { status: searchParams.status as any } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { user: true, items: { include: { produk: true } } },
  })

  const counts = await prisma.order.groupBy({
    by: ['status'],
    _count: { status: true },
  })

  const statusCount = Object.fromEntries(counts.map((c) => [c.status, c._count.status]))

  const tabs = [
    { label: 'Semua', value: '', count: orders.length },
    { label: 'Pending', value: 'PENDING', count: statusCount['PENDING'] || 0 },
    { label: 'Dibayar', value: 'PAID', count: statusCount['PAID'] || 0 },
    { label: 'Proses', value: 'PROCESSING', count: statusCount['PROCESSING'] || 0 },
    { label: 'Dikirim', value: 'SHIPPED', count: statusCount['SHIPPED'] || 0 },
    { label: 'Selesai', value: 'DONE', count: statusCount['DONE'] || 0 },
    { label: 'Batal', value: 'CANCELLED', count: statusCount['CANCELLED'] || 0 },
  ]

  return (
    <div className="p-6 space-y-5">
      <h1 className="text-2xl font-bold text-gray-800">Kelola Pesanan</h1>

      {/* Tab filter */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((t) => (
          <a
            key={t.value}
            href={t.value ? `?status=${t.value}` : '/admin/pesanan'}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition ${
              (searchParams.status || '') === t.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {t.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
              (searchParams.status || '') === t.value ? 'bg-blue-500' : 'bg-gray-100 text-gray-500'
            }`}>
              {t.count}
            </span>
          </a>
        ))}
      </div>

      <OrderTable orders={orders as any} />
    </div>
  )
}
