import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product/ProductCard';
import { ProductSlider } from '@/components/product/ProductSlider';
import { Product } from '@/types';
import { MessageCircle, ArrowRight } from 'lucide-react';
import { PromoSlider } from '@/components/hero/PromoSlider';
import { TodayDealCard } from '@/components/hero/TodayDealCard';
import { TrustBoosters } from '@/components/hero/TrustBoosters';

export default async function HomePage() {
  const supabase = await createClient();

  // Get featured products (latest 10 published products for slider)
  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      product_images (*)
    `)
    .eq('is_published', true)
    .neq('status', 'sold')
    .order('created_at', { ascending: false })
    .limit(10);

  // Get today's deal (first available product, or latest)
  const { data: todayDealData } = await supabase
    .from('products')
    .select(`
      *,
      product_images (*)
    `)
    .eq('is_published', true)
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Get settings for WhatsApp number and currency
  const { data: settings } = await supabase
    .from('settings')
    .select('whatsapp_number, store_name, currency')
    .single();

  // Transform products to match Product type structure (product_images -> images)
  const featuredProducts: Product[] = (products || []).map((product: any) => ({
    ...product,
    images: Array.isArray(product.product_images)
      ? product.product_images
          .filter((img: any) => img && img.image_url)
          .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
      : [],
  }));

  // Transform today's deal product
  const todayDeal: Product | null = todayDealData
    ? {
        ...todayDealData,
        images: Array.isArray((todayDealData as any).product_images)
          ? (todayDealData as any).product_images
              .filter((img: any) => img && img.image_url)
              .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
          : [],
      }
    : null;

  // Get some product images for background collage (blurred)
  const collageImages = featuredProducts
    .slice(0, 4)
    .map((p) => p.images?.[0]?.image_url)
    .filter(Boolean);

  return (
    <div className="space-y-12">
      {/* Promo Slider */}
      <PromoSlider />

      {/* Hero Section */}
      <section className="relative w-full px-4 py-12 md:py-20 overflow-hidden">
        {/* Background collage - blurred product images */}
        {collageImages.length > 0 && (
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-full">
              {collageImages.map((img, idx) => (
                <div key={idx} className="relative">
                  <Image
                    src={img!}
                    alt=""
                    fill
                    className="object-cover blur-2xl scale-110"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 max-w-7xl mx-auto">
            {/* Left side - Text content */}
            <div className="flex-1 text-center lg:text-left space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Find Premium Items at Bargain Prices
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Carefully selected, lightly used items. Only one piece of each.
              </p>

              {/* Today's Deal Card */}
              {todayDeal && (
                <div className="max-w-md mx-auto lg:mx-0">
                  <TodayDealCard
                    product={todayDeal}
                    currency={settings?.currency || 'AED'}
                  />
                </div>
              )}

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link href="/shop">
                  <Button size="lg">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                {settings?.whatsapp_number && (
                  <Link
                    href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`}
                    target="_blank"
                  >
                    <Button size="lg" variant="outline">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Contact Us
                    </Button>
                  </Link>
                )}
              </div>

              {/* Trust Boosters */}
              <div className="pt-4">
                <TrustBoosters />
              </div>
            </div>

            {/* Right side - Product preview grid */}
            {featuredProducts.length > 0 && (
              <div className="flex-1 w-full lg:w-auto">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0">
                  {featuredProducts.slice(0, 6).map((product) => {
                    const mainImage = product.images?.[0]?.image_url;
                    return (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        className="group relative aspect-square rounded-lg overflow-hidden bg-muted border border-border hover:border-primary/50 transition-all hover:shadow-lg"
                      >
                        {mainImage ? (
                          <Image
                            src={mainImage}
                            alt={product.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                            No Image
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-2 left-2 right-2">
                            <p className="text-white text-xs font-medium line-clamp-1">
                              {product.title}
                            </p>
                            <p className="text-white/90 text-xs">
                              {product.sale_price || product.price} {settings?.currency || 'AED'}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="w-full px-0 py-12 bg-blue-100 border-4 border-blue-500">
          {/* TEST: If you see this blue border, the section is rendering */}
          <div className="text-center mb-8 px-4">
            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-4 w-full max-w-7xl mx-auto">
              <h2 className="text-3xl font-bold">Latest Items</h2>
              <Link href="/shop">
                <Button variant="ghost">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
          <ProductSlider products={featuredProducts} />
        </section>
      )}

      {/* CTA Section */}
      <section className="w-full px-4 py-16">
        <div className="bg-muted rounded-lg p-8 md:p-12">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold">Can't find what you're looking for?</h2>
            <p className="text-muted-foreground text-lg">
              Contact us on WhatsApp and we'll help you find the perfect item.
            </p>
            {settings?.whatsapp_number && (
              <div className="flex justify-center pt-2">
                <Link
                  href={`https://wa.me/${settings.whatsapp_number.replace(/\D/g, '')}`}
                  target="_blank"
                >
                  <Button size="lg">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat with Us
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

