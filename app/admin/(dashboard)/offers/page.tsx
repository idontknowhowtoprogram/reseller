import { createClient } from '@/lib/supabase/server';
import { OffersTable } from '@/components/admin/OffersTable';

export default async function AdminOffersPage() {
  const supabase = await createClient();

  const { data: offers } = await supabase
    .from('offers')
    .select(`
      *,
      products (*)
    `)
    .order('created_at', { ascending: false });

  // Type the offers array properly
  const typedOffers = (offers || []) as any[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Offers</h1>
        <p className="text-muted-foreground">Manage customer offers</p>
      </div>

      <OffersTable offers={typedOffers} />
    </div>
  );
}

