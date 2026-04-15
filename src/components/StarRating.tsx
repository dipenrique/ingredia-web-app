interface StarRatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md';
}

export function StarRating({ rating, count, size = 'sm' }: StarRatingProps) {
  const filled = Math.round(rating);          // 0–5 whole stars
  const textSize = size === 'md' ? 'text-base' : 'text-sm';
  const countSize = size === 'md' ? 'text-sm' : 'text-xs';

  return (
    <div className="flex items-center gap-1.5">
      {/* Stars */}
      <span className={`${textSize} leading-none`} aria-hidden="true">
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i} className={i < filled ? 'text-amber-400' : 'text-stone-300'}>
            ★
          </span>
        ))}
      </span>

      {/* Numeric rating */}
      <span className={`${textSize} font-semibold text-stone-700 leading-none`}>
        {rating.toFixed(1)}
      </span>

      {/* Review count */}
      {count !== undefined && count > 0 && (
        <span className={`${countSize} text-stone-400 leading-none`}>
          ({count.toLocaleString()})
        </span>
      )}
    </div>
  );
}
