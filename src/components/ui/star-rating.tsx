import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md';
  showCount?: boolean;
  count?: number;
}

export function StarRating({ rating, max = 5, size = 'sm', showCount, count }: StarRatingProps) {
  const starSize = size === 'sm' ? 12 : 16;
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: max }, (_, i) => {
          const filled = i < Math.floor(rating);
          const partial = !filled && i < rating;
          return (
            <Star
              key={i}
              size={starSize}
              className={cn(
                filled || partial ? 'text-[#C9A84C]' : 'text-[#E8DDD6]',
                filled ? 'fill-[#C9A84C]' : partial ? 'fill-[#C9A84C]/50' : 'fill-transparent'
              )}
            />
          );
        })}
      </div>
      {showCount && count !== undefined && (
        <span className="text-xs text-[#7A6A64]">({count})</span>
      )}
    </div>
  );
}
