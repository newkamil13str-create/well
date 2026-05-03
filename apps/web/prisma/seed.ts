// apps/web/prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Buat admin
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kamilshop.my.id' },
    update: {},
    create: {
      nama: 'Admin KamilShop',
      email: 'admin@kamilshop.my.id',
      password: adminPassword,
      noWhatsapp: '628123456789',
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin dibuat:', admin.email)

  // Buat user contoh
  const userPassword = await bcrypt.hash('user123', 12)
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      nama: 'User Contoh',
      email: 'user@example.com',
      password: userPassword,
      noWhatsapp: '628987654321',
      role: 'USER',
    },
  })
  console.log('✅ User dibuat:', user.email)

  // Produk contoh
  const produkData = [
    {
      nama: 'Kaos Polos Premium',
      slug: 'kaos-polos-premium-' + Date.now(),
      harga: 85000,
      stok: 50,
      deskripsi: 'Kaos polos premium bahan cotton combed 30s. Nyaman dipakai sehari-hari, tersedia berbagai warna. Bahan anti-pilling dan awet cuci.',
      gambar: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'],
      kategori: 'Fashion',
    },
    {
      nama: 'Celana Jogger Kasual',
      slug: 'celana-jogger-kasual-' + (Date.now() + 1),
      harga: 145000,
      stok: 30,
      deskripsi: 'Celana jogger kasual untuk santai maupun olahraga. Bahan fleece lembut, elastis, dan breathable. Ada kantong kanan kiri.',
      gambar: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400'],
      kategori: 'Fashion',
    },
    {
      nama: 'Tas Ransel Laptop 15"',
      slug: 'tas-ransel-laptop-' + (Date.now() + 2),
      harga: 320000,
      stok: 15,
      deskripsi: 'Tas ransel multifungsi untuk laptop hingga 15 inch. Material waterproof, banyak kompartemen. Cocok untuk kuliah, kerja, traveling.',
      gambar: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400'],
      kategori: 'Aksesoris',
    },
    {
      nama: 'Tumbler Stainless 500ml',
      slug: 'tumbler-stainless-500ml-' + (Date.now() + 3),
      harga: 95000,
      stok: null, // unlimited
      deskripsi: 'Tumbler stainless steel 500ml dengan double wall insulation. Menjaga minuman tetap dingin 24 jam atau hangat 12 jam. BPA Free.',
      gambar: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400'],
      kategori: 'Peralatan',
    },
    {
      nama: 'Sepatu Sneakers Casual',
      slug: 'sepatu-sneakers-casual-' + (Date.now() + 4),
      harga: 275000,
      stok: 20,
      deskripsi: 'Sepatu sneakers casual modern dengan sol karet anti-slip. Ringan dan nyaman untuk kegiatan sehari-hari. Tersedia ukuran 38-44.',
      gambar: ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'],
      kategori: 'Fashion',
    },
    {
      nama: 'Topi Baseball Polos',
      slug: 'topi-baseball-polos-' + (Date.now() + 5),
      harga: 65000,
      stok: 100,
      deskripsi: 'Topi baseball polos berkualitas dengan bahan twill. Gesper belakang yang adjustable. Cocok untuk outdoor maupun fashion.',
      gambar: ['https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400'],
      kategori: 'Aksesoris',
    },
  ]

  for (const p of produkData) {
    const produk = await prisma.produk.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    })
    console.log(`✅ Produk: ${produk.nama}`)
  }

  // Settings default
  await prisma.setting.upsert({
    where: { key: 'nama_toko' },
    update: {},
    create: { key: 'nama_toko', value: 'KamilShop' },
  })
  await prisma.setting.upsert({
    where: { key: 'whatsapp_admin' },
    update: {},
    create: { key: 'whatsapp_admin', value: '628123456789' },
  })

  console.log('\n✅ Seeding selesai!')
  console.log('📧 Admin: admin@kamilshop.my.id / password: admin123')
  console.log('📧 User:  user@example.com / password: user123')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
