"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { getTexts, Texts } from '@/lib/texts';
import { getCurrentLocale } from '@/lib/locale';
import { useSettings } from '@/hooks/useSettings';
import LanguageSwitcher from './LanguageSwitcher';


export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [texts, setTexts] = useState<Texts | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);
  const { settings } = useSettings();

  useEffect(() => {
    const loadTexts = async () => {
      const loadedTexts = await getTexts(locale);
      setTexts(loadedTexts);
    };
    loadTexts();
  }, [locale]);

  // Detect screen size for responsive WhatsApp link
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Helper function to clean phone number for WhatsApp
  const cleanPhoneNumber = (phone: string) => {
    if (!phone) return '628123456789';
    
    let cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('08')) {
      cleaned = '62' + cleaned.substring(1);
    } else if (cleaned.startsWith('8')) {
      cleaned = '62' + cleaned;
    } else if (!cleaned.startsWith('62')) {
      cleaned = '628123456789';
    }
    
    return cleaned;
  };

  // Generate WhatsApp URL with responsive logic
  const generateWhatsAppURL = () => {
    const phoneNumber = cleanPhoneNumber(settings?.noTelp || '628123456789');
    const message = encodeURIComponent(`Halo, saya ingin mengetahui lebih lanjut tentang paket wisata dan kuliner di Desa Wisata Alamendah.`);
    
    if (isMobile) {
      return `https://wa.me/${phoneNumber}?text=${message}`;
    } else {
      return `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${message}`;
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!texts) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg py-2' 
        : 'bg-white/90 backdrop-blur-sm shadow-md py-4'
    }`}>
      <div className="max-w-full mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="flex items-center">
              <Image
                src="/Dawala.png"
                alt={texts.header.logoAlt}
                width={isScrolled ? 160 : 192}
                height={isScrolled ? 40 : 48}
                className={`w-auto transition-all duration-300 ${
                  isScrolled ? 'h-8 sm:h-10' : 'h-10 sm:h-12'
                }`}
              />
            </Link>
          </div>

          {/* Desktop Navigation - Centered */}
          <nav className="hidden md:flex items-center justify-center flex-1 mx-8">
            <div className="flex items-center space-x-8">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-green-600 transition-colors font-medium"
              >
                {texts.header.navigation.home}
              </Link>
              <Link 
                href="/menu" 
                className="text-gray-600 hover:text-green-600 transition-colors font-medium"
              >
                {texts.header.navigation.menu}
              </Link>
              <Link 
                href="/contact" 
                className="text-gray-600 hover:text-green-600 transition-colors font-medium"
              >
                {texts.header.navigation.contact}
              </Link>
            </div>
          </nav>

          {/* Right Side - Language & Contact */}
          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            <LanguageSwitcher />
            <a 
              href={generateWhatsAppURL()}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-all duration-300 ${
                isScrolled ? 'px-3 py-2' : 'px-4 py-2'
              }`}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              {texts.header.contactButton}
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-green-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Toggle mobile menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 mt-4 pt-4">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className="text-gray-600 hover:text-green-600 transition-colors font-medium block py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {texts.header.navigation.home}
              </Link>
              <Link 
                href="/menu" 
                className="text-gray-600 hover:text-green-600 transition-colors font-medium block py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {texts.header.navigation.menu}
              </Link>
              <Link 
                href="/contact" 
                className="text-gray-600 hover:text-green-600 transition-colors font-medium block py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {texts.header.navigation.contact}
              </Link>
              <a 
                href={generateWhatsAppURL()}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-4 py-3 rounded-md text-center font-medium hover:bg-green-700 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {texts.header.contactButton}
              </a>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
