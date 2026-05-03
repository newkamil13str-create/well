'use client'
// app/register/page.tsx
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/firebase'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import { Eye, EyeOff, Zap, ArrowRight, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email || !form.password || !form.phone) {
      return toast.error('Semua field wajib diisi')
    }
    if (form.password.length < 6) return toast.error('Password minimal 6 karakter')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return toast.error('Format email tidak valid')

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!data.success) {
        toast.error(data.error || 'Gagal mendaftar')
        return
      }

      // Sign in to Firebase Auth to send verification
      const userCred = await createUserWithEmailAndPassword(auth, form.email, form.password)
      await sendEmailVerification(userCred.user)

      toast.success(`Berhasil! ID Anda: ${data.uniqueId}. Cek email untuk verifikasi.`)
      router.push('/login')
    } catch (error: any) {
      const msg = error.code === 'auth/email-already-in-use'
        ? 'Email sudah terdaftar'
        : error.message || 'Terjadi kesalahan'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ks-darker flex items-center justify-center px-4 py-12 bg-grid">
      <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-2xl">Kamil<span className="gradient-text">Shop</span></span>
          </Link>
          <h1 className="text-2xl font-display font-bold">Buat Akun Baru</h1>
          <p className="text-gray-500 text-sm mt-2">Daftar gratis dan mulai belanja produk digital</p>
        </div>

        {/* Form */}
        <div className="bg-ks-surface border border-ks-border rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Nama Lengkap</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Masukkan nama lengkap"
                className="w-full px-4 py-3 bg-ks-darker border border-ks-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="nama@email.com"
                className="w-full px-4 py-3 bg-ks-darker border border-ks-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">No. WhatsApp</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="08xxxxxxxxxx"
                className="w-full px-4 py-3 bg-ks-darker border border-ks-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-4 py-3 pr-12 bg-ks-darker border border-ks-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Mendaftar...</>
              ) : (
                <>Buat Akun <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Sudah punya akun?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Masuk di sini
            </Link>
          </p>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          Dengan mendaftar, Anda menyetujui syarat dan ketentuan KamilShop
        </p>
      </div>
    </div>
  )
}
