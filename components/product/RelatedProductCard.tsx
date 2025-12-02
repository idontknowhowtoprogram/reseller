'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { PriceDisplay } from './PriceDisplay';

interface RelatedProductCardProps {
  product: Product;
}

export function RelatedProductCard({ product }: RelatedProductCardProps) {
  // Get main image - check both images array and product_images for compatibility
  const images = product.images || (product as any).product_images || [];
  const mainImage = Array.isArray(images) && images.length > 0 
    ? images[0]?.image_url || images[0] 
    : null;
  
  const isReserved = product.status === 'reserved';
  const isSold = product.status === 'sold';

  // Check if product is new (created within last 7 days)
  const isNew = product.created_at 
    ? new Date(product.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    : false;

  return (
    <Link 
      href={`/product/${product.id}`}
      className="group block w-full"
    >
      <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-all hover:border-primary/50 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          {mainImage && typeof mainImage === 'string' ? (
            <Image
              src={mainImage}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 170px, 200px"
              onError={(e) => {
                // Hide image on error
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-muted-foreground text-xs">No image</span>
            </div>
          )}
          
          {/* Status Overlays */}
          {isReserved && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary" className="text-xs">
                Reserved
              </Badge>
            </div>
          )}
          {isSold && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-xs">
                Sold
              </Badge>
            </div>
          )}
          
          {/* New Badge */}
          {isNew && !isReserved && !isSold && (
            <Badge
              variant="default"
              className="absolute top-2 left-2 text-[10px] px-1.5 py-0.5 leading-tight rounded-md"
            >
              New
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-2.5 flex-1 flex flex-col gap-1">
          <h3 className="font-semibold text-xs line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <PriceDisplay
            price={product.price}
            salePrice={product.sale_price}
            className="mt-auto"
          />
        </div>
      </div>
    </Link>
  );
}

