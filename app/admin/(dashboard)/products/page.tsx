import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Plus, Upload } from 'lucide-react';
import { ProductsTable } from '@/components/admin/ProductsTable';
import { AdminProductSearch } from '@/components/admin/AdminProductSearch';

interface ProductsPageProps {
  searchParams: {
    search?: string;
  };
}

export default async function AdminProductsPage({ searchParams }: ProductsPageProps) {
  const supabase = await createClient();

  let query = supabase
    .from('products')
    .select(`
      *,
      product_images (*)
    `)
    .order('created_at', { ascending: false });

  if (searchParams.search) {
    const searchTerm = searchParams.search.trim();
    query = query.or(`title.ilike.%${searchTerm}%,product_code.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%`);
  }

  const { data: products } = await query;

  // Transform products to match Product type structure
  const transformedProducts = (products || []).map((product: any) => ({
    ...product,
    images: Array.isArray(product.product_images)
      ? product.product_images.sort((a: any, b: any) => a.sort_order - b.sort_order)
      : [],
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">Manage your product inventory</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products/bulk">
            <Button variant="outline" className="transition-colors duration-200 hover:bg-accent">
              <Upload className="mr-2 h-4 w-4" />
              Bulk Upload
            </Button>
          </Link>
          <Link href="/admin/products/new">
            <Button className="transition-colors duration-200 hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <AdminProductSearch />

      <ProductsTable products={transformedProducts} />
    </div>
  );
}

