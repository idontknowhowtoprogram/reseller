import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Product } from '@/types';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

interface TodayDealCardProps {
  product: Product;
  currency?: string;
}

export function TodayDealCard({ product, currency = 'AED' }: TodayDealCardProps) {
  const displayPrice = product.sale_price || product.price;
  const mainImage = product.images?.[0]?.image_url;

  return (
    <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-4 md:p-6 border border-primary/20">
      <div className="flex flex-col md:flex-row items-center gap-4">
        {mainImage && (
          <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <Image
              src={mainImage}
              alt={product.title}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
        )}
        <div className="flex-1 text-center md:text-left">
          <p className="text-xs font-semibold text-primary mb-1">Today's Pick</p>
          <h3 className="font-bold text-lg md:text-xl mb-1 line-clamp-1">
            {product.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">
            <span className="font-semibold text-foreground">{displayPrice} {currency}</span>
            {product.sale_price && (
              <span className="line-through ml-2 text-muted-foreground">
                {product.price} {currency}
              </span>
            )}
          </p>
          <p className="text-xs text-destructive font-medium mb-3">
            Only 1 left
          </p>
          <Link href={`/product/${product.id}`}>
            <Button size="sm" variant="outline" className="w-full md:w-auto">
              View Item
              <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

