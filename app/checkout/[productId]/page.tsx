'use client'
// app/checkout/[productId]/page.tsx
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { Product, User } from '@/types'
import { formatCurrency } from '@/lib/utils'
import Navbar from '@/components/layout/Navbar'
import { ShoppingCart, Shield, Zap, Loader2, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { CATEGORY_LABELS, CATEGORY_ICONS } from '@/types'

export default function CheckoutPage() {
  const { productId } = useParams()
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push(`/login?redirect=/checkout/${productId}`)
        return
      }
      setUser(firebaseUser)
      const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (userSnap.exists()) setUserData(userSnap.data() as User)
    })
    return unsub
  }, [productId, router])

  useEffect(() => {
    if (productId) fetchProduct()
  }, [productId])

  async function fetchProduct() {
    try {
      const res = await fetch(`/api/products/${productId}`)
      const data = await res.json()
      if (data.success) setProduct(data.data)
      else router.push('/products')
    } catch {
      router.push('/products')
    } finally {
      setLoading(false)
    }
  }

  async function handleCheckout() {
    if (!user || !product || !userData) return
    setProcessing(true)
    try {
      const token = await user.getIdToken()
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: product.id }),
      })
      const data = await res.json()

      if (data.success) {
        toast.success('Order berhasil dibuat! Menuju halaman pembayaran...')
        setTimeout(() => {
          window.location.href = data.data.paymentUrl
        }, 1500)
      } else {
        toast.error(data.error || 'Gagal membuat order')
      }
    } catch {
      toast.error('Terjadi kesalahan, coba lagi')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-ks-darker">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 pt-24 pb-20">
          <div className="skeleton h-80 rounded-2xl" />
        </div>
      </div>
    )
  }

  if (!product) return null

  return (
    <div className="min-h-screen bg-ks-darker">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-24 pb-20">
        <Link href={`/products/${product.id}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-white mb-8 text-sm">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>

        <h1 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
          <ShoppingCart className="w-6 h-6 text-blue-400" />
          Checkout
        </h1>

        {/* Product Summary */}
        <div className="bg-ks-surface border border-ks-border rounded-2xl p-6 mb-6">
          <h2 className="font-semibold mb-4 text-gray-300 text-sm uppercase tracking-wide">Detail Produk</h2>
          <div className="flex gap-4">
            <div className="w-16 h-16 rounded-xl bg-ks-darker border border-ks-border flex items-center justify-center text-3xl flex-shrink-0">
              {CATEGORY_ICONS[product.category]}
            </div>
            <div className="flex-1">
              <div className="text-xs text-blue-400 mb-1">{CATEGORY_LABELS[product.category]}</div>
              <h3 className="font-semibold mb-1">{product.name}</h3>
              <p className="text-gray-500 text-sm line-clamp-2">{product.description}</p>
            </div>
          </div>
          {product.deliveryType === 'auto' && (
            <div className="mt-4 flex items-center gap-2 text-sm text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-2">
              <Zap className="w-4 h-4" fill="currentColor" />
              Auto delivery — produk dikirim otomatis setelah pembayaran
            </div>
          )}
        </div>

        {/* User Info */}
        {userData && (
          <div className="bg-ks-surface border border-ks-border rounded-2xl p-6 mb-6">
            <h2 className="font-semibold mb-4 text-gray-300 text-sm uppercase tracking-wide">Info Pembeli</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Nama</span><span>{userData.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Email</span><span>{userData.email}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">ID</span><span className="font-mono text-blue-400">{userData.uniqueId}</span></div>
            </div>
          </div>
        )}

        {/* Price Summary */}
        <div className="bg-ks-surface border border-ks-border rounded-2xl p-6 mb-6">
          <h2 className="font-semibold mb-4 text-gray-300 text-sm uppercase tracking-wide">Ringkasan Harga</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Harga Produk</span>
              <span>{formatCurrency(product.price)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Biaya Layanan</span>
              <span className="text-green-400">Gratis</span>
            </div>
            <div className="border-t border-ks-border pt-3 flex justify-between">
              <span className="font-semibold">Total Pembayaran</span>
              <span className="font-bold text-xl gradient-text">{formatCurrency(product.price)}</span>
            </div>
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-center gap-3 text-sm text-gray-500 mb-6 px-2">
          <Shield className="w-5 h-5 text-green-400 flex-shrink-0" />
          Pembayaran aman diproses via Pakasir. Data Anda terenkripsi.
        </div>

        {/* Checkout button */}
        <button
          onClick={handleCheckout}
          disabled={processing || product.stock === 0}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {processing ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Membuat Order...</>
          ) : (
            <>Bayar {formatCurrency(product.price)}</>
          )}
        </button>
      </div>
    </div>
  )
}
