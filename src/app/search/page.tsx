import type { Metadata } from 'next';
import { search } from '@/lib/api';
import { InfiniteSearchResults } from '@/components/InfiniteSearchResults';
import { SearchInput } from '@/components/SearchInput';

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
        type: activeType as 'products' | 'ingredients' | 'ingredient_names' | 'all',
        page,
        pageSize: 12,
      });
    } catch {
      error = 'Search failed. Please try again.';
    }
  }

  const TYPE_TABS = [
    { key: 'all',              label: 'All' },
    { key: 'products',         label: 'Products' },
    { key: 'ingredients',      label: 'By Ingredient' },
    { key: 'ingredient_names', label: 'Ingredient Names' },
  ];

  return (
    <div className="page-container py-8">
      <h1 className="section-heading mb-6">Search</h1>

      {/* Search form */}
      <form action="/search" method="GET" className="mb-6">
        <div className="flex gap-2">
          <SearchInput defaultValue={query} activeType={activeType} />
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
        <div className="space-y-6">
          <p className="text-stone-500 text-sm">
            Results for <span className="font-semibold text-stone-800">&ldquo;{results.query}&rdquo;</span>
          </p>
          <InfiniteSearchResults
            query={results.query}
            activeType={activeType}
            initialProducts={results.products.items}
            productsTotal={results.products.total}
            initialProductsHasMore={results.products.hasMore}
            initialIngredients={results.ingredients.items}
            ingredientsTotal={results.ingredients.total}
            initialIngredientsHasMore={results.ingredients.hasMore}
            initialIngredientNames={results.ingredientNames.items}
            ingredientNamesTotal={results.ingredientNames.total}
            initialIngredientNamesHasMore={results.ingredientNames.hasMore}
            pageSize={12}
          />
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
