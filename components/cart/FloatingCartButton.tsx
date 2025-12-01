'use client';

import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { CartSheet } from './CartSheet';
import { Settings } from '@/types';
import { useEffect, useState } from 'react';

interface FloatingCartButtonProps {
  settings: Settings;
}

export function FloatingCartButton({ settings }: FloatingCartButtonProps) {
  const itemCount = useCartStore((state) => state.getItemCount());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || itemCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 md:hidden">
      <CartSheet settings={settings}>
        <Button
          size="lg"
          className="rounded-full h-14 w-14 shadow-lg relative"
        >
          <ShoppingBag className="h-6 w-6" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold">
              {itemCount}
            </span>
          )}
        </Button>
      </CartSheet>
    </div>
  );
}

