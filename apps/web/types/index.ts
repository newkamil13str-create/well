// apps/web/types/index.ts

export type Role = 'USER' | 'ADMIN'
export type OTPType = 'LOGIN' | 'REGISTER' | 'FORGOT_PASSWORD'
export type OrderStatus = 'PENDING' | 'PAID' | 'PROCESSING' | 'SHIPPED' | 'DONE' | 'CANCELLED'

export interface User {
  id: string
  nama: string
  email: string
  noWhatsapp?: string | null
  role: Role
  createdAt: Date
}

export interface Produk {
  id: string
  nama: string
  slug: string
  harga: number
  stok?: number | null
  deskripsi: string
  gambar: string[]
  kategori?: string | null
  aktif: boolean
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  id: string
  produkId: string
  produk: Produk
  qty: number
  harga: number
  subtotal: number
}

export interface Order {
  id: string
  invoiceId: string
  userId: string
  user?: User
  status: OrderStatus
  metodePembayaran?: string | null
  totalHarga: number
  totalBayar: number
  feePayment: number
  namaLengkap: string
  noWhatsapp: string
  alamat: string
  catatan?: string | null
  paymentData?: any
  expiredAt?: Date | null
  paidAt?: Date | null
  createdAt: Date
  items: OrderItem[]
}

export interface ApiResponse<T = any> {
  success?: boolean
  error?: string
  data?: T
}

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Menunggu Pembayaran',
  PAID: 'Sudah Dibayar',
  PROCESSING: 'Diproses',
  SHIPPED: 'Dikirim',
  DONE: 'Selesai',
  CANCELLED: 'Dibatalkan',
}

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DONE: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
}
