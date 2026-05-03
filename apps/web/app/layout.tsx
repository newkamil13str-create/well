// apps/web/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KamilShop - Belanja Online Mudah & Terpercaya',
  description: 'Toko online KamilShop. Produk berkualitas, pengiriman cepat, pembayaran mudah via QRIS dan Transfer.',
  keywords: 'toko online, belanja online, kamilshop',
  openGraph: {
    title: 'KamilShop',
    description: 'Belanja Online Mudah & Terpercaya',
    url: 'https://kamilshop.my.id',
    siteName: 'KamilShop',
    locale: 'id_ID',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  )
}
