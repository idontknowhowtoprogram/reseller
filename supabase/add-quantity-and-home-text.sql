-- Add quantity field to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;

-- Add home page text fields to settings table
ALTER TABLE settings ADD COLUMN IF NOT EXISTS home_hero_title TEXT DEFAULT 'Find Premium Items at Bargain Prices';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS home_hero_subtitle TEXT DEFAULT 'Carefully selected, lightly used items. Only one piece of each.';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS home_cta_title TEXT DEFAULT 'Can''t find what you''re looking for?';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS home_cta_description TEXT DEFAULT 'Contact us on WhatsApp and we''ll help you find the perfect item.';
ALTER TABLE settings ADD COLUMN IF NOT EXISTS home_cta_button_text TEXT DEFAULT 'Chat with Us';

-- Create index for quantity
CREATE INDEX IF NOT EXISTS idx_products_quantity ON products(quantity);

