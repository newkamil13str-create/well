// apps/web/components/admin/ProductForm.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Upload, Link as LinkIcon, X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProductForm({ initialData }: { initialData?: any }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url')
  const [imageUrl, setImageUrl] = useState('')
  const [images, setImages] = useState<string[]>(initialData?.gambar || [])
  const [uploadingImage, setUploadingImage] = useState(false)

  const [form, setForm] = useState({
    nama: initialData?.nama || '',
    harga: initialData?.harga || '',
    stok: initialData?.stok ?? '',
    deskripsi: initialData?.deskripsi || '',
    kategori: initialData?.kategori || '',
    aktif: initialData?.aktif ?? true,
  })

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }))

  const handleAddImageUrl = async () => {
    if (!imageUrl.trim()) return toast.error('Masukkan URL gambar')
    setUploadingImage(true)
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setImages((prev) => [...prev, data.url])
      setImageUrl('')
      toast.success('Gambar ditambahkan!')
    } catch (err: any) {
      toast.error(err.message || 'Gagal upload gambar')
    } finally {
      setUploadingImage(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) return toast.error('Ukuran file maksimal 5MB')
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setImages((prev) => [...prev, data.url])
      toast.success('Gambar diupload!')
    } catch (err: any) {
      toast.error(err.message || 'Gagal upload')
    } finally {
      setUploadingImage(false)
      e.target.value = ''
    }
  }

  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (images.length === 0) return toast.error('Tambahkan minimal 1 gambar!')
    setLoading(true)
    try {
      const method = initialData?.id ? 'PUT' : 'POST'
      const url = initialData?.id ? `/api/produk/${initialData.id}` : '/api/produk'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          harga: Number(form.harga),
          stok: form.stok === '' ? null : Number(form.stok),
          gambar: images,
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || 'Gagal menyimpan')
      }
      toast.success(initialData?.id ? 'Produk diupdate!' : 'Produk ditambahkan!')
      router.push('/admin/produk')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Nama */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk *</label>
        <input required value={form.nama} onChange={(e) => set('nama', e.target.value)}
          className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Nama produk" />
      </div>

      {/* Harga */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp) *</label>
        <input required type="number" min={0} value={form.harga} onChange={(e) => set('harga', e.target.value)}
          className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0" />
      </div>

      {/* Stok */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stok <span className="text-gray-400 font-normal">(kosongkan = unlimited)</span>
        </label>
        <input type="number" min={0} value={form.stok} onChange={(e) => set('stok', e.target.value)}
          className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Kosongkan jika unlimited" />
      </div>

      {/* Kategori */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
        <input value={form.kategori} onChange={(e) => set('kategori', e.target.value)}
          className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Elektronik, Fashion, dll" />
      </div>

      {/* Deskripsi */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi *</label>
        <textarea required rows={6} value={form.deskripsi} onChange={(e) => set('deskripsi', e.target.value)}
          className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          placeholder="Deskripsi lengkap produk..." />
      </div>

      {/* Status aktif */}
      <div className="flex items-center gap-3">
        <input type="checkbox" id="aktif" checked={form.aktif} onChange={(e) => set('aktif', e.target.checked)}
          className="w-4 h-4 text-blue-600 rounded" />
        <label htmlFor="aktif" className="text-sm font-medium text-gray-700">
          Produk aktif (tampil di toko)
        </label>
      </div>

      {/* Upload gambar */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Gambar Produk * <span className="text-gray-400 font-normal">(min 1 gambar)</span>
        </label>

        {/* Toggle mode */}
        <div className="flex gap-2 mb-3">
          <button type="button" onClick={() => setImageMode('url')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition ${
              imageMode === 'url' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}>
            <LinkIcon size={14} /> Via URL
          </button>
          <button type="button" onClick={() => setImageMode('upload')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition ${
              imageMode === 'upload' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}>
            <Upload size={14} /> Upload File
          </button>
        </div>

        {imageMode === 'url' ? (
          <div className="flex gap-2">
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example.com/gambar.jpg" />
            <button type="button" onClick={handleAddImageUrl} disabled={uploadingImage}
              className="px-4 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center gap-1.5">
              {uploadingImage ? <Loader2 size={14} className="animate-spin" /> : null}
              Tambah
            </button>
          </div>
        ) : (
          <div className={`border-2 border-dashed rounded-lg p-6 text-center transition ${
            uploadingImage ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          }`}>
            {uploadingImage ? (
              <div className="flex flex-col items-center gap-2 text-blue-600">
                <Loader2 size={24} className="animate-spin" />
                <p className="text-sm">Mengupload...</p>
              </div>
            ) : (
              <>
                <Upload size={24} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-2">Pilih file gambar</p>
                <input type="file" accept="image/*" onChange={handleFileUpload}
                  className="text-sm text-gray-600 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white file:text-sm file:cursor-pointer" />
                <p className="text-xs text-gray-400 mt-2">PNG, JPG, WebP — Maks 5MB</p>
              </>
            )}
          </div>
        )}

        {/* Preview gambar */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-3">
            {images.map((img, i) => (
              <div key={i} className="relative group">
                <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-gray-200">
                  <Image src={img} alt="" fill className="object-cover" />
                </div>
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                    Utama
                  </span>
                )}
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition shadow">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.back()}
          className="px-6 py-3 border rounded-xl text-gray-600 hover:bg-gray-50 font-medium">
          Batal
        </button>
        <button type="submit" disabled={loading || images.length === 0}
          className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Menyimpan...' : initialData?.id ? 'Update Produk' : 'Tambah Produk'}
        </button>
      </div>
    </form>
  )
}
