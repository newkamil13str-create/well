// apps/web/components/admin/DeleteProductButton.tsx
'use client'
import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function DeleteProductButton({ id, nama }: { id: string; nama: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm(`Hapus produk "${nama}"?\nTindakan ini tidak bisa dibatalkan.`)) return
    setLoading(true)
    try {
      const res = await fetch(`/api/produk/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus')
      toast.success('Produk dihapus!')
      router.refresh()
    } catch {
      toast.error('Gagal menghapus produk')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs hover:bg-red-50 disabled:opacity-50"
    >
      <Trash2 size={12} />
      {loading ? '...' : 'Hapus'}
    </button>
  )
}
