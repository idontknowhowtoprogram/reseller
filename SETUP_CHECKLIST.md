# Setup Checklist

Follow these steps to get your marketplace up and running:

## ✅ Step 1: Supabase Project Setup

- [ ] Create a new Supabase project at [supabase.com](https://supabase.com)
- [ ] Copy your project URL and anon key
- [ ] Copy your service role key (keep it secret!)

## ✅ Step 2: Database Setup

- [ ] Go to SQL Editor in Supabase dashboard
- [ ] Run the SQL from `supabase/schema.sql`
- [ ] Verify tables were created:
  - [ ] products
  - [ ] product_images
  - [ ] offers
  - [ ] product_notifications
  - [ ] settings

## ✅ Step 3: Storage Setup

- [ ] Go to Storage in Supabase dashboard
- [ ] Create a new bucket named `product-images`
- [ ] Set bucket to **Public**
- [ ] Configure CORS if needed (for production)

## ✅ Step 4: Environment Variables

- [ ] Create `.env.local` file in project root
- [ ] Add your Supabase credentials:
  ```
  NEXT_PUBLIC_SUPABASE_URL=your_url_here
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
  SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
  ```

## ✅ Step 5: Create Admin User

- [ ] Go to Authentication > Users in Supabase
- [ ] Click "Add User"
- [ ] Create an admin account (email + password)
- [ ] Note: You'll use this to login at `/admin/login`

## ✅ Step 6: Install & Run

- [ ] Run `npm install`
- [ ] Run `npm run dev`
- [ ] Open [http://localhost:3000](http://localhost:3000)

## ✅ Step 7: Initial Configuration

- [ ] Login to `/admin/login` with your admin credentials
- [ ] Go to Settings (`/admin/settings`)
- [ ] Configure:
  - [ ] Store name
  - [ ] WhatsApp number (format: +971 50 123 4567)
  - [ ] Currency (default: AED)
  - [ ] Delivery charge (default: 25)
  - [ ] Free delivery threshold (default: 70)
  - [ ] Discount thresholds (150 and 200)
- [ ] Save settings

## ✅ Step 8: Add Your First Product

- [ ] Go to Products (`/admin/products`)
- [ ] Click "Add Product"
- [ ] Fill in product details:
  - [ ] Title
  - [ ] Product code (must be unique)
  - [ ] Category
  - [ ] Price
  - [ ] Condition
  - [ ] Description
- [ ] Save product
- [ ] Upload product images
- [ ] Set status (available/reserved/sold)
- [ ] Publish product

## ✅ Step 9: Test the Store

- [ ] Visit home page - verify products show
- [ ] Visit shop page - test filters and search
- [ ] Click on a product - verify detail page
- [ ] Add product to cart
- [ ] Test cart functionality:
  - [ ] Add multiple items
  - [ ] Verify delivery calculator works
  - [ ] Verify discount calculations
  - [ ] Test WhatsApp checkout
- [ ] Test "Make Offer" functionality
- [ ] Test reserved item notifications

## ✅ Step 10: Production Deployment

- [ ] Push code to GitHub
- [ ] Deploy to Vercel (or your preferred platform)
- [ ] Add environment variables in deployment platform
- [ ] Update Supabase CORS settings for your domain
- [ ] Test production deployment

## Troubleshooting

### Images not uploading?
- Check that `product-images` bucket exists and is public
- Verify storage policies in Supabase

### Can't login to admin?
- Verify admin user was created in Supabase Auth
- Check that email/password are correct

### Products not showing?
- Check that `is_published` is true
- Verify product status is not "sold"
- Check browser console for errors

### Cart not persisting?
- Check browser localStorage is enabled
- Verify Zustand persist middleware is working

## Next Steps

- Customize the design (colors, fonts, etc.)
- Add more product categories
- Configure email notifications (optional)
- Set up analytics (optional)
- Customize WhatsApp message templates

