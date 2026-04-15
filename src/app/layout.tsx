import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pure-ingredia.com';
const SITE_NAME = 'Pure Ingredia';
const SITE_DESCRIPTION =
  'Discover beauty products, browse ingredients, and find exactly what goes into your skincare and haircare.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Know Your Ingredients`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="flex flex-col min-h-full font-sans">

        {/* ---------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ---------------------------------------------------------------- */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200">
          <div className="page-container">
            <div className="h-16 flex items-center justify-between gap-6">

              {/* Logo */}
              <a
                href="/"
                className="flex items-center gap-2 shrink-0"
                aria-label={SITE_NAME}
              >
                {/* Leaf icon */}
                <span className="flex items-center justify-center w-8 h-8 bg-brand-600 rounded-lg text-white text-lg leading-none select-none">
                  🌿
                </span>
                <span className="hidden sm:block text-lg font-bold text-stone-900 tracking-tight">
                  Pure <span className="text-brand-600">Ingredia</span>
                </span>
              </a>

              {/* Primary nav */}
              <nav className="flex items-center gap-1 text-sm font-medium">
                <a
                  href="/categories"
                  className="px-3 py-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                >
                  Categories
                </a>
                <a
                  href="/ingredients"
                  className="px-3 py-2 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors hidden sm:block"
                >
                  Ingredients
                </a>
              </nav>

              {/* Search CTA */}
              <a
                href="/search"
                className="flex items-center gap-2 btn-ghost shrink-0"
                aria-label="Search"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />
                </svg>
                <span className="hidden sm:inline">Search</span>
              </a>

            </div>
          </div>
        </header>

        {/* ---------------------------------------------------------------- */}
        {/* Page content                                                      */}
        {/* ---------------------------------------------------------------- */}
        <main className="flex-1">
          {children}
        </main>

        {/* ---------------------------------------------------------------- */}
        {/* Footer                                                            */}
        {/* ---------------------------------------------------------------- */}
        <footer className="bg-stone-900 text-stone-400">
          <div className="page-container py-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">

              {/* Brand */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center justify-center w-7 h-7 bg-brand-600 rounded-md text-white text-base leading-none">
                    🌿
                  </span>
                  <span className="text-white font-bold">{SITE_NAME}</span>
                </div>
                <p className="text-sm leading-relaxed">
                  Know exactly what goes into your beauty products. Transparent ingredients for smarter choices.
                </p>
              </div>

              {/* Explore */}
              <div>
                <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
                  Explore
                </h3>
                <ul className="space-y-2 text-sm">
                  {[
                    { label: 'Browse Categories', href: '/categories' },
                    { label: 'Ingredient Browser', href: '/ingredients' },
                    { label: 'Search Products', href: '/search' },
                  ].map(link => (
                    <li key={link.href}>
                      <a href={link.href} className="hover:text-white transition-colors">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Legal / info */}
              <div>
                <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
                  Info
                </h3>
                <p className="text-sm leading-relaxed">
                  Product data sourced from publicly available information. Ingredient lists are provided for informational purposes only.
                </p>
              </div>

            </div>

            <div className="mt-10 pt-6 border-t border-stone-800 text-xs text-center sm:text-left">
              &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}
