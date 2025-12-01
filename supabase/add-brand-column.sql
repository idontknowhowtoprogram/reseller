-- Add brand column to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS brand TEXT;

-- Create index for brand filtering
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);

-- Optional: Set default empty string for existing products
-- UPDATE products SET brand = '' WHERE brand IS NULL;

