import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getIngredientProducts } from '@/lib/api';
import { InfiniteProductGrid } from '@/components/InfiniteProductGrid';

export const revalidate = 7200;

interface Props {
  params: Promise<{ name: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  return {
    title: `Products with ${decoded}`,
    description: `Browse beauty products that contain ${decoded} as an ingredient.`,
  };
}

const SORT_LABELS: Record<string, string> = {
  rating_desc:   'Top Rated',
  price_asc:     'Price: Low to High',
  price_desc:    'Price: High to Low',
  discount_desc: 'Biggest Discount',
};

export default async function IngredientPage({ params, searchParams }: Props) {
  const { name } = await params;
  const { sort = 'rating_desc' } = await searchParams;
  const nameNormalized = decodeURIComponent(name).toLowerCase();

  let data;
  try {
    data = await getIngredientProducts(nameNormalized, { page: 1, pageSize: 24, sort });
  } catch {
    notFound();
  }

  const { ingredient, items: products, total, hasMore } = data;

  return (
    <div className="page-container py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-stone-400 mb-4" aria-label="Breadcrumb">
        <a href="/ingredients" className="hover:text-stone-600 transition-colors">Ingredients</a>
        <span className="mx-2">/</span>
        <span className="text-stone-700 font-medium">{ingredient.name}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="section-heading">{ingredient.name}</h1>
          <p className="text-stone-500 mt-1 text-sm">
            {total.toLocaleString()} product{total !== 1 ? 's' : ''} contain this ingredient
          </p>
        </div>

        {/* Sort pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {Object.entries(SORT_LABELS).map(([key, label]) => (
            <a
              key={key}
              href={`?sort=${key}`}
              className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                sort === key
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-white text-stone-600 border-stone-300 hover:border-stone-400'
              }`}
            >
              {label}
            </a>
          ))}
        </div>
      </div>

      {/* Product grid with infinite scroll */}
      {products.length === 0 ? (
        <div className="py-24 text-center text-stone-400">
          <p className="text-lg font-medium">No products found.</p>
          <a href="/ingredients" className="mt-4 inline-block text-brand-600 hover:underline">
            ← Back to ingredients
          </a>
        </div>
      ) : (
        <InfiniteProductGrid
          initialProducts={products}
          initialHasMore={hasMore}
          fetchUrl={`/api/ingredients/${encodeURIComponent(nameNormalized)}/products`}
          sort={sort}
        />
      )}
    </div>
  );
}
