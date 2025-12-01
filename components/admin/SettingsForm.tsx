'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from '@/types';
import { toast } from 'sonner';

const settingsSchema = z.object({
  store_name: z.string().min(1, 'Store name is required'),
  whatsapp_number: z.string().min(1, 'WhatsApp number is required'),
  currency: z.string().min(1, 'Currency is required'),
  delivery_info: z.string().optional().nullable(),
  about_page: z.string().optional().nullable(),
  free_delivery_threshold: z.number().min(0),
  discount_150_threshold: z.number().min(0),
  discount_200_threshold: z.number().min(0),
  delivery_charge: z.number().min(0),
  primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format (use #RRGGBB)').optional().or(z.literal('')),
  secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format (use #RRGGBB)').optional().or(z.literal('')),
  accent_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format (use #RRGGBB)').optional().or(z.literal('')),
  background_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format (use #RRGGBB)').optional().or(z.literal('')),
  text_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format (use #RRGGBB)').optional().or(z.literal('')),
  home_hero_title: z.string().min(1, 'Hero title is required'),
  home_hero_subtitle: z.string().min(1, 'Hero subtitle is required'),
  home_cta_title: z.string().min(1, 'CTA title is required'),
  home_cta_description: z.string().min(1, 'CTA description is required'),
  home_cta_button_text: z.string().min(1, 'CTA button text is required'),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  settings: Settings;
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      store_name: settings.store_name,
      whatsapp_number: settings.whatsapp_number,
      currency: settings.currency,
      delivery_info: settings.delivery_info || '',
      about_page: settings.about_page || '',
      free_delivery_threshold: settings.free_delivery_threshold,
      discount_150_threshold: settings.discount_150_threshold,
      discount_200_threshold: settings.discount_200_threshold,
      delivery_charge: settings.delivery_charge,
      primary_color: settings.primary_color || '#000000',
      secondary_color: settings.secondary_color || '#F5F5F5',
      accent_color: settings.accent_color || '#000000',
      background_color: settings.background_color || '#FFFFFF',
      text_color: settings.text_color || '#000000',
      home_hero_title: settings.home_hero_title || 'Find Premium Items at Bargain Prices',
      home_hero_subtitle: settings.home_hero_subtitle || 'Carefully selected, lightly used items. Only one piece of each.',
      home_cta_title: settings.home_cta_title || 'Can\'t find what you\'re looking for?',
      home_cta_description: settings.home_cta_description || 'Contact us on WhatsApp and we\'ll help you find the perfect item.',
      home_cta_button_text: settings.home_cta_button_text || 'Chat with Us',
    },
  });

  const onSubmit = async (data: SettingsFormData) => {
    setIsSubmitting(true);
    try {
      // Ensure color fields have default values if empty
      const payload = {
        ...data,
        primary_color: data.primary_color || '#000000',
        secondary_color: data.secondary_color || '#F5F5F5',
        accent_color: data.accent_color || '#000000',
        background_color: data.background_color || '#FFFFFF',
        text_color: data.text_color || '#000000',
      };
      
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Settings update error:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to update settings');
      }

      toast.success('Settings updated successfully!');
      window.location.reload();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update settings. Please try again.';
      toast.error(errorMessage);
      console.error('Settings update error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>Basic information about your store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="store_name">Store Name</Label>
            <Input id="store_name" {...register('store_name')} />
            {errors.store_name && (
              <p className="text-sm text-destructive">{errors.store_name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp_number">WhatsApp Number</Label>
            <Input
              id="whatsapp_number"
              {...register('whatsapp_number')}
              placeholder="+971 50 123 4567"
            />
            {errors.whatsapp_number && (
              <p className="text-sm text-destructive">{errors.whatsapp_number.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input id="currency" {...register('currency')} placeholder="AED" />
            {errors.currency && (
              <p className="text-sm text-destructive">{errors.currency.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Delivery & Discounts</CardTitle>
          <CardDescription>Configure delivery charges and discount thresholds</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery_charge">Delivery Charge (AED)</Label>
              <Input
                id="delivery_charge"
                type="number"
                step="0.01"
                {...register('delivery_charge', { valueAsNumber: true })}
              />
              {errors.delivery_charge && (
                <p className="text-sm text-destructive">{errors.delivery_charge.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="free_delivery_threshold">Free Delivery Threshold (AED)</Label>
              <Input
                id="free_delivery_threshold"
                type="number"
                step="0.01"
                {...register('free_delivery_threshold', { valueAsNumber: true })}
              />
              {errors.free_delivery_threshold && (
                <p className="text-sm text-destructive">{errors.free_delivery_threshold.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_150_threshold">25 AED Discount Threshold (AED)</Label>
              <Input
                id="discount_150_threshold"
                type="number"
                step="0.01"
                {...register('discount_150_threshold', { valueAsNumber: true })}
              />
              {errors.discount_150_threshold && (
                <p className="text-sm text-destructive">{errors.discount_150_threshold.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="discount_200_threshold">50 AED Discount Threshold (AED)</Label>
              <Input
                id="discount_200_threshold"
                type="number"
                step="0.01"
                {...register('discount_200_threshold', { valueAsNumber: true })}
              />
              {errors.discount_200_threshold && (
                <p className="text-sm text-destructive">{errors.discount_200_threshold.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content</CardTitle>
          <CardDescription>Additional information pages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="delivery_info">Delivery Information</Label>
            <Textarea
              id="delivery_info"
              {...register('delivery_info')}
              rows={4}
              placeholder="Information about delivery options, areas covered, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="about_page">About Page Content</Label>
            <Textarea
              id="about_page"
              {...register('about_page')}
              rows={6}
              placeholder="Content for the about page"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Color Palette</CardTitle>
          <CardDescription>Customize your store's color scheme</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="primary_color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="primary_color"
                  type="color"
                  {...register('primary_color')}
                  onChange={(e) => {
                    setValue('primary_color', e.target.value, { shouldValidate: true });
                  }}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  {...register('primary_color')}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-F]{6}$/i.test(value)) {
                      setValue('primary_color', value, { shouldValidate: true });
                    }
                  }}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">Used for buttons, links, and highlights</p>
              {errors.primary_color && (
                <p className="text-sm text-destructive">{errors.primary_color.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="secondary_color">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  id="secondary_color"
                  type="color"
                  {...register('secondary_color')}
                  onChange={(e) => {
                    setValue('secondary_color', e.target.value, { shouldValidate: true });
                  }}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  {...register('secondary_color')}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-F]{6}$/i.test(value)) {
                      setValue('secondary_color', value, { shouldValidate: true });
                    }
                  }}
                  placeholder="#F5F5F5"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">Used for secondary elements</p>
              {errors.secondary_color && (
                <p className="text-sm text-destructive">{errors.secondary_color.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="accent_color">Accent Color</Label>
              <div className="flex gap-2">
                <Input
                  id="accent_color"
                  type="color"
                  {...register('accent_color')}
                  onChange={(e) => {
                    setValue('accent_color', e.target.value, { shouldValidate: true });
                  }}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  {...register('accent_color')}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-F]{6}$/i.test(value)) {
                      setValue('accent_color', value, { shouldValidate: true });
                    }
                  }}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">Used for special highlights and CTAs</p>
              {errors.accent_color && (
                <p className="text-sm text-destructive">{errors.accent_color.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="background_color">Background Color</Label>
              <div className="flex gap-2">
                <Input
                  id="background_color"
                  type="color"
                  {...register('background_color')}
                  onChange={(e) => {
                    setValue('background_color', e.target.value, { shouldValidate: true });
                  }}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  {...register('background_color')}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-F]{6}$/i.test(value)) {
                      setValue('background_color', value, { shouldValidate: true });
                    }
                  }}
                  placeholder="#FFFFFF"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">Main background color</p>
              {errors.background_color && (
                <p className="text-sm text-destructive">{errors.background_color.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="text_color">Text Color</Label>
              <div className="flex gap-2">
                <Input
                  id="text_color"
                  type="color"
                  {...register('text_color')}
                  onChange={(e) => {
                    setValue('text_color', e.target.value, { shouldValidate: true });
                  }}
                  className="w-20 h-10 cursor-pointer"
                />
                <Input
                  type="text"
                  {...register('text_color')}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (/^#[0-9A-F]{6}$/i.test(value)) {
                      setValue('text_color', value, { shouldValidate: true });
                    }
                  }}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">Main text color</p>
              {errors.text_color && (
                <p className="text-sm text-destructive">{errors.text_color.message}</p>
              )}
            </div>
          </div>

          {/* Preview section */}
          <div className="mt-6 p-4 rounded-lg border" style={{ backgroundColor: watch('background_color') || '#FFFFFF' }}>
            <p className="text-sm font-medium mb-2" style={{ color: watch('text_color') || '#000000' }}>
              Color Preview
            </p>
            <div className="flex gap-2 flex-wrap">
              <Button 
                size="sm" 
                style={{ 
                  backgroundColor: watch('primary_color') || '#000000',
                  color: '#FFFFFF',
                  borderColor: watch('primary_color') || '#000000'
                }}
              >
                Primary Button
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                style={{ 
                  borderColor: watch('secondary_color') || '#F5F5F5',
                  color: watch('text_color') || '#000000'
                }}
              >
                Secondary Button
              </Button>
              <span 
                className="px-3 py-1 rounded text-sm inline-block"
                style={{ 
                  backgroundColor: watch('accent_color') || '#000000',
                  color: '#FFFFFF'
                }}
              >
                Accent Badge
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Home Page Text</CardTitle>
          <CardDescription>Customize the text displayed on your home page</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="home_hero_title">Hero Title</Label>
            <Input
              id="home_hero_title"
              {...register('home_hero_title')}
              placeholder="Find Premium Items at Bargain Prices"
            />
            {errors.home_hero_title && (
              <p className="text-sm text-destructive">{errors.home_hero_title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="home_hero_subtitle">Hero Subtitle</Label>
            <Textarea
              id="home_hero_subtitle"
              {...register('home_hero_subtitle')}
              rows={2}
              placeholder="Carefully selected, lightly used items. Only one piece of each."
            />
            {errors.home_hero_subtitle && (
              <p className="text-sm text-destructive">{errors.home_hero_subtitle.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="home_cta_title">CTA Section Title</Label>
            <Input
              id="home_cta_title"
              {...register('home_cta_title')}
              placeholder="Can't find what you're looking for?"
            />
            {errors.home_cta_title && (
              <p className="text-sm text-destructive">{errors.home_cta_title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="home_cta_description">CTA Section Description</Label>
            <Textarea
              id="home_cta_description"
              {...register('home_cta_description')}
              rows={2}
              placeholder="Contact us on WhatsApp and we'll help you find the perfect item."
            />
            {errors.home_cta_description && (
              <p className="text-sm text-destructive">{errors.home_cta_description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="home_cta_button_text">CTA Button Text</Label>
            <Input
              id="home_cta_button_text"
              {...register('home_cta_button_text')}
              placeholder="Chat with Us"
            />
            {errors.home_cta_button_text && (
              <p className="text-sm text-destructive">{errors.home_cta_button_text.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </form>
  );
}

