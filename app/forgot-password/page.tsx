'use client'
// app/forgot-password/page.tsx
import { useState } from 'react'
import Link from 'next/link'
import { auth } from '@/lib/firebase'
import { confirmPasswordReset } from 'firebase/auth'
import { Zap, Loader2, ArrowLeft, Mail, KeyRound, Lock } from 'lucide-react'
import toast from 'react-hot-toast'

type Step = 'email' | 'otp' | 'reset' | 'done'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function sendOTP() {
    if (!email) return toast.error('Masukkan email Anda')
    setLoading(true)
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('OTP dikirim ke email Anda')
        setStep('otp')
      } else {
        toast.error(data.error || 'Gagal mengirim OTP')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  async function verifyOTP() {
    if (!otp || otp.length !== 6) return toast.error('Masukkan OTP 6 digit')
    setLoading(true)
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('OTP benar!')
        setStep('reset')
      } else {
        toast.error(data.error || 'OTP salah atau expired')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  async function resetPassword() {
    if (!newPassword || newPassword.length < 6) return toast.error('Password minimal 6 karakter')
    setLoading(true)
    try {
      const res = await fetch('/api/otp/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Password berhasil direset!')
        setStep('done')
      } else {
        toast.error(data.error || 'Gagal mereset password')
      }
    } catch {
      toast.error('Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ks-darker flex items-center justify-center px-4 py-12 bg-grid">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-2xl">Kamil<span className="gradient-text">Shop</span></span>
          </Link>
          <h1 className="text-2xl font-display font-bold">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-2">
            {step === 'email' && 'Masukkan email untuk menerima OTP'}
            {step === 'otp' && `Cek email ${email} untuk kode OTP`}
            {step === 'reset' && 'Buat password baru Anda'}
            {step === 'done' && 'Password berhasil direset!'}
          </p>
        </div>

        <div className="bg-ks-surface border border-ks-border rounded-2xl p-8">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-8">
            {(['email', 'otp', 'reset'] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                  step === s ? 'bg-blue-500 text-white' :
                  (['email','otp','reset','done'] as Step[]).indexOf(step) > i ? 'bg-green-500 text-white' :
                  'bg-ks-border text-gray-500'
                }`}>{i + 1}</div>
                {i < 2 && <div className={`flex-1 h-0.5 ${(['email','otp','reset','done'] as Step[]).indexOf(step) > i ? 'bg-green-500' : 'bg-ks-border'}`} />}
              </div>
            ))}
          </div>

          {step === 'email' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-ks-darker border border-ks-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>
              <button onClick={sendOTP} disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Mengirim...</> : 'Kirim OTP'}
              </button>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Kode OTP (6 digit)</label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-3 bg-ks-darker border border-ks-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all font-mono text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>
                <p className="text-gray-600 text-xs mt-2 text-center">OTP berlaku 5 menit</p>
              </div>
              <button onClick={verifyOTP} disabled={loading || otp.length !== 6} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Memverifikasi...</> : 'Verifikasi OTP'}
              </button>
              <button onClick={() => setStep('email')} className="w-full py-2 text-gray-500 hover:text-gray-300 text-sm flex items-center justify-center gap-1">
                <ArrowLeft className="w-4 h-4" /> Ubah email
              </button>
            </div>
          )}

          {step === 'reset' && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Password Baru</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-4 py-3 bg-ks-darker border border-ks-border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 transition-all"
                  />
                </div>
              </div>
              <button onClick={resetPassword} disabled={loading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</> : 'Simpan Password Baru'}
              </button>
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✅</span>
              </div>
              <h3 className="font-semibold mb-2">Password Berhasil Direset!</h3>
              <p className="text-gray-500 text-sm mb-6">Silakan masuk dengan password baru Anda.</p>
              <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
                Masuk Sekarang
              </Link>
            </div>
          )}
        </div>

        <p className="text-center mt-6">
          <Link href="/login" className="text-gray-500 hover:text-gray-300 text-sm flex items-center justify-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Kembali ke Login
          </Link>
        </p>
      </div>
    </div>
  )
}
