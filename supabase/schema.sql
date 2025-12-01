-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE product_status AS ENUM ('available', 'reserved', 'sold');
CREATE TYPE product_condition AS ENUM ('new', 'like_new', 'used', 'good', 'fair');
CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'countered');

-- Products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  sale_price NUMERIC(10, 2),
  condition product_condition NOT NULL DEFAULT 'used',
  category TEXT NOT NULL,
  product_code TEXT UNIQUE NOT NULL,
  status product_status NOT NULL DEFAULT 'available',
  metadata JSONB DEFAULT '{}',
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product images table
CREATE TABLE product_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Offers table
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  offer_price NUMERIC(10, 2) NOT NULL,
  notes TEXT,
  status offer_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product notifications table (for reserved items)
CREATE TABLE product_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  notified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Settings table (single row)
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001',
  whatsapp_number TEXT NOT NULL DEFAULT '',
  store_name TEXT NOT NULL DEFAULT 'My Store',
  currency TEXT NOT NULL DEFAULT 'AED',
  delivery_info TEXT,
  about_page TEXT,
  free_delivery_threshold NUMERIC(10, 2) DEFAULT 70,
  discount_150_threshold NUMERIC(10, 2) DEFAULT 150,
  discount_200_threshold NUMERIC(10, 2) DEFAULT 200,
  delivery_charge NUMERIC(10, 2) DEFAULT 25,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (id) VALUES ('00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Create indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_product_code ON products(product_code);
CREATE INDEX idx_products_is_published ON products(is_published);
CREATE INDEX idx_product_images_product_id ON product_images(product_id);
CREATE INDEX idx_offers_product_id ON offers(product_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_product_notifications_product_id ON product_notifications(product_id);
CREATE INDEX idx_product_notifications_notified ON product_notifications(notified);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public policies (read-only for products and images)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (is_published = true AND status != 'sold');

CREATE POLICY "Product images are viewable by everyone" ON product_images
  FOR SELECT USING (true);

-- Public policy for creating offers
CREATE POLICY "Anyone can create offers" ON offers
  FOR INSERT WITH CHECK (true);

-- Public policy for creating notifications
CREATE POLICY "Anyone can create product notifications" ON product_notifications
  FOR INSERT WITH CHECK (true);

-- Admin policies (authenticated users can manage everything)
CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage product images" ON product_images
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage offers" ON offers
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage product notifications" ON product_notifications
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage settings" ON settings
  FOR ALL USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage bucket policies
-- Allow public read access
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update product images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete product images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

