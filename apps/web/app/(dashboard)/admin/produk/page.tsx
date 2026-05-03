// apps/web/app/(dashboard)/admin/produk/page.tsx
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Plus, Pencil, Package } from 'lucide-react'
import DeleteProductButton from '@/components/admin/DeleteProductButton'

export default async function AdminProdukPage() {
  const produk = await prisma.produk.findMany({
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Produk</h1>
          <p className="text-sm text-gray-500">{produk.length} produk terdaftar</p>
        </div>
        <Link
          href="/admin/produk/tambah"
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition"
        >
          <Plus size={18} /> Tambah Produk
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              {['Produk', 'Harga', 'Stok', 'Kategori', 'Status', 'Aksi'].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {produk.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      {p.gambar[0] ? (
                        <Image src={p.gambar[0]} alt={p.nama} fill className="object-cover" />
                      ) : (
                        <Package size={24} className="absolute inset-0 m-auto text-gray-300" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 line-clamp-1">{p.nama}</p>
                      <p className="text-xs text-gray-400 font-mono">{p.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 font-semibold text-gray-800">
                  Rp {p.harga.toLocaleString('id-ID')}
                </td>
                <td className="px-5 py-4">
                  {p.stok === null ? (
                    <span className="text-green-600 font-medium">∞ Unlimited</span>
                  ) : p.stok === 0 ? (
                    <span className="text-red-500 font-medium">Habis</span>
                  ) : (
                    <span className="text-gray-700">{p.stok} pcs</span>
                  )}
                </td>
                <td className="px-5 py-4">
                  {p.kategori ? (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">{p.kategori}</span>
                  ) : <span className="text-gray-300">-</span>}
                </td>
                <td className="px-5 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    p.aktif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {p.aktif ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Link href={`/admin/produk/edit/${p.id}`}
                      className="flex items-center gap-1 px-3 py-1.5 border rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                      <Pencil size={12} /> Edit
                    </Link>
                    <DeleteProductButton id={p.id} nama={p.nama} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {produk.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Package size={48} className="mx-auto mb-3 text-gray-200" />
            <p>Belum ada produk</p>
            <Link href="/admin/produk/tambah" className="mt-3 inline-block text-blue-600 hover:underline text-sm">
              Tambah produk pertama
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
