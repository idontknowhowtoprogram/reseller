'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Product } from '@/types';
import { PriceDisplay } from './PriceDisplay';
import { toast } from 'sonner';

const offerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  offer_price: z.number().min(1, 'Offer price must be greater than 0'),
  notes: z.string().optional(),
});

type OfferFormData = z.infer<typeof offerSchema>;

interface OfferModalProps {
  product: Product;
  trigger: React.ReactNode;
}

export function OfferModal({ product, trigger }: OfferModalProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      offer_price: product.sale_price || product.price,
    },
  });

  const onSubmit = async (data: OfferFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit offer');
      }

      toast.success('Offer submitted successfully! We will contact you soon.');
      reset();
      setOpen(false);
    } catch (error) {
      toast.error('Failed to submit offer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Make an Offer</DialogTitle>
          <DialogDescription>
            Submit your offer for {product.title}. We'll get back to you soon!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="Your name"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="+971 50 123 4567"
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="offer_price">Your Offer (AED)</Label>
            <Input
              id="offer_price"
              type="number"
              step="0.01"
              {...register('offer_price', { valueAsNumber: true })}
            />
            {errors.offer_price && (
              <p className="text-sm text-destructive">
                {errors.offer_price.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Current price: {product.sale_price || product.price} AED
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Any additional information..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Offer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

