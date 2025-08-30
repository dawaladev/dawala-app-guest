'use client'

// Utility functions for locale management

export type Locale = 'id' | 'en'

/**
 * Get the preferred locale from localStorage or default to 'id'
 */
export function getPreferredLocale(): Locale {
  if (typeof window === 'undefined') return 'id'
  
  const savedLocale = localStorage.getItem('preferred-locale') as Locale | null
  return savedLocale && (savedLocale === 'id' || savedLocale === 'en') ? savedLocale : 'id'
}

/**
 * Get locale from pathname
 */
export function getLocaleFromPathname(pathname: string): Locale {
  return pathname.startsWith('/en') ? 'en' : 'id'
}

/**
 * Set preferred locale in localStorage
 */
export function setPreferredLocale(locale: Locale): void {
  if (typeof window === 'undefined') return
  localStorage.setItem('preferred-locale', locale)
}

/**
 * Get the current locale (preferred or from pathname)
 */
export function getCurrentLocale(pathname: string): Locale {
  const preferredLocale = getPreferredLocale()
  const pathLocale = getLocaleFromPathname(pathname)
  
  // Always prioritize the pathname locale if it exists
  // This ensures URL-based navigation works correctly
  if (pathname.startsWith('/en') || pathname.startsWith('/id')) {
    return pathLocale
  }
  
  // If no locale in pathname, use preferred locale
  return preferredLocale
}
