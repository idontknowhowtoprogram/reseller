import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  let user = null;
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();
    user = authUser;
  } catch (error) {
    console.error('Error checking auth:', error);
  }

  if (!user) {
    redirect('/admin/login');
  }

  return (
    <>
      {/* Admin layout - replaces root layout's main content */}
      <div className="min-h-screen bg-muted/50">
        <div className="flex">
          {/* Sidebar */}
          <AdminSidebar />

          {/* Main Content */}
          <main className="flex-1 p-8">{children}</main>
        </div>
      </div>
    </>
  );
}

