// apps/web/app/(dashboard)/admin/pengguna/page.tsx
import { prisma } from '@/lib/prisma'
import { Users } from 'lucide-react'

export default async function AdminPenggunaPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { orders: true } } },
  })

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Pengguna</h1>
        <p className="text-sm text-gray-500">{users.length} pengguna terdaftar</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Nama', 'Email', 'WhatsApp', 'Role', 'Total Order', 'Bergabung'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                      {u.nama[0].toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-800">{u.nama}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-gray-600">{u.email}</td>
                <td className="px-5 py-4 text-gray-600">{u.noWhatsapp || '-'}</td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-700">{u._count.orders} pesanan</td>
                <td className="px-5 py-4 text-gray-400 text-xs">
                  {new Date(u.createdAt).toLocaleDateString('id-ID', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Users size={48} className="mx-auto mb-3 text-gray-200" />
            <p>Belum ada pengguna</p>
          </div>
        )}
      </div>
    </div>
  )
}
