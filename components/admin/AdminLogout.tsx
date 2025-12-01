'use client';

import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function AdminLogout() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <Button 
      variant="ghost" 
      className="w-full justify-start transition-colors duration-200 hover:bg-accent/80 hover:text-accent-foreground" 
      onClick={handleLogout}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
}

