/**
 * Typed API client for the Pure Ingredia proxy.
 *
 * All server-component calls include the x-internal-secret header so the API
 * can distinguish legitimate server-side traffic from direct browser requests.
 * The secret is never sent from client components — those call Next.js API
 * routes (src/app/api/) instead, which proxy to this module server-side.
 */

import type {
  Category,
  Ingredient,
  IngredientProductsResponse,
  PaginatedResponse,
  ProductDetail,
  ProductSummary,
  SearchResponse,
} from '@/types/index.js';

const API_BASE = process.env.API_URL ?? 'http://localhost:4001';

// Only available server-side (no NEXT_PUBLIC_ prefix).
const INTERNAL_SECRET = process.env.API_INTERNAL_SECRET ?? '';

interface FetchOptions {
  revalidate?: number;   // Next.js ISR revalidation in seconds (0 = no-store)
  serverOnly?: boolean;  // Attach the internal secret header
}

async function apiFetch<T>(
  path: string,
  params: object = {},
  { revalidate = 3600, serverOnly = true }: FetchOptions = {},
): Promise<T> {
  const url = new URL(path, API_BASE);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (serverOnly && INTERNAL_SECRET) {
    headers['x-internal-secret'] = INTERNAL_SECRET;
  }

  const res = await fetch(url.toString(), {
    headers,
    next: revalidate === 0 ? { revalidate: 0 } : { revalidate },
  });

  if (!res.ok) {
    throw new Error(`API error ${res.status} for ${url.pathname}`);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  category?: string;
  brand?: string;
  inStock?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'rating_desc' | 'discount_desc' | 'newest' | 'reviews_desc';
}

export function getProducts(params: ProductListParams = {}) {
  return apiFetch<PaginatedResponse<ProductSummary>>('/api/products', {
    ...params,
    inStock: params.inStock ? 'true' : undefined,
  }, { revalidate: 600 });
}

export function getProduct(idOrSlug: string) {
  return apiFetch<ProductDetail>(`/api/products/${idOrSlug}`, {}, { revalidate: 14400 });
}

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------

export function getCategories() {
  return apiFetch<{ items: Category[]; total: number }>('/api/categories', {}, { revalidate: 1800 });
}

export interface CategoryProductsParams {
  page?: number;
  pageSize?: number;
  sort?: string;
}

export function getCategoryProducts(categoryId: string, params: CategoryProductsParams = {}) {
  return apiFetch<PaginatedResponse<ProductSummary>>(
    `/api/categories/${categoryId}/products`,
    params,
    { revalidate: 600 },
  );
}

// ---------------------------------------------------------------------------
// Search
// ---------------------------------------------------------------------------

export interface SearchParams {
  q: string;
  type?: 'products' | 'ingredients' | 'all';
  page?: number;
  pageSize?: number;
  category?: string;
  brand?: string;
}

export function search(params: SearchParams) {
  return apiFetch<SearchResponse>(
    '/api/search',
    params,
    // Search results change quickly; no ISR cache, but the API's node-cache handles it.
    { revalidate: 0, serverOnly: false },
  );
}

// ---------------------------------------------------------------------------
// Ingredients
// ---------------------------------------------------------------------------

export interface IngredientListParams {
  q?: string;
  page?: number;
  pageSize?: number;
}

export function getIngredients(params: IngredientListParams = {}) {
  return apiFetch<PaginatedResponse<Ingredient>>(
    '/api/ingredients',
    params,
    { revalidate: 1800 },
  );
}

export interface IngredientProductsParams {
  page?: number;
  pageSize?: number;
  sort?: string;
}

export function getIngredientProducts(nameNormalized: string, params: IngredientProductsParams = {}) {
  return apiFetch<IngredientProductsResponse>(
    `/api/ingredients/${encodeURIComponent(nameNormalized)}/products`,
    params,
    { revalidate: 600 },
  );
}
