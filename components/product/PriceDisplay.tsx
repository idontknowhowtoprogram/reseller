import { cn } from '@/lib/utils';

interface PriceDisplayProps {
  price: number;
  salePrice: number | null;
  currency?: string;
  className?: string;
}

export function PriceDisplay({
  price,
  salePrice,
  currency = 'AED',
  className,
}: PriceDisplayProps) {
  if (salePrice) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        <span className="text-xs font-bold text-primary">{salePrice} {currency}</span>
        <span className="text-[10px] text-muted-foreground line-through">
          {price} {currency}
        </span>
      </div>
    );
  }

  return (
    <div className={cn('text-xs font-bold', className)}>
      {price} {currency}
    </div>
  );
}

