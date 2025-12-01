import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ProductGallery } from '@/components/product/ProductGallery';
import { PriceDisplay } from '@/components/product/PriceDisplay';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WhatsAppButton } from '@/components/shared/WhatsAppButton';
import { OfferModal } from '@/components/product/OfferModal';
import { ReservedNotificationForm } from '@/components/product/ReservedNotificationForm';
import { ProductCard } from '@/components/product/ProductCard';
import { Product, Settings } from '@/types';
import { MessageCircle } from 'lucide-react';
import { AddToCartButton } from '@/components/product/AddToCartButton';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      product_images (*)
    `)
    .eq('id', id)
    .single();

  if (!product) {
    notFound();
  }

  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .single();

  // Transform product data to match expected format
  const productData: Product = (() => {
    const productObj: any = product;
    return {
      ...productObj,
      images: Array.isArray(productObj.product_images)
        ? productObj.product_images
            .filter((img: any) => img && img.image_url)
            .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
        : [],
    };
  })() as Product;
  const settingsData: Settings = (settings as Settings) || {
    id: 'default',
    whatsapp_number: '',
    store_name: 'Reseller',
    currency: 'AED',
    delivery_info: null,
    about_page: null,
    free_delivery_threshold: 70,
    discount_150_threshold: 150,
    discount_200_threshold: 200,
    delivery_charge: 25,
    primary_color: '#000000',
    secondary_color: '#F5F5F5',
    accent_color: '#000000',
    background_color: '#FFFFFF',
    text_color: '#000000',
    home_hero_title: 'Find Premium Items at Bargain Prices',
    home_hero_subtitle: 'Carefully selected, lightly used items. Only one piece of each.',
    home_cta_title: "Can't find what you're looking for?",
    home_cta_description: "Contact us on WhatsApp and we'll help you find the perfect item.",
    home_cta_button_text: 'Chat with Us',
  };

  // Get related products (same category, different product)
  const { data: relatedProductsData } = await supabase
    .from('products')
    .select(`
      *,
      product_images (*)
    `)
    .eq('category', productData.category)
    .eq('is_published', true)
    .neq('id', productData.id)
    .neq('status', 'sold')
    .limit(4);

  // Transform related products to match Product type structure
  const relatedProducts: Product[] = (relatedProductsData || []).map((product: any) => ({
    ...product,
    images: Array.isArray(product.product_images)
      ? product.product_images
          .filter((img: any) => img && img.image_url)
          .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
      : [],
  }));

  const isReserved = productData.status === 'reserved';
  const isSold = productData.status === 'sold';
  const isAvailable = productData.status === 'available';

  return (
    <div className="container px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Product Gallery */}
        <ProductGallery
          images={productData.images || []}
          productTitle={productData.title}
        />

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="capitalize">
                {productData.condition.replace('_', ' ')}
              </Badge>
              {isReserved && (
                <Badge variant="secondary">Reserved</Badge>
              )}
              {isSold && (
                <Badge variant="destructive">Sold</Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {productData.title}
            </h1>
            {productData.brand && (
              <p className="text-lg font-medium text-primary mb-1">
                {productData.brand}
              </p>
            )}
            <p className="text-muted-foreground">Code: {productData.product_code}</p>
          </div>

          <PriceDisplay
            price={productData.price}
            salePrice={productData.sale_price}
            currency={settingsData.currency}
            className="text-3xl"
          />

          {productData.description && (
            <div>
              <h2 className="font-semibold mb-2">Description</h2>
              <p className="text-muted-foreground whitespace-pre-line">
                {productData.description}
              </p>
            </div>
          )}

          {productData.metadata && Object.keys(productData.metadata).length > 0 && (
            <div>
              <h2 className="font-semibold mb-2">Details</h2>
              <dl className="grid grid-cols-2 gap-2">
                {Object.entries(productData.metadata).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm text-muted-foreground capitalize">
                      {key.replace('_', ' ')}
                    </dt>
                    <dd className="font-medium">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {isAvailable && (
              <>
                <AddToCartButton product={productData} className="flex-1" />
                <WhatsAppButton
                  phoneNumber={settingsData.whatsapp_number}
                  product={productData}
                  settings={settingsData}
                  className="flex-1"
                />
              </>
            )}
            {isReserved && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  This item is currently reserved but may become available again.
                </p>
                <ReservedNotificationForm
                  product={productData}
                  trigger={
                    <Button className="w-full">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Notify Me When Available
                    </Button>
                  }
                />
              </div>
            )}
            {!isSold && isAvailable && (
              <OfferModal
                product={productData}
                trigger={
                  <Button variant="outline" className="flex-1">
                    Make Offer
                  </Button>
                }
              />
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6 text-center lg:text-left">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

