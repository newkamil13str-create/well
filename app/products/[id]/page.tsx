'use client'
// app/products/[id]/page.tsx
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { Product, CATEGORY_LABELS, CATEGORY_ICONS } from '@/types'
import { formatCurrency } from '@/lib/utils'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ArrowLeft, Zap, Package, CheckCircle, ShoppingCart, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [buying, setBuying] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => setUser(u))
    return unsub
  }, [])

  useEffect(() => {
    if (id) fetchProduct()
  }, [id])

  async function fetchProduct() {
    try {
      const res = await fetch(`/api/products/${id}`)
      const data = await res.json()
      if (data.success) setProduct(data.data)
    } catch {}
    finally { setLoading(false) }
  }

  async function handleBuy() {
    if (!user) {
      toast.error('Anda harus login untuk membeli produk')
      router.push(`/login?redirect=/products/${id}`)
      return
    }
    router.push(`/checkout/${id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ks-darker">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-24 pb-20">
          <div className="skeleton h-64 rounded-2xl mb-8" />
          <div className="space-y-3">
            <div className="skeleton h-8 rounded w-3/4" />
            <div className="skeleton h-4 rounded w-full" />
            <div className="skeleton h-4 rounded w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-ks-darker flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-400 mb-4">Produk tidak ditemukan</h2>
          <Link href="/products" className="text-blue-400 hover:underline">Lihat semua produk</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ks-darker">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <Link href="/products" className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Kembali ke Produk
        </Link>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Image */}
          <div className="md:col-span-2">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-ks-surface border border-ks-border">
              {product.thumbnail ? (
                <Image src={product.thumbnail} alt={product.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">
                  {CATEGORY_ICONS[product.category]}
                </div>
              )}
              {product.deliveryType === 'auto' && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500 text-white text-sm font-semibold">
                  <Zap className="w-3.5 h-3.5" fill="white" /> Auto Delivery
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-3 flex flex-col">
            <div className="text-sm text-blue-400 font-medium mb-2">
              {CATEGORY_ICONS[product.category]} {CATEGORY_LABELS[product.category]}
            </div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold mb-4">{product.name}</h1>
            <p className="text-gray-400 leading-relaxed mb-6">{product.description}</p>

            {/* Features */}
            {product.features?.length > 0 && (
              <div className="mb-6">
                <h3 className="font-semibold mb-3 text-sm text-gray-300">Fitur Produk:</h3>
                <ul className="space-y-2">
                  {product.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-auto">
              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-gray-500 line-through text-lg">{formatCurrency(product.originalPrice)}</span>
                )}
                <span className="text-3xl font-display font-bold gradient-text">{formatCurrency(product.price)}</span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-green-400 text-sm font-semibold">
                    Hemat {Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>

              {/* Stock info */}
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Package className="w-4 h-4" />
                {product.stock > 0 ? (
                  <span>Stok tersedia: <span className="text-white font-medium">{product.stock} unit</span></span>
                ) : (
                  <span className="text-red-400">Stok habis</span>
                )}
              </div>

              {/* Buy button */}
              <button
                onClick={handleBuy}
                disabled={product.stock === 0 || buying}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {buying ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Memproses...</>
                ) : product.stock === 0 ? (
                  'Stok Habis'
                ) : (
                  <><ShoppingCart className="w-5 h-5" /> Beli Sekarang</>
                )}
              </button>

              {!user && (
                <p className="text-center text-gray-500 text-sm mt-3">
                  <Link href="/login" className="text-blue-400 hover:underline">Login</Link> untuk membeli
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
