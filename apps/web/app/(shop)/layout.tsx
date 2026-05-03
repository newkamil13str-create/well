// apps/web/app/(shop)/layout.tsx
import Navbar from '@/components/shop/Navbar'

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <footer className="bg-gray-900 text-gray-400 text-center py-8 mt-16 text-sm">
        <p className="text-white font-bold text-lg mb-1">🛍️ KamilShop</p>
        <p>© {new Date().getFullYear()} KamilShop · kamilshop.my.id</p>
        <p className="mt-2">Belanja Online Mudah, Cepat & Terpercaya</p>
      </footer>
    </>
  )
}
