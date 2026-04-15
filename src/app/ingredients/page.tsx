import type { Metadata } from 'next';
import { getIngredients } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Ingredient Browser',
  description: 'Look up any beauty ingredient and discover which products contain it.',
};

export const revalidate = 1800;

export default async function IngredientsPage() {
  // Load the first page of ingredients sorted alphabetically.
  const { items: ingredients, total } = await getIngredients({ pageSize: 48 });

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-stone-50 to-brand-50 border-b border-stone-100">
        <div className="page-container py-12 sm:py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mb-3">
            Ingredient Browser
          </h1>
          <p className="text-stone-500 max-w-md mx-auto mb-8">
            Search any ingredient to instantly find every product that contains it.
          </p>
          <form action="/search" method="GET" className="flex gap-2 max-w-lg mx-auto">
            <input type="hidden" name="type" value="ingredients" />
            <input
              name="q"
              type="search"
              placeholder="e.g. Niacinamide, Retinol, Hyaluronic Acid…"
              required
              minLength={2}
              autoFocus
              className="search-input flex-1"
            />
            <button type="submit" className="btn-primary shrink-0">Find Products</button>
          </form>
        </div>
      </section>

      {/* Ingredient list */}
      <section className="page-container py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="section-heading">All Ingredients</h2>
          <span className="text-sm text-stone-400">{total.toLocaleString()} total</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {ingredients.map(ing => (
            <a
              key={ing.name_normalized}
              href={`/ingredients/${encodeURIComponent(ing.name_normalized)}`}
              className="group flex items-center gap-3 bg-white rounded-xl border border-stone-100 shadow-sm
                         hover:border-brand-200 hover:shadow-md hover:-translate-y-0.5
                         transition-all duration-200 px-4 py-3"
            >
              <span className="w-2 h-2 rounded-full bg-brand-200 group-hover:bg-brand-500 shrink-0 transition-colors" />
              <span className="text-sm font-medium text-stone-700 group-hover:text-brand-600 transition-colors truncate">
                {ing.name}
              </span>
            </a>
          ))}
        </div>

        {total > 48 && (
          <p className="text-center text-stone-400 text-sm mt-8">
            Showing 48 of {total.toLocaleString()} ingredients.{' '}
            <a href="/search?type=ingredients" className="text-brand-600 hover:underline">
              Search for a specific ingredient →
            </a>
          </p>
        )}
      </section>
    </>
  );
}
