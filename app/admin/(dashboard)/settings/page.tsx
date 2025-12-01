import { createClient } from '@/lib/supabase/server';
import { SettingsForm } from '@/components/admin/SettingsForm';
import { Settings } from '@/types';

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data: settings } = await supabase
    .from('settings')
    .select('*')
    .single();

  const defaultSettings: Settings = {
    id: '00000000-0000-0000-0000-000000000001',
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your store settings</p>
      </div>

      <SettingsForm settings={settings ? (settings as unknown as Settings) : defaultSettings} />
    </div>
  );
}

