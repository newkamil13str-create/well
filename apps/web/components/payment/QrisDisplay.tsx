// apps/web/components/payment/QrisDisplay.tsx
'use client'
import { useState, useEffect, useCallback } from 'react'
import QRCode from 'react-qr-code'
import { CheckCircle, Clock, RefreshCw } from 'lucide-react'

interface QrisDisplayProps {
  paymentNumber: string
  totalBayar: number
  expiredAt: string
  orderId: string
  onPaid: () => void
}

export default function QrisDisplay({
  paymentNumber, totalBayar, expiredAt, orderId, onPaid,
}: QrisDisplayProps) {
  const [timeLeft, setTimeLeft] = useState('')
  const [expired, setExpired] = useState(false)
  const [checking, setChecking] = useState(false)

  // Countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = new Date(expiredAt).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft('KADALUARSA')
        setExpired(true)
        clearInterval(interval)
        return
      }
      const menit = Math.floor(diff / 60000)
      const detik = Math.floor((diff % 60000) / 1000)
      setTimeLeft(`${menit}:${detik.toString().padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [expiredAt])

  // Polling status setiap 5 detik
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

  const handleManualCheck = async () => {
    setChecking(true)
    await checkStatus()
    setTimeout(() => setChecking(false), 1000)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center gap-5">
      <div className="flex items-center gap-2 text-green-600">
        <CheckCircle size={20} />
        <h3 className="font-bold text-lg text-gray-800">Scan QRIS untuk Membayar</h3>
      </div>

      {/* QR Code */}
      <div className="p-4 bg-white border-4 border-blue-100 rounded-2xl">
        <QRCode value={paymentNumber} size={200} />
      </div>

      {/* Total */}
      <div className="text-center">
        <p className="text-3xl font-bold text-blue-600">
          Rp {totalBayar.toLocaleString('id-ID')}
        </p>
        <p className="text-sm text-gray-400 mt-1">Total termasuk biaya layanan</p>
      </div>

      {/* Countdown */}
      <div className={`flex items-center gap-2 font-mono text-xl font-bold px-6 py-3 rounded-xl ${
        expired ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'
      }`}>
        <Clock size={20} />
        {timeLeft || 'Memuat...'}
      </div>

      {!expired && (
        <button
          onClick={handleManualCheck}
          disabled={checking}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <RefreshCw size={14} className={checking ? 'animate-spin' : ''} />
          {checking ? 'Mengecek...' : 'Cek Status Pembayaran'}
        </button>
      )}

      <div className="text-center text-xs text-gray-400 space-y-1">
        <p>Pembayaran dikonfirmasi otomatis</p>
        <p>Bisa dibayar via semua aplikasi dompet digital & m-banking</p>
      </div>
    </div>
  )
}
