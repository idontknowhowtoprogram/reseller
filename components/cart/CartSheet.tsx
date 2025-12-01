'use client';

import { useCartStore } from '@/store/cart-store';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ShoppingBag, Trash2, Plus, Minus, X } from 'lucide-react';
import Image from 'next/image';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { calculateCartTotals, getDeliveryProgress, getDiscountProgress } from '@/lib/utils/cart';
import { Settings } from '@/types';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { PriceDisplay } from '@/components/product/PriceDisplay';

interface CartSheetProps {
  settings: Settings;
  children: React.ReactNode;
}

export function CartSheet({ settings, children }: CartSheetProps) {
  const { items, removeItem, updateQuantity, clearCart, getItemCount } = useCartStore();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Track previous state to only show notifications when crossing thresholds
  const prevStateRef = useRef({
    wasFreeDelivery: false,
    previousDiscount: 0,
    hasShownFreeDelivery: false,
    hasShown25Discount: false,
    hasShown50Discount: false,
    previousItemCount: 0,
    isInitialMount: true,
  });

  // Always call hooks in the same order - before any conditional returns
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate values (these are not hooks, so they can be conditional)
  const calculations = mounted ? calculateCartTotals(items, settings) : {
    subtotal: 0,
    discount: 0,
    deliveryCharge: 0,
    total: 0,
    freeDeliveryThreshold: settings.free_delivery_threshold,
    discount150Threshold: settings.discount_150_threshold,
    discount200Threshold: settings.discount_200_threshold,
    isFreeDelivery: false,
    discountAmount: 0,
  };
  
  const deliveryProgress = mounted ? getDeliveryProgress(calculations.subtotal - calculations.discount, settings.free_delivery_threshold) : {
    percentage: 0,
    remaining: settings.free_delivery_threshold,
    message: '',
  };
  
  const discountProgress = mounted ? getDiscountProgress(calculations.subtotal, settings.discount_150_threshold, settings.discount_200_threshold) : {
    nextThreshold: settings.discount_150_threshold,
    nextDiscount: 25,
    remaining: settings.discount_150_threshold,
    message: null,
  };

  // Show notifications only when crossing thresholds (not on initial mount or refresh)
  useEffect(() => {
    if (!mounted) return;

    const prev = prevStateRef.current;
    const currentItemCount = items.length;
    const current = calculations;

    // On initial mount, just initialize state without showing notifications
    if (prev.isInitialMount) {
      prevStateRef.current = {
        wasFreeDelivery: current.isFreeDelivery,
        previousDiscount: current.discount,
        hasShownFreeDelivery: false,
        hasShown25Discount: false,
        hasShown50Discount: false,
        previousItemCount: currentItemCount,
        isInitialMount: false,
      };
      return;
    }

    // Only show notifications if items actually changed (added/removed/updated)
    if (currentItemCount === 0) {
      // Reset state when cart is empty
      prevStateRef.current = {
        wasFreeDelivery: false,
        previousDiscount: 0,
        hasShownFreeDelivery: false,
        hasShown25Discount: false,
        hasShown50Discount: false,
        previousItemCount: 0,
        isInitialMount: false,
      };
      return;
    }

    // Only process notifications if items changed (not just on re-render)
    if (currentItemCount !== prev.previousItemCount) {
      prevStateRef.current.previousItemCount = currentItemCount;
    } else {
      // Items haven't changed, don't show new notifications
      return;
    }

    // Only show free delivery notification when crossing the threshold (not already above it)
    if (current.isFreeDelivery && !prev.wasFreeDelivery && !prev.hasShownFreeDelivery) {
      toast.success('🎉 Free delivery unlocked!');
      prevStateRef.current.hasShownFreeDelivery = true;
      prevStateRef.current.wasFreeDelivery = true;
    } else if (!current.isFreeDelivery && prev.wasFreeDelivery) {
      // Reset if they drop below threshold
      prevStateRef.current.wasFreeDelivery = false;
      prevStateRef.current.hasShownFreeDelivery = false;
    } else if (current.isFreeDelivery) {
      // Update state if already above threshold
      prevStateRef.current.wasFreeDelivery = true;
    }

    // Only show discount notifications when crossing thresholds
    if (current.discount === 25 && prev.previousDiscount < 25 && !prev.hasShown25Discount) {
      toast.success('🎉 25 AED discount applied!');
      prevStateRef.current.hasShown25Discount = true;
      prevStateRef.current.previousDiscount = 25;
    } else if (current.discount === 50 && prev.previousDiscount < 50 && !prev.hasShown50Discount) {
      toast.success('🎉 50 AED discount applied!');
      prevStateRef.current.hasShown50Discount = true;
      prevStateRef.current.previousDiscount = 50;
    } else if (current.discount < prev.previousDiscount) {
      // Reset discount flags if discount decreases
      if (current.discount < 50) {
        prevStateRef.current.hasShown50Discount = false;
      }
      if (current.discount < 25) {
        prevStateRef.current.hasShown25Discount = false;
      }
      prevStateRef.current.previousDiscount = current.discount;
    } else {
      // Update previous discount if it hasn't changed
      prevStateRef.current.previousDiscount = current.discount;
    }
  }, [mounted, items.length, calculations.isFreeDelivery, calculations.discount, calculations.subtotal, settings]);

  // Now we can do conditional returns after all hooks
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            {getItemCount()} {getItemCount() === 1 ? 'item' : 'items'}
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button onClick={() => setOpen(false)} variant="outline">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <>
            {/* Progress Banner */}
            <div className="mt-4 space-y-2">
              {!calculations.isFreeDelivery && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm font-medium mb-1">{deliveryProgress.message}</p>
                  <div className="w-full bg-background rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${deliveryProgress.percentage}%` }}
                    />
                  </div>
                </div>
              )}
              {discountProgress.message && discountProgress.remaining > 0 && (
                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="text-sm font-medium">{discountProgress.message}</p>
                </div>
              )}
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => {
                const price = item.product.sale_price || item.product.price;
                return (
                  <div key={item.product.id} className="flex gap-4">
                    <div className="relative w-20 h-20 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={item.product.images?.[0]?.image_url || '/placeholder-product.jpg'}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium text-sm line-clamp-2">{item.product.title}</h4>
                      <p className="text-xs text-muted-foreground">Code: {item.product.product_code}</p>
                      <PriceDisplay price={item.product.price} salePrice={item.product.sale_price} className="text-sm" />
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                          <span className="sr-only">Decrease quantity</span>
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= (item.product.quantity || 1)}
                          title={item.quantity >= (item.product.quantity || 1) ? 'Maximum quantity reached' : 'Increase quantity'}
                        >
                          <Plus className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                          <span className="sr-only">Increase quantity</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 ml-auto shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                          <span className="sr-only">Remove item</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cart Summary */}
            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{calculations.subtotal.toFixed(2)} {settings.currency}</span>
                </div>
                {calculations.discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span>-{calculations.discount.toFixed(2)} {settings.currency}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>
                    {calculations.deliveryCharge > 0
                      ? `${calculations.deliveryCharge.toFixed(2)} ${settings.currency}`
                      : 'FREE'}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{calculations.total.toFixed(2)} {settings.currency}</span>
                </div>
              </div>

              <WhatsAppButton
                phoneNumber={settings.whatsapp_number}
                items={items}
                settings={settings}
                className="w-full"
                size="lg"
              >
                Checkout on WhatsApp
              </WhatsAppButton>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

