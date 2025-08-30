import Image from 'next/image'
import { Makanan } from '@/types'
import { getSupabaseImageUrl } from '@/lib/config'
import { getFoodDescription, getPackageName } from '@/lib/database-i18n'

interface MakananCardProps {
  makanan: Makanan
  onClick?: () => void
  locale?: 'id' | 'en'
}


export default function MakananCard({ makanan, onClick, locale = 'id' }: MakananCardProps) {


  // Helper: get first valid image string from foto array
  const getFirstValidImage = (foto: any) => {
    console.log('Raw foto value:', foto, 'Type:', typeof foto);
    
    if (!foto) return '';
    
    // If it's a string that looks like JSON, try to parse it
    if (typeof foto === 'string') {
      // Check if it's a JSON string
      if (foto.startsWith('[') && foto.endsWith(']')) {
        try {
          const parsed = JSON.parse(foto);
          console.log('Parsed foto array:', parsed);
          if (Array.isArray(parsed)) {
            // Find first valid string (http/https or base64)
            for (const f of parsed) {
              if (typeof f === 'string' && (f.startsWith('http') || f.startsWith('data:image'))) {
                console.log('Found valid image URL:', f);
                return f;
              }
            }
          }
          return '';
        } catch (e) {
          console.log('Error parsing foto JSON:', e);
          // Maybe it's a direct URL string without JSON wrapping
          if (foto.startsWith('http') || foto.startsWith('data:image')) {
            console.log('Using direct URL string:', foto);
            return foto;
          }
          return '';
        }
      }
      // If it's a direct URL string
      if (foto.startsWith('http') || foto.startsWith('data:image')) {
        console.log('Using direct URL string:', foto);
        return foto;
      }
      return '';
    }
    
    if (Array.isArray(foto)) {
      console.log('Processing array:', foto);
      // Find first valid string (http/https or base64)
      for (const f of foto) {
        if (typeof f === 'string' && (f.startsWith('http') || f.startsWith('data:image'))) {
          console.log('Found valid image URL from array:', f);
          return f;
        }
      }
      return '';
    }
    
    console.log('No valid image found, using placeholder');
    return '';
  };

  // Helper to get correct image src
  const getImageUrl = (fotoStr: string) => {
    return getSupabaseImageUrl(fotoStr);
  };


  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Debug: log isi makanan.foto mentah  
  console.log('=== MakananCard DEBUG ===');
  console.log('MakananCard foto:', makanan.foto);
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:scale-105"
      onClick={onClick}
    >
      <div className="relative h-48 sm:h-52 w-full">
        {(() => {
          // Always use first valid image string
          let imageUrl = getFirstValidImage(makanan.foto);
          if (!imageUrl) imageUrl = '/placeholder-food.jpg';
          console.log('Image URL:', imageUrl);
          return (
            <Image
              src={imageUrl}
              alt={makanan.namaMakanan || 'Gambar makanan'}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          );
        })()}
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="font-semibold text-base sm:text-lg text-gray-800 mb-2 line-clamp-1">
          {makanan.namaMakanan}
        </h3>
        <p className="text-gray-600 text-sm sm:text-base mb-3 line-clamp-2">
          {getFoodDescription(makanan, locale)}
        </p>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
          <span className="text-lg sm:text-xl font-bold text-green-600">
            {formatRupiah(makanan.harga)}
          </span>
          {makanan.jenisPaket && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-1 rounded self-start sm:self-auto">
              {getPackageName(makanan.jenisPaket || {}, locale)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
