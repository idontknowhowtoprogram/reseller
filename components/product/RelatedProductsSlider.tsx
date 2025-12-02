'use client';

import { Product } from '@/types';
import { RelatedProductCard } from './RelatedProductCard';

interface RelatedProductsSliderProps {
  products: Product[];
}

export function RelatedProductsSlider({ products }: RelatedProductsSliderProps) {
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div
      className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 scrollbar-hide"
      style={{
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}
    >
      {products.map((product) => (
        <div 
          key={product.id} 
          className="flex-shrink-0 snap-center w-[170px] md:w-[200px]"
        >
          <RelatedProductCard product={product} />
        </div>
      ))}
    </div>
  );
}

