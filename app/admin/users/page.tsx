'use client'
// app/admin/users/page.tsx
import { useState, useEffect } from 'react'
import { db, auth } from '@/lib/firebase'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import AdminLayout from '@/components/admin/AdminLayout'
import { User } from '@/types'
import { formatDate } from '@/lib/utils'
import { Search, Ban, CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push('/admin'); return }
      fetchUsers()
    })
    return unsub
  }, [router])

  async function fetchUsers() {
    const snap = await getDocs(collection(db, 'users'))
    setUsers(snap.docs.map(d => ({ ...d.data(), uid: d.id } as User)))
    setLoading(false)
  }

  async function toggleBan(user: User) {
    setTogglingId(user.uid)
    try {
      await updateDoc(doc(db, 'users', user.uid), { isBanned: !user.isBanned })
      setUsers(prev => prev.map(u => u.uid === user.uid ? { ...u, isBanned: !u.isBanned } : u))
      toast.success(user.isBanned ? 'User di-unban' : 'User di-ban')
    } catch { toast.error('Gagal') }
    finally { setTogglingId(null) }
  }

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.uniqueId?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-xl font-display font-bold">Manajemen User</h1>
        <p className="text-gray-500 text-sm mt-1">{users.length} total user terdaftar</p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama, email, atau ID..." className="w-full pl-9 pr-4 py-2.5 bg-ks-surface border border-ks-border rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50" />
      </div>

      <div className="bg-ks-surface border border-ks-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-ks-border">
            <tr className="text-gray-500 text-xs uppercase">
              <th className="text-left p-4">User</th>
              <th className="text-left p-4 hidden sm:table-cell">ID Unik</th>
              <th className="text-left p-4 hidden md:table-cell">Telepon</th>
              <th className="text-left p-4 hidden lg:table-cell">Daftar</th>
              <th className="text-left p-4">Status</th>
              <th className="text-right p-4">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ks-border">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="p-4"><div className="skeleton h-4 rounded" /></td></tr>
              ))
            ) : filtered.map(user => (
              <tr key={user.uid} className={`hover:bg-white/2 ${user.isBanned ? 'opacity-60' : ''}`}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-600/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold gradient-text">{user.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 hidden sm:table-cell">
                  <span className="font-mono text-xs text-blue-400">{user.uniqueId}</span>
                </td>
                <td className="p-4 hidden md:table-cell text-gray-400 text-xs">{user.phone}</td>
                <td className="p-4 hidden lg:table-cell text-gray-500 text-xs">
                  {user.createdAt ? formatDate(user.createdAt as string) : '-'}
                </td>
                <td className="p-4">
                  {user.isBanned ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-400/10 text-red-400 border border-red-400/20">Banned</span>
                  ) : user.role === 'admin' ? (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-400/10 text-purple-400 border border-purple-400/20">Admin</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-green-400/10 text-green-400 border border-green-400/20">Aktif</span>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex justify-end">
                    {user.role !== 'admin' && (
                      <button
                        onClick={() => toggleBan(user)}
                        disabled={togglingId === user.uid}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 ${
                          user.isBanned
                            ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                        }`}
                      >
                        {togglingId === user.uid ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : user.isBanned ? (
                          <><CheckCircle className="w-3.5 h-3.5" />Unban</>
                        ) : (
                          <><Ban className="w-3.5 h-3.5" />Ban</>
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500">Tidak ada user ditemukan</div>
        )}
      </div>
    </AdminLayout>
  )
}
