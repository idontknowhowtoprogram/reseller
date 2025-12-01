import { CartItem, Settings } from '@/types';

export interface CartCalculations {
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  freeDeliveryThreshold: number;
  discount150Threshold: number;
  discount200Threshold: number;
  isFreeDelivery: boolean;
  discountAmount: number;
}

export function calculateCartTotals(
  items: CartItem[],
  settings: Settings
): CartCalculations {
  const subtotal = items.reduce((sum, item) => {
    const price = item.product.sale_price || item.product.price;
    return sum + price * item.quantity;
  }, 0);

  // Calculate discounts
  let discountAmount = 0;
  if (subtotal >= settings.discount_200_threshold) {
    discountAmount = 50;
  } else if (subtotal >= settings.discount_150_threshold) {
    discountAmount = 25;
  }

  const afterDiscount = subtotal - discountAmount;

  // Calculate delivery
  const isFreeDelivery = afterDiscount >= settings.free_delivery_threshold;
  const deliveryCharge = isFreeDelivery ? 0 : settings.delivery_charge;

  const total = afterDiscount + deliveryCharge;

  return {
    subtotal,
    discount: discountAmount,
    deliveryCharge,
    total,
    freeDeliveryThreshold: settings.free_delivery_threshold,
    discount150Threshold: settings.discount_150_threshold,
    discount200Threshold: settings.discount_200_threshold,
    isFreeDelivery,
    discountAmount,
  };
}

export function getDeliveryProgress(
  currentTotal: number,
  threshold: number
): {
  percentage: number;
  remaining: number;
  message: string;
} {
  if (currentTotal >= threshold) {
    return {
      percentage: 100,
      remaining: 0,
      message: '🎉 Free delivery unlocked!',
    };
  }

  const remaining = threshold - currentTotal;
  const percentage = (currentTotal / threshold) * 100;

  return {
    percentage: Math.min(percentage, 100),
    remaining,
    message: `Add ${remaining.toFixed(0)} ${getCurrencySymbol()} more for free delivery!`,
  };
}

export function getDiscountProgress(
  currentTotal: number,
  threshold150: number,
  threshold200: number
): {
  nextThreshold: number;
  nextDiscount: number;
  remaining: number;
  message: string | null;
} {
  if (currentTotal >= threshold200) {
    return {
      nextThreshold: threshold200,
      nextDiscount: 50,
      remaining: 0,
      message: '🎉 Maximum discount applied (50 AED off)!',
    };
  }

  if (currentTotal >= threshold150) {
    const remaining = threshold200 - currentTotal;
    return {
      nextThreshold: threshold200,
      nextDiscount: 50,
      remaining,
      message: `Add ${remaining.toFixed(0)} ${getCurrencySymbol()} more for 50 AED off!`,
    };
  }

  const remaining = threshold150 - currentTotal;
  return {
    nextThreshold: threshold150,
    nextDiscount: 25,
    remaining,
    message: `Add ${remaining.toFixed(0)} ${getCurrencySymbol()} more for 25 AED off!`,
  };
}

function getCurrencySymbol(): string {
  return 'AED';
}

