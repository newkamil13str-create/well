// types/index.ts

export interface User {
  uid: string
  uniqueId: string
  name: string
  email: string
  phone: string
  role: 'user' | 'admin'
  isBanned: boolean
  emailVerified: boolean
  createdAt: Date | string
  avatarUrl?: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  category: ProductCategory
  thumbnail: string
  deliveryType: 'auto' | 'manual'
  deliveryContent?: string
  stock: number
  isActive: boolean
  isFeatured: boolean
  features: string[]
  createdAt: Date | string
  updatedAt: Date | string
}

export type ProductCategory =
  | 'bot-whatsapp'
  | 'hosting-web'
  | 'domain'
  | 'bot-telegram'
  | 'script-website'
  | 'akun-premium'
  | 'layanan-seo'
  | 'topup-voucher'

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  'bot-whatsapp': 'Bot WhatsApp',
  'hosting-web': 'Hosting Web',
  'domain': 'Domain',
  'bot-telegram': 'Bot Telegram',
  'script-website': 'Script & Website',
  'akun-premium': 'Akun Premium',
  'layanan-seo': 'Layanan SEO',
  'topup-voucher': 'Top Up & Voucher',
}

export const CATEGORY_ICONS: Record<ProductCategory, string> = {
  'bot-whatsapp': '💬',
  'hosting-web': '🌐',
  'domain': '🔗',
  'bot-telegram': '🤖',
  'script-website': '💻',
  'akun-premium': '⭐',
  'layanan-seo': '📈',
  'topup-voucher': '🎮',
}

export type OrderStatus = 'pending' | 'paid' | 'delivered' | 'cancelled'

export interface Order {
  id: string
  userId: string
  userUniqueId: string
  userName: string
  userEmail: string
  productId: string
  productName: string
  productCategory: string
  amount: number
  status: OrderStatus
  paymentUrl: string
  pakasirInvoiceId: string
  deliveryContent?: string
  notes?: string
  createdAt: Date | string
  paidAt?: Date | string
  deliveredAt?: Date | string
}

export interface OtpRequest {
  email: string
  otp: string
  expiresAt: Date
  used: boolean
  createdAt: Date
}

export interface StoreSettings {
  storeName: string
  storeDesc: string
  storeEmail: string
  storeLogo?: string
  pakasirSlug: string
  pakasirApiKey: string
  telegramBotToken: string
  telegramOwnerChatId: string
  gmailUser: string
  gmailAppPassword: string
  maintenanceMode: boolean
  webhookSecret: string
}

export interface DashboardStats {
  revenueToday: number
  revenueMonth: number
  revenueAll: number
  ordersPending: number
  ordersPaid: number
  ordersDelivered: number
  ordersCancelled: number
  totalUsers: number
  newUsersToday: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
