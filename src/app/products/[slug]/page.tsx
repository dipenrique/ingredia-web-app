import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/api';
import { StarRating } from '@/components/StarRating';

// ISR: revalidate each product page every 4 hours.
export const revalidate = 14400;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProduct(slug);
    return {
      title: `${product.name} by ${product.brand}`,
      description: product.ingredient_list_names?.length
        ? `Key ingredients: ${product.ingredient_list_names.slice(0, 5).join(', ')}.`
        : `${product.name} by ${product.brand}. ₹${product.price}.`,
      openGraph: {
        images: product.image ? [{ url: product.image }] : [],
      },
    };
  } catch {
    return { title: 'Product not found' };
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  let product;
  try {
    product = await getProduct(slug);
  } catch {
    notFound();
  }

  const primaryImage = product.images?.[0] ?? product.image;

  return (
    <div className="page-container py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-stone-400 mb-6" aria-label="Breadcrumb">
        {product.categories?.[0] && (
          <>
            <a href="/categories" className="hover:text-stone-600 transition-colors">Categories</a>
            <span className="mx-2">/</span>
            <a
              href={`/categories/${product.categories[0].id}`}
              className="hover:text-stone-600 transition-colors capitalize"
            >
              {product.categories[0].name}
            </a>
            <span className="mx-2">/</span>
          </>
        )}
        <span className="text-stone-700 font-medium">{product.name}</span>
      </nav>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-12">

        {/* Image gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-contain p-4"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.slice(0, 6).map((img, i) => (
                <div key={i} className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-stone-100 border border-stone-200">
                  <Image src={img} alt={`${product.name} view ${i + 1}`} fill className="object-cover" sizes="64px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-wide text-stone-400">{product.brand}</p>

          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">{product.name}</h1>

          {product.rating !== undefined && product.rating > 0 && (
            <StarRating rating={product.rating} count={product.reviewCount} size="md" />
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-stone-900">₹{product.price.toLocaleString()}</span>
            {product.mrp && product.mrp > product.price && (
              <>
                <span className="text-xl text-stone-400 line-through">₹{product.mrp.toLocaleString()}</span>
                <span className="badge-discount text-sm">{product.discount}% off</span>
              </>
            )}
          </div>

          {product.sku && (
            <p className="text-xs text-stone-400">SKU: {product.sku}</p>
          )}

          {/* Categories */}
          {product.categories && product.categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.categories.map(c => (
                <a
                  key={c.id}
                  href={`/categories/${c.id}`}
                  className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-600 font-medium px-3 py-1 rounded-full transition-colors capitalize"
                >
                  {c.name}
                </a>
              ))}
            </div>
          )}

          {product.url && (
            <a href={product.url} target="_blank" rel="noopener noreferrer" className="btn-ghost self-start mt-2">
              View on Nykaa ↗
            </a>
          )}
        </div>
      </div>

      {/* Ingredients section */}
      {product.ingredient_list_names && product.ingredient_list_names.length > 0 && (
        <section className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-stone-900">Ingredients</h2>
            <span className="text-sm text-stone-400">{product.ingredient_list_names.length} ingredients</span>
          </div>

          {/* Clickable ingredient pills — each links to the ingredient product listing */}
          <div className="flex flex-wrap gap-2">
            {product.ingredient_list_names.map(name => (
              <a
                key={name}
                href={`/ingredients/${encodeURIComponent(name.toLowerCase())}`}
                className="text-xs bg-stone-50 hover:bg-brand-50 border border-stone-200 hover:border-brand-300
                           text-stone-600 hover:text-brand-600 px-3 py-1.5 rounded-full transition-colors"
              >
                {name}
              </a>
            ))}
          </div>

          {/* Raw string fallback (collapsed) — useful for copy-paste */}
          {product.ingredients && (
            <details className="mt-4">
              <summary className="text-xs text-stone-400 cursor-pointer hover:text-stone-600 transition-colors select-none">
                View raw ingredient list
              </summary>
              <p className="mt-2 text-xs text-stone-500 leading-relaxed">{product.ingredients}</p>
            </details>
          )}
        </section>
      )}
    </div>
  );
}
