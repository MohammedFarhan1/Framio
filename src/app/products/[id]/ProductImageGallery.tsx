'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  images: string[];
  productName: string;
  fallback: React.ReactNode;
  badge?: React.ReactNode;
}

export function ProductImageGallery({ images, productName, fallback, badge }: Props) {
  const [active, setActive] = useState(0);

  const prev = () => setActive(i => (i - 1 + images.length) % images.length);
  const next = () => setActive(i => (i + 1) % images.length);

  if (!images.length) {
    return (
      <div className="bg-gradient-to-br from-[#F5EDE5] to-[#EBD9CC] rounded-3xl aspect-square flex items-center justify-center relative overflow-hidden">
        <div className="absolute w-64 h-64 rounded-full bg-white/20 -top-10 -left-10" />
        <div className="absolute w-40 h-40 rounded-full bg-white/15 bottom-10 right-10" />
        {fallback}
        {badge && <div className="absolute top-5 left-5 z-10">{badge}</div>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 w-full">

      {/* ── Main viewer ── */}
      <div className="relative w-full aspect-square rounded-3xl bg-[#F5EDE5] overflow-hidden group">

        {/* Padded image area — image fits inside without cropping */}
        <div className="absolute inset-6">
          <div className="relative w-full h-full">
            <Image
              key={images[active]}
              src={images[active]}
              alt={`${productName} — view ${active + 1}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain transition-opacity duration-200"
              priority={active === 0}
              onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          </div>
        </div>

        {/* Subtle inner shadow to frame the image area */}
        <div className="absolute inset-0 rounded-3xl shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] pointer-events-none" />

        {/* Prev / Next arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
              aria-label="Previous image"
            >
              <ChevronLeft size={16} className="text-[#2D1F1A]" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-10"
              aria-label="Next image"
            >
              <ChevronRight size={16} className="text-[#2D1F1A]" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  aria-label={`View image ${i + 1}`}
                  className={cn(
                    'h-2 rounded-full transition-all duration-200',
                    i === active ? 'bg-[#C4634F] w-5' : 'bg-[#C4634F]/30 w-2 hover:bg-[#C4634F]/60'
                  )}
                />
              ))}
            </div>
          </>
        )}

        {badge && <div className="absolute top-4 left-4 z-10">{badge}</div>}

        {images.length > 1 && (
          <div className="absolute top-4 right-4 z-10 bg-black/30 backdrop-blur-sm text-white text-xs font-medium px-2.5 py-1 rounded-full">
            {active + 1} / {images.length}
          </div>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Select image ${i + 1}`}
              className={cn(
                'flex-shrink-0 w-[72px] h-[72px] rounded-xl border-2 transition-all bg-[#F5EDE5] overflow-hidden relative',
                i === active
                  ? 'border-[#C4634F] shadow-md ring-1 ring-[#C4634F]/30'
                  : 'border-[#E8DDD6] hover:border-[#C4634F]/50 opacity-60 hover:opacity-100'
              )}
            >
              {/* Padded thumbnail image — no cropping */}
              <div className="absolute inset-1.5">
                <div className="relative w-full h-full">
                  <Image
                    src={url}
                    alt={`View ${i + 1}`}
                    fill
                    sizes="72px"
                    className="object-contain"
                  />
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
