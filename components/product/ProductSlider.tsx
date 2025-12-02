'use client';

import { Product } from '@/types';
import { ProductCard } from './ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

interface ProductSliderProps {
  products: Product[];
}

export function ProductSlider({ products }: ProductSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      // Scroll by approximately 1.5 cards on mobile (170px + 12px gap = ~182px per card, so ~273px for 1.5 cards)
      // On desktop, scroll by 0.8 of container width
      const isMobile = window.innerWidth < 768;
      const scrollAmount = isMobile ? 273 : scrollContainerRef.current.offsetWidth * 0.8;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative w-full">
      {/* Left scroll button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-2 md:left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 md:h-10 md:w-10 rounded-full bg-background/90 backdrop-blur-sm shadow-lg hover:bg-background border"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
      </Button>

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3 md:gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth px-12 md:px-12"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {products.map((product) => (
          <div 
            key={product.id} 
            className="flex-shrink-0 snap-center w-[170px] md:w-[calc((100vw-4.5rem)/10)] min-w-[170px]"
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Right scroll button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute right-2 md:right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 md:h-10 md:w-10 rounded-full bg-background/90 backdrop-blur-sm shadow-lg hover:bg-background border"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
      </Button>
    </div>
  );
}

