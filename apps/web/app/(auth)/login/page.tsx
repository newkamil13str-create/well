// apps/web/app/(auth)/login/page.tsx
'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

type Mode = 'password' | 'otp'

export default function LoginPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('password')
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
    noWhatsapp: '',
    otp: '',
  })

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })
      if (res?.error) throw new Error('Email atau password salah')
      toast.success('Login berhasil!')
      router.push('/')
      router.refresh()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSendOTP = async () => {
    if (!form.noWhatsapp) return toast.error('Masukkan nomor WhatsApp')
    setLoading(true)
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noWhatsapp: form.noWhatsapp, tipe: 'LOGIN' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setOtpSent(true)
      toast.success('OTP terkirim ke WhatsApp!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOTPLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noWhatsapp: form.noWhatsapp, kode: form.otp, tipe: 'LOGIN' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Login berhasil!')
      router.push('/')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">🛍️ KamilShop</h1>
          <p className="text-gray-500 mt-2">Masuk ke akun Anda</p>
        </div>

        {/* Tab mode */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setMode('password')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              mode === 'password' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setMode('otp')}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              mode === 'otp' ? 'bg-white shadow text-gray-800' : 'text-gray-500'
            }`}
          >
            OTP WhatsApp
          </button>
        </div>

        {mode === 'password' ? (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <input
              type="email"
              required
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="password"
              required
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Link href="/forgot-password" className="block text-right text-sm text-blue-600 hover:underline">
              Lupa password?
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="Nomor WhatsApp (628xxx)"
                value={form.noWhatsapp}
                onChange={(e) => setForm({ ...form, noWhatsapp: e.target.value })}
                className="flex-1 border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendOTP}
                disabled={loading || otpSent}
                className="px-4 py-3 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {otpSent ? 'Terkirim' : 'Kirim OTP'}
              </button>
            </div>
            {otpSent && (
              <form onSubmit={handleOTPLogin} className="space-y-4">
                <input
                  required
                  placeholder="Masukkan kode OTP (6 digit)"
                  value={form.otp}
                  onChange={(e) => setForm({ ...form, otp: e.target.value })}
                  maxLength={6}
                  className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-xl tracking-widest"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Verifikasi...' : 'Verifikasi & Masuk'}
                </button>
              </form>
            )}
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Belum punya akun?{' '}
          <Link href="/register" className="text-blue-600 font-medium hover:underline">
            Daftar
          </Link>
        </p>
      </div>
    </div>
  )
}
