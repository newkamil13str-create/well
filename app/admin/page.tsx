'use client'
// app/admin/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { Zap, Eye, EyeOff, Loader2, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid))
        if (snap.exists() && snap.data()?.role === 'admin') {
          router.push('/admin/dashboard')
          return
        }
      }
      setChecking(false)
    })
    return unsub
  }, [router])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      const snap = await getDoc(doc(db, 'users', cred.user.uid))
      if (!snap.exists() || snap.data()?.role !== 'admin') {
        await auth.signOut()
        toast.error('Akses ditolak. Bukan akun admin.')
        return
      }
      toast.success('Login admin berhasil')
      router.push('/admin/dashboard')
    } catch (err: any) {
      toast.error('Email atau password salah')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-ks-darker flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ks-darker flex items-center justify-center px-4 bg-grid">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-2xl">Kamil<span className="gradient-text">Shop</span></span>
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
            <Shield className="w-4 h-4" />
            Admin Panel
          </div>
        </div>

        <div className="bg-ks-surface border border-ks-border rounded-2xl p-8">
          <h1 className="text-xl font-display font-bold mb-6 text-center">Login Admin</h1>
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email Admin</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@kamilshop.my.id"
                className="w-full px-4 py-3 bg-ks-darker border border-ks-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-3 pr-12 bg-ks-darker border border-ks-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                  required
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <><Loader2 className="w-5 h-5 animate-spin" />Masuk...</> : 'Masuk ke Admin Panel'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
