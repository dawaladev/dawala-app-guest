'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function LocaleProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  useEffect(() => {
    // Update html lang attribute based on current locale
    const locale = pathname.startsWith('/en') ? 'en' : 'id'
    document.documentElement.lang = locale
  }, [pathname])

  return <>{children}</>
}
