import type { Metadata } from 'next';
import { getCategories } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Browse Categories',
  description: 'Explore beauty product categories including skincare, haircare, makeup and more.',
};

export const revalidate = 1800;

const CATEGORY_ICONS: Record<string, string> = {
  default:    '🧴',
  skincare:   '✨',
  haircare:   '💇',
  makeup:     '💄',
  fragrance:  '🌸',
  bath:       '🛁',
  body:       '💆',
  suncare:    '☀️',
  nails:      '💅',
  eyes:       '👁️',
  lips:       '💋',
  face:       '🌟',
};

function getCategoryIcon(name: string): string {
  const lower = name.toLowerCase();
  return (
    Object.entries(CATEGORY_ICONS).find(([key]) => key !== 'default' && lower.includes(key))?.[1]
    ?? CATEGORY_ICONS.default
  );
}

export default async function CategoriesPage() {
  const { items: categories } = await getCategories();

  return (
    <div className="page-container py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="section-heading">Browse Categories</h1>
        <p className="text-stone-500 mt-1">
          {categories.length} categories &mdash; find products by type
        </p>
      </div>

      {/* Category grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map(cat => (
          <a
            key={cat.id}
            href={`/categories/${cat.id}`}
            className="group flex flex-col items-center gap-3
                       bg-white rounded-2xl border border-stone-100 shadow-sm
                       hover:border-brand-200 hover:shadow-md hover:-translate-y-0.5
                       transition-all duration-200 p-5 text-center"
          >
            <span className="text-3xl select-none">{getCategoryIcon(cat.name)}</span>
            <div>
              <p className="text-sm font-semibold text-stone-800 group-hover:text-brand-600 transition-colors leading-snug">
                {cat.name}
              </p>
              {cat.productCount !== undefined && (
                <p className="text-xs text-stone-400 mt-0.5">
                  {cat.productCount.toLocaleString()} products
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
