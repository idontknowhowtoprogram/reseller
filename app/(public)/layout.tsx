import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FloatingCartButton } from '@/components/cart/FloatingCartButton';
import { TrustBanner } from '@/components/hero/TrustBanner';
import { ColorTheme } from '@/components/ColorTheme';
import { createClient } from '@/lib/supabase/server';
import { Settings } from '@/types';

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // Get settings with error handling
  let settings: Settings = {
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
    home_cta_title: 'Can\'t find what you\'re looking for?',
    home_cta_description: 'Contact us on WhatsApp and we\'ll help you find the perfect item.',
    home_cta_button_text: 'Chat with Us',
  };

  try {
    const { data: settingsData } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (settingsData) {
      settings = settingsData;
    }
  } catch (error) {
    // Use default settings if there's an error
    console.error('Error loading settings:', error);
  }

  return (
    <>
      <ColorTheme settings={settings} />
      <Navbar settings={settings} />
      <TrustBanner />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <FloatingCartButton settings={settings} />
    </>
  );
}

