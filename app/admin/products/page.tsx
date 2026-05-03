'use client'
// app/admin/products/page.tsx
import { useState, useEffect } from 'react'
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, doc, updateDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { Product, CATEGORY_LABELS, ProductCategory } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Loader2, X, Search } from 'lucide-react'
import toast from 'react-hot-toast'

const emptyProduct = {
  name: '', description: '', price: 0, originalPrice: 0,
  category: 'hosting-web' as ProductCategory,
  thumbnail: '', deliveryType: 'auto' as 'auto' | 'manual',
  deliveryContent: '', stock: 1, isActive: true, isFeatured: false,
  features: [] as string[],
}

export default function AdminProductsPage() {
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState(emptyProduct)
  const [featureInput, setFeatureInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/admin'); return }
      fetchProducts()
    })
    return unsub
  }, [router])

  async function fetchProducts() {
    const snap = await getDocs(collection(db, 'products'))
    setProducts(snap.docs.map(d => ({ ...d.data(), id: d.id } as Product)))
    setLoading(false)
  }

  function openAdd() { setEditing(null); setForm(emptyProduct); setShowModal(true) }
  function openEdit(p: Product) {
    setEditing(p)
    setForm({ name: p.name, description: p.description, price: p.price, originalPrice: p.originalPrice || 0, category: p.category, thumbnail: p.thumbnail || '', deliveryType: p.deliveryType, deliveryContent: p.deliveryContent || '', stock: p.stock, isActive: p.isActive, isFeatured: p.isFeatured || false, features: p.features || [] })
    setShowModal(true)
  }

  async function saveProduct() {
    if (!form.name || !form.description || form.price <= 0) return toast.error('Nama, deskripsi, dan harga wajib diisi')
    setSaving(true)
    try {
      const data = { ...form, updatedAt: serverTimestamp() }
      if (editing) {
        await updateDoc(doc(db, 'products', editing.id), data)
        toast.success('Produk diperbarui')
      } else {
        await addDoc(collection(db, 'products'), { ...data, createdAt: serverTimestamp() })
        toast.success('Produk ditambahkan')
      }
      setShowModal(false)
      fetchProducts()
    } catch { toast.error('Gagal menyimpan') }
    finally { setSaving(false) }
  }

  async function toggleActive(p: Product) {
    await updateDoc(doc(db, 'products', p.id), { isActive: !p.isActive })
    setProducts(prev => prev.map(x => x.id === p.id ? { ...x, isActive: !x.isActive } : x))
    toast.success(p.isActive ? 'Produk dinonaktifkan' : 'Produk diaktifkan')
  }

  async function deleteProduct(p: Product) {
    if (!confirm(`Hapus produk "${p.name}"?`)) return
    await deleteDoc(doc(db, 'products', p.id))
    setProducts(prev => prev.filter(x => x.id !== p.id))
    toast.success('Produk dihapus')
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchCat = !filterCat || p.category === filterCat
    return matchSearch && matchCat
  })

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-bold">Manajemen Produk</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold">
          <Plus className="w-4 h-4" /> Tambah Produk
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari produk..." className="w-full pl-9 pr-4 py-2.5 bg-ks-surface border border-ks-border rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50" />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="px-3 py-2.5 bg-ks-surface border border-ks-border rounded-xl text-sm text-white focus:outline-none">
          <option value="">Semua Kategori</option>
          {Object.entries(CATEGORY_LABELS).map(([s, l]) => <option key={s} value={s}>{l}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : (
        <div className="bg-ks-surface border border-ks-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-ks-border">
              <tr className="text-gray-500 text-xs uppercase">
                <th className="text-left p-4">Produk</th>
                <th className="text-left p-4 hidden sm:table-cell">Kategori</th>
                <th className="text-left p-4 hidden md:table-cell">Harga</th>
                <th className="text-left p-4 hidden md:table-cell">Stok</th>
                <th className="text-left p-4">Status</th>
                <th className="text-right p-4">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ks-border">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-white/2">
                  <td className="p-4">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">{p.description}</div>
                  </td>
                  <td className="p-4 hidden sm:table-cell">
                    <span className="text-xs text-gray-400">{CATEGORY_LABELS[p.category]}</span>
                  </td>
                  <td className="p-4 hidden md:table-cell font-semibold text-blue-400">{formatCurrency(p.price)}</td>
                  <td className="p-4 hidden md:table-cell">
                    <span className={p.stock === 0 ? 'text-red-400' : p.stock <= 5 ? 'text-yellow-400' : 'text-green-400'}>{p.stock}</span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => toggleActive(p)}>
                      {p.isActive
                        ? <ToggleRight className="w-6 h-6 text-green-400" />
                        : <ToggleLeft className="w-6 h-6 text-gray-600" />}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteProduct(p)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-500">Tidak ada produk ditemukan</div>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-ks-surface border border-ks-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-ks-border">
              <h2 className="font-display font-bold">{editing ? 'Edit Produk' : 'Tambah Produk'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 mb-1.5 block">Nama Produk *</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-ks-darker border border-ks-border rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50" placeholder="Nama produk" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Harga *</label>
                  <input type="number" value={form.price} onChange={e => setForm({ ...form, price: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-ks-darker border border-ks-border rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50" placeholder="0" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Harga Asli (coret)</label>
                  <input type="number" value={form.originalPrice} onChange={e => setForm({ ...form, originalPrice: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-ks-darker border border-ks-border rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50" placeholder="0" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Kategori</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value as ProductCategory })} className="w-full px-4 py-2.5 bg-ks-darker border border-ks-border rounded-xl text-white text-sm focus:outline-none">
                    {Object.entries(CATEGORY_LABELS).map(([s, l]) => <option key={s} value={s}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Stok</label>
                  <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: Number(e.target.value) })} className="w-full px-4 py-2.5 bg-ks-darker border border-ks-border rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block">Tipe Delivery</label>
                  <select value={form.deliveryType} onChange={e => setForm({ ...form, deliveryType: e.target.value as 'auto' | 'manual' })} className="w-full px-4 py-2.5 bg-ks-darker border border-ks-border rounded-xl text-white text-sm focus:outline-none">
                    <option value="auto">Auto (otomatis)</option>
                    <option value="manual">Manual (admin)</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 mb-1.5 block">URL Thumbnail</label>
                  <input value={form.thumbnail} onChange={e => setForm({ ...form, thumbnail: e.target.value })} className="w-full px-4 py-2.5 bg-ks-darker border border-ks-border rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50" placeholder="https://..." />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 mb-1.5 block">Deskripsi *</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 bg-ks-darker border border-ks-border rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50 resize-none" placeholder="Deskripsi produk..." />
                </div>
                {form.deliveryType === 'auto' && (
                  <div className="col-span-2">
                    <label className="text-xs text-gray-400 mb-1.5 block">Konten Delivery (auto)</label>
                    <textarea value={form.deliveryContent} onChange={e => setForm({ ...form, deliveryContent: e.target.value })} rows={4} className="w-full px-4 py-2.5 bg-ks-darker border border-ks-border rounded-xl text-white text-sm font-mono focus:outline-none focus:border-blue-500/50 resize-none" placeholder="Email: xxx&#10;Password: xxx&#10;..." />
                  </div>
                )}
                <div className="col-span-2">
                  <label className="text-xs text-gray-400 mb-1.5 block">Fitur Produk</label>
                  <div className="flex gap-2 mb-2">
                    <input value={featureInput} onChange={e => setFeatureInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); if (featureInput.trim()) { setForm({ ...form, features: [...form.features, featureInput.trim()] }); setFeatureInput('') } } }} className="flex-1 px-4 py-2 bg-ks-darker border border-ks-border rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50" placeholder="Tambah fitur, tekan Enter" />
                    <button onClick={() => { if (featureInput.trim()) { setForm({ ...form, features: [...form.features, featureInput.trim()] }); setFeatureInput('') } }} className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl text-sm">Tambah</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {form.features.map((f, i) => (
                      <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-ks-darker rounded-full text-xs text-gray-300 border border-ks-border">
                        {f}
                        <button onClick={() => setForm({ ...form, features: form.features.filter((_, j) => j !== i) })} className="text-gray-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex gap-3 p-6 border-t border-ks-border">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-ks-border text-gray-400 hover:text-white text-sm transition-colors">Batal</button>
              <button onClick={saveProduct} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan...</> : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
