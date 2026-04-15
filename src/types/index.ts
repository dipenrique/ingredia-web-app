// ---------------------------------------------------------------------------
// Shared types mirroring what the API proxy returns.
// Internal fields (_id, ingredient_list_ids, scrapedAt, updatedAt, createdAt)
// are never exposed.
// ---------------------------------------------------------------------------

export interface ProductSummary {
  id: string;
  /** Full Nykaa URL path, e.g. "product-name/p/762174". Use `id` for app routes. */
  slug: string;
  name: string;
  brand: string;
  price: number;
  mrp?: number;
  discount?: number;
  rating?: number;
  reviewCount?: number;
  image?: string;
  categories?: Category[];
}

export interface ProductDetail extends ProductSummary {
  images?: string[];
  /** Parsed ingredient names — preferred for display and linking. */
  ingredient_list_names?: string[];
  /** Raw comma-separated string — kept for compatibility. */
  ingredients?: string;
  sku?: string;
  /** Full Nykaa product URL, e.g. https://www.nykaa.com/product-name/p/762174 */
  url: string;
}

export interface Category {
  id: string;
  name: string;
  productCount?: number;
}

export interface Ingredient {
  /** name_normalized is the public identifier, e.g. "vitamin c" */
  name_normalized: string;
  name: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface IngredientProductsResponse extends PaginatedResponse<ProductSummary> {
  ingredient: Ingredient;
}

export interface SearchResponse {
  query: string;
  products: {
    items: ProductSummary[];
    total: number;
    page: number;
    pageSize: number;
  };
  ingredients: {
    /** Products whose ingredient_list_names matched the query. */
    items: (ProductSummary & { ingredient_list_names?: string[] })[];
  };
}
