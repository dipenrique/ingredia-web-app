import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCategoryProducts, getCategories } from '@/lib/api';
import { InfiniteProductGrid } from '@/components/InfiniteProductGrid';

export const revalidate = 7200;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ sort?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const title = slug.replace(/-/g, ' ');
  return {
    title: `${title} — Beauty Products`,
    description: `Browse ${title} beauty products with full ingredient lists and ratings.`,
  };
}

export async function generateStaticParams() {
  try {
    const { items } = await getCategories();
    return items.slice(0, 50).map(cat => ({ slug: cat.id }));
  } catch {
    return [];
  }
}

const SORT_LABELS: Record<string, string> = {
  rating_desc:    'Top Rated',
  price_asc:      'Price: Low to High',
  price_desc:     'Price: High to Low',
  discount_desc:  'Biggest Discount',
};

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { sort = 'rating_desc' } = await searchParams;

  let data;
  try {
    data = await getCategoryProducts(slug, { page: 1, pageSize: 24, sort });
  } catch {
    notFound();
  }

  const { items: products, total, hasMore } = data;
  const categoryName = slug.replace(/-/g, ' ');

  return (
    <div className="page-container py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-stone-400 mb-4" aria-label="Breadcrumb">
        <a href="/categories" className="hover:text-stone-600 transition-colors">Categories</a>
        <span className="mx-2">/</span>
        <span className="text-stone-700 font-medium capitalize">{categoryName}</span>
      </nav>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="section-heading capitalize">{categoryName}</h1>
          <p className="text-stone-500 mt-1 text-sm">{total.toLocaleString()} products</p>
        </div>

        {/* Sort pills — plain links so sort is bookmarkable/SEO-friendly */}
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
          <p className="text-lg font-medium">No products found in this category.</p>
          <a href="/categories" className="mt-4 inline-block text-brand-600 hover:underline">
            ← Back to categories
          </a>
        </div>
      ) : (
        <InfiniteProductGrid
          initialProducts={products}
          initialHasMore={hasMore}
          fetchUrl={`/api/categories/${slug}/products`}
          sort={sort}
        />
      )}
    </div>
  );
}
