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

    // Type the product properly
    const typedProduct = product as any;

    // Transform product data to match expected format
    const productData = {
      id: typedProduct.id,
      title: typedProduct.title || '',
      description: typedProduct.description || null,
      price: Number(typedProduct.price) || 0,
      sale_price: typedProduct.sale_price ? Number(typedProduct.sale_price) : null,
      quantity: typedProduct.quantity ?? 1,
      condition: typedProduct.condition || 'used',
      category: typedProduct.category || '',
      product_code: typedProduct.product_code || '',
      status: typedProduct.status || 'available',
      is_published: typedProduct.is_published ?? true,
      metadata: typedProduct.metadata || {},
      images: Array.isArray(typedProduct.product_images) 
        ? typedProduct.product_images 
        : [],
      created_at: typedProduct.created_at,
      updated_at: typedProduct.updated_at,
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

