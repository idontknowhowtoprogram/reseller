import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartStore {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
  isInCart: (productId: string) => boolean;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        const items = get().items;
        const existingItem = items.find((item) => item.product.id === product.id);
        const productQuantity = product.quantity || 1;
        const currentQuantity = existingItem ? existingItem.quantity : 0;

        // Check if adding one more would exceed available quantity
        if (currentQuantity + 1 > productQuantity) {
          return; // Don't add if it would exceed available quantity
        }

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({
            items: [...items, { product, quantity: 1 }],
          });
        }
      },
      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.product.id !== productId),
        });
      },
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        const items = get().items;
        const item = items.find((item) => item.product.id === productId);
        if (!item) return;
        
        const productQuantity = item.product.quantity || 1;
        // Don't allow quantity to exceed available product quantity
        const finalQuantity = Math.min(quantity, productQuantity);
        
        set({
          items: items.map((item) =>
            item.product.id === productId ? { ...item, quantity: finalQuantity } : item
          ),
        });
      },
      clearCart: () => {
        set({ items: [] });
      },
      getTotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.sale_price || item.product.price;
          return total + price * item.quantity;
        }, 0);
      },
      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
      isInCart: (productId) => {
        return get().items.some((item) => item.product.id === productId);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);

