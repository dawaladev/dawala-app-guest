import { config } from '@/lib/config'

function normalizeAppUrl(raw: string): string {
  const trimmed = raw.trim().replace(/\/$/, '')
  if (!trimmed) return 'http://localhost:3000'
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `http://${trimmed}`
}

export type PublicContact = {
  name: string
  email: string
  phone: string
  phoneHours: string
  location: string
  locationNote: string
  reservation: string
  contactPageUrl: string
}

/**
 * Info kontak yang sama dengan halaman /contact (bukan scrape HTML).
 * Email & telepon mengikuti config yang dipakai UI.
 */
export function getPublicContact(locale: 'id' | 'en' = 'id'): PublicContact {
  const appUrl = normalizeAppUrl(config.app.url)
  const name = config.app.name
  const email = config.contact.email
  const phone = config.contact.phone
  const contactPageUrl = `${appUrl}/${locale}/contact`

  if (locale === 'en') {
    return {
      name,
      email,
      phone,
      phoneHours: 'Available 08.00 - 17.00 WIB',
      location:
        'Desa Wisata Alamendah, Bandung Regency, West Java, Indonesia',
      locationNote: 'Welcoming visitors from many regions',
      reservation: `Email ${email} with the package name, or call during phone hours.`,
      contactPageUrl,
    }
  }

  return {
    name,
    email,
    phone,
    phoneHours: 'Tersedia 08.00 - 17.00 WIB',
    location:
      'Desa Wisata Alamendah, Kabupaten Bandung, Jawa Barat, Indonesia',
    locationNote: 'Melayani wisatawan dari berbagai daerah',
    reservation: `Kirim email ke ${email} dengan menyebutkan nama paket, atau telepon pada jam layanan.`,
    contactPageUrl,
  }
}
