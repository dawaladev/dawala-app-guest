
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


export default function Home() {
  const [makanan, setMakanan] = useState<Makanan[]>([])
  const [jenisPaket, setJenisPaket] = useState<JenisPaket[]>([])
  const [selectedPaket, setSelectedPaket] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedMakanan, setSelectedMakanan] = useState<Makanan | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
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
            href="mailto:dawaladev@gmail.com"
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
              href={`mailto:${texts.footer.contactInfo.email}`}
              className="inline-block bg-white text-green-600 px-6 sm:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors shadow-lg"
            >
              {texts.home.cta.emailButton}
            </a>
            <a 
              href="tel:+62123456789"
              className="inline-block bg-transparent border-2 border-white text-white px-6 sm:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg hover:bg-white hover:text-green-600 transition-colors"
            >
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
