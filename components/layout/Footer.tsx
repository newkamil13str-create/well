'use client'
// components/layout/Footer.tsx
import Link from 'next/link'
import { Zap, Mail, MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-ks-border bg-ks-darker">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" fill="white" />
              </div>
              <span className="font-display font-bold text-xl">Kamil<span className="gradient-text">Shop</span></span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Marketplace digital terpercaya untuk kebutuhan bot, hosting, domain, dan produk digital lainnya.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="mailto:admin@kamilshop.my.id" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <Mail className="w-4 h-4" />
              </a>
              <a href="https://t.me/kamilshop" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 text-white">Produk</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/products?category=bot-whatsapp', label: 'Bot WhatsApp' },
                { href: '/products?category=hosting-web', label: 'Hosting Web' },
                { href: '/products?category=domain', label: 'Domain' },
                { href: '/products?category=bot-telegram', label: 'Bot Telegram' },
                { href: '/products?category=akun-premium', label: 'Akun Premium' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 text-white">Layanan</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/products?category=script-website', label: 'Script & Website' },
                { href: '/products?category=layanan-seo', label: 'Layanan SEO' },
                { href: '/products?category=topup-voucher', label: 'Top Up & Voucher' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-sm mb-4 text-white">Akun</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/login', label: 'Masuk' },
                { href: '/register', label: 'Daftar' },
                { href: '/dashboard', label: 'Dashboard' },
                { href: '/orders', label: 'Pesanan Saya' },
              ].map(item => (
                <li key={item.href}>
                  <Link href={item.href} className="text-gray-500 hover:text-gray-300 text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-ks-border mt-10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 text-sm">© 2024 KamilShop. All rights reserved.</p>
          <p className="text-gray-600 text-sm">
            Pembayaran aman via <span className="text-gray-400">Pakasir</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
