import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProductForm } from '@/components/admin/ProductForm';

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  try {
    const { id: productId } = await params;
    
    if (!productId) {
      console.error('No product ID provided');
      notFound();
    }

    const supabase = await createClient();

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        product_images (*)
      `)
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      notFound();
    }

    if (!product) {
      console.error('Product not found');
      notFound();
    }

    // Transform product data to match expected format
    const productData = {
      id: product.id,
      title: product.title || '',
      description: product.description || null,
      price: Number(product.price) || 0,
      sale_price: product.sale_price ? Number(product.sale_price) : null,
      quantity: product.quantity ?? 1,
      condition: product.condition || 'used',
      category: product.category || '',
      product_code: product.product_code || '',
      status: product.status || 'available',
      is_published: product.is_published ?? true,
      metadata: product.metadata || {},
      images: Array.isArray((product as any).product_images) 
        ? (product as any).product_images 
        : [],
      created_at: product.created_at,
      updated_at: product.updated_at,
    };

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">Update product information</p>
        </div>

        <ProductForm product={productData as any} />
      </div>
    );
  } catch (error: any) {
    console.error('EditProductPage error:', error);
    notFound();
  }
}

