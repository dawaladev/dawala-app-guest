'use client'

import { useState, useEffect } from 'react'
import { Makanan } from '@/types'
import Image from 'next/image'
import { getTexts, Texts } from '@/lib/texts'
import { getSupabaseImageUrl } from '@/lib/config'
import { usePathname } from 'next/navigation'
import { getCurrentLocale } from '@/lib/locale'
import { getFoodDescription } from '@/lib/database-i18n'

interface MakananModalProps {
  makanan: Makanan | null
  isOpen: boolean
  onClose: () => void
}

export default function MakananModal({ makanan, isOpen, onClose }: MakananModalProps) {
  // Support single image or array of images from makanan.foto
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const pathname = usePathname()
  const locale = getCurrentLocale(pathname)
  const [texts, setTexts] = useState<Texts | null>(null)

  useEffect(() => {
    const loadTexts = async () => {
      const loadedTexts = await getTexts(locale)
      setTexts(loadedTexts)
    }
    loadTexts()
  }, [locale])
  if (!isOpen || !makanan || !texts) return null

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
    <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
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
              {images.length > 1 && (
                <div className="flex justify-center mt-3 sm:mt-4 space-x-2">
                  {images.map((_, index) => (
                    <button
                      key={index}
                      onClick={(e) => {
                        e.stopPropagation();
                        goToImage(index);
                      }}
                      className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-green-600' : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-2xl sm:text-3xl font-bold text-green-600">
                  Rp {makanan.harga.toLocaleString('id-ID')}
                </span>
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-2 sm:mb-3">{texts.modal.description}</h3>
                <div className="text-sm sm:text-base text-gray-600 leading-relaxed whitespace-pre-line">
                  {getFoodDescription(makanan, locale)}
                </div>
              </div>
              <div className="border-t pt-4 sm:pt-6">
                <h4 className="font-semibold text-gray-800 mb-3 sm:mb-4 text-sm sm:text-base">{texts.modal.reservation.title}</h4>
                <a 
                  href={`mailto:dawaladev@gmail.com?subject=${texts.modal.reservation.emailSubject}&body=${texts.modal.reservation.emailBody.replace('{packageName}', makanan.namaMakanan)}`}
                  className="inline-flex items-center bg-green-600 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {texts.modal.reservation.button}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Image Viewer */}
      {isFullscreen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-95 flex items-center justify-center z-[60]">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-green-600 text-white text-2xl sm:text-4xl font-bold hover:bg-green-700 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center z-10"
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
                  className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white rounded-full p-2 sm:p-4 transition-all"
                >
                  <svg className="w-5 h-5 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white rounded-full p-2 sm:p-4 transition-all"
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

            {/* Image Dots for Fullscreen */}
            {images.length > 1 && (
              <div className="absolute bottom-4 sm:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all ${
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
