
'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MakananCard from '@/components/MakananCard'
import MakananModal from '@/components/MakananModal'
import FilterPaket from '@/components/FilterPaket'
import SearchBar from '@/components/SearchBar'
import { LoadingCards } from '@/components/LoadingSpinner'
import { JenisPaket, Makanan } from '@/types'
import { getTexts, Texts } from '@/lib/texts'
import { getCurrentLocale } from '@/lib/locale'
import { getFoodDescription } from '@/lib/database-i18n'
import { useSettings } from '@/hooks/useSettings'


export default function Home() {
  const [makanan, setMakanan] = useState<Makanan[]>([])
  const [jenisPaket, setJenisPaket] = useState<JenisPaket[]>([])
  const [selectedPaket, setSelectedPaket] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMakanan, setSelectedMakanan] = useState<Makanan | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
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
  const generateWhatsAppURL = (message: string) => {
    const phoneNumber = cleanPhoneNumber(settings?.noTelp || '628123456789')
    const encodedMessage = encodeURIComponent(message)
    
    if (isMobile) {
      return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    } else {
      return `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`
    }
  }


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching data from APIs...')
        
        const [makananRes, jenisPaketRes] = await Promise.all([
          fetch('/api/makanan'),
          fetch('/api/jenis-paket')
        ])

        console.log('API Response status:', {
          makanan: makananRes.status,
          jenisPaket: jenisPaketRes.status
        })

        if (!makananRes.ok || !jenisPaketRes.ok) {
          throw new Error(`API Error: makanan=${makananRes.status}, jenisPaket=${jenisPaketRes.status}`)
        }

        const [makananData, jenisPaketData] = await Promise.all([
          makananRes.json(),
          jenisPaketRes.json()
        ])

        console.log('Data received:', {
          makananCount: makananData.length,
          jenisPaketCount: jenisPaketData.length
        })

        setMakanan(makananData)
        setJenisPaket(jenisPaketData)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter function for search and category
  const filteredMakanan = makanan.filter((item) => {
    // Filter by category
    const matchesCategory = selectedPaket === null || item.jenisPaketId === selectedPaket
    
    // Filter by search query (search in name and description)
    const matchesSearch = searchQuery === '' || 
      item.namaMakanan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getFoodDescription(item, locale).toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesCategory && matchesSearch
  })

  const openModal = (item: Makanan) => {
    setSelectedMakanan(item)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSelectedMakanan(null)
    setIsModalOpen(false)
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
      
      {/* Hero Section dengan Background Image */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <Image
            src={texts.images.hero}
            alt="Pemandangan Desa Wisata Alamendah"
            fill
            className="object-cover brightness-50"
            priority
          />
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 drop-shadow-lg">
            {texts.home.hero.title}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 drop-shadow-lg px-4">
            {texts.home.hero.subtitle}
          </p>
          <a 
            href={generateWhatsAppURL('Halo, saya tertarik untuk mengetahui lebih lanjut tentang paket wisata dan kuliner di Desa Wisata Alamendah.')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-green-600 hover:bg-green-700 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg transition-colors shadow-lg"
          >
            {texts.home.hero.ctaButton}
          </a>
        </div>
      </section>

      {/* Featured Menu Section - Highlighted */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50 relative">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-50/30 to-blue-50/30"></div>
        <div className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 sm:mb-16">
              <div className="inline-block">
                <span className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold tracking-wide uppercase mb-4 inline-block">
                  {texts.home.featured.badge}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 sm:mb-6">
                {texts.home.featured.title}
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
                {texts.home.featured.description}
              </p>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-8 mx-4 sm:mx-0">
                {error}
              </div>
            )}

            {loading ? (
              <LoadingCards />
            ) : (
              <>
                {/* Search Bar */}
                <SearchBar 
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  placeholder={texts?.home?.search?.placeholder || "Cari paket..."}
                />

                {/* Filter Paket */}
                <div className="mb-8 sm:mb-12">
                  <FilterPaket 
                    jenisPaket={jenisPaket}
                    selectedPaket={selectedPaket}
                    onSelectPaket={setSelectedPaket}
                    locale={locale}
                    allPackagesText={texts?.menu?.filter?.allPackages || "Semua Paket"}
                  />
                </div>

                {/* Results Info */}
                {(searchQuery || selectedPaket) && (
                  <div className="mb-6 text-center px-4 sm:px-0">
                    <p className="text-sm sm:text-base text-gray-600">
                      {texts?.home?.search?.results?.replace('{count}', filteredMakanan.length.toString()) || `Found ${filteredMakanan.length} packages`}
                      {searchQuery && (
                        <span className="font-medium">
                          {' '}{texts?.home?.search?.forQuery?.replace('{query}', `"${searchQuery}"`) || `for "${searchQuery}"`}
                        </span>
                      )}
                      {selectedPaket && (
                        <span className="font-medium">
                          {' '}{texts?.home?.search?.inCategory || "in selected category"}
                        </span>
                      )}
                    </p>
                    {(searchQuery || selectedPaket) && (
                      <button
                        onClick={() => {
                          setSearchQuery('')
                          setSelectedPaket(null)
                        }}
                        className="mt-2 text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
                      >
                        {texts?.home?.search?.clearFilters || "Clear all filters"}
                      </button>
                    )}
                  </div>
                )}

                {filteredMakanan.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mb-4">
                      <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-600 text-lg mb-2">
                      {searchQuery || selectedPaket ? (texts?.home?.search?.noResults || "No packages match your search") : (texts?.home?.errors?.noPackages || "No packages found")}
                    </p>
                    {searchQuery || selectedPaket ? (
                      <p className="text-gray-500 text-sm">
                        {texts?.home?.search?.tryDifferent || "Try different keywords or filters"}
                      </p>
                    ) : null}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                    {filteredMakanan.map((item) => (
                      <div key={item.id} className="transform hover:scale-105 transition-all duration-300">
                        <MakananCard 
                          makanan={item} 
                          onClick={() => openModal(item)}
                          locale={locale}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
                {texts.home.about.title}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
                {texts.home.about.description1}
              </p>
              <p className="text-base sm:text-lg text-gray-600">
                {texts.home.about.description2}
              </p>
            </div>
            <div className="relative h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden shadow-lg order-1 lg:order-2">
              <Image
                src={texts.images.about}
                alt="Suasana Desa Wisata Alamendah"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Activities Gallery */}
      <section className="py-12 sm:py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
              {texts.home.activities.title}
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              {texts.home.activities.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1 - Budaya */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative h-48 sm:h-64">
                <Image
                  src={texts.images.activities.culture}
                  alt="Wisata Budaya"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">{texts.home.activities.culture.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {texts.home.activities.culture.description}
                </p>
              </div>
            </div>

            {/* Card 2 - Alam */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
              <div className="relative h-48 sm:h-64">
                <Image
                  src={texts.images.activities.nature}
                  alt="Wisata Alam"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">{texts.home.activities.nature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {texts.home.activities.nature.description}
                </p>
              </div>
            </div>

            {/* Card 3 - Edukasi */}
            <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow sm:col-span-2 lg:col-span-1 sm:mx-auto lg:mx-0 max-w-sm sm:max-w-none">
              <div className="relative h-48 sm:h-64">
                <Image
                  src={texts.images.activities.education}
                  alt="Wisata Edukasi"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4 sm:p-6">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">{texts.home.activities.education.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">
                  {texts.home.activities.education.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comfort & Accommodation Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="relative h-64 sm:h-80 lg:h-96 rounded-lg overflow-hidden shadow-lg">
              <Image
                src={texts.images.accommodation}
                alt="Pemandangan dari Akomodasi"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
                {texts.home.accommodation.title}
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6">
                {texts.home.accommodation.description}
              </p>
              <div className="space-y-3 sm:space-y-4">
                {texts.home.accommodation.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-green-600 rounded-full mr-3 flex-shrink-0"></div>
                    <span className="text-sm sm:text-base text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-green-600 to-green-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">
            {texts.home.cta.title}
          </h2>
          <p className="text-lg sm:text-xl text-green-100 mb-6 sm:mb-8 px-4">
            {texts.home.cta.subtitle}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
            <a 
              href={generateWhatsAppURL('Halo, saya ingin bertanya mengenai paket wisata dan kuliner yang tersedia di Desa Wisata Alamendah.')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-white text-green-600 px-3 sm:px-4 py-3 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors shadow-lg justify-center w-fit mx-auto"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              {texts.home.cta.contactButton}
            </a>
          </div>
        </div>
      </section>

      <Footer locale={locale} />
      
      {/* Modal */}
      <MakananModal
        makanan={selectedMakanan}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </div>
  )
}
