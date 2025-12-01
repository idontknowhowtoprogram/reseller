'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

interface BulkImageUploaderProps {
  images: ImageFile[];
  onImagesChange: (images: ImageFile[]) => void;
  disabled?: boolean;
}

export function BulkImageUploader({
  images,
  onImagesChange,
  disabled = false,
}: BulkImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const processFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const imageFiles = fileArray.filter((file) => file.type.startsWith('image/'));

    if (imageFiles.length === 0) {
      toast.error('Please select image files only');
      return;
    }

    if (fileArray.length > imageFiles.length) {
      toast.warning(`Skipped ${fileArray.length - imageFiles.length} non-image file(s)`);
    }

    const newImages: ImageFile[] = imageFiles.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    onImagesChange([...images, ...newImages]);
    toast.success(`Added ${newImages.length} image(s)`);
  }, [images, onImagesChange]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    processFiles(files);
    e.target.value = ''; // Reset input
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }, [disabled, processFiles]);

  const handleRemove = (id: string) => {
    const imageToRemove = images.find((img) => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    onImagesChange(images.filter((img) => img.id !== id));
    toast.success('Image removed');
  };

  return (
    <div className="space-y-4">
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <Label htmlFor="bulk-image-upload" className="cursor-pointer">
          <div className="flex flex-col items-center justify-center space-y-2">
            <Upload className={`h-8 w-8 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            <div className="text-center">
              <span className="text-sm font-medium">
                {isDragging ? 'Drop images here' : 'Click to upload or drag and drop'}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, GIF up to 10MB each
              </p>
            </div>
          </div>
        </Label>
        <input
          id="bulk-image-upload"
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="relative group">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <Image
                  src={image.preview}
                  alt="Product preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemove(image.id)}
                    disabled={disabled}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

