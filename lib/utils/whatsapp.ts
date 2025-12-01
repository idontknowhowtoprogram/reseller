import { CartItem, Settings } from '@/types';
import { calculateCartTotals } from './cart';

export function generateWhatsAppMessage(
  items: CartItem[],
  settings: Settings
): string {
  const calculations = calculateCartTotals(items, settings);
  
  let message = `Hi, I want to buy:\n\n`;
  
  items.forEach((item, index) => {
    const price = item.product.sale_price || item.product.price;
    const total = price * item.quantity;
    message += `${index + 1}. ${item.product.title} (Code: ${item.product.product_code})`;
    if (item.quantity > 1) {
      message += ` x${item.quantity}`;
    }
    message += ` - ${price} ${settings.currency} each = ${total} ${settings.currency}\n`;
  });
  
  message += `\n---\n`;
  message += `Subtotal: ${calculations.subtotal} ${settings.currency}\n`;
  
  if (calculations.discount > 0) {
    message += `Discount: -${calculations.discount} ${settings.currency}\n`;
  }
  
  if (calculations.deliveryCharge > 0) {
    message += `Delivery: ${calculations.deliveryCharge} ${settings.currency}\n`;
  } else {
    message += `Delivery: FREE\n`;
  }
  
  message += `Total: ${calculations.total} ${settings.currency}\n`;
  
  return message;
}

export function generateWhatsAppLink(
  phoneNumber: string,
  message: string
): string {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phoneNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
}

export function generateSingleProductWhatsAppMessage(
  product: { title: string; product_code: string; price: number; sale_price: number | null },
  settings: Settings
): string {
  const price = product.sale_price || product.price;
  return `Hi, I want to buy: ${product.title} (Code: ${product.product_code}) - ${price} ${settings.currency}`;
}

