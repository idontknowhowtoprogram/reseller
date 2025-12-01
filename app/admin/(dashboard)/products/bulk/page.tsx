import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BulkProductForm } from '@/components/admin/BulkProductForm';

export default function BulkUploadPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bulk Product Upload</h1>
          <p className="text-muted-foreground">
            Add multiple products at once (up to 20 products)
          </p>
        </div>
        <Link href="/admin/products">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
      </div>

      <BulkProductForm />
    </div>
  );
}

