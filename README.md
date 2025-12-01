# Reseller Marketplace

A full-stack marketplace application for reselling items, built with Next.js 14, Supabase, and Tailwind CSS.

## Features

### Customer-Facing Store
- **Home Page**: Hero section, featured products, latest items
- **Shop Page**: Product grid with filters (category, condition, price), search functionality
- **Product Detail Page**: Large image gallery, product information, add to cart, make offer
- **Shopping Cart**: 
  - Multi-product selection
  - Dynamic delivery calculator (25 AED below 70 AED, free above)
  - Bundle discounts (25 AED off at 150 AED, 50 AED off at 200 AED)
  - Toast notifications for milestones
  - Progress indicators
  - WhatsApp checkout with all items and product codes
- **Reserved Items**: Customers can request notifications when reserved items become available

### Admin Dashboard
- **Authentication**: Secure admin login
- **Dashboard**: Statistics overview (total products, sold items, pending offers, notifications)
- **Product Management**: 
  - Create, edit, delete products
  - Upload multiple images with drag-and-drop reordering
  - Product code search
  - Status management (available, reserved, sold)
  - Published/draft toggle
- **Offers Management**: View, accept, reject offers with WhatsApp quick reply
- **Settings**: 
  - Store information
  - Delivery and discount thresholds (configurable)
  - WhatsApp number
  - Content management

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, ShadCN UI
- **State Management**: Zustand (cart), React Query
- **Forms**: React Hook Form + Zod validation
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Icons**: Lucide React
- **Notifications**: Sonner (toast notifications)

## Setup Instructions

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)

### 2. Clone and Install

```bash
# Install dependencies
npm install
```

### 3. Supabase Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Create a storage bucket named `product-images` (public access)
4. Go to Settings > API and copy your:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep this secret!)

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5. Create Admin User

1. Go to Supabase Dashboard > Authentication > Users
2. Click "Add User" and create an admin account
3. Note the email and password (you'll use this to login to `/admin`)

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 7. Initial Setup

1. Login to `/admin/login` with your Supabase admin credentials
2. Go to Settings and configure:
   - Store name
   - WhatsApp number
   - Delivery thresholds
   - Discount thresholds
3. Start adding products!

## Project Structure

```
reseller/
├── app/
│   ├── (public)/          # Public-facing pages
│   │   ├── page.tsx       # Home page
│   │   ├── shop/          # Shop listing
│   │   └── product/[id]   # Product detail
│   ├── admin/             # Admin dashboard
│   │   ├── page.tsx       # Dashboard
│   │   ├── products/      # Product management
│   │   ├── offers/        # Offers management
│   │   └── settings/      # Settings
│   └── api/               # API routes
├── components/
│   ├── admin/             # Admin components
│   ├── cart/              # Shopping cart components
│   ├── layout/            # Layout components
│   ├── product/           # Product components
│   └── shared/           # Shared components
├── lib/
│   ├── supabase/          # Supabase clients
│   └── utils/             # Utility functions
├── store/                 # Zustand stores
├── types/                 # TypeScript types
└── supabase/
    └── schema.sql         # Database schema
```

## Key Features Explained

### Shopping Cart System
- Uses Zustand for state management with localStorage persistence
- Calculates delivery charges and discounts automatically
- Shows progress indicators for free delivery and discount milestones
- Toast notifications when milestones are reached

### Delivery & Discounts
- **Delivery**: 25 AED charge below 70 AED, free above
- **Discounts**: 
  - 25 AED off when cart value ≥ 150 AED
  - 50 AED off when cart value ≥ 200 AED
- All thresholds are configurable in admin settings

### WhatsApp Integration
- Generates deep links with pre-filled messages
- Includes all cart items with product codes and prices
- Shows totals, discounts, and delivery charges

### Reserved Items
- Products can be marked as "reserved"
- Customers can request notifications when items become available
- Admin can change status from reserved to available, triggering notifications

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Supabase Storage

Make sure your `product-images` bucket is configured with:
- Public access enabled
- CORS settings for your domain

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Notes

- Images are stored in Supabase Storage
- Product codes must be unique
- Admin authentication uses Supabase Auth
- All admin routes are protected by middleware
- The app is mobile-first and fully responsive

## Support

For issues or questions, please check the code comments or Supabase documentation.
