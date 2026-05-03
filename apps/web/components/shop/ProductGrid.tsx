// apps/web/components/shop/ProductGrid.tsx
import ProductCard from './ProductCard'
import type { Produk } from '@/types'

export default function ProductGrid({ produk }: { produk: Produk[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {produk.map((p) => (
        <ProductCard key={p.id} produk={p} />
      ))}
    </div>
  )
}
