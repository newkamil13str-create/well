// apps/web/app/(dashboard)/admin/produk/edit/[id]/page.tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default async function EditProdukPage({ params }: { params: { id: string } }) {
  const produk = await prisma.produk.findUnique({ where: { id: params.id } })
  if (!produk) notFound()

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/produk" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ChevronLeft size={16} /> Kembali ke Produk
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Edit Produk</h1>
        <p className="text-gray-500 text-sm mt-1">{produk.nama}</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <ProductForm initialData={produk} />
      </div>
    </div>
  )
}
