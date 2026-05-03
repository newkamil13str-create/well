// apps/web/app/(auth)/forgot-password/page.tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<'send' | 'verify' | 'reset'>('send')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ noWhatsapp: '', otp: '', newPassword: '', confirm: '' })

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noWhatsapp: form.noWhatsapp, tipe: 'FORGOT_PASSWORD' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setStep('verify')
      toast.success('OTP dikirim!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noWhatsapp: form.noWhatsapp, kode: form.otp, tipe: 'FORGOT_PASSWORD' }),
      })
      if (!res.ok) throw new Error('OTP salah atau kadaluarsa')
      setStep('reset')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.newPassword !== form.confirm) return toast.error('Password tidak cocok')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noWhatsapp: form.noWhatsapp, newPassword: form.newPassword }),
      })
      if (!res.ok) throw new Error('Gagal reset password')
      toast.success('Password berhasil direset!')
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
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Lupa Password</h1>
        <p className="text-center text-gray-500 text-sm mb-8">Reset via OTP WhatsApp</p>

        {step === 'send' && (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <input required type="tel" placeholder="Nomor WhatsApp (628xxx)"
              value={form.noWhatsapp} onChange={(e) => setForm({ ...form, noWhatsapp: e.target.value })}
              className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Mengirim...' : 'Kirim OTP'}
            </button>
          </form>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-4">
            <input required placeholder="Kode OTP (6 digit)" value={form.otp}
              onChange={(e) => setForm({ ...form, otp: e.target.value })} maxLength={6}
              className="w-full border rounded-lg px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Verifikasi...' : 'Verifikasi OTP'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleReset} className="space-y-4">
            <input required type="password" placeholder="Password baru (min 8)" value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })} minLength={8}
              className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input required type="password" placeholder="Konfirmasi password" value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className="w-full border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          <Link href="/login" className="text-blue-600 hover:underline">← Kembali ke Login</Link>
        </p>
      </div>
    </div>
  )
}
