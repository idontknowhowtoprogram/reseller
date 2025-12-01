import { createClient } from '@/lib/supabase/server';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Package, CheckCircle2, MessageSquare, Clock } from 'lucide-react';

export default async function AdminDashboard() {
  const supabase = await createClient();

  // Get statistics
  const [productsResult, soldResult, offersResult, notificationsResult] = await Promise.all([
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }).eq('status', 'sold'),
    supabase.from('offers').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('product_notifications').select('id', { count: 'exact', head: true }).eq('notified', false),
  ]);

  // Get recent products
  const { data: recentProducts } = await supabase
    .from('products')
    .select('id, title, created_at, status')
    .order('created_at', { ascending: false })
    .limit(5);

  // Type the recent products array properly
  const typedRecentProducts = (recentProducts || []) as any[];

  const totalProducts = productsResult.count || 0;
  const soldProducts = soldResult.count || 0;
  const pendingOffers = offersResult.count || 0;
  const pendingNotifications = notificationsResult.count || 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProducts}</div>
            <p className="text-xs text-muted-foreground">Items in inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sold Items</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{soldProducts}</div>
            <p className="text-xs text-muted-foreground">Items sold</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Offers</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOffers}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Notifications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingNotifications}</div>
            <p className="text-xs text-muted-foreground">Reserved items</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Products */}
      <Card>
        <CardHeader>
          <CardTitle>Recently Added Products</CardTitle>
          <CardDescription>Latest products added to your store</CardDescription>
        </CardHeader>
        <CardContent>
          {typedRecentProducts && typedRecentProducts.length > 0 ? (
            <div className="space-y-2">
              {typedRecentProducts.map((product: any) => (
                <div key={product.id} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                  <div>
                    <p className="font-medium">{product.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(product.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm capitalize">{product.status}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No products yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

