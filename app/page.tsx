// app/page.tsx
import Link from 'next/link'
import { ArrowRight, Shield, Zap, Clock, Star } from 'lucide-react'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { CATEGORY_LABELS, CATEGORY_ICONS, ProductCategory } from '@/types'

const categories = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][]

const features = [
  { icon: Zap, title: 'Auto Delivery', desc: 'Produk dikirim otomatis setelah pembayaran berhasil, tanpa menunggu.' },
  { icon: Shield, title: 'Transaksi Aman', desc: 'Pembayaran diproses melalui gateway terpercaya dengan enkripsi penuh.' },
  { icon: Clock, title: '24/7 Support', desc: 'Tim support siap membantu Anda kapanpun lewat Telegram & Email.' },
  { icon: Star, title: 'Produk Terpercaya', desc: 'Semua produk telah diuji dan terjamin kualitasnya.' },
]

const stats = [
  { value: '2.000+', label: 'Pelanggan Puas' },
  { value: '500+', label: 'Produk Digital' },
  { value: '99.9%', label: 'Uptime Server' },
  { value: '< 1 Menit', label: 'Auto Delivery' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-ks-darker">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-grid pt-16">
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8">
            <Zap className="w-3.5 h-3.5" fill="currentColor" />
            Auto Delivery · Transaksi Aman · 24/7 Support
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-extrabold leading-tight tracking-tight mb-6">
            Marketplace Digital{' '}
            <span className="gradient-text">#1 Terpercaya</span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Bot WhatsApp, hosting web, domain, akun premium, dan ratusan produk digital lainnya — semua tersedia dengan pengiriman otomatis dan harga terbaik.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg transition-all hover:scale-105 glow-blue"
            >
              Lihat Semua Produk
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-ks-border hover:border-white/20 text-gray-300 hover:text-white font-semibold text-lg transition-all hover:bg-white/5"
            >
              Daftar Gratis
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
            {stats.map(stat => (
              <div key={stat.label} className="glass rounded-xl p-4">
                <div className="text-2xl font-display font-bold gradient-text">{stat.value}</div>
                <div className="text-gray-500 text-sm mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Semua Kategori Produk
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Temukan berbagai produk digital berkualitas sesuai kebutuhan Anda
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map(([slug, label]) => (
              <Link
                key={slug}
                href={`/products?category=${slug}`}
                className="group p-6 rounded-xl bg-ks-surface border border-ks-border hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
              >
                <div className="text-3xl mb-3">{CATEGORY_ICONS[slug]}</div>
                <div className="font-semibold text-sm group-hover:text-blue-400 transition-colors">{label}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 bg-ks-surface/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">Kenapa KamilShop?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Kami hadir dengan sistem terbaik untuk pengalaman belanja digital yang menyenangkan
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-6 rounded-xl bg-ks-surface border border-ks-border hover:border-blue-500/20 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-600/10 border border-blue-500/20">
            <h2 className="text-3xl sm:text-4xl font-display font-bold mb-4">
              Siap Berbelanja?
            </h2>
            <p className="text-gray-400 mb-8">
              Daftar sekarang dan dapatkan akses ke ratusan produk digital dengan harga terbaik
            </p>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold text-lg transition-all hover:scale-105"
            >
              Mulai Sekarang — Gratis!
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
