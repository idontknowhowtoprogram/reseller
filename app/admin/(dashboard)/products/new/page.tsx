import { ProductForm } from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Add New Product</h1>
        <p className="text-muted-foreground">Create a new product listing</p>
      </div>

      <ProductForm />
    </div>
  );
}

