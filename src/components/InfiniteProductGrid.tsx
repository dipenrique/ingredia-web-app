'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ProductCard } from './ProductCard';
import type { ProductSummary } from '@/types';

interface Props {
  initialProducts: ProductSummary[];
  initialHasMore: boolean;
  /** Next.js API route to call for more pages, e.g. "/api/categories/moisturizer/products" */
  fetchUrl: string;
  sort: string;
  pageSize?: number;
}

export function InfiniteProductGrid({
  initialProducts,
  initialHasMore,
  fetchUrl,
  sort,
  pageSize = 24,
}: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Track the fetch URL + sort so we can detect when the server re-renders with new props.
  const fetchKeyRef = useRef(`${fetchUrl}:${sort}`);

  // When the parent re-renders (sort changed → server re-fetches page 1), reset local state.
  useEffect(() => {
    const newKey = `${fetchUrl}:${sort}`;
    if (fetchKeyRef.current !== newKey) {
      fetchKeyRef.current = newKey;
      setProducts(initialProducts);
      setHasMore(initialHasMore);
      setPage(1);
    }
  }, [fetchUrl, sort, initialProducts, initialHasMore]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    try {
      const url = new URL(fetchUrl, window.location.origin);
      url.searchParams.set('page', String(nextPage));
      url.searchParams.set('sort', sort);
      url.searchParams.set('pageSize', String(pageSize));
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: { items: ProductSummary[]; hasMore: boolean } = await res.json();
      setProducts(prev => [...prev, ...data.items]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch {
      // Don't crash the page — the user can scroll back up and try again.
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, fetchUrl, sort, pageSize]);

  // Attach IntersectionObserver to the sentinel div.
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: '300px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {/* Sentinel — sits below the grid; triggers load when scrolled into view */}
      <div ref={sentinelRef} className="mt-10 flex items-center justify-center min-h-[48px]">
        {loading && (
          <span className="flex items-center gap-2 text-stone-400 text-sm">
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12" cy="12" r="10"
                stroke="currentColor" strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Loading more…
          </span>
        )}
        {!loading && !hasMore && products.length > 0 && (
          <p className="text-stone-400 text-sm">All {products.length} products loaded</p>
        )}
      </div>
    </>
  );
}
