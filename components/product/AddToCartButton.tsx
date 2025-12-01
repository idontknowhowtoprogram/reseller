'use client';

import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { Product } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface AddToCartButtonProps {
  product: Product;
  className?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export function AddToCartButton({
  product,
  className,
  variant = 'default',
  size = 'default',
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const isInCart = useCartStore((state) => state.isInCart(product.id));

  const handleClick = () => {
    if (product.status !== 'available') {
      return;
    }
    addItem(product);
    toast.success('Added to cart!');
  };

  if (product.status !== 'available') {
    return null;
  }

  return (
    <Button
      onClick={handleClick}
      className={cn(className)}
      variant={variant}
      size={size}
      disabled={isInCart}
    >
      <ShoppingCart className="mr-2 h-4 w-4" />
      {isInCart ? 'In Cart' : 'Add to Cart'}
    </Button>
  );
}

