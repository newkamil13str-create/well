// lib/pakasir.ts
const PAKASIR_BASE_URL = 'https://pakasir.com/api'

interface PakasirInvoiceResponse {
  success: boolean
  data?: {
    invoice_id: string
    payment_url: string
    amount: number
    status: string
    expired_at: string
  }
  message?: string
}

export async function createPakasirInvoice(params: {
  orderId: string
  amount: number
  productName: string
  customerName: string
  customerEmail: string
  returnUrl: string
}): Promise<PakasirInvoiceResponse> {
  const slug = process.env.PAKASIR_SLUG
  const apiKey = process.env.PAKASIR_API_KEY

  try {
    const res = await fetch(`${PAKASIR_BASE_URL}/v1/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-Pakasir-Slug': slug!,
      },
      body: JSON.stringify({
        external_id: params.orderId,
        amount: params.amount,
        description: `${params.productName} - KamilShop`,
        customer_name: params.customerName,
        customer_email: params.customerEmail,
        success_redirect_url: params.returnUrl,
        failure_redirect_url: `${process.env.NEXT_PUBLIC_BASE_URL}/orders/${params.orderId}`,
        webhook_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/webhook/pakasir`,
      }),
    })

    const data = await res.json()
    return data
  } catch (error) {
    console.error('Pakasir create invoice error:', error)
    return { success: false, message: 'Gagal membuat invoice pembayaran' }
  }
}

export async function getPakasirInvoice(invoiceId: string): Promise<PakasirInvoiceResponse> {
  const slug = process.env.PAKASIR_SLUG
  const apiKey = process.env.PAKASIR_API_KEY

  try {
    const res = await fetch(`${PAKASIR_BASE_URL}/v1/invoice/${invoiceId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'X-Pakasir-Slug': slug!,
      },
    })
    return await res.json()
  } catch (error) {
    console.error('Pakasir get invoice error:', error)
    return { success: false, message: 'Gagal mendapatkan data invoice' }
  }
}

export function verifyPakasirWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.PAKASIR_WEBHOOK_SECRET
  if (!secret) return true // Skip validation if not configured

  const crypto = require('crypto')
  const expectedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex')
  return expectedSig === signature
}
