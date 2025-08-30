// Utility functions for database internationalization

export type Locale = 'id' | 'en'

/**
 * Get localized package name
 */
export function getLocalizedPackageName(paket: { namaPaket: string; namaPaketEn?: string }, locale: Locale): string {
  if (locale === 'id') {
    return paket.namaPaket
  }
  // For English, use namaPaketEn if available, fallback to namaPaket
  return paket.namaPaketEn || paket.namaPaket
}

/**
 * Get localized food description
 */
export function getLocalizedDescription(makanan: { deskripsi: string; deskripsiEn?: string }, locale: Locale): string {
  if (locale === 'id') {
    return makanan.deskripsi
  }
  // For English, use deskripsiEn if available, fallback to deskripsi
  return makanan.deskripsiEn || makanan.deskripsi
}

/**
 * Get localized package name with fallback
 */
export function getPackageName(paket: any, locale: Locale): string {
  if (locale === 'id') {
    return paket.nama_paket || paket.namaPaket || 'Unknown Package'
  }
  // For English, use nama_paket_en if available, fallback to nama_paket
  return paket.nama_paket_en || paket.namaPaketEn || paket.nama_paket || paket.namaPaket || 'Unknown Package'
}

/**
 * Get localized food description with fallback
 */
export function getFoodDescription(makanan: any, locale: Locale): string {
  if (locale === 'id') {
    return makanan.deskripsi || 'No description available'
  }
  // For English, use deskripsiEn if available, fallback to deskripsi
  return makanan.deskripsi_en || makanan.deskripsiEn || makanan.deskripsi || 'No description available'
}
