'use client'

import { useState, useEffect } from 'react'
import { Makanan } from '@/types'
import Image from 'next/image'
import { getTexts, Texts } from '@/lib/texts'
import { getSupabaseImageUrl } from '@/lib/config'
import { usePathname } from 'next/navigation'
import { getCurrentLocale } from '@/lib/locale'
import { getFoodDescription } from '@/lib/database-i18n'
import { useSettings } from '@/hooks/useSettings'

interface MakananModalProps {
  makanan: Makanan | null
  isOpen: boolean
  onClose: () => void
}

export default function MakananModal({ makanan, isOpen, onClose }: MakananModalProps) {
  // Support single image or array of images from makanan.foto
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isMobile, setIsMobile] = useState(false)
  const pathname = usePathname()
  const locale = getCurrentLocale(pathname)
  const [texts, setTexts] = useState<Texts | null>(null)
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
    
    // Initial check
    checkScreenSize()
    
    // Listen for window resize
    window.addEventListener('resize', checkScreenSize)
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Reset quantity when modal opens with new makanan
  useEffect(() => {
    if (isOpen && makanan) {
      setQuantity(1)
      setCurrentImageIndex(0)
    }
  }, [isOpen, makanan])

  if (!isOpen || !makanan || !texts) return null

  // Quantity control functions
  const increaseQuantity = () => setQuantity(prev => prev + 1)
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1)
  
  // Calculate total price
  const totalPrice = makanan.harga * quantity

  // Generate WhatsApp message
  const generateWhatsAppMessage = () => {
    const message = `Halo, saya tertarik untuk memesan:

Paket: ${makanan.namaMakanan}
Jumlah: ${quantity} paket
Harga satuan: Rp ${makanan.harga.toLocaleString('id-ID')}
Total harga: Rp ${totalPrice.toLocaleString('id-ID')}

Mohon informasi lebih lanjut untuk pemesanan. Terima kasih!`
    
    return encodeURIComponent(message)
  }

  // Generate WhatsApp URL with responsive logic
  const generateWhatsAppURL = () => {
    const phoneNumber = cleanPhoneNumber(settings?.noTelp || '628123456789')
    const message = generateWhatsAppMessage()
    
    if (isMobile) {
      // Mobile: Use WhatsApp app
      return `https://wa.me/${phoneNumber}?text=${message}`
    } else {
      // Desktop: Use WhatsApp Web for better message reliability
      return `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`
    }
  }

  // Helper function to clean phone number for WhatsApp
  const cleanPhoneNumber = (phone: string) => {
    if (!phone) return '628123456789'
    
    // Remove all non-digit characters
    let cleaned = phone.replace(/\D/g, '')
    
    // If starts with 08, replace with 628
    if (cleaned.startsWith('08')) {
      cleaned = '62' + cleaned.substring(1)
    }
    // If starts with 8, add 62
    else if (cleaned.startsWith('8')) {
      cleaned = '62' + cleaned
    }
    // If already starts with 62, keep as is
    else if (!cleaned.startsWith('62')) {
      // If it's some other format, default to 628123456789
      cleaned = '628123456789'
    }
    
    return cleaned
  }

  // Generate Email message
  const generateEmailMessage = () => {
    return `Saya tertarik untuk memesan:

Paket: ${makanan.namaMakanan}
Jumlah: ${quantity} paket
Harga satuan: Rp ${makanan.harga.toLocaleString('id-ID')}
Total harga: Rp ${totalPrice.toLocaleString('id-ID')}

Mohon informasi lebih lanjut untuk pemesanan.`
  }

  // Helper to get correct image src
  const getImageUrl = (fotoStr: string) => {
    return getSupabaseImageUrl(fotoStr);
  };

  // Helper: parse foto field (same as in MakananCard)
  const parsePhotoArray = (foto: string | string[]): string[] => {
    if (!foto) return [];
    
    // If it's a string that looks like JSON, try to parse it
    if (typeof foto === 'string') {
      // Check if it's a JSON string
      if (foto.startsWith('[') && foto.endsWith(']')) {
        try {
          const parsed = JSON.parse(foto);
          if (Array.isArray(parsed)) {
            return parsed.filter((f: string) => 
              typeof f === 'string' && (f.startsWith('http') || f.startsWith('data:image'))
            );
          }
          return [];
        } catch (e) {
          console.log('Error parsing foto JSON in modal:', e);
          return [];
        }
      }
      // If it's a direct URL string
      if (foto.startsWith('http') || foto.startsWith('data:image')) {
        return [foto];
      }
      return [];
    }
    
    if (Array.isArray(foto)) {
      return foto.filter((f: string) => 
        typeof f === 'string' && (f.startsWith('http') || f.startsWith('data:image'))
      );
    }
    
    return [];
  };

  const photoUrls = parsePhotoArray(makanan.foto);
  const images: string[] = photoUrls.length > 0 
    ? photoUrls.map(getImageUrl) 
    : ['/placeholder-food.jpg'];

  console.log('Modal foto raw:', makanan.foto);
  console.log('Modal parsed photos:', photoUrls);
  console.log('Modal final images:', images);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }
  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const closeFullscreen = () => {
    setIsFullscreen(false)
  }

  return (
    <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="rounded-xl bg-white shadow-xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        <div className="bg-white rounded-xl overflow-y-auto max-h-[95vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 line-clamp-1 pr-4">{makanan.namaMakanan}</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl sm:text-3xl font-semibold cursor-pointer flex-shrink-0 w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            {/* Image Slider */}
            <div className="relative mb-4 sm:mb-6">
              <div 
                className="relative h-48 sm:h-64 lg:h-80 rounded-lg overflow-hidden cursor-pointer"
                onClick={toggleFullscreen}
              >
                <Image
                  src={images[currentImageIndex] || '/placeholder-food.jpg'}
                  alt={makanan.namaMakanan || 'Gambar makanan'}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 60vw"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-food.jpg';
                  }}
                />
                {/* Click to expand indicator */}
                <div className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-black bg-opacity-50 text-white p-1.5 sm:p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                  </svg>
                </div>
                {/* Navigation Arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1.5 sm:p-2 shadow-lg transition-all cursor-pointer"
                    >
                      <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-1.5 sm:p-2 shadow-lg transition-all cursor-pointer"
                    >
                      <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              {/* Image Dots Indicator */}
              {images.length > 1 && images.length <= 5 && (
                <div className="flex justify-center mt-3 sm:mt-4 space-x-1.5 sm:space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        goToImage(index);
                      }}
                      className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full transition-all touch-target ${
                        index === currentImageIndex ? 'bg-green-600' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
              {/* Image Counter for many images */}
              {images.length > 5 && (
                <div className="flex justify-center mt-3 sm:mt-4">
                  <div className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-4 sm:space-y-6">
              {/* Price and Quantity Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl sm:text-2xl font-bold text-green-600">
                      Rp {makanan.harga.toLocaleString('id-ID')}
                    </span>
                    <span className="text-sm text-gray-500 block">per paket</span>
                  </div>
                  
                  {/* Quantity Selector */}
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700">Jumlah:</span>
                    <div className="flex items-center border border-gray-300 rounded-lg">
                      <button
                        onClick={decreaseQuantity}
                        className="p-2 text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="px-4 py-2 font-medium text-gray-800">{quantity}</span>
                      <button
                        onClick={increaseQuantity}
                        className="p-2 text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <svg className="w-4 h-4 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Total Price */}
                {quantity > 1 && (
                  <div className="flex justify-between items-center text-lg font-bold text-green-600 bg-green-50 p-3 rounded-lg">
                    <span>Total ({quantity} paket):</span>
                    <span>Rp {totalPrice.toLocaleString('id-ID')}</span>
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">{texts.modal.description}</h3>
                <div className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">
                  {getFoodDescription(makanan, locale)}
                </div>
              </div>
              
              <div className="border-t pt-4 sm:pt-6">
                <h4 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">{texts.modal.reservation.title}</h4>
                <div className="space-x-2 space-y-2">
                  {/* WhatsApp Button */}
                  <a 
                    href={generateWhatsAppURL()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center bg-green-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                    </svg>
                    Pesan via WhatsApp
                  </a>
                  
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      {isFullscreen && (
        <div className="fixed inset-0 backdrop-blur-lg bg-black bg-opacity-80 flex items-center justify-center z-[60]">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-green-600 text-white text-2xl sm:text-4xl font-bold hover:bg-green-700 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center z-10 cursor-pointer"
            >
              ×
            </button>
            
            {/* Fullscreen Image */}
            <div className="relative w-full h-full flex items-center justify-center p-4">
              <Image
                src={images[currentImageIndex] || '/placeholder-food.jpg'}
                alt={makanan.namaMakanan || 'Gambar makanan'}
                fill
                className="object-contain"
                sizes="100vw"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/placeholder-food.jpg';
                }}
              />
            </div>

            {/* Navigation Arrows for Fullscreen */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white rounded-full p-2 sm:p-4 transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white rounded-full p-2 sm:p-4 transition-all cursor-pointer"
                >
                  <svg className="w-5 h-5 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-12 sm:bottom-16 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm sm:text-base">
                {currentImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Image Dots for Fullscreen - only show for 5 or fewer images */}
            {images.length > 1 && images.length <= 5 && (
              <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-1.5 sm:space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full transition-all cursor-pointer ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
