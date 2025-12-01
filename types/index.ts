export type ProductStatus = 'available' | 'reserved' | 'sold';
export type ProductCondition = 'new' | 'like_new' | 'used' | 'good' | 'fair';
export type OfferStatus = 'pending' | 'accepted' | 'rejected' | 'countered';

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  sale_price: number | null;
  condition: ProductCondition;
  category: string;
  brand: string | null;
  product_code: string;
  status: ProductStatus;
  quantity: number;
  metadata: Record<string, any>;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  sort_order: number;
}

export interface Offer {
  id: string;
  product_id: string;
  name: string;
  phone: string;
  offer_price: number;
  notes: string | null;
  status: OfferStatus;
  created_at: string;
  product?: Product;
}

export interface ProductNotification {
  id: string;
  product_id: string;
  customer_name: string;
  phone: string | null;
  email: string | null;
  notified: boolean;
  created_at: string;
  product?: Product;
}

export interface Settings {
  id: string;
  whatsapp_number: string;
  store_name: string;
  currency: string;
  delivery_info: string | null;
  about_page: string | null;
  free_delivery_threshold: number; // Default: 70
  discount_150_threshold: number; // Default: 150, discount: 25
  discount_200_threshold: number; // Default: 200, discount: 50
  delivery_charge: number; // Default: 25
  // Color palette
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  // Home page text
  home_hero_title: string;
  home_hero_subtitle: string;
  home_cta_title: string;
  home_cta_description: string;
  home_cta_button_text: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

