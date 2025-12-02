'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Product } from '@/types';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { PriceDisplay } from './PriceDisplay';
import { useState, useEffect } from 'react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [mounted, setMounted] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const isInCart = useCartStore((state) => state.isInCart(product.id));

  // Prevent hydration mismatch by only reading cart state after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get main image - check both images array and product_images for compatibility
  const images = product.images || (product as any).product_images || [];
  const mainImage = Array.isArray(images) && images.length > 0 
    ? images[0]?.image_url || images[0] 
    : null;
  
  const isReserved = product.status === 'reserved';
  const isSold = product.status === 'sold';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isReserved && !isSold) {
      addItem(product);
    }
  };

  // Use mounted state to prevent hydration mismatch
  const cartDisabled = mounted ? (isReserved || isSold || isInCart) : (isReserved || isSold);
  const buttonText = mounted && isInCart ? 'In Cart' : 'Add';

  return (
    <Card className="group overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
      <Link href={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {mainImage && typeof mainImage === 'string' ? (
            <Image
              src={mainImage}
              alt={product.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 170px, (max-width: 1200px) 200px, 250px"
              onError={(e) => {
                // Hide image on error
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No image</span>
            </div>
          )}
          {isReserved && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary" className="text-sm">
                Reserved
              </Badge>
            </div>
          )}
          {isSold && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-sm">
                Sold
              </Badge>
            </div>
          )}
          <Badge
            variant="outline"
            className="absolute top-2 left-2 capitalize text-[11px] px-2 py-0.5 leading-tight bg-background/90 backdrop-blur-sm"
          >
            {product.condition.replace('_', ' ')}
          </Badge>
        </div>
      </Link>
      <CardContent className="p-2.5 md:p-1.5 flex-1 flex flex-col gap-1">
        <Link href={`/product/${product.id}`}>
          <h3 className="font-semibold text-sm md:text-xs line-clamp-2 mb-0 hover:text-primary transition-colors leading-tight">
            {product.title}
          </h3>
        </Link>
        {product.brand && (
          <p className="text-xs font-medium text-primary mb-0">
            {product.brand}
          </p>
        )}
        <p className="text-xs text-muted-foreground mb-0">
          Code: {product.product_code}
        </p>
        <PriceDisplay
          price={product.price}
          salePrice={product.sale_price}
          className="mb-0"
        />
      </CardContent>
      <CardFooter className="p-2.5 md:p-1.5 pt-0 flex gap-2 md:gap-1 mt-auto">
        <Link href={`/product/${product.id}`} className="flex-1">
          <Button variant="outline" className="w-full h-7 md:h-6 text-xs md:text-[10px] px-2 md:px-1.5" size="sm">
            <Eye className="h-3 w-3 md:h-2.5 md:w-2.5 mr-1 md:mr-0.5" />
            View
          </Button>
        </Link>
        <Button
          variant="default"
          className="flex-1 h-7 md:h-6 text-xs md:text-[10px] px-2 md:px-1.5"
          size="sm"
          onClick={handleAddToCart}
          disabled={cartDisabled}
        >
          <ShoppingCart className="h-3 w-3 md:h-2.5 md:w-2.5 mr-1 md:mr-0.5" />
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
}

