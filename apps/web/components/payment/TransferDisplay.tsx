// apps/web/components/payment/TransferDisplay.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import { Copy, CheckCircle, Clock, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

interface TransferDisplayProps {
  paymentNumber: string
  totalBayar: number
  expiredAt: string
  orderId: string
  onPaid: () => void
}

export default function TransferDisplay({
  paymentNumber, totalBayar, expiredAt, orderId, onPaid,
}: TransferDisplayProps) {
  const [timeLeft, setTimeLeft] = useState('')
  const [expired, setExpired] = useState(false)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(expiredAt).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft('KADALUARSA'); setExpired(true); clearInterval(interval); return }
      const menit = Math.floor(diff / 60000)
      const detik = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${menit}:${detik.toString().padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [expiredAt])

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/order/${orderId}`)
      const data = await res.json()
      if (data.status === 'PAID') onPaid()
    } catch {}
  }, [orderId, onPaid])

  useEffect(() => {
    if (expired) return
    const poll = setInterval(checkStatus, 5000)
    return () => clearInterval(poll)
  }, [expired, checkStatus])

  const copyNomor = () => {
    navigator.clipboard.writeText(paymentNumber)
    toast.success('Nomor rekening disalin!')
  }

  const copyNominal = () => {
    navigator.clipboard.writeText(String(totalBayar))
    toast.success('Nominal disalin!')
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col gap-5">
      <h3 className="font-bold text-lg text-gray-800 text-center">Transfer Bank</h3>

      {/* Info rekening */}
      <div className="bg-blue-50 rounded-xl p-5 space-y-4">
        <div>
          <p className="text-xs text-gray-500 mb-1">Nomor Rekening / VA</p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-2xl font-bold text-gray-800 tracking-wider">{paymentNumber}</span>
            <button onClick={copyNomor} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap">
              <Copy size={14} /> Salin
            </button>
          </div>
        </div>
        <div className="border-t border-blue-200 pt-4">
          <p className="text-xs text-gray-500 mb-1">Nominal Transfer (harus tepat)</p>
          <div className="flex items-center justify-between gap-3">
            <span className="text-2xl font-bold text-blue-600">
              Rp {totalBayar.toLocaleString('id-ID')}
            </span>
            <button onClick={copyNominal} className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium whitespace-nowrap">
              <Copy size={14} /> Salin
            </button>
          </div>
          <p className="text-xs text-red-500 mt-1">⚠️ Transfer nominal tepat agar terkonfirmasi otomatis</p>
        </div>
      </div>

      {/* Countdown */}
      <div className={`flex items-center justify-center gap-2 font-mono text-xl font-bold px-6 py-3 rounded-xl ${
        expired ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
      }`}>
        <Clock size={20} />
        {timeLeft || 'Memuat...'}
      </div>

      <button
        onClick={async () => { setChecking(true); await checkStatus(); setTimeout(() => setChecking(false), 1000) }}
        disabled={checking || expired}
        className="flex items-center justify-center gap-2 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-medium hover:bg-blue-50 disabled:opacity-50 transition"
      >
        <RefreshCw size={16} className={checking ? 'animate-spin' : ''} />
        {checking ? 'Mengecek...' : 'Cek Status Pembayaran'}
      </button>

      <div className="text-xs text-gray-400 text-center space-y-1">
        <p>Konfirmasi otomatis setelah transfer masuk</p>
        <p>Hubungi admin jika tidak terkonfirmasi dalam 5 menit</p>
      </div>
    </div>
  )
}
