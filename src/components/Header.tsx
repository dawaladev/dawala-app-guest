"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getTexts } from '@/lib/texts';
import { getCurrentLocale } from '@/lib/locale';
import LanguageSwitcher from './LanguageSwitcher';


export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [texts, setTexts] = useState<any>(null);
  const pathname = usePathname();
  const locale = getCurrentLocale(pathname);

  useEffect(() => {
    const loadTexts = async () => {
      const loadedTexts = await getTexts(locale);
      setTexts(loadedTexts);
    };
    loadTexts();
  }, [locale]);

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
              <img
                src="/Dawala.png"
                alt={texts.header.logoAlt}
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
              href="mailto:dawaladev@gmail.com"
              className={`bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-all duration-300 ${
                isScrolled ? 'px-3 py-2' : 'px-4 py-2'
              }`}
            >
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
                href="mailto:dawaladev@gmail.com"
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
