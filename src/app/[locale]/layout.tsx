import type { Metadata } from "next";
import "../globals.css";
import LocaleProvider from "@/components/LocaleProvider";

const locales = ['id', 'en'];

export function generateStaticParams() {
  return locales.map((locale) => ({locale}));
}

export const metadata: Metadata = {
  title: "Desa Wisata Alamendah",
  description: "Website resmi Desa Wisata Alamendah",
};

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as 'id' | 'en')) {
    return <div>Locale not found</div>;
  }

  return (
    <LocaleProvider>
      <div data-locale={locale}>
        {children}
      </div>
    </LocaleProvider>
  );
}
