// Environment configuration utility
export const config = {
  // Supabase Configuration
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://iroaauayoqlfsetgtlec.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    storageBucket: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'gastronomi',
    storageUrl: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL || 'https://iroaauayoqlfsetgtlec.supabase.co/storage/v1/object/public/gastronomi'
  },
  
  // Contact Information
  contact: {
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'dawaladev@gmail.com',
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+62 xxx-xxxx-xxxx'
  },
  
  // Database Configuration
  database: {
    url: process.env.DATABASE_URL || ''
  },
  
  // Admin Configuration
  admin: {
    email: process.env.SUPER_ADMIN_EMAIL || 'dawaladev@gmail.com'
  },
  
  // Application Configuration
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Desa Wisata Alamendah',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }
}

// Helper function to get Supabase storage URL for images
export const getSupabaseImageUrl = (imagePath: string): string => {
  if (!imagePath) return '/placeholder-food.jpg'
  if (imagePath.startsWith('data:image')) return imagePath
  if (imagePath.startsWith('http')) return imagePath
  return `${config.supabase.storageUrl}/${imagePath}`
}
