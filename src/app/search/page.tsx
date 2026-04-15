import type { Metadata } from 'next';
import { search } from '@/lib/api';
import { ProductCard } from '@/components/ProductCard';

export const metadata: Metadata = {
  title: 'Search Products & Ingredients',
  description: 'Search thousands of beauty products by name, brand or ingredient.',
  robots: { index: false },
};

export const dynamic = 'force-dynamic';

interface Props {
  searchParams: Promise<{ q?: string; type?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q, type, page: pageParam } = await searchParams;
  const query = q?.trim() ?? '';
  const activeType = type ?? 'all';
  const page = Math.max(1, Number(pageParam) || 1);

  let results = null;
  let error = '';

  if (query.length >= 2) {
    try {
      results = await search({
        q: query,
        type: activeType as 'products' | 'ingredients' | 'all',
        page,
        pageSize: 12,
      });
    } catch {
      error = 'Search failed. Please try again.';
    }
  }

  const TYPE_TABS = [
    { key: 'all',         label: 'All' },
    { key: 'products',    label: 'Products' },
    { key: 'ingredients', label: 'By Ingredient' },
  ];

  return (
    <div className="page-container py-8">
      <h1 className="section-heading mb-6">Search</h1>

      {/* Search form */}
      <form action="/search" method="GET" className="mb-6">
        <div className="flex gap-2">
          <input
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search products, brands or ingredients…"
            required
            minLength={2}
            autoFocus
            className="search-input flex-1"
          />
          <input type="hidden" name="type" value={activeType} />
          <button type="submit" className="btn-primary shrink-0">
            Search
          </button>
        </div>

        {/* Type tabs */}
        <div className="flex gap-2 mt-3">
          {TYPE_TABS.map(tab => (
            <a
              key={tab.key}
              href={query ? `?q=${encodeURIComponent(query)}&type=${tab.key}` : `?type=${tab.key}`}
              className={`text-sm px-4 py-1.5 rounded-full border font-medium transition-colors ${
                activeType === tab.key
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-stone-600 border-stone-300 hover:border-stone-400'
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>
      </form>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm mb-6" role="alert">
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-10">
          <p className="text-stone-500 text-sm">
            Results for <span className="font-semibold text-stone-800">&ldquo;{results.query}&rdquo;</span>
          </p>

          {/* Product results */}
          {(activeType === 'all' || activeType === 'products') && (
            <section>
              <h2 className="text-lg font-bold text-stone-900 mb-4">
                Products
                <span className="ml-2 text-sm font-normal text-stone-400">
                  ({results.products.total.toLocaleString()})
                </span>
              </h2>
              {results.products.items.length === 0 ? (
                <p className="text-stone-400 text-sm">No products found.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {results.products.items.map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Ingredient results */}
          {(activeType === 'all' || activeType === 'ingredients') && (
            <section>
              <h2 className="text-lg font-bold text-stone-900 mb-4">
                Products containing this ingredient
              </h2>
              {results.ingredients.items.length === 0 ? (
                <p className="text-stone-400 text-sm">No products found with that ingredient.</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {results.ingredients.items.map(p => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* Empty state */}
      {!results && !error && (
        <div className="py-24 text-center">
          <p className="text-5xl mb-4 select-none">🔍</p>
          <p className="text-stone-500">
            Enter a product name, brand, or ingredient to get started.
          </p>
        </div>
      )}
    </div>
  );
}
