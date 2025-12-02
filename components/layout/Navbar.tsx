'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store/cart-store';
import { CartSheet } from '@/components/cart/CartSheet';
import { Settings } from '@/types';
import { useEffect, useState } from 'react';

interface NavbarProps {
  settings?: Settings;
}

export function Navbar({ settings }: NavbarProps) {
  const itemCount = useCartStore((state) => state.getItemCount());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const defaultSettings: Settings = {
    id: 'default',
    whatsapp_number: '',
    store_name: 'Reseller',
    currency: 'AED',
  
    delivery_info: null,
    about_page: null,
  
    free_delivery_threshold: 70,
    discount_150_threshold: 150,
    discount_200_threshold: 200,
    delivery_charge: 25,
  
    // Colors
    primary_color: '#000000',
    secondary_color: '#ffffff',
    accent_color: '#f5f5f5',
    background_color: '#ffffff',
    text_color: '#000000',
  
    // Homepage defaults
    home_hero_title: 'Find Premium Items at Bargain Prices',
    home_hero_subtitle: 'Only one piece each. Grab it before it’s gone.',
    home_cta_title: 'Shop Deals Now',
    home_cta_description: 'Carefully selected items, all priced to sell.',
    home_cta_button_text: 'Browse Items',
  };
  

  const finalSettings = settings || defaultSettings;

  if (!mounted) {
    return (
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full max-w-[1920px] mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <ShoppingBag className="h-6 w-6" />
            <span className="font-bold text-xl">Reseller</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/shop">
              <Button variant="ghost">Shop</Button>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full max-w-[1920px] mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <ShoppingBag className="h-6 w-6" />
          <span className="font-bold text-xl">Reseller</span>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/shop">
            <Button variant="ghost">Shop</Button>
          </Link>
          <CartSheet settings={finalSettings}>
            <Button variant="outline" className="relative">
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </CartSheet>
        </div>
      </div>
    </nav>
  );
}

