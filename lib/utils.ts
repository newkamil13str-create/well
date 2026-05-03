// lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateUniqueId(firstName: string): string {
  const namePart = firstName.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 10)
  const digits = Math.floor(100 + Math.random() * 900).toString()
  return `${namePart}-KS${digits}`
}

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'pending': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    case 'paid': return 'text-blue-400 bg-blue-400/10 border-blue-400/20'
    case 'delivered': return 'text-green-400 bg-green-400/10 border-green-400/20'
    case 'cancelled': return 'text-red-400 bg-red-400/10 border-red-400/20'
    default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20'
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending': return 'Menunggu Pembayaran'
    case 'paid': return 'Dibayar'
    case 'delivered': return 'Terkirim'
    case 'cancelled': return 'Dibatalkan'
    default: return status
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function sanitizeInput(input: string): string {
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
}

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
