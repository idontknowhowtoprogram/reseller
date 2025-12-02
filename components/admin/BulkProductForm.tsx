'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BulkImageUploader, ImageFile } from './BulkImageUploader';
import { toast } from 'sonner';
import { Plus, Trash2, Copy, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import Link from 'next/link';
import * as z from 'zod';

const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  sale_price: z.number().min(0).optional().nullable(),
  condition: z.enum(['new', 'like_new', 'used', 'good', 'fair']),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().optional().nullable(),
  status: z.enum(['available', 'reserved', 'sold']),
  is_published: z.boolean(),
});

const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Clothing & Accessories',
  'Books & Media',
  'Home & Kitchen',
  'Sports & Outdoors',
  'Toys & Games',
  'Beauty & Personal Care',
  'Automotive',
  'Other',
];

function generateProductCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PROD-${timestamp}-${random}`;
}

interface ProductRow {
  id: string;
  title: string;
  description: string;
  price: string;
  sale_price: string;
  condition: 'new' | 'like_new' | 'used' | 'good' | 'fair';
  category: string;
  brand: string;
  status: 'available' | 'reserved' | 'sold';
  is_published: boolean;
  images: ImageFile[];
  errors: Record<string, string>;
}

interface BulkResult {
  productId: string;
  title: string;
  success: boolean;
  error?: string;
  productIndex?: number; // Store index for retry
  productData?: ProductRow; // Store product data for retry
}

export function BulkProductForm() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductRow[]>(() => {
    // Initialize with 5 empty rows
    return Array.from({ length: 5 }, () => createEmptyProductRow());
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BulkResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  function createEmptyProductRow(): ProductRow {
    return {
      id: `${Date.now()}-${Math.random()}`,
      title: '',
      description: '',
      price: '',
      sale_price: '',
      condition: 'used',
      category: '',
      brand: '',
      status: 'available',
      is_published: true,
      images: [],
      errors: {},
    };
  }

  const addProductRow = () => {
    if (products.length >= 20) {
      toast.error('Maximum 20 products allowed');
      return;
    }
    setProducts([...products, createEmptyProductRow()]);
  };

  const removeProductRow = (id: string) => {
    if (products.length <= 1) {
      toast.error('At least one product row is required');
      return;
    }
    setProducts(products.filter((p) => p.id !== id));
  };

  const duplicateProductRow = (id: string) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    
    const duplicated: ProductRow = {
      ...createEmptyProductRow(),
      title: product.title,
      description: product.description,
      price: product.price,
      sale_price: product.sale_price,
      condition: product.condition,
      category: product.category,
      brand: product.brand,
      status: product.status,
      is_published: product.is_published,
    };
    
    setProducts([...products, duplicated]);
  };

  const updateProduct = (id: string, field: keyof ProductRow, value: any) => {
    setProducts(
      products.map((p) => {
        if (p.id === id) {
          const updated = { ...p, [field]: value };
          // Clear errors for this field when updated
          if (updated.errors[field as string]) {
            const { [field as string]: _, ...restErrors } = updated.errors;
            updated.errors = restErrors;
          }
          return updated;
        }
        return p;
      })
    );
  };

  const validateProduct = (product: ProductRow): Record<string, string> => {
    const errors: Record<string, string> = {};
    
    try {
      productSchema.parse({
        title: product.title,
        description: product.description,
        price: parseFloat(product.price) || 0,
        sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
        condition: product.condition,
        category: product.category,
        brand: product.brand || null,
        status: product.status,
        is_published: product.is_published,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach((err) => {
          const path = err.path[0] as string;
          errors[path] = err.message;
        });
      }
    }
    
    return errors;
  };

  const validateAll = (): boolean => {
    let isValid = true;
    const updatedProducts = products.map((product) => {
      const errors = validateProduct(product);
      if (Object.keys(errors).length > 0) {
        isValid = false;
      }
      return { ...product, errors };
    });
    
    setProducts(updatedProducts);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateAll()) {
      toast.error('Please fix validation errors before submitting');
      return;
    }

    setIsSubmitting(true);
    setProgress(0);
    setResults([]);
    setShowResults(false);

    const bulkResults: BulkResult[] = [];
    const totalProducts = products.length;

    try {
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        setProgress(((i + 1) / totalProducts) * 100);

        try {
          // Create product
          const productData = {
            title: product.title,
            description: product.description || null,
            price: parseFloat(product.price),
            sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
            condition: product.condition,
            category: product.category,
            brand: product.brand || null,
            product_code: generateProductCode(),
            status: product.status,
            is_published: product.is_published,
            metadata: {},
          };

          const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create product');
          }

          const result = await response.json();
          const productId = result.data.id;

          // Upload images if any
          if (product.images.length > 0) {
            const formData = new FormData();
            product.images.forEach((img) => {
              formData.append('files', img.file);
            });

            const imageResponse = await fetch(`/api/products/${productId}/images`, {
              method: 'POST',
              body: formData,
            });

            if (!imageResponse.ok) {
              console.error(`Failed to upload images for ${product.title}`);
            }
          }

          bulkResults.push({
            productId,
            title: product.title,
            success: true,
            productIndex: i,
            productData: product,
          });
        } catch (error) {
          bulkResults.push({
            productId: '',
            title: product.title,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            productIndex: i,
            productData: product,
          });
        }
      }

      setResults(bulkResults);
      setShowResults(true);

      const successCount = bulkResults.filter((r) => r.success).length;
      const failCount = bulkResults.filter((r) => !r.success).length;

      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} product(s)`);
      }
      if (failCount > 0) {
        toast.error(`Failed to create ${failCount} product(s)`);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setProducts(Array.from({ length: 5 }, () => createEmptyProductRow()));
    setResults([]);
    setShowResults(false);
    setProgress(0);
  };

  const handleRetryFailed = async () => {
    const failedResults = results.filter((r) => !r.success && r.productData);
    if (failedResults.length === 0) {
      toast.info('No failed products to retry');
      return;
    }

    setIsSubmitting(true);
    setProgress(0);
    setShowResults(false);

    const retryResults: BulkResult[] = [];
    const totalRetries = failedResults.length;

    try {
      for (let i = 0; i < failedResults.length; i++) {
        const failedResult = failedResults[i];
        if (!failedResult.productData) continue;

        setProgress(((i + 1) / totalRetries) * 100);

        try {
          const productData = {
            title: failedResult.productData.title,
            description: failedResult.productData.description || null,
            price: parseFloat(failedResult.productData.price),
            sale_price: failedResult.productData.sale_price
              ? parseFloat(failedResult.productData.sale_price)
              : null,
            condition: failedResult.productData.condition,
            category: failedResult.productData.category,
            product_code: generateProductCode(),
            status: failedResult.productData.status,
            is_published: failedResult.productData.is_published,
            metadata: {},
          };

          const response = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData),
          });

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create product');
          }

          const result = await response.json();
          const productId = result.data.id;

          // Upload images if any
          if (failedResult.productData.images.length > 0) {
            const formData = new FormData();
            failedResult.productData.images.forEach((img) => {
              formData.append('files', img.file);
            });

            const imageResponse = await fetch(`/api/products/${productId}/images`, {
              method: 'POST',
              body: formData,
            });

            if (!imageResponse.ok) {
              console.error(`Failed to upload images for ${failedResult.productData.title}`);
            }
          }

          retryResults.push({
            productId,
            title: failedResult.productData.title,
            success: true,
            productData: failedResult.productData,
          });
        } catch (error) {
          retryResults.push({
            productId: '',
            title: failedResult.productData.title,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            productData: failedResult.productData,
          });
        }
      }

      // Update results: replace failed ones with retry results, keep successful ones
      const updatedResults = results.map((result) => {
        const retryResult = retryResults.find(
          (r) => r.productData?.title === result.title && !result.success
        );
        return retryResult || result;
      });

      setResults(updatedResults);
      setShowResults(true);

      const successCount = updatedResults.filter((r) => r.success).length;
      const failCount = updatedResults.filter((r) => !r.success).length;

      if (successCount > 0) {
        toast.success(`Successfully created ${successCount} product(s)`);
      }
      if (failCount > 0) {
        toast.error(`Failed to create ${failCount} product(s)`);
      }
    } catch (error) {
      toast.error('An unexpected error occurred during retry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Fill in product details below. You can add up to 20 products at once.
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={isSubmitting}>
            Reset All
          </Button>
          <Button
            onClick={addProductRow}
            variant="outline"
            disabled={isSubmitting || products.length >= 20}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product ({products.length}/20)
          </Button>
        </div>
      </div>

      {isSubmitting && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Creating products...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
          </CardContent>
        </Card>
      )}

      {showResults && results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-2 p-2 rounded ${
                    result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  )}
                  <span className="flex-1 text-sm">
                    <span className="font-medium">{result.title}</span>
                    {result.success ? (
                      <span className="text-green-700 ml-2">✓ Success</span>
                    ) : (
                      <span className="text-red-700 ml-2">✗ {result.error}</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex gap-2">
                <Button onClick={() => router.push('/admin/products')} className="flex-1">
                  View All Products
                </Button>
                <Button onClick={handleReset} variant="outline" className="flex-1">
                  Create More
                </Button>
              </div>
              {results.some((r) => !r.success) && (
                <Button
                  onClick={handleRetryFailed}
                  variant="outline"
                  className="w-full border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  Retry Failed Products ({results.filter((r) => !r.success).length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-6">
        {products.map((product, index) => (
          <Card key={product.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Product {index + 1}</CardTitle>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => duplicateProductRow(product.id)}
                    disabled={isSubmitting || products.length >= 20}
                    title="Duplicate"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeProductRow(product.id)}
                    disabled={isSubmitting || products.length <= 1}
                    title="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Title * {product.errors.title && (
                      <span className="text-destructive text-xs ml-2">
                        {product.errors.title}
                      </span>
                    )}
                  </Label>
                  <Input
                    value={product.title}
                    onChange={(e) => updateProduct(product.id, 'title', e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Product title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Category * {product.errors.category && (
                      <span className="text-destructive text-xs ml-2">
                        {product.errors.category}
                      </span>
                    )}
                  </Label>
                  <Select
                    value={product.category}
                    onValueChange={(value) => updateProduct(product.id, 'category', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Input
                    value={product.brand}
                    onChange={(e) => updateProduct(product.id, 'brand', e.target.value)}
                    disabled={isSubmitting}
                    placeholder="e.g., Apple, Samsung, Nike"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Price (AED) * {product.errors.price && (
                      <span className="text-destructive text-xs ml-2">
                        {product.errors.price}
                      </span>
                    )}
                  </Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={product.price}
                    onChange={(e) => updateProduct(product.id, 'price', e.target.value)}
                    disabled={isSubmitting}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Sale Price (AED)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={product.sale_price}
                    onChange={(e) => updateProduct(product.id, 'sale_price', e.target.value)}
                    disabled={isSubmitting}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Condition *</Label>
                  <Select
                    value={product.condition}
                    onValueChange={(value) => updateProduct(product.id, 'condition', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="like_new">Like New</SelectItem>
                      <SelectItem value="used">Used</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select
                    value={product.status}
                    onValueChange={(value) => updateProduct(product.id, 'status', value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={product.description}
                    onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                    disabled={isSubmitting}
                    placeholder="Product description..."
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`published-${product.id}`}
                    checked={product.is_published}
                    onChange={(e) => updateProduct(product.id, 'is_published', e.target.checked)}
                    disabled={isSubmitting}
                    className="rounded"
                  />
                  <Label htmlFor={`published-${product.id}`}>Published</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Product Images</Label>
                <BulkImageUploader
                  images={product.images}
                  onImagesChange={(images) => updateProduct(product.id, 'images', images)}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-4 pb-6">
        <Link href="/admin/products">
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
        </Link>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Creating Products...' : `Create All Products (${products.length})`}
        </Button>
      </div>
    </div>
  );
}

