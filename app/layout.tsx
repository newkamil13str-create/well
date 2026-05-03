// app/layout.tsx
import type { Metadata } from 'next'
import { Syne, Space_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const syne = Syne({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '700'],
})

export const metadata: Metadata = {
  title: 'KamilShop — Marketplace Digital Terpercaya',
  description: 'Beli bot WhatsApp, hosting web, domain, bot Telegram, script website, akun premium, layanan SEO, dan top up dengan mudah dan aman.',
  metadataBase: new URL('https://kamilshop.my.id'),
  openGraph: {
    title: 'KamilShop — Marketplace Digital Terpercaya',
    description: 'Beli produk digital dengan mudah dan aman.',
    url: 'https://kamilshop.my.id',
    siteName: 'KamilShop',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className="dark">
      <body className={`${syne.variable} ${spaceMono.variable} font-sans bg-ks-darker text-white antialiased`}>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111118',
              color: '#fff',
              border: '1px solid #1E1E2E',
              borderRadius: '10px',
              fontFamily: 'var(--font-display)',
            },
            success: { iconTheme: { primary: '#3B82F6', secondary: '#fff' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#fff' } },
          }}
        />
      </body>
    </html>
  )
}
