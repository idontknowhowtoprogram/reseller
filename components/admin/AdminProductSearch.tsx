'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useState } from 'react';

export function AdminProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    if (search.trim()) {
      params.set('search', search.trim());
    }
    
    const queryString = params.toString();
    router.push(`/admin/products${queryString ? `?${queryString}` : ''}`);
  };

  const handleClear = () => {
    setSearch('');
    router.push('/admin/products');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit(e as any);
            }
          }}
          placeholder="Search by name, code, or brand..."
          className="pl-10"
        />
      </div>
      <Button type="submit" className="transition-colors duration-200 hover:bg-primary/90">
        Search
      </Button>
      {search && (
        <Button type="button" variant="outline" onClick={handleClear}>
          Clear
        </Button>
      )}
    </form>
  );
}

