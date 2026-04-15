import type { Metadata } from 'next';
import { getCategories, getProducts } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';

export const metadata: Metadata = {
  title: 'Pure Ingredia — Know Your Ingredients',
};

export const revalidate = 3600;

export default async function HomePage() {
  const [{ items: categories }, { items: featuredProducts }] = await Promise.all([
    getCategories(),
    getProducts({ pageSize: 8, sort: 'rating_desc' }),
  ]);

  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Hero                                                                */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-gradient-to-br from-brand-50 via-white to-rose-50 border-b border-stone-100">
        <div className="page-container py-16 sm:py-24 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-stone-900 tracking-tight leading-tight mb-4">
            Know exactly what goes<br className="hidden sm:block" /> into your beauty products.
          </h1>
          <p className="text-lg text-stone-500 max-w-xl mx-auto mb-8">
            Search millions of products, decode ingredient lists, and make smarter choices for your skin.
          </p>
          <form
            action="/search"
            method="GET"
            className="flex items-center gap-2 max-w-lg mx-auto"
          >
            <input
              name="q"
              type="search"
              placeholder="Search products, brands or ingredients…"
              required
              minLength={2}
              className="search-input flex-1"
              autoComplete="off"
            />
            <button type="submit" className="btn-primary shrink-0">
              Search
            </button>
          </form>
          <p className="mt-4 text-sm text-stone-400">
            Try&nbsp;
            {['Niacinamide', 'Vitamin C', 'Retinol'].map((term, i) => (
              <span key={term}>
                <a
                  href={`/search?q=${encodeURIComponent(term)}&type=ingredients`}
                  className="underline underline-offset-2 hover:text-brand-600 transition-colors"
                >
                  {term}
                </a>
                {i < 2 ? ', ' : ''}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Categories                                                          */}
      {/* ------------------------------------------------------------------ */}
      <section className="page-container py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-heading">Browse Categories</h2>
          <a href="/categories" className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">
            View all →
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {categories.slice(0, 12).map((cat) => (
            <a
              key={cat.id}
              href={`/categories/${cat.id}`}
              className="group flex flex-col items-center justify-center gap-2
                         bg-white rounded-2xl border border-stone-100 shadow-sm
                         hover:border-brand-200 hover:shadow-md hover:-translate-y-0.5
                         transition-all duration-200 p-4 text-center"
            >
              <span className="text-2xl select-none">🧴</span>
              <span className="text-xs font-semibold text-stone-700 group-hover:text-brand-600 transition-colors leading-tight line-clamp-2">
                {cat.name}
              </span>
              {cat.productCount && (
                <span className="text-xs text-stone-400">
                  {cat.productCount.toLocaleString()}
                </span>
              )}
            </a>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Top-rated products                                                  */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-stone-100/60 py-12">
        <div className="page-container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-heading">Top Rated Products</h2>
            <a href="/categories" className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors">
              Browse all →
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {featuredProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------------ */}
      {/* Ingredient CTA strip                                               */}
      {/* ------------------------------------------------------------------ */}
      <section className="bg-brand-600 text-white">
        <div className="page-container py-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">
            Decode ingredient labels in seconds.
          </h2>
          <p className="text-rose-100 mb-6 max-w-md mx-auto">
            Type any ingredient name to instantly find every product that contains it.
          </p>
          <a href="/ingredients" className="inline-flex items-center gap-2 bg-white text-brand-600 hover:bg-brand-50 font-semibold px-6 py-3 rounded-lg transition-colors">
            Open Ingredient Browser →
          </a>
        </div>
      </section>
    </>
  );
}
