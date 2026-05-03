// apps/web/lib/pakasir.ts

const PAKASIR_BASE = 'https://app.pakasir.com/api'

export interface PakasirPaymentResponse {
  payment: {
    id: string
    order_id: string
    amount: number
    fee: number
    total_payment: number
    payment_number: string // nomor rekening / string QRIS
    expired_at: string
    status: string
  }
}

/**
 * Buat transaksi QRIS
 */
export async function createQrisPayment(
  invoiceId: string,
  amount: number
): Promise<PakasirPaymentResponse> {
  const res = await fetch(`${PAKASIR_BASE}/transactioncreate/qris`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project: process.env.PAKASIR_PROJECT,
      order_id: invoiceId,
      amount,
      api_key: process.env.PAKASIR_API_KEY,
    }),
  })
  if (!res.ok) throw new Error(`Pakasir error: ${await res.text()}`)
  return res.json()
}

/**
 * Buat transaksi Transfer Bank
 */
export async function createTransferPayment(
  invoiceId: string,
  amount: number
): Promise<PakasirPaymentResponse> {
  const res = await fetch(`${PAKASIR_BASE}/transactioncreate/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      project: process.env.PAKASIR_PROJECT,
      order_id: invoiceId,
      amount,
      api_key: process.env.PAKASIR_API_KEY,
    }),
  })
  if (!res.ok) throw new Error(`Pakasir error: ${await res.text()}`)
  return res.json()
}

/**
 * Cek status transaksi
 */
export async function checkPaymentStatus(invoiceId: string) {
  const res = await fetch(`${PAKASIR_BASE}/transactionstatus/${invoiceId}`, {
    headers: { 'x-api-key': process.env.PAKASIR_API_KEY! },
  })
  if (!res.ok) throw new Error('Gagal cek status')
  return res.json()
}
