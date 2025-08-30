'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [currentLocale, setCurrentLocale] = useState<'id' | 'en'>('id')

  // Update current locale when pathname changes
  useEffect(() => {
    const pathLocale = pathname.startsWith('/en') ? 'en' : 'id'
    setCurrentLocale(pathLocale)
  }, [pathname])

  // Sync localStorage to cookie on mount
  useEffect(() => {
    const savedLocale = localStorage.getItem('preferred-locale') as 'id' | 'en' | null
    if (savedLocale && (savedLocale === 'id' || savedLocale === 'en')) {
      // Set cookie to match localStorage
      document.cookie = `preferred-locale=${savedLocale}; path=/; max-age=31536000`
    }
  }, [])

  const switchLanguage = (locale: 'id' | 'en') => {
    // Save preference to localStorage
    localStorage.setItem('preferred-locale', locale)
    
    // Also set cookie for middleware access
    document.cookie = `preferred-locale=${locale}; path=/; max-age=31536000` // 1 year
    
    setCurrentLocale(locale)
    
    // Remove current locale from pathname
    const pathWithoutLocale = pathname.replace(/^\/(id|en)/, '') || '/'
    
    // Navigate to new locale
    router.push(`/${locale}${pathWithoutLocale}`)
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full border border-white/30 text-gray-800 hover:bg-white transition-all duration-200 shadow-lg cursor-pointer"
      >
        <div className="w-5 h-5 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
          <img
            src={currentLocale === 'id' ? '/id.png' : '/en.png'}
            alt={currentLocale === 'id' ? 'Indonesia' : 'English'}
            className="w-full h-full object-cover"
          />
        </div>
        <span className="text-xs font-medium text-gray-800">
          {currentLocale === 'id' ? 'ID' : 'EN'}
        </span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 text-black ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-24 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50">
          <button
            onClick={() => switchLanguage('id')}
            className={`cursor-pointer w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-green-50 transition-colors ${
              currentLocale === 'id' ? 'bg-green-50 text-green-600' : 'text-gray-700'
            }`}
          >
            <div className="w-4 h-4 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              <img
                src="/id.png"
                alt="Indonesia"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-medium text-xs">ID</span>
          </button>
          <button
            onClick={() => switchLanguage('en')}
            className={`cursor-pointer w-full flex items-center space-x-2 px-3 py-2 text-sm hover:bg-green-50 transition-colors ${
              currentLocale === 'en' ? 'bg-green-50 text-green-600' : 'text-gray-700'
            }`}
          >
            <div className="w-4 h-4 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
              <img
                src="/en.png"
                alt="English"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-medium text-xs">EN</span>
          </button>
        </div>
      )}
    </div>
  )
}