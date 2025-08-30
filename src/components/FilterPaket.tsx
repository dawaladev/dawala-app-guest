import { JenisPaket } from '@/types'
import { getPackageName } from '@/lib/database-i18n'

interface FilterPaketProps {
  jenisPaket: JenisPaket[]
  selectedPaket: number | null
  onSelectPaket: (paketId: number | null) => void
  locale?: 'id' | 'en'
}

export default function FilterPaket({ jenisPaket, selectedPaket, onSelectPaket, locale = 'id' }: FilterPaketProps) {
  return (
    <div className="mb-6 sm:mb-8">
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 px-4 sm:px-0">Filter berdasarkan Kategori</h3>
      <div className="flex flex-wrap gap-2 sm:gap-3 px-4 sm:px-0">
        <button
          onClick={() => onSelectPaket(null)}
          className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors min-h-[44px] ${
            selectedPaket === null
              ? 'bg-green-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Semua Paket
        </button>
        {jenisPaket.map((paket) => (
          <button
            key={paket.id}
            onClick={() => onSelectPaket(paket.id)}
            className={`px-3 sm:px-4 py-2 rounded-full text-sm font-medium cursor-pointer transition-colors min-h-[44px] ${
              selectedPaket === paket.id
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {getPackageName(paket, locale)}
          </button>
        ))}
      </div>
    </div>
  )
}
