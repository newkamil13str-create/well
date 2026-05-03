// apps/web/app/(auth)/register/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [form, setForm] = useState({
    nama: '', email: '', password: '', noWhatsapp: '', otp: '',
  })

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStep('otp')
      toast.success('OTP dikirim ke WhatsApp!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noWhatsapp: form.noWhatsapp, kode: form.otp, tipe: 'REGISTER' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Akun berhasil dibuat!')
      router.push('/login')
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
          <p className="text-gray-500 mt-2">
            {step === 'form' ? 'Buat akun baru' : 'Verifikasi WhatsApp'}
          </p>
        </div>

        {step === 'form' ? (
          <form onSubmit={handleRegister} className="space-y-4">
            <input required placeholder="Nama Lengkap" value={form.nama}
              onChange={(e) => setForm({ ...form, nama: e.target.value })}
              className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input required type="email" placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input required type="password" placeholder="Password (min 8 karakter)" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={8}
              className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input required type="tel" placeholder="Nomor WhatsApp (628xxx)" value={form.noWhatsapp}
              onChange={(e) => setForm({ ...form, noWhatsapp: e.target.value })}
              className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Memproses...' : 'Daftar & Kirim OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <p className="text-center text-gray-600 text-sm">
              Kode OTP dikirim ke <strong>{form.noWhatsapp}</strong>
            </p>
            <input required placeholder="Kode OTP (6 digit)" value={form.otp}
              onChange={(e) => setForm({ ...form, otp: e.target.value })} maxLength={6}
              className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-2xl tracking-widest" />
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Verifikasi...' : 'Verifikasi & Buat Akun'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          Sudah punya akun?{' '}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  )
}
