'use client'
// app/profile/page.tsx
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth, db } from '@/lib/firebase'
import { onAuthStateChanged, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { User } from '@/types'
import Navbar from '@/components/layout/Navbar'
import { Loader2, Save, Lock, User as UserIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ name: '', phone: '' })
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' })
  const [changingPass, setChangingPass] = useState(false)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) { router.push('/login'); return }
      setUser(firebaseUser)
      const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
      if (snap.exists()) {
        const data = snap.data() as User
        setUserData(data)
        setForm({ name: data.name, phone: data.phone })
      }
      setLoading(false)
    })
    return unsub
  }, [router])

  async function saveProfile() {
    if (!form.name.trim()) return toast.error('Nama tidak boleh kosong')
    setSaving(true)
    try {
      await updateDoc(doc(db, 'users', user.uid), { name: form.name.trim(), phone: form.phone.trim() })
      toast.success('Profil berhasil diperbarui')
    } catch { toast.error('Gagal menyimpan') }
    finally { setSaving(false) }
  }

  async function changePassword() {
    if (!passForm.current || !passForm.new || !passForm.confirm) return toast.error('Semua field wajib diisi')
    if (passForm.new.length < 6) return toast.error('Password baru minimal 6 karakter')
    if (passForm.new !== passForm.confirm) return toast.error('Konfirmasi password tidak cocok')
    setChangingPass(true)
    try {
      const credential = EmailAuthProvider.credential(user.email, passForm.current)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, passForm.new)
      toast.success('Password berhasil diubah')
      setPassForm({ current: '', new: '', confirm: '' })
    } catch (e: any) {
      toast.error(e.code === 'auth/wrong-password' ? 'Password saat ini salah' : 'Gagal mengubah password')
    }
    finally { setChangingPass(false) }
  }

  if (loading) return (
    <div className="min-h-screen bg-ks-darker">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 pt-24 space-y-4">
        <div className="skeleton h-48 rounded-2xl" /><div className="skeleton h-48 rounded-2xl" />
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-ks-darker">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 sm:px-6 pt-24 pb-20">
        <h1 className="text-2xl font-display font-bold mb-8">Edit Profil</h1>

        {/* Profile form */}
        <div className="bg-ks-surface border border-ks-border rounded-2xl p-6 mb-6">
          <h2 className="font-semibold mb-5 flex items-center gap-2 text-sm text-gray-300">
            <UserIcon className="w-4 h-4" /> Informasi Profil
          </h2>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">ID Unik</label>
              <div className="px-4 py-2.5 bg-ks-darker border border-ks-border rounded-xl text-blue-400 font-mono text-sm">
                {userData?.uniqueId}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Email (tidak bisa diubah)</label>
              <div className="px-4 py-2.5 bg-ks-darker border border-ks-border rounded-xl text-gray-500 text-sm">
                {userData?.email}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">Nama Lengkap</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-2.5 bg-ks-darker border border-ks-border rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1.5 block">No. WhatsApp</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full px-4 py-2.5 bg-ks-darker border border-ks-border rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50" />
            </div>
            <button onClick={saveProfile} disabled={saving} className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Menyimpan...</> : <><Save className="w-4 h-4" />Simpan Profil</>}
            </button>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-ks-surface border border-ks-border rounded-2xl p-6">
          <h2 className="font-semibold mb-5 flex items-center gap-2 text-sm text-gray-300">
            <Lock className="w-4 h-4" /> Ganti Password
          </h2>
          <div className="space-y-4">
            {[
              { label: 'Password Saat Ini', key: 'current' as const },
              { label: 'Password Baru', key: 'new' as const },
              { label: 'Konfirmasi Password Baru', key: 'confirm' as const },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-xs text-gray-400 mb-1.5 block">{label}</label>
                <input type="password" value={passForm[key]} onChange={e => setPassForm({ ...passForm, [key]: e.target.value })} className="w-full px-4 py-2.5 bg-ks-darker border border-ks-border rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50" />
              </div>
            ))}
            <button onClick={changePassword} disabled={changingPass} className="w-full py-3 rounded-xl border border-blue-500/30 text-blue-400 hover:bg-blue-500/10 font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-50 transition-colors">
              {changingPass ? <><Loader2 className="w-4 h-4 animate-spin" />Mengubah...</> : <><Lock className="w-4 h-4" />Ganti Password</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
