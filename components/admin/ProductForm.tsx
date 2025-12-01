'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { Product, ProductImage } from '@/types';
import { toast } from 'sonner';
import { ImageUploader } from './ImageUploader';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be positive'),
  sale_price: z.number().min(0).optional().nullable(),
  quantity: z.number().int().min(0, 'Quantity must be 0 or greater'),
  condition: z.enum(['new', 'like_new', 'used', 'good', 'fair']),
  category: z.string().min(1, 'Category is required'),
  brand: z.string().optional().nullable(),
  product_code: z.string().optional(), // Auto-generated, optional in form
  status: z.enum(['available', 'reserved', 'sold']),
  is_published: z.boolean(),
  metadata: z.record(z.any()).optional(),
});

// Predefined categories
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

// Generate unique product code
function generateProductCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PROD-${timestamp}-${random}`;
}

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product;
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<ProductImage[]>(product?.images || []);
  const [generatedCode, setGeneratedCode] = useState<string>(product?.product_code || '');

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: product?.title || '',
      description: product?.description || '',
      price: product?.price || 0,
      sale_price: product?.sale_price || null,
      quantity: product?.quantity ?? 1,
      condition: product?.condition || 'used',
      category: product?.category || '',
      brand: product?.brand || '',
      product_code: product?.product_code || '',
      status: product?.status || 'available',
      is_published: product?.is_published !== undefined ? product.is_published : true,
      metadata: product?.metadata || {},
    },
  });

  const status = watch('status');
  const condition = watch('condition');
  const category = watch('category');
  const isPublished = watch('is_published');

  // Auto-generate product code when creating new product
  useEffect(() => {
    if (!product && !generatedCode) {
      const code = generateProductCode();
      setGeneratedCode(code);
      setValue('product_code', code);
    } else if (product) {
      setGeneratedCode(product.product_code);
    }
  }, [product, generatedCode, setValue]);

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const url = product ? `/api/products/${product.id}` : '/api/products';
      const method = product ? 'PATCH' : 'POST';

      // Ensure product code is set (use generated code for new products)
      const productData = {
        ...data,
        product_code: data.product_code || generatedCode || generateProductCode(),
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Failed to save product');
      }

      const result = await response.json();
      const productId = result.data.id;

      // Handle images if any were uploaded
      if (images.length > 0 && !product) {
        // Images will be handled separately via image upload API
        // For now, we'll just redirect
      }

      toast.success(product ? 'Product updated successfully!' : 'Product created successfully!');
      router.push('/admin/products');
      router.refresh();
    } catch (error) {
      toast.error('Failed to save product. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/admin/products">
          <Button variant="ghost" type="button">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Basic Information</h2>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" {...register('title')} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="product_code">Product Code *</Label>
            <Input 
              id="product_code" 
              value={generatedCode || product?.product_code || ''} 
              readOnly
              className="bg-muted"
              {...register('product_code')}
            />
            {!product && (
              <p className="text-xs text-muted-foreground">
                Product code is auto-generated
              </p>
            )}
            {errors.product_code && (
              <p className="text-sm text-destructive">{errors.product_code.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={category}
              onValueChange={(value) => setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-destructive">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              {...register('brand')}
              placeholder="e.g., Apple, Samsung, Nike"
            />
            {errors.brand && (
              <p className="text-sm text-destructive">{errors.brand.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              rows={4}
              placeholder="Product description..."
            />
          </div>
        </div>

        {/* Pricing & Status */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pricing & Status</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Price (AED) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sale_price">Sale Price (AED)</Label>
              <Input
                id="sale_price"
                type="number"
                step="0.01"
                {...register('sale_price', {
                  valueAsNumber: true,
                  setValueAs: (v) => (v === '' ? null : parseFloat(v)),
                })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Available Quantity *</Label>
            <Input
              id="quantity"
              type="number"
              min="0"
              step="1"
              {...register('quantity', { valueAsNumber: true })}
            />
            <p className="text-xs text-muted-foreground">
              Number of items available for purchase (most items have 1)
            </p>
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">Condition *</Label>
            <Select
              value={condition}
              onValueChange={(value) => setValue('condition', value as any)}
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
            <Label htmlFor="status">Status *</Label>
            <Select
              value={status}
              onValueChange={(value) => setValue('status', value as any)}
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

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_published"
              checked={isPublished}
              onChange={(e) => setValue('is_published', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="is_published">Published</Label>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Product Images</h2>
        <ImageUploader
          productId={product?.id}
          existingImages={images}
          onImagesChange={setImages}
        />
      </div>

      <div className="flex justify-end gap-4">
        <Link href="/admin/products">
          <Button type="button" variant="outline">
            Cancel
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
        </Button>
      </div>
    </form>
  );
}

