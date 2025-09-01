'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { getTexts, Texts } from '@/lib/texts'
import { usePathname } from 'next/navigation'
import { getCurrentLocale } from '@/lib/locale'
import { useSettings } from '@/hooks/useSettings'

export default function Contact() {
  const pathname = usePathname()
  const locale = getCurrentLocale(pathname)
  const [texts, setTexts] = useState<Texts | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const { settings } = useSettings()

  useEffect(() => {
    const loadTexts = async () => {
      const loadedTexts = await getTexts(locale)
      setTexts(loadedTexts)
    }
    loadTexts()
  }, [locale])

  // Detect screen size for responsive WhatsApp link
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Helper function to clean phone number for WhatsApp
  const cleanPhoneNumber = (phone: string) => {
    if (!phone) return '628123456789'
    
    let cleaned = phone.replace(/\D/g, '')
    
    if (cleaned.startsWith('08')) {
      cleaned = '62' + cleaned.substring(1)
    } else if (cleaned.startsWith('8')) {
      cleaned = '62' + cleaned
    } else if (!cleaned.startsWith('62')) {
      cleaned = '628123456789'
    }
    
    return cleaned
  }

  // Generate WhatsApp URL with responsive logic
  const generateWhatsAppURL = () => {
    const phoneNumber = cleanPhoneNumber(settings?.noTelp || '628123456789')
    const message = encodeURIComponent(`Halo, saya ingin mengetahui informasi lebih lanjut mengenai Desa Wisata Alamendah.`)
    
    if (isMobile) {
      return `https://wa.me/${phoneNumber}?text=${message}`
    } else {
      return `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`
    }
  }
  if (!texts) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading translations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <section className="py-12 sm:py-16 pt-20 sm:pt-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
              {texts.contact.title}
            </h1>
            <p className="text-base sm:text-lg text-gray-600 px-4">
              {texts.contact.subtitle}
            </p>
          </div>

          <div className="w-full">
            {/* Contact Information */}
            <div className='w-full max-w-2xl mx-auto'>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 text-center sm:text-left px-4 sm:px-0">
                {texts.contact.contactInfo.title}
              </h2>
              
              <div className="space-y-6 px-4 sm:px-0">
                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <svg className="w-5 h-5 text-green-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-medium text-gray-800">{texts.contact.contactInfo.email.label}</h3>
                      <p className="text-sm sm:text-base text-gray-600 break-words">{settings?.email || texts.contact.contactInfo.email.value}</p>
                      <a 
                        href={generateWhatsAppURL()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 text-sm inline-block mt-1"
                      >
                        Hubungi via WhatsApp
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <svg className="w-5 h-5 text-green-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-medium text-gray-800">{texts.contact.contactInfo.phone.label}</h3>
                      <p className="text-sm sm:text-base text-gray-600">{settings?.noTelp || texts.contact.contactInfo.phone.value}</p>
                      <p className="text-gray-500 text-sm">{texts.contact.contactInfo.phone.hours}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      <svg className="w-5 h-5 text-green-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-medium text-gray-800">{texts.contact.contactInfo.location.label}</h3>
                      <p className="text-sm sm:text-base text-gray-600">{texts.contact.contactInfo.location.value}</p>
                      <p className="text-gray-500 text-sm">{texts.contact.contactInfo.location.note}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer locale={locale} />
    </div>
  )
}
