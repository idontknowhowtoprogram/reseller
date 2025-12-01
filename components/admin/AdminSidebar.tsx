'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut, Package, MessageSquare, Settings, LayoutDashboard, Home, ExternalLink } from 'lucide-react';
import { AdminLogout } from './AdminLogout';
import { cn } from '@/lib/utils';

export function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/offers', label: 'Offers', icon: MessageSquare },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 min-h-screen bg-background border-r">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Admin Dashboard</h1>
      </div>
      <nav className="p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
            (item.href !== '/admin' && pathname?.startsWith(item.href));
          
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "block rounded-md transition-colors duration-200 cursor-pointer",
                isActive && "bg-accent text-accent-foreground",
                !isActive && "hover:bg-accent/80 hover:text-accent-foreground"
              )}
            >
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-transparent font-medium"
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t space-y-2">
        <Link 
          href="/" 
          target="_blank"
          className="block rounded-md transition-colors duration-200 hover:bg-accent/80 hover:text-accent-foreground cursor-pointer"
        >
          <Button
            variant="ghost"
            className="w-full justify-start"
          >
            <Home className="mr-2 h-4 w-4" />
            View Store
            <ExternalLink className="ml-auto h-3 w-3 opacity-50" />
          </Button>
        </Link>
        <AdminLogout />
      </div>
    </aside>
  );
}

