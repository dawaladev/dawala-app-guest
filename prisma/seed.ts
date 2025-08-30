import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Check if super admin already exists
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: 'SUPER_ADMIN' }
  })

  if (!existingSuperAdmin) {
    // Create super admin - Note: You'll need to create this user in Supabase Auth first
    const superAdmin = await prisma.user.create({
      data: {
        id: 'super-admin-id', // This should be replaced with actual Supabase Auth ID
        email: process.env.SUPER_ADMIN_EMAIL || 'dawaladev@gmail.com',
        role: 'SUPER_ADMIN'
      }
    })
    console.log('✅ Super admin created:', superAdmin.email)
  } else {
    console.log('ℹ️ Super admin already exists')
  }

  // Seed sample data for JenisPaket
  const jenisNasi = await prisma.jenisPaket.upsert({
    where: { id: 1 },
    update: {},
    create: {
      namaPaket: 'Nasi Box',
      namaPaketEn: 'Rice Box'
    }
  })

  const jenisSnack = await prisma.jenisPaket.upsert({
    where: { id: 2 },
    update: {},
    create: {
      namaPaket: 'Snack Box',
      namaPaketEn: 'Snack Box'
    }
  })

  const jenisMinuman = await prisma.jenisPaket.upsert({
    where: { id: 3 },
    update: {},
    create: {
      namaPaket: 'Minuman',
      namaPaketEn: 'Beverages'
    }
  })

  // Seed sample data for Makanan
  await prisma.makanan.upsert({
    where: { id: 1 },
    update: {},
    create: {
      namaMakanan: 'Nasi Gudeg',
      deskripsi: 'Nasi gudeg khas Yogyakarta dengan lauk ayam dan telur',
      deskripsiEn: 'Traditional Yogyakarta gudeg rice with chicken and egg',
      foto: '/images/DSC01831.JPG',
      harga: 15000,
      jenisPaketId: jenisNasi.id
    }
  })

  await prisma.makanan.upsert({
    where: { id: 2 },
    update: {},
    create: {
      namaMakanan: 'Nasi Rendang',
      deskripsi: 'Nasi dengan rendang daging sapi yang empuk dan bumbu rica',
      deskripsiEn: 'Rice with tender beef rendang and spicy seasoning',
      foto: '/images/DSC06062.JPG',
      harga: 18000,
      jenisPaketId: jenisNasi.id
    }
  })

  await prisma.makanan.upsert({
    where: { id: 3 },
    update: {},
    create: {
      namaMakanan: 'Risoles Mayo',
      deskripsi: 'Risoles isi sayuran dengan mayonaise segar',
      deskripsiEn: 'Vegetable risoles with fresh mayonnaise',
      foto: '/images/12.jpg',
      harga: 5000,
      jenisPaketId: jenisSnack.id
    }
  })

  await prisma.makanan.upsert({
    where: { id: 4 },
    update: {},
    create: {
      namaMakanan: 'Es Teh Manis',
      deskripsi: 'Es teh manis segar',
      deskripsiEn: 'Refreshing sweet iced tea',
      foto: '/images/5.jpg',
      harga: 3000,
      jenisPaketId: jenisMinuman.id
    }
  })

  console.log('✅ Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
