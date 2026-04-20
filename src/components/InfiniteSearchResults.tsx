'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ProductCard } from './ProductCard';
import type { Ingredient, ProductSummary } from '@/types';

type IngredientProduct = ProductSummary & { ingredient_list_names?: string[] };

interface Props {
  query: string;
  activeType: string;
  initialProducts: ProductSummary[];
  productsTotal: number;
  initialProductsHasMore: boolean;
  initialIngredients: IngredientProduct[];
  ingredientsTotal: number;
  initialIngredientsHasMore: boolean;
  initialIngredientNames: Ingredient[];
  ingredientNamesTotal: number;
  initialIngredientNamesHasMore: boolean;
  pageSize: number;
}

function LoadingSpinner() {
  return (
    <span className="flex items-center gap-2 text-stone-400 text-sm">
      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      Loading more…
    </span>
  );
}

function useInfiniteSection<T extends { id: string }>(
  initialItems: T[],
  initialHasMore: boolean,
  fetcher: (page: number) => Promise<{ items: T[]; hasMore: boolean }>,
  resetKey: string,
) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const resetKeyRef = useRef(resetKey);

  useEffect(() => {
    if (resetKeyRef.current !== resetKey) {
      resetKeyRef.current = resetKey;
      setItems(initialItems);
      setHasMore(initialHasMore);
      setPage(1);
    }
  }, [resetKey, initialItems, initialHasMore]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    try {
      const data = await fetcher(nextPage);
      setItems(prev => [...prev, ...data.items]);
      setHasMore(data.hasMore);
      setPage(nextPage);
    } catch {
      // Silent — user can scroll back up and retry.
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page, fetcher]);

  return { items, hasMore, loading, loadMore };
}

function Sentinel({ onVisible }: { onVisible: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const onVisibleRef = useRef(onVisible);
  onVisibleRef.current = onVisible;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) onVisibleRef.current(); },
      { rootMargin: '300px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} />;
}

export function InfiniteSearchResults({
  query,
  activeType,
  initialProducts,
  productsTotal,
  initialProductsHasMore,
  initialIngredients,
  ingredientsTotal,
  initialIngredientsHasMore,
  initialIngredientNames,
  ingredientNamesTotal,
  initialIngredientNamesHasMore,
  pageSize,
}: Props) {
  const resetKey = `${query}:${activeType}`;

  const fetchProducts = useCallback(async (page: number) => {
    const url = new URL('/api/search', window.location.origin);
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'products');
    url.searchParams.set('page', String(page));
    url.searchParams.set('pageSize', String(pageSize));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { items: data.products.items as ProductSummary[], hasMore: data.products.hasMore as boolean };
  }, [query, pageSize]);

  const fetchIngredients = useCallback(async (page: number) => {
    const url = new URL('/api/search', window.location.origin);
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'ingredients');
    url.searchParams.set('page', String(page));
    url.searchParams.set('pageSize', String(pageSize));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { items: data.ingredients.items as IngredientProduct[], hasMore: data.ingredients.hasMore as boolean };
  }, [query, pageSize]);

  const fetchIngredientNames = useCallback(async (page: number) => {
    const url = new URL('/api/search', window.location.origin);
    url.searchParams.set('q', query);
    url.searchParams.set('type', 'ingredient_names');
    url.searchParams.set('page', String(page));
    url.searchParams.set('pageSize', String(pageSize));
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return { items: data.ingredientNames.items as Ingredient[], hasMore: data.ingredientNames.hasMore as boolean };
  }, [query, pageSize]);

  const products = useInfiniteSection(initialProducts, initialProductsHasMore, fetchProducts, resetKey);
  const ingredients = useInfiniteSection(initialIngredients, initialIngredientsHasMore, fetchIngredients, resetKey);

  // ingredient_names uses name_normalized as key, managed separately
  const [ingredientNames, setIngredientNames] = useState(initialIngredientNames);
  const [ingredientNamesHasMore, setIngredientNamesHasMore] = useState(initialIngredientNamesHasMore);
  const [ingredientNamesPage, setIngredientNamesPage] = useState(1);
  const [ingredientNamesLoading, setIngredientNamesLoading] = useState(false);
  const ingredientNamesResetKeyRef = useRef(resetKey);
  useEffect(() => {
    if (ingredientNamesResetKeyRef.current !== resetKey) {
      ingredientNamesResetKeyRef.current = resetKey;
      setIngredientNames(initialIngredientNames);
      setIngredientNamesHasMore(initialIngredientNamesHasMore);
      setIngredientNamesPage(1);
    }
  }, [resetKey, initialIngredientNames, initialIngredientNamesHasMore]);

  const loadMoreIngredientNames = useCallback(async () => {
    if (ingredientNamesLoading || !ingredientNamesHasMore) return;
    setIngredientNamesLoading(true);
    const nextPage = ingredientNamesPage + 1;
    try {
      const data = await fetchIngredientNames(nextPage);
      setIngredientNames(prev => [...prev, ...data.items]);
      setIngredientNamesHasMore(data.hasMore);
      setIngredientNamesPage(nextPage);
    } catch {
      // silent
    } finally {
      setIngredientNamesLoading(false);
    }
  }, [ingredientNamesLoading, ingredientNamesHasMore, ingredientNamesPage, fetchIngredientNames]);

  const showProducts = activeType === 'all' || activeType === 'products';
  const showIngredients = activeType === 'all' || activeType === 'ingredients';
  const showIngredientNames = activeType === 'all' || activeType === 'ingredient_names';

  return (
    <div className="space-y-10">
      {showProducts && (
        <section>
          <h2 className="text-lg font-bold text-stone-900 mb-4">
            Products
            <span className="ml-2 text-sm font-normal text-stone-400">
              ({productsTotal.toLocaleString()})
            </span>
          </h2>
          {products.items.length === 0 ? (
            <p className="text-stone-400 text-sm">No products found.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {products.items.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <div className="mt-10 flex items-center justify-center min-h-[48px]">
                {products.loading && <LoadingSpinner />}
                {!products.loading && !products.hasMore && products.items.length > 0 && (
                  <p className="text-stone-400 text-sm">All {products.items.length} products loaded</p>
                )}
              </div>
              <Sentinel onVisible={products.loadMore} />
            </>
          )}
        </section>
      )}

      {showIngredients && (
        <section>
          <h2 className="text-lg font-bold text-stone-900 mb-4">
            Products containing this ingredient
            <span className="ml-2 text-sm font-normal text-stone-400">
              ({ingredientsTotal.toLocaleString()})
            </span>
          </h2>
          {ingredients.items.length === 0 ? (
            <p className="text-stone-400 text-sm">No products found with that ingredient.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {ingredients.items.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
              <div className="mt-10 flex items-center justify-center min-h-[48px]">
                {ingredients.loading && <LoadingSpinner />}
                {!ingredients.loading && !ingredients.hasMore && ingredients.items.length > 0 && (
                  <p className="text-stone-400 text-sm">All {ingredients.items.length} products loaded</p>
                )}
              </div>
              <Sentinel onVisible={ingredients.loadMore} />
            </>
          )}
        </section>
      )}
      {showIngredientNames && (
        <section>
          <h2 className="text-lg font-bold text-stone-900 mb-4">
            Ingredient Names
            <span className="ml-2 text-sm font-normal text-stone-400">
              ({ingredientNamesTotal.toLocaleString()})
            </span>
          </h2>
          {ingredientNames.length === 0 ? (
            <p className="text-stone-400 text-sm">No ingredients found.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {ingredientNames.map(ing => (
                  <a
                    key={ing.name_normalized}
                    href={`/ingredients/${encodeURIComponent(ing.name_normalized)}`}
                    className="px-3 py-1.5 rounded-full border border-stone-200 bg-white text-sm text-stone-700
                               hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                  >
                    {ing.name}
                  </a>
                ))}
              </div>
              <div className="mt-8 flex items-center justify-center">
                {ingredientNamesLoading && <LoadingSpinner />}
                {!ingredientNamesLoading && ingredientNamesHasMore && (
                  <button
                    onClick={loadMoreIngredientNames}
                    className="px-5 py-2 rounded-full border border-stone-300 bg-white text-sm font-medium
                               text-stone-700 hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50 transition-colors"
                  >
                    Load more
                  </button>
                )}
                {!ingredientNamesLoading && !ingredientNamesHasMore && ingredientNames.length > 0 && (
                  <p className="text-stone-400 text-sm">All {ingredientNames.length} ingredients loaded</p>
                )}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
