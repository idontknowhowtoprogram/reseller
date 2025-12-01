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
      const scrollAmount = scrollContainerRef.current.offsetWidth * 0.8;
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
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background"
        onClick={() => scroll('left')}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>

      {/* Scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-12"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {products.map((product) => (
          <div key={product.id} className="flex-shrink-0" style={{ width: 'calc((100vw - 4.5rem) / 10)' }}>
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Right scroll button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm shadow-lg hover:bg-background"
        onClick={() => scroll('right')}
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
}

