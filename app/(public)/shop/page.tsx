import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product/ProductCard';
import { Product } from '@/types';
import { ShopFilters } from '@/components/shop/ShopFilters';
import { Suspense } from 'react';

// Force dynamic rendering to ensure search params are always fresh
export const dynamic = 'force-dynamic';

interface ShopPageProps {
  searchParams: {
    search?: string;
    category?: string;
    condition?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  // Handle both Promise and non-Promise searchParams (Next.js 16 compatibility)
  const params = searchParams instanceof Promise ? await searchParams : searchParams;
  
  // Debug: Log what we receive
  console.log('📥 ShopPage received searchParams:', JSON.stringify(params, null, 2));
  console.log('📥 searchParams type:', searchParams instanceof Promise ? 'Promise' : 'Object');
  
  const supabase = await createClient();

  // Start with base query - apply search FIRST, then status filters
  let query = supabase
    .from('products')
    .select(`
      *,
      product_images (*)
    `);

  // Apply search filter FIRST (before status filters)
  if (params.search) {
    const searchTerm = params.search.trim();
    console.log('🔍 Applying search filter for term:', searchTerm);
    if (searchTerm) {
      const searchPattern = `%${searchTerm}%`;
      query = query.or(`title.ilike.${searchPattern},description.ilike.${searchPattern},product_code.ilike.${searchPattern},brand.ilike.${searchPattern}`);
      console.log('📝 Applied OR query with pattern:', searchPattern);
    }
  }

  // Apply status filters AFTER search
  query = query.eq('is_published', true).neq('status', 'sold');

  if (params.category && params.category !== 'all') {
    query = query.eq('category', params.category);
  }

  if (params.condition && params.condition !== 'all') {
    query = query.eq('condition', params.condition);
  }

  if (params.brand && params.brand !== 'all') {
    query = query.eq('brand', params.brand);
  }

  if (params.minPrice) {
    query = query.gte('price', parseFloat(params.minPrice));
  }

  if (params.maxPrice) {
    query = query.lte('price', parseFloat(params.maxPrice));
  }

  // Log the query before execution
  console.log('🔎 Executing query with filters...');
  
  const { data: products, error: productsError } = await query.order('created_at', { ascending: false });

  // Log for debugging
  if (productsError) {
    console.error('❌ Error fetching products:', productsError);
    console.error('❌ Error code:', productsError.code);
    console.error('❌ Error message:', productsError.message);
    console.error('❌ Error details:', JSON.stringify(productsError, null, 2));
  }
  
  // Type the products array properly
  const typedProducts = (products || []) as any[];
  
  // Debug logging
  console.log('📊 Products count:', typedProducts?.length || 0);
  if (params.search) {
    console.log('✅ Search term used:', params.search);
    if (typedProducts && typedProducts.length > 0) {
      console.log('✅ First result:', typedProducts[0]?.title);
      console.log('✅ All product titles:', typedProducts.map((p: any) => p.title).slice(0, 5));
    } else {
      console.log('⚠️ No products found for search term:', params.search);
      
      // Test 1: Check if products exist at all
      const { data: allProducts } = await supabase
        .from('products')
        .select('title, product_code, brand, is_published, status')
        .limit(10);
      console.log('📋 All products in DB (first 10):', allProducts?.map(p => ({
        title: p.title,
        code: p.product_code,
        brand: p.brand,
        published: p.is_published,
        status: p.status
      })));
      
      // Test 2: Check if any products match the search term in title
      const { data: titleMatch } = await supabase
        .from('products')
        .select('title, product_code, brand')
        .ilike('title', `%${params.search}%`)
        .eq('is_published', true)
        .neq('status', 'sold')
        .limit(5);
      console.log('🔍 Products matching title search:', titleMatch?.map(p => ({
        title: p.title,
        code: p.product_code,
        brand: p.brand
      })));
    }
  }

  // Get unique categories
  const { data: categoriesData } = await supabase
    .from('products')
    .select('category')
    .eq('is_published', true);

  const categories = Array.from(
    new Set(categoriesData?.map((p) => p.category) || [])
  ).sort();

  // Get unique brands
  const { data: brandsData } = await supabase
    .from('products')
    .select('brand')
    .eq('is_published', true)
    .not('brand', 'is', null);

  const brands = Array.from(
    new Set(brandsData?.map((p) => p.brand).filter(Boolean) || [])
  ).sort();

  // Transform products to match Product type structure (product_images -> images)
  const productList: Product[] = (typedProducts || []).map((product: any) => ({
    ...product,
    images: Array.isArray(product.product_images)
      ? product.product_images
          .filter((img: any) => img && img.image_url)
          .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
      : [],
  }));

  return (
    <div className="w-full px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Shop</h1>
        <p className="text-muted-foreground">
          Browse our collection of quality pre-owned items
        </p>
      </div>

      {/* Filters */}
      <div className="mb-8 space-y-4">
        <Suspense fallback={<div className="h-12 bg-muted animate-pulse rounded" />}>
          <ShopFilters categories={categories} brands={brands} />
        </Suspense>
      </div>

      {/* Products Grid */}
      {productList.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No products found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
          {productList.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

