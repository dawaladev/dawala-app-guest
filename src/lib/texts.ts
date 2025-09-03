import { translateText } from './translate'

// Type definition for the texts structure
export interface Texts {
  header: {
    logoAlt: string
    navigation: {
      home: string
      menu: string
      contact: string
    }
    contactButton: string
  }
  footer: {
    companyName: string
    description: string
    subDescription: string
    contactInfo: {
      title: string
      email: string
      phone: string
      location: string
    }
    quickLinks: {
      title: string
      home: string
      contact: string
      reservation: string
    }
    copyright: string
  }
  home: {
    hero: {
      title: string
      subtitle: string
      ctaButton: string
    }
    featured: {
      badge: string
      title: string
      description: string
    }
    about: {
      title: string
      description1: string
      description2: string
    }
    activities: {
      title: string
      subtitle: string
      culture: {
        title: string
        description: string
      }
      nature: {
        title: string
        description: string
      }
      education: {
        title: string
        description: string
      }
    }
    accommodation: {
      title: string
      description: string
      features: string[]
    }
    cta: {
      title: string
      subtitle: string
      emailButton: string
      contactButton: string
    }
    search: {
      placeholder: string
      results: string
      forQuery: string
      inCategory: string
      clearFilters: string
      noResults: string
      tryDifferent: string
    }
    errors: {
      noPackages: string
    }
  }
  contact: {
    title: string
    subtitle: string
    contactInfo: {
      title: string
      email: {
        label: string
        value: string
        link: string
      }
      phone: {
        label: string
        value: string
        hours: string
      }
      location: {
        label: string
        value: string
        note: string
      }
    }
  }
  menu: {
    header: {
      title: string
      subtitle: string
    }
    content: {
      noPackages: string
      noPackagesSubtitle: string
      showingPackages: string
      inCategory: string
    }
    cta: {
      title: string
      subtitle: string
      button: string
    }
    filter: {
      allPackages: string
    }
  }
  modal: {
    description: string
    reservation: {
      title: string
      button: string
      emailSubject: string
      emailBody: string
    }
  }
  common: {
    loading: string
    error: string
    retry: string
  }
  images: {
    logo: string
    hero: string
    about: string
    activities: {
      culture: string
      nature: string
      education: string
    }
    accommodation: string
  }
}

// Cache untuk terjemahan
const translationCache = new Map<string, string>()

// Function to generate English translations automatically
const generateEnglishTranslations = async (idTexts: Texts): Promise<Texts> => {
  const translateField = async (text: string): Promise<string> => {
    if (typeof text !== 'string' || text.length < 3) return text
    
    // Check cache first
    if (translationCache.has(text)) {
      return translationCache.get(text)!
    }
    
    try {
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise<string>((_, reject) => 
        setTimeout(() => reject(new Error('Translation timeout')), 3000)
      )
      
      const translatePromise = translateText(text, 'en').then(result => result.translatedText)
      
      const translatedText = await Promise.race([translatePromise, timeoutPromise])
      
      // Cache the result
      translationCache.set(text, translatedText)
      return translatedText
    } catch {
      // Fallback to original text
      translationCache.set(text, text)
      return text
    }
  }

  const translateObject = async (obj: unknown): Promise<unknown> => {
    if (typeof obj === 'string') {
      return await translateField(obj)
    }
    if (Array.isArray(obj)) {
      return Promise.all(obj.map(item => translateObject(item)))
    }
    if (obj && typeof obj === 'object') {
      const result: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(obj)) {
        // Skip translation for images object to prevent path corruption
        if (key === 'images') {
          result[key] = value
        } else {
          result[key] = await translateObject(value)
        }
      }
      return result
    }
    return obj
  }

  return await translateObject(idTexts) as Texts
}

// Function to get texts with type safety
export const getTexts = async (locale: 'id' | 'en' = 'id'): Promise<Texts> => {
  
  // Import JSON data directly to avoid Turbopack HMR issues
  const textsDataId = {
    "header": {
      "logoAlt": "Logo Alamendah",
      "navigation": {
        "home": "Beranda",
        "menu": "Menu",
        "contact": "Kontak"
      },
      "contactButton": "Hubungi Kami"
    },
    "footer": {
      "companyName": "DESA WISATA ALAMENDAH",
      "description": "Desa wisata yang menawarkan pengalaman kuliner dan wisata terbaik di Kabupaten Bandung dengan berbagai paket wisata dan kuliner yang menarik.",
      "subDescription": "Nikmati keindahan alam dan cita rasa kuliner lokal yang autentik di Jawa Barat.",
      "contactInfo": {
        "title": "Informasi Kontak",
        "email": "dawaladev@gmail.com",
        "phone": "+62 xxx-xxxx-xxxx",
        "location": "Desa Wisata Alamendah, Kab. Bandung, Indonesia"
      },
      "quickLinks": {
        "title": "Menu Cepat",
        "home": "Beranda",
        "contact": "Hubungi Kami",
        "reservation": "Reservasi"
      },
      "copyright": "© 2025 UNIVERSITAS PERTAMINA. All rights reserved."
    },
    "home": {
      "hero": {
        "title": "Selamat Datang di Desa Wisata Alamendah",
        "subtitle": "Jelajahi keindahan alam Kabupaten Bandung, nikmati kuliner autentik, dan rasakan pengalaman wisata yang tak terlupakan",
        "ctaButton": "Rencanakan Kunjungan"
      },
      "featured": {
        "badge": "Unggulan Kami",
        "title": "Paket Wisata & Kuliner",
        "description": "Temukan berbagai pilihan paket wisata dan kuliner yang telah kami siapkan khusus untuk pengalaman yang berkesan di Desa Wisata Alamendah, Kabupaten Bandung"
      },
      "about": {
        "title": "Tentang Desa Wisata Alamendah",
        "description1": "Desa Wisata Alamendah di Kabupaten Bandung menawarkan pengalaman autentik kehidupan pedesaan dengan keindahan alam yang menakjubkan. Nikmati aktivitas wisata yang beragam, mulai dari wisata alam, budaya, hingga kuliner tradisional yang lezat.",
        "description2": "Dengan pemandangan pegunungan yang indah dan udara yang sejuk, Alamendah adalah destinasi sempurna untuk melepas penat dari kehidupan kota yang sibuk."
      },
      "activities": {
        "title": "Aktivitas & Pengalaman",
        "subtitle": "Berbagai kegiatan menarik menanti Anda di Desa Wisata Alamendah, Kabupaten Bandung",
        "culture": {
          "title": "Wisata Budaya",
          "description": "Saksikan pertunjukan seni budaya lokal dan pelajari tradisi yang telah turun temurun"
        },
        "nature": {
          "title": "Wisata Alam",
          "description": "Jelajahi keindahan alam dengan tracking, bird watching, dan aktivitas outdoor lainnya"
        },
        "education": {
          "title": "Wisata Edukasi",
          "description": "Program edukasi dan workshop untuk mengenal lebih dekat kehidupan pedesaan"
        }
      },
      "accommodation": {
        "title": "Akomodasi yang Nyaman",
        "description": "Menginaplah dengan pemandangan yang menakjubkan langsung dari jendela kamar Anda. Rasakan kenyamanan fasilitas modern dengan nuansa tradisional yang autentik.",
        "features": [
          "Pemandangan pegunungan yang indah",
          "Udara segar dan sejuk",
          "Fasilitas lengkap dan modern"
        ]
      },
      "cta": {
        "title": "Siap untuk Petualangan yang Tak Terlupakan?",
        "subtitle": "Hubungi kami sekarang dan rencanakan kunjungan Anda ke Desa Wisata Alamendah, Kabupaten Bandung",
        "emailButton": "Email Kami",
        "contactButton": "Hubungi Kami"
      },
      "search": {
        "placeholder": "Cari paket...",
        "results": "Menampilkan {count} paket",
        "forQuery": "untuk \"{query}\"",
        "inCategory": "di kategori yang dipilih",
        "clearFilters": "Hapus semua filter",
        "noResults": "Tidak ada paket yang cocok",
        "tryDifferent": "Coba kata kunci atau filter yang berbeda"
      },
      "errors": {
        "noPackages": "Tidak ada paket yang ditemukan."
      }
    },
    "contact": {
      "title": "Hubungi Kami",
      "subtitle": "Hubungi kami untuk informasi lebih lanjut tentang paket wisata dan kuliner",
      "contactInfo": {
        "title": "Informasi Kontak",
        "email": {
          "label": "Email",
          "value": "dawaladev@gmail.com",
          "link": "Kirim email ke kami"
        },
        "phone": {
          "label": "Telepon",
          "value": "+62 xxx-xxxx-xxxx",
          "hours": "Tersedia 08.00 - 17.00 WIB"
        },
        "location": {
          "label": "Lokasi",
          "value": "Desa Wisata Alamendah, Kabupaten Bandung, Jawa Barat, Indonesia",
          "note": "Melayani wisatawan dari berbagai daerah"
        }
      }
    },
    "menu": {
      "header": {
        "title": "Paket Wisata & Kuliner Lengkap",
        "subtitle": "Jelajahi semua pilihan paket wisata dan kuliner yang tersedia di Desa Wisata Alamendah, Kabupaten Bandung"
      },
      "content": {
        "noPackages": "Tidak ada paket yang ditemukan.",
        "noPackagesSubtitle": "Coba pilih kategori paket yang berbeda.",
        "showingPackages": "Menampilkan {count} paket",
        "inCategory": "dalam kategori {category}"
      },
      "cta": {
        "title": "Siap untuk Berwisata?",
        "subtitle": "Hubungi tim kami untuk merencanakan kunjungan dan mendapatkan penawaran khusus",
        "button": "Hubungi Kami Sekarang"
      },
      "filter": {
        "allPackages": "Semua Kategori"
      }
    },
    "modal": {
      "description": "Deskripsi",
      "reservation": {
        "title": "Informasi & Reservasi",
        "button": "Reservasi Sekarang",
        "emailSubject": "Reservasi Paket Wisata",
        "emailBody": "Saya tertarik dengan paket: {packageName}"
      }
    },
    "common": {
      "loading": "Memuat...",
      "error": "Terjadi kesalahan",
      "retry": "Coba lagi"
    },
    "images": {
      "logo": "/Dawala.png",
      "hero": "/images/DSC06062.JPG",
      "about": "/images/Desa Wisata Alamendah (118).JPG",
      "activities": {
        "culture": "/images/12.jpg",
        "nature": "/images/DSC01831.JPG",
        "education": "/images/5.jpg"
      },
      "accommodation": "/images/WhatsApp Image 2022-12-01 at 15.37.06.jpeg"
    }
  }


  
  if (locale === 'id') {
    return textsDataId as Texts
  } else {
    // Try to generate English translations automatically with fallback
    try {
      const translatedTexts = await generateEnglishTranslations(textsDataId)
      return translatedTexts as Texts
    } catch (error) {
      console.warn('Translation failed, using fallback:', error)
      // Fallback to simple English translations
      return {
        ...textsDataId,
        header: {
          ...textsDataId.header,
          logoAlt: "Alamendah Logo",
          navigation: {
            home: "Home",
            menu: "Menu", 
            contact: "Contact"
          },
          contactButton: "Contact Us"
        },
        footer: {
          ...textsDataId.footer,
          companyName: "ALAMENDAH TOURISM VILLAGE",
          description: "A tourism village offering the best culinary and tourism experiences in Bandung Regency with various attractive tourism and culinary packages.",
          subDescription: "Enjoy the beauty of nature and authentic local culinary flavors in West Java.",
          contactInfo: {
            ...textsDataId.footer.contactInfo,
            title: "Contact Information",
            location: "Alamendah Tourism Village, Bandung Regency, Indonesia"
          },
          quickLinks: {
            title: "Quick Menu",
            home: "Home",
            contact: "Contact Us",
            reservation: "Reservation"
          },
          copyright: "© 2025 UNIVERSITAS PERTAMINA. All rights reserved."
        },
        home: {
          ...textsDataId.home,
          hero: {
            title: "Welcome to Alamendah Tourism Village",
            subtitle: "Explore the beauty of Bandung Regency, enjoy authentic cuisine, and experience unforgettable tourism",
            ctaButton: "Plan Your Visit"
          },
          featured: {
            badge: "Our Featured",
            title: "Tourism & Culinary Packages",
            description: "Discover various tourism and culinary package options that we have prepared specifically for a memorable experience at Alamendah Tourism Village, Bandung Regency"
          },
          about: {
            title: "About Alamendah Tourism Village",
            description1: "Alamendah Tourism Village in Bandung Regency offers an authentic rural life experience with amazing natural beauty. Enjoy diverse tourism activities, from nature tourism, culture, to delicious traditional cuisine.",
            description2: "With beautiful mountain views and cool air, Alamendah is the perfect destination to escape from busy city life."
          },
          activities: {
            title: "Activities & Experiences",
            subtitle: "Various interesting activities await you at Alamendah Tourism Village, Bandung Regency",
            culture: {
              title: "Cultural Tourism",
              description: "Witness local cultural art performances and learn traditions that have been passed down for generations"
            },
            nature: {
              title: "Nature Tourism", 
              description: "Explore the beauty of nature with tracking, bird watching, and other outdoor activities"
            },
            education: {
              title: "Educational Tourism",
              description: "Educational programs and workshops to get to know rural life more closely"
            }
          },
          accommodation: {
            title: "Comfortable Accommodation",
            description: "Stay with amazing views directly from your room window. Experience the comfort of modern facilities with authentic traditional nuances.",
            features: [
              "Beautiful mountain views",
              "Fresh and cool air", 
              "Complete and modern facilities"
            ]
          },
          cta: {
            title: "Ready for an Unforgettable Adventure?",
            subtitle: "Contact us now and plan your visit to Alamendah Tourism Village, Bandung Regency",
            emailButton: "Email Us",
            contactButton: "Contact Us"
          },
          errors: {
            noPackages: "No packages found."
          }
        },
        contact: {
          title: "Contact Us",
          subtitle: "Contact us for more information about tourism and culinary packages",
          contactInfo: {
            title: "Contact Information",
            email: {
              label: "Email",
              value: "dawaladev@gmail.com",
              link: "Send us an email"
            },
            phone: {
              label: "Phone",
              value: "+62 xxx-xxxx-xxxx",
              hours: "Available 08:00 - 17:00 WIB"
            },
            location: {
              label: "Location",
              value: "Alamendah Tourism Village, Bandung Regency, West Java, Indonesia",
              note: "Serving tourists from various regions"
            }
          }
        },
        menu: {
          header: {
            title: "Complete Tourism & Culinary Packages",
            subtitle: "Explore all available tourism and culinary package options at Alamendah Tourism Village, Bandung Regency"
          },
          content: {
            noPackages: "No packages found.",
            noPackagesSubtitle: "Try selecting a different package category.",
            showingPackages: "Showing {count} packages",
            inCategory: "in {category} category"
          },
          cta: {
            title: "Ready to Travel?",
            subtitle: "Contact our team to plan your visit and get special offers",
            button: "Contact Us Now"
          },
          filter: {
            allPackages: "All Categories"
          }
        },
        modal: {
          description: "Description",
          reservation: {
            title: "Information & Reservation",
            button: "Reserve Now",
            emailSubject: "Tourism Package Reservation",
            emailBody: "I am interested in the package: {packageName}"
          }
        },
        common: {
          loading: "Loading...",
          error: "An error occurred",
          retry: "Try again"
        },
        images: textsDataId.images
      } as Texts
    }
  }
}

// Helper function to replace placeholders in strings
export const replacePlaceholders = (text: string, replacements: Record<string, string | number>): string => {
  let result = text
  Object.entries(replacements).forEach(([key, value]) => {
    result = result.replace(`{${key}}`, String(value))
  })
  return result
}
