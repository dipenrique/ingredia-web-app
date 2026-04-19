import Image from 'next/image';
import { StarRating } from './StarRating';
import type { ProductSummary } from '@/types';

interface ProductCardProps {
  product: ProductSummary;
}

export function ProductCard({ product }: ProductCardProps) {
  // slug is a full Nykaa path (e.g. "name/p/762174") and contains "/" which
  // would break Next.js routing, so we always use the numeric id instead.
  const href = `/products/${product.id}`;

  return (
    <a
      href={href}
      className="group flex flex-col bg-white rounded-2xl border border-stone-100
                 shadow-sm hover:shadow-md hover:-translate-y-0.5
                 transition-all duration-200 overflow-hidden"
    >
      {/* Image */}
      <div className="relative aspect-square bg-stone-100 img-placeholder overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          /* Styled placeholder when no image URL is available */
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-stone-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {/* Discount badge */}
        {product.discount && product.discount > 0 && (
          <span className="absolute top-2 left-2 badge-discount">
            {product.discount}% off
          </span>
        )}

        {/* Out of stock overlay */}
        {/* {product.inStock === false && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              Out of stock
            </span>
          </div>
        )} */}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 p-3 flex-1">
        {/* Brand */}
        <p className="text-xs text-stone-400 font-medium uppercase tracking-wide truncate">
          {product.brand}
        </p>

        {/* Product name */}
        <h3 className="text-sm font-semibold text-stone-800 line-clamp-2 leading-snug group-hover:text-brand-600 transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        {product.rating !== undefined && product.rating > 0 && (
          <StarRating rating={product.rating} count={product.reviewCount} />
        )}

        {/* Price row */}
        {product.price != null && (
          <div className="flex items-baseline gap-1.5 mt-auto pt-1">
            <span className="text-sm font-bold text-stone-900">
              ₹{product.price.toLocaleString()}
            </span>
            {product.mrp && product.mrp > product.price && (
              <span className="text-xs text-stone-400 line-through">
                ₹{product.mrp.toLocaleString()}
              </span>
            )}
          </div>
        )}
      </div>
    </a>
  );
}
