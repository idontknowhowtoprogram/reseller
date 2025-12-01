'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X, GripVertical } from 'lucide-react';
import { ProductImage } from '@/types';
import Image from 'next/image';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface ImageUploaderProps {
  productId?: string;
  existingImages?: ProductImage[];
  onImagesChange?: (images: ProductImage[]) => void;
}

export function ImageUploader({
  productId,
  existingImages = [],
  onImagesChange,
}: ImageUploaderProps) {
  const [images, setImages] = useState<ProductImage[]>(existingImages);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!productId) {
      toast.error('Please save the product first before uploading images');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch(`/api/products/${productId}/images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload images');
      }

      const result = await response.json();
      const newImages = result.data || [];

      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange?.(updatedImages);
      toast.success('Images uploaded successfully!');
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to upload images. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string, imageUrl: string) => {
    try {
      const supabase = createClient();

      // Delete from database
      const { error: dbError } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (dbError) throw dbError;

      // Extract file path from URL and delete from storage
      const urlParts = imageUrl.split('/');
      const filePath = urlParts.slice(urlParts.indexOf('product-images') + 1).join('/');

      const { error: storageError } = await supabase.storage
        .from('product-images')
        .remove([filePath]);

      if (storageError) {
        console.error('Error deleting from storage:', storageError);
        // Don't throw - database deletion succeeded
      }

      const updatedImages = images.filter((img) => img.id !== imageId);
      setImages(updatedImages);
      onImagesChange?.(updatedImages);
      toast.success('Image deleted');
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);

    // Update sort_order
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      sort_order: index,
    }));

    setImages(updatedImages);
    onImagesChange?.(updatedImages);

    // Update in database
    if (productId) {
      try {
        const supabase = createClient();
        await Promise.all(
          updatedImages.map((img, index) =>
            supabase
              .from('product_images')
              .update({ sort_order: index })
              .eq('id', img.id)
          )
        );
      } catch (error) {
        console.error('Error updating sort order:', error);
      }
    }
  };

  return (
    <div className="space-y-4">
      {productId ? (
        <div>
          <Label htmlFor="image-upload">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={uploading}
              asChild
            >
              <span>
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? 'Uploading...' : 'Upload Images'}
              </span>
            </Button>
          </Label>
          <input
            id="image-upload"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Save the product first to upload images
        </p>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={image.id} className="relative group">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <Image
                  src={image.image_url}
                  alt={`Product image ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {index > 0 && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      onClick={() => handleReorder(index, index - 1)}
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                  )}
                  {index < images.length - 1 && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="icon"
                      onClick={() => handleReorder(index, index + 1)}
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleDelete(image.id, image.image_url)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-center mt-1 text-muted-foreground">
                Image {index + 1}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

