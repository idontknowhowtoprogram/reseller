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
import { Product } from '@/types';
import { toast } from 'sonner';
import { Bell } from 'lucide-react';

const notificationSchema = z.object({
  customer_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional().or(z.literal('')),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
}).refine((data) => data.phone || data.email, {
  message: 'Please provide either phone number or email',
  path: ['phone'],
});

type NotificationFormData = z.infer<typeof notificationSchema>;

interface ReservedNotificationFormProps {
  product: Product;
  trigger: React.ReactNode;
}

export function ReservedNotificationForm({ product, trigger }: ReservedNotificationFormProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<NotificationFormData>({
    resolver: zodResolver(notificationSchema),
  });

  const onSubmit = async (data: NotificationFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/product-notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.id,
          customer_name: data.customer_name,
          phone: data.phone || null,
          email: data.email || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit notification request');
      }

      toast.success('We will notify you when this item becomes available!');
      reset();
      setOpen(false);
    } catch (error) {
      toast.error('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Notify Me When Available</DialogTitle>
          <DialogDescription>
            This item is currently reserved. Enter your details and we'll notify you if it becomes available again.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customer_name">Name</Label>
            <Input
              id="customer_name"
              {...register('customer_name')}
              placeholder="Your name"
            />
            {errors.customer_name && (
              <p className="text-sm text-destructive">{errors.customer_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number (Optional)</Label>
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
            <Label htmlFor="email">Email (Optional)</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="your@email.com"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Please provide at least one contact method (phone or email)
          </p>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              <Bell className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Submitting...' : 'Notify Me'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

