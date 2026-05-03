'use client'
// app/admin/settings/page.tsx
import { useState, useEffect } from 'react'
import { db, auth } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { Loader2, Save, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSecrets, setShowSecrets] = useState(false)
  const [settings, setSettings] = useState({
    storeName: 'KamilShop',
    storeDesc: 'Marketplace digital terpercaya',
    storeEmail: 'admin@kamilshop.my.id',
    pakasirSlug: '',
    pakasirApiKey: '',
    telegramBotToken: '',
    telegramOwnerChatId: '',
    gmailUser: '',
    gmailAppPassword: '',
    maintenanceMode: false,
    webhookSecret: '',
  })

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/admin'); return }
      const snap = await getDoc(doc(db, 'settings', 'config'))
      if (snap.exists()) setSettings({ ...settings, ...snap.data() })
      setLoading(false)
    })
    return unsub
  }, [router])

  async function save() {
    setSaving(true)
    try {
      await setDoc(doc(db, 'settings', 'config'), settings, { merge: true })
      toast.success('Pengaturan disimpan')
    } catch { toast.error('Gagal menyimpan') }
    finally { setSaving(false) }
  }

  const field = (key: keyof typeof settings, label: string, placeholder?: string, secret = false, type = 'text') => (
    <div>
      <label className="text-xs text-gray-400 mb-1.5 block">{label}</label>
      <div className="relative">
        <input
          type={secret && !showSecrets ? 'password' : type}
          value={settings[key] as string}
          onChange={e => setSettings({ ...settings, [key]: e.target.value })}
          placeholder={placeholder}
          className="w-full px-4 py-2.5 bg-ks-darker border border-ks-border rounded-xl text-white text-sm focus:outline-none focus:border-blue-500/50"
        />
      </div>
    </div>
  )

  if (loading) return <AdminLayout><div className="skeleton h-96 rounded-xl" /></AdminLayout>

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-display font-bold">Pengaturan Toko</h1>
        <button onClick={() => setShowSecrets(!showSecrets)} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-ks-border text-sm text-gray-400 hover:text-white">
          {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showSecrets ? 'Sembunyikan' : 'Tampilkan'} Rahasia
        </button>
      </div>

      <div className="space-y-6">
        {/* Store Info */}
        <div className="bg-ks-surface border border-ks-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Informasi Toko</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {field('storeName', 'Nama Toko', 'KamilShop')}
            {field('storeEmail', 'Email CS', 'admin@kamilshop.my.id')}
            <div className="sm:col-span-2">
              {field('storeDesc', 'Deskripsi Toko', 'Marketplace digital terpercaya')}
            </div>
            <div className="sm:col-span-2 flex items-center gap-3">
              <label className="text-xs text-gray-400">Mode Maintenance</label>
              <button
                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                className={`relative w-12 h-6 rounded-full transition-colors ${settings.maintenanceMode ? 'bg-red-500' : 'bg-gray-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.maintenanceMode ? 'left-7' : 'left-1'}`} />
              </button>
              <span className="text-xs text-gray-500">{settings.maintenanceMode ? 'Aktif (toko offline)' : 'Nonaktif'}</span>
            </div>
          </div>
        </div>

        {/* Pakasir */}
        <div className="bg-ks-surface border border-ks-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Pakasir Payment Gateway</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {field('pakasirSlug', 'Pakasir Slug', 'your-slug', true)}
            {field('pakasirApiKey', 'Pakasir API Key', 'pak_xxxx', true)}
            {field('webhookSecret', 'Webhook Secret', 'secret', true)}
          </div>
        </div>

        {/* Telegram */}
        <div className="bg-ks-surface border border-ks-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Telegram Bot</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {field('telegramBotToken', 'Bot Token', '123456:ABC...', true)}
            {field('telegramOwnerChatId', 'Owner Chat ID', '123456789', true)}
          </div>
        </div>

        {/* Gmail */}
        <div className="bg-ks-surface border border-ks-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Gmail SMTP (untuk OTP & Email)</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {field('gmailUser', 'Gmail Address', 'admin@gmail.com')}
            {field('gmailAppPassword', 'App Password', 'xxxx xxxx xxxx xxxx', true)}
          </div>
          <p className="text-xs text-gray-600 mt-3">Gunakan App Password dari Google Account → Security → 2-Step Verification → App Passwords</p>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {saving ? <><Loader2 className="w-5 h-5 animate-spin" />Menyimpan...</> : <><Save className="w-5 h-5" />Simpan Pengaturan</>}
        </button>
      </div>
    </AdminLayout>
  )
}
