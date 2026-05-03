'use client'
// app/products/page.tsx
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { Product, ProductCategory, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Search, Filter, Zap, Package } from 'lucide-react'

export default function ProductsPage() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>(searchParams.get('category') || '')

  useEffect(() => {
    fetchProducts()
  }, [category])

  async function fetchProducts() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category) params.set('category', category)
      const res = await fetch(`/api/products?${params}`)
      const data = await res.json()
      if (data.success) setProducts(data.data)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-ks-darker">
      <Navbar />
      <div className="pt-20 pb-20">
        {/* Header */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <h1 className="text-3xl sm:text-4xl font-display font-bold mb-2">
            {category ? CATEGORY_LABELS[category as ProductCategory] : 'Semua Produk'}
          </h1>
          <p className="text-gray-500">Temukan produk digital terbaik untuk kebutuhan Anda</p>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Cari produk..."
                className="w-full pl-10 pr-4 py-3 bg-ks-surface border border-ks-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
              />
            </div>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="px-4 py-3 bg-ks-surface border border-ks-border rounded-xl text-white focus:outline-none focus:border-blue-500/50 transition-all"
            >
              <option value="">Semua Kategori</option>
              {Object.entries(CATEGORY_LABELS).map(([slug, label]) => (
                <option key={slug} value={slug}>{label}</option>
              ))}
            </select>
          </div>

          {/* Category pills */}
          <div className="flex gap-2 flex-wrap mb-8">
            <button
              onClick={() => setCategory('')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === '' ? 'bg-blue-500 text-white' : 'bg-ks-surface border border-ks-border text-gray-400 hover:text-white'
              }`}
            >
              Semua
            </button>
            {Object.entries(CATEGORY_LABELS).map(([slug, label]) => (
              <button
                key={slug}
                onClick={() => setCategory(slug)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  category === slug ? 'bg-blue-500 text-white' : 'bg-ks-surface border border-ks-border text-gray-400 hover:text-white'
                }`}
              >
                {CATEGORY_ICONS[slug as ProductCategory]} {label}
              </button>
            ))}
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-ks-surface border border-ks-border rounded-2xl overflow-hidden">
                  <div className="skeleton h-48" />
                  <div className="p-5 space-y-3">
                    <div className="skeleton h-4 rounded" />
                    <div className="skeleton h-3 rounded w-2/3" />
                    <div className="skeleton h-8 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-400 mb-2">Tidak ada produk</h3>
              <p className="text-gray-600">Coba ubah filter atau kata kunci pencarian</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-ks-surface border border-ks-border rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all hover:-translate-y-1"
    >
      <div className="relative h-48 bg-ks-darker overflow-hidden">
        {product.thumbnail ? (
          <Image src={product.thumbnail} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">
            {CATEGORY_ICONS[product.category]}
          </div>
        )}
        {product.deliveryType === 'auto' && (
          <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/90 text-white text-xs font-semibold backdrop-blur-sm">
            <Zap className="w-3 h-3" fill="white" /> Auto
          </div>
        )}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-yellow-500/90 text-white text-xs font-semibold">
            Sisa {product.stock}
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-red-400 font-bold text-sm">Habis</span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="text-xs text-blue-400 font-medium mb-1">
          {CATEGORY_ICONS[product.category]} {CATEGORY_LABELS[product.category]}
        </div>
        <h3 className="font-semibold text-sm leading-tight mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors">
          {product.name}
        </h3>
        <p className="text-gray-500 text-xs line-clamp-2 mb-4">{product.description}</p>

        <div className="flex items-center justify-between">
          <div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="text-xs text-gray-600 line-through">{formatCurrency(product.originalPrice)}</div>
            )}
            <div className="font-bold text-lg gradient-text">{formatCurrency(product.price)}</div>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-400 text-xs font-semibold group-hover:bg-blue-500 group-hover:text-white transition-colors">
            Beli
          </div>
        </div>
      </div>
    </Link>
  )
}
