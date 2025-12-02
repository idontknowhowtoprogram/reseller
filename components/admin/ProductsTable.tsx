'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Product } from '@/types';
import { Edit, Trash2, Eye, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

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

interface ProductsTableProps {
  products: Product[];
}

interface EditingState {
  productId: string;
  field: 'price' | 'sale_price' | 'status' | 'category';
  value: string | number | null;
}

export function ProductsTable({ products: initialProducts }: ProductsTableProps) {
  const [products, setProducts] = useState(initialProducts);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      setProducts(products.filter((p) => p.id !== id));
      toast.success('Product deleted successfully');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    } finally {
      setDeletingId(null);
    }
  };

  const startEditing = (productId: string, field: EditingState['field'], currentValue: any) => {
    setEditing({ productId, field, value: currentValue });
  };

  const cancelEditing = () => {
    setEditing(null);
  };

  const saveEdit = async () => {
    if (!editing) return;

    setSaving(editing.productId);
    try {
      const updateData: any = {};
      
      if (editing.field === 'price' || editing.field === 'sale_price') {
        const numValue = editing.value === '' || editing.value === null 
          ? null 
          : parseFloat(editing.value.toString());
        updateData[editing.field] = numValue;
      } else {
        updateData[editing.field] = editing.value;
      }

      const response = await fetch(`/api/products/${editing.productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      // Update local state
      setProducts(
        products.map((p) =>
          p.id === editing.productId
            ? { ...p, ...updateData }
            : p
        )
      );

      setEditing(null);
      toast.success('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } finally {
      setSaving(null);
    }
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No products found</p>
        <Link href="/admin/products/new">
          <Button className="mt-4 hover:bg-primary/90 transition-colors">Add Your First Product</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Image</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Category</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const mainImage = product.images?.[0]?.image_url;
            const isEditing = editing?.productId === product.id;
            const isSaving = saving === product.id;

            return (
              <TableRow key={product.id} className="hover:bg-muted/50 transition-colors">
                <TableCell>
                  <div className="relative w-16 h-16 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                    {mainImage ? (
                      <Image
                        src={mainImage}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="64px"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">No image</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{product.title}</TableCell>
                <TableCell>
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {product.product_code}
                  </code>
                </TableCell>
                <TableCell>
                  {isEditing && (editing.field === 'price' || editing.field === 'sale_price') ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        step="0.01"
                        value={editing.value ?? ""}
                        onChange={(e) =>
                          setEditing({ ...editing, value: e.target.value })
                        }
                        className="w-24 h-8"
                        autoFocus
                        placeholder={editing.field === 'sale_price' ? 'Sale price' : 'Price'}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') cancelEditing();
                        }}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 hover:bg-green-100 hover:text-green-700 transition-colors"
                        onClick={saveEdit}
                        disabled={isSaving}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 hover:bg-red-100 hover:text-red-700 transition-colors"
                        onClick={cancelEditing}
                        disabled={isSaving}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <div
                        className="cursor-pointer hover:bg-muted px-2 py-1 rounded transition-colors inline-block"
                        onClick={() => startEditing(product.id, 'price', product.price)}
                        title="Click to edit price"
                      >
                        {product.sale_price ? (
                          <div>
                            <span className="text-primary font-bold">{product.sale_price} AED</span>
                            <span className="text-muted-foreground line-through text-sm ml-2">
                              {product.price} AED
                            </span>
                          </div>
                        ) : (
                          <span>{product.price} AED</span>
                        )}
                      </div>
                      {product.sale_price ? (
                        <div
                          className="cursor-pointer hover:bg-muted px-2 py-1 rounded transition-colors text-xs text-muted-foreground"
                          onClick={() => startEditing(product.id, 'sale_price', product.sale_price)}
                          title="Click to edit sale price"
                        >
                          Sale: {product.sale_price} AED
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer hover:bg-muted px-2 py-1 rounded transition-colors text-xs text-muted-foreground italic"
                          onClick={() => startEditing(product.id, 'sale_price', '')}
                          title="Click to add sale price"
                        >
                          + Add sale price
                        </div>
                      )}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {isEditing && editing.field === 'status' ? (
                    <div className="flex items-center gap-2">
                      <Select
                        value={editing.value as string}
                        onValueChange={(value) =>
                          setEditing({ ...editing, value })
                        }
                      >
                        <SelectTrigger className="w-32 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="reserved">Reserved</SelectItem>
                          <SelectItem value="sold">Sold</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 hover:bg-green-100 hover:text-green-700 transition-colors"
                        onClick={saveEdit}
                        disabled={isSaving}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 hover:bg-red-100 hover:text-red-700 transition-colors"
                        onClick={cancelEditing}
                        disabled={isSaving}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div
                      className="cursor-pointer inline-block"
                      onClick={() => startEditing(product.id, 'status', product.status)}
                      title="Click to edit status"
                    >
                      <Badge
                        variant={
                          product.status === 'sold'
                            ? 'destructive'
                            : product.status === 'reserved'
                            ? 'secondary'
                            : 'default'
                        }
                        className="capitalize hover:opacity-80 transition-opacity"
                      >
                        {product.status}
                      </Badge>
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {isEditing && editing.field === 'category' ? (
                    <div className="flex items-center gap-2">
                      <Select
                        value={editing.value as string}
                        onValueChange={(value) =>
                          setEditing({ ...editing, value })
                        }
                      >
                        <SelectTrigger className="w-48 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 hover:bg-green-100 hover:text-green-700 transition-colors"
                        onClick={saveEdit}
                        disabled={isSaving}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 hover:bg-red-100 hover:text-red-700 transition-colors"
                        onClick={cancelEditing}
                        disabled={isSaving}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <span
                      className="cursor-pointer hover:bg-muted px-2 py-1 rounded transition-colors inline-block"
                      onClick={() => startEditing(product.id, 'category', product.category)}
                      title="Click to edit category"
                    >
                      {product.category}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link 
                      href={`/product/${product.id}`} 
                      target="_blank" 
                      className="inline-block rounded-md hover:bg-accent/80 transition-colors duration-200 cursor-pointer"
                    >
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="hover:bg-transparent cursor-pointer"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link 
                      href={`/admin/products/${product.id}`} 
                      className="inline-block rounded-md hover:bg-accent/80 transition-colors duration-200 cursor-pointer"
                    >
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="hover:bg-transparent cursor-pointer"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deletingId === product.id}
                          className="hover:bg-destructive/10 hover:text-destructive transition-colors duration-200 disabled:hover:bg-transparent disabled:hover:text-current cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the product "{product.title}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(product.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
