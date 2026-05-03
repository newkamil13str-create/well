// apps/web/app/(shop)/checkout/page.tsx
'use client'
import { useState } from 'react'
import { useCartStore } from '@/store/cartStore'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import QrisDisplay from '@/components/payment/QrisDisplay'
import TransferDisplay from '@/components/payment/TransferDisplay'

type Step = 'form' | 'payment' | 'success'

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clearCart } = useCartStore()
  const [step, setStep] = useState<Step>('form')
  const [loading, setLoading] = useState(false)
  const [order, setOrder] = useState<any>(null)
  const [payment, setPayment] = useState<any>(null)

  const [form, setForm] = useState({
    namaLengkap: '',
    noWhatsapp: '',
    alamat: '',
    catatan: '',
    metode: 'qris',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (items.length === 0) return toast.error('Keranjang kosong!')
    setLoading(true)

    try {
      // 1. Buat order
      const orderRes = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            produkId: i.id,
            qty: i.qty,
            harga: i.harga,
          })),
          namaLengkap: form.namaLengkap,
          noWhatsapp: form.noWhatsapp,
          alamat: form.alamat,
          catatan: form.catatan,
          totalHarga: total(),
        }),
      })
      if (!orderRes.ok) throw new Error('Gagal membuat order')
      const orderData = await orderRes.json()

      // 2. Buat payment
      const payRes = await fetch('/api/payment/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: orderData.id, metode: form.metode }),
      })
      if (!payRes.ok) throw new Error('Gagal membuat pembayaran')
      const payData = await payRes.json()

      setOrder(orderData)
      setPayment(payData.payment)
      setStep('payment')
      clearCart()
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Pembayaran Berhasil!</h2>
          <p className="text-gray-500 mb-2">Invoice: <strong>{order?.invoiceId}</strong></p>
          <p className="text-gray-500 mb-6">Notifikasi telah dikirim ke WhatsApp Anda.</p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Kembali Berbelanja
          </button>
        </div>
      </div>
    )
  }

  if (step === 'payment' && payment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {form.metode === 'qris' ? (
            <QrisDisplay
              paymentNumber={payment.payment_number}
              totalBayar={payment.total_payment}
              expiredAt={payment.expired_at}
              orderId={order?.id}
              onPaid={() => setStep('success')}
            />
          ) : (
            <TransferDisplay
              paymentNumber={payment.payment_number}
              totalBayar={payment.total_payment}
              expiredAt={payment.expired_at}
              orderId={order?.id}
              onPaid={() => setStep('success')}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="font-semibold text-gray-800">Data Penerima</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap *
              </label>
              <input
                required
                value={form.namaLengkap}
                onChange={(e) => setForm({ ...form, namaLengkap: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nama penerima"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor WhatsApp *
              </label>
              <input
                required
                type="tel"
                value={form.noWhatsapp}
                onChange={(e) => setForm({ ...form, noWhatsapp: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="628xxx"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat Pengiriman *
              </label>
              <textarea
                required
                rows={3}
                value={form.alamat}
                onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Alamat lengkap..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catatan (opsional)
              </label>
              <input
                value={form.catatan}
                onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Catatan untuk penjual..."
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Metode Pembayaran</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'qris', label: '📱 QRIS', desc: 'Scan QR Code' },
                { value: 'transfer', label: '🏦 Transfer', desc: 'Transfer Bank' },
              ].map((m) => (
                <label
                  key={m.value}
                  className={`cursor-pointer border-2 rounded-lg p-4 transition ${
                    form.metode === m.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="metode"
                    value={m.value}
                    checked={form.metode === m.value}
                    onChange={(e) => setForm({ ...form, metode: e.target.value })}
                    className="hidden"
                  />
                  <div className="font-semibold text-sm">{m.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{m.desc}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Ringkasan */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Ringkasan Pesanan</h2>
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{item.nama} x{item.qty}</span>
                <span>Rp {(item.harga * item.qty).toLocaleString('id-ID')}</span>
              </div>
            ))}
            <div className="border-t pt-3 mt-3 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-blue-600">Rp {total().toLocaleString('id-ID')}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {loading ? 'Memproses...' : 'Bayar Sekarang'}
          </button>
        </form>
      </div>
    </div>
  )
}
