import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

interface BulkProductData {
  title: string;
  description?: string | null;
  price: number;
  sale_price?: number | null;
  condition: string;
  category: string;
  brand?: string | null;
  product_code: string;
  status: string;
  is_published: boolean;
  metadata?: Record<string, any>;
  images?: File[];
}

interface BulkResult {
  productId: string;
  title: string;
  success: boolean;
  error?: string;
}

// Generate unique product code
function generateProductCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PROD-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated (admin)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const productsData = formData.get('products');
    
    if (!productsData) {
      return NextResponse.json(
        { error: 'No products data provided' },
        { status: 400 }
      );
    }

    // Parse products JSON
    let products: BulkProductData[];
    try {
      products = JSON.parse(productsData as string);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid products data format' },
        { status: 400 }
      );
    }

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json(
        { error: 'Products must be a non-empty array' },
        { status: 400 }
      );
    }

    if (products.length > 20) {
      return NextResponse.json(
        { error: 'Maximum 20 products allowed per bulk upload' },
        { status: 400 }
      );
    }

    // Use service role client for operations
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const results: BulkResult[] = [];

    // Process each product
    for (const productData of products) {
      try {
        // Ensure product code is set
        const productCode = productData.product_code || generateProductCode();

        // Create product
        const query = (serviceClient.from('products') as any);
        const { data: product, error: productError } = await query
          .insert({
            title: productData.title,
            description: productData.description || null,
            price: parseFloat(productData.price.toString()),
            sale_price: productData.sale_price
              ? parseFloat(productData.sale_price.toString())
              : null,
            condition: productData.condition,
            category: productData.category,
            brand: productData.brand || null,
            product_code: productCode,
            status: productData.status || 'available',
            metadata: productData.metadata || {},
            is_published: productData.is_published !== undefined
              ? productData.is_published
              : true,
          })
          .select()
          .single();

        if (productError) {
          throw new Error(productError.message || 'Failed to create product');
        }

        const productId = product.id;

        // Handle images if provided (images are sent as separate form data entries)
        // Note: Images should be uploaded via the existing /api/products/[id]/images endpoint
        // This bulk endpoint focuses on creating products, images can be uploaded separately

        results.push({
          productId,
          title: productData.title,
          success: true,
        });
      } catch (error) {
        results.push({
          productId: '',
          title: productData.title,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    return NextResponse.json({
      results,
      summary: {
        total: products.length,
        success: successCount,
        failed: failCount,
      },
    });
  } catch (error) {
    console.error('Unexpected error in bulk upload:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

