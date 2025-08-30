'use client'

import { useState, useEffect } from 'react'
import { getTexts } from '@/lib/texts'
import { getCurrentLocale } from '@/lib/locale'

interface FooterProps {
  locale?: 'id' | 'en'
}

export default function Footer({ locale }: FooterProps) {
  const [texts, setTexts] = useState<any>(null)
  const [currentLocale, setCurrentLocale] = useState<'id' | 'en'>('id')

  useEffect(() => {
    // Use provided locale or get from localStorage
    const finalLocale = locale || getCurrentLocale(window.location.pathname)
    setCurrentLocale(finalLocale)
    
    const loadTexts = async () => {
      const loadedTexts = await getTexts(finalLocale)
      setTexts(loadedTexts)
    }
    loadTexts()
  }, [locale])

  if (!texts) {
    return (
      <footer className="bg-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="h-32 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-32 bg-gray-700 rounded animate-pulse"></div>
            <div className="h-32 bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-bold mb-3 sm:mb-4">{texts.footer.companyName}</h3>
            <p className="text-gray-300 mb-3 sm:mb-4 text-sm sm:text-base">
              {texts.footer.description}
            </p>
            <p className="text-gray-300 text-sm">
              {texts.footer.subDescription}
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-3 sm:mb-4">{texts.footer.contactInfo.title}</h3>
            <div className="space-y-2 text-gray-300 text-sm sm:text-base">
              <p className="break-words">Email: {texts.footer.contactInfo.email}</p>
              <p>Phone: {texts.footer.contactInfo.phone}</p>
              <p>Lokasi: {texts.footer.contactInfo.location}</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="sm:col-span-2 lg:col-span-1">
            <h3 className="text-lg font-bold mb-3 sm:mb-4">{texts.footer.quickLinks.title}</h3>
            <div className="space-y-2">
              <a href="/" className="block text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                {texts.footer.quickLinks.home}
              </a>
              <a href="/contact" className="block text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                {texts.footer.quickLinks.contact}
              </a>
              <a href="mailto:dawaladev@gmail.com" className="block text-gray-300 hover:text-white transition-colors text-sm sm:text-base">
                {texts.footer.quickLinks.reservation}
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center">
          <p className="text-gray-300 text-xs sm:text-sm">
            {texts.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  )
}
