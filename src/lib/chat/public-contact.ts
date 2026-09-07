import pool from '@/lib/postgres'
import { config } from '@/lib/config'

const DEFAULT_EMAIL = 'dawaladev@gmail.com'
const DEFAULT_PHONE = '628123456789'

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

async function loadSettingsContact(): Promise<{ email: string; phone: string }> {
  try {
    const result = await pool.query(
      `
        SELECT
          email,
          no_telp as "noTelp"
        FROM settings
        ORDER BY id DESC
        LIMIT 1
      `,
    )
    const row = result.rows[0] as { email?: string; noTelp?: string } | undefined
    return {
      email: row?.email?.trim() || DEFAULT_EMAIL,
      phone: row?.noTelp?.trim() || DEFAULT_PHONE,
    }
  } catch (error) {
    console.error('[chat/kontak] settings DB error:', error)
    return { email: DEFAULT_EMAIL, phone: DEFAULT_PHONE }
  }
}

/**
 * Info kontak yang sama dengan halaman /contact (tabel settings).
 */
export async function getPublicContact(
  locale: 'id' | 'en' = 'id',
): Promise<PublicContact> {
  const appUrl = normalizeAppUrl(config.app.url)
  const name = config.app.name
  const { email, phone } = await loadSettingsContact()
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
