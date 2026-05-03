// apps/web/app/(shop)/pesanan/[invoiceId]/page.tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from '@/types'
import { ChevronLeft, Package } from 'lucide-react'

export default async function DetailPesananPage({
  params,
}: { params: { invoiceId: string } }) {
  const order = await prisma.order.findUnique({
    where: { invoiceId: params.invoiceId },
    include: { items: { include: { produk: true } }, user: true },
  })
  if (!order) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/pesanan" className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6">
          <ChevronLeft size={16} /> Riwayat Pesanan
        </Link>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Detail Pesanan</h1>

        {/* Status */}
        <div className="bg-white rounded-xl shadow-sm border p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">Invoice</p>
              <code className="text-blue-600 font-mono text-sm">{order.invoiceId}</code>
            </div>
            <span className={`px-3 py-1.5 rounded-full text-sm font-semibold ${ORDER_STATUS_COLOR[order.status]}`}>
              {ORDER_STATUS_LABEL[order.status]}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400">Tanggal Order</p>
              <p className="font-medium text-gray-800">
                {new Date(order.createdAt).toLocaleDateString('id-ID', {
                  day: '2-digit', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
            {order.paidAt && (
              <div>
                <p className="text-gray-400">Tanggal Bayar</p>
                <p className="font-medium text-gray-800">
                  {new Date(order.paidAt).toLocaleDateString('id-ID', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </p>
              </div>
            )}
            <div>
              <p className="text-gray-400">Metode Bayar</p>
              <p className="font-medium text-gray-800 uppercase">
                {order.metodePembayaran || '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-400">Total Bayar</p>
              <p className="font-bold text-blue-600">
                Rp {order.totalBayar.toLocaleString('id-ID')}
              </p>
            </div>
          </div>
        </div>

        {/* Item pesanan */}
        <div className="bg-white rounded-xl shadow-sm border p-5 mb-4">
          <h2 className="font-semibold text-gray-800 mb-4">Item Pesanan</h2>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {item.produk.gambar[0] ? (
                    <Image src={item.produk.gambar[0]} alt={item.produk.nama} fill className="object-cover" />
                  ) : (
                    <Package size={32} className="absolute inset-0 m-auto text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.produk.nama}</p>
                  <p className="text-sm text-gray-500">
                    Rp {item.harga.toLocaleString('id-ID')} × {item.qty}
                  </p>
                </div>
                <p className="font-bold text-gray-800">
                  Rp {item.subtotal.toLocaleString('id-ID')}
                </p>
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between">
            <span className="text-gray-500">Subtotal</span>
            <span className="font-bold text-gray-800">Rp {order.totalHarga.toLocaleString('id-ID')}</span>
          </div>
          {order.feePayment > 0 && (
            <div className="flex justify-between mt-1">
              <span className="text-gray-500 text-sm">Biaya layanan</span>
              <span className="text-sm text-gray-700">Rp {order.feePayment.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="flex justify-between mt-2 pt-2 border-t">
            <span className="font-semibold">Total Bayar</span>
            <span className="font-bold text-blue-600 text-lg">Rp {order.totalBayar.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Info penerima */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h2 className="font-semibold text-gray-800 mb-4">Info Penerima</h2>
          <div className="space-y-2 text-sm">
            <div className="flex gap-3">
              <span className="text-gray-400 w-28">Nama</span>
              <span className="font-medium text-gray-800">{order.namaLengkap}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-gray-400 w-28">WhatsApp</span>
              <span className="font-medium text-gray-800">{order.noWhatsapp}</span>
            </div>
            <div className="flex gap-3">
              <span className="text-gray-400 w-28">Alamat</span>
              <span className="font-medium text-gray-800">{order.alamat}</span>
            </div>
            {order.catatan && (
              <div className="flex gap-3">
                <span className="text-gray-400 w-28">Catatan</span>
                <span className="text-gray-800">{order.catatan}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition">
            Lanjut Belanja
          </Link>
        </div>
      </div>
    </div>
  )
}
