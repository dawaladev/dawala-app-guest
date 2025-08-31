'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MakananCard from '@/components/MakananCard'
import MakananModal from '@/components/MakananModal'
import FilterPaket from '@/components/FilterPaket'
import SearchBar from '@/components/SearchBar'
import { LoadingCards } from '@/components/LoadingSpinner'
import { JenisPaket, Makanan } from '@/types'
import { getTexts, Texts } from '@/lib/texts'
import { usePathname } from 'next/navigation'
import { getCurrentLocale } from '@/lib/locale'
import { getFoodDescription } from '@/lib/database-i18n'

export default function Menu() {
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
        
        console.log('Menu: Fetching data from APIs...')
        
        const [makananRes, jenisPaketRes] = await Promise.all([
          fetch('/api/makanan'),
          fetch('/api/jenis-paket')
        ])

        console.log('Menu: API Response status:', {
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

        console.log('Menu: Data received:', {
          makananCount: makananData.length,
          jenisPaketCount: jenisPaketData.length
        })

        setMakanan(makananData)
        setJenisPaket(jenisPaketData)
      } catch (error) {
        console.error('Menu: Error fetching data:', error)
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

  // Handle modal
  const handleCardClick = (makananItem: Makanan) => {
    setSelectedMakanan(makananItem)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedMakanan(null)
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
      
      {/* Menu Header */}
      <section className="min-h-[400px] sm:min-h-[500px] bg-gradient-to-r from-green-600 to-green-800 text-white py-12 sm:py-16 flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center h-fit">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            {texts.menu.header.title}
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto">
            {texts.menu.header.subtitle}
          </p>
        </div>
      </section>

      {/* Menu Content */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <FilterPaket
                jenisPaket={jenisPaket}
                selectedPaket={selectedPaket}
                onSelectPaket={setSelectedPaket}
                locale={locale}
                allPackagesText={texts?.menu?.filter?.allPackages || "Semua Paket"}
              />

              {filteredMakanan.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <div className="mb-4">
                    <svg className="mx-auto h-16 w-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600 text-base sm:text-lg mb-2">
                    {searchQuery || selectedPaket ? (texts?.home?.search?.noResults || "No packages match your search") : (texts?.menu?.content?.noPackages || "No packages found")}
                  </p>
                  {searchQuery || selectedPaket ? (
                    <p className="text-gray-500 text-sm">
                      {texts?.home?.search?.tryDifferent || "Try different keywords or filters"}
                    </p>
                  ) : (
                    <p className="text-gray-500 text-sm">{texts?.menu?.content?.noPackagesSubtitle || "Try selecting a different category"}</p>
                  )}
                </div>
              ) : (
                <>
                  {/* Results Info */}
                  <div className="text-center mb-6 sm:mb-8 px-4 sm:px-0">
                    <p className="text-gray-600 text-sm sm:text-base">
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMakanan.map((item) => (
                      <MakananCard 
                        key={item.id} 
                        makanan={item} 
                        locale={locale}
                        onClick={() => handleCardClick(item)}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-600 text-white py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            {texts.menu.cta.title}
          </h2>
          <p className="text-lg sm:text-xl mb-6 sm:mb-8 px-4">
            {texts.menu.cta.subtitle}
          </p>
          <a 
            href="mailto:dawaladev@gmail.com"
            className="inline-block bg-white text-green-600 px-6 sm:px-8 py-3 rounded-lg font-semibold text-base sm:text-lg hover:bg-gray-100 transition-colors"
          >
            {texts.menu.cta.button}
          </a>
        </div>
      </section>

      <Footer locale={locale} />

      {/* Modal */}
      <MakananModal 
        makanan={selectedMakanan}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
