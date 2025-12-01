-- Fix RLS policies to allow authenticated users to manage data
-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Admins can manage product images" ON product_images;
DROP POLICY IF EXISTS "Admins can manage offers" ON offers;
DROP POLICY IF EXISTS "Admins can manage product notifications" ON product_notifications;
DROP POLICY IF EXISTS "Admins can manage settings" ON settings;

-- Create new admin policies that check for authenticated users
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

-- Create storage bucket for product images (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Drop existing storage policies (if any)
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete product images" ON storage.objects;

-- Storage bucket policies
-- Allow public read access
CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to update their uploaded images
CREATE POLICY "Authenticated users can update product images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL)
  WITH CHECK (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

-- Allow authenticated users to delete images
CREATE POLICY "Authenticated users can delete product images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND auth.uid() IS NOT NULL);

