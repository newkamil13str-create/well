// apps/web/app/(dashboard)/admin/produk/tambah/page.tsx
import ProductForm from '@/components/admin/ProductForm'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function TambahProdukPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/produk" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ChevronLeft size={16} /> Kembali ke Produk
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Tambah Produk Baru</h1>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <ProductForm />
      </div>
    </div>
  )
}
