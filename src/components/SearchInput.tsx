'use client';

import { useEffect, useRef, useState } from 'react';
import type { Ingredient } from '@/types';

interface Props {
  defaultValue: string;
  activeType: string;
}

export function SearchInput({ defaultValue, activeType }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<Ingredient[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value.length < 3 || activeType !== 'ingredient_names') {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const url = new URL('/api/ingredients', window.location.origin);
        url.searchParams.set('q', value);
        url.searchParams.set('pageSize', '8');
        const res = await fetch(url.toString());
        if (!res.ok) return;
        const data: { items: Ingredient[] } = await res.json();
        setSuggestions(data.items);
        setOpen(data.items.length > 0);
        setActiveIndex(-1);
      } catch {
        // ignore
      }
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function selectSuggestion(ingredient: Ingredient) {
    window.location.href = `/search?q=${encodeURIComponent(ingredient.name)}&type=ingredient_names`;
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      selectSuggestion(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="relative flex-1">
      <input
        name="q"
        type="search"
        value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search products, brands or ingredients…"
        required
        minLength={2}
        autoFocus
        autoComplete="off"
        className="search-input w-full"
      />

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg overflow-hidden"
        >
          {suggestions.map((ingredient, i) => (
            <li
              key={ingredient.name_normalized}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={() => selectSuggestion(ingredient)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex items-center gap-2 px-4 py-2.5 cursor-pointer text-sm transition-colors ${
                i === activeIndex
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-stone-700 hover:bg-stone-50'
              }`}
            >
              <svg className="w-3.5 h-3.5 text-stone-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              {ingredient.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
