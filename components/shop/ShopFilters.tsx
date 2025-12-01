'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ShopFiltersProps {
  categories: string[];
  brands: string[];
}

export function ShopFilters({ categories, brands }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [condition, setCondition] = useState('all');
  const [brand, setBrand] = useState('all');

  // Sync state with URL params on mount and when params change
  useEffect(() => {
    const searchParam = searchParams.get('search') || '';
    const categoryParam = searchParams.get('category') || 'all';
    const conditionParam = searchParams.get('condition') || 'all';
    const brandParam = searchParams.get('brand') || 'all';
    
    setSearch(searchParam);
    setCategory(categoryParam);
    setCondition(conditionParam);
    setBrand(brandParam);
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    
    if (search.trim()) {
      params.set('search', search.trim());
    }
    
    if (category && category !== 'all') {
      params.set('category', category);
    }
    
    if (condition && condition !== 'all') {
      params.set('condition', condition);
    }
    
    if (brand && brand !== 'all') {
      params.set('brand', brand);
    }
    
    const queryString = params.toString();
    const url = `/shop${queryString ? `?${queryString}` : ''}`;
    
    console.log('🔍 Submitting search with URL:', url);
    console.log('🔍 Search value:', search);
    console.log('🔍 All params:', Object.fromEntries(params));
    
    // Use router.push with refresh to ensure server component re-renders
    router.push(url);
    router.refresh();
  };

  const handleReset = () => {
    setSearch('');
    setCategory('all');
    setCondition('all');
    setBrand('all');
    window.location.href = '/shop';
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1 relative">
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
          placeholder="Search products, codes, brands..."
          className="pl-10"
        />
      </div>
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((cat) => (
            <SelectItem key={cat} value={cat}>
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={condition} onValueChange={setCondition}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="All Conditions" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Conditions</SelectItem>
          <SelectItem value="new">New</SelectItem>
          <SelectItem value="like_new">Like New</SelectItem>
          <SelectItem value="used">Used</SelectItem>
          <SelectItem value="good">Good</SelectItem>
          <SelectItem value="fair">Fair</SelectItem>
        </SelectContent>
      </Select>
      {brands.length > 0 && (
        <Select value={brand} onValueChange={setBrand}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Brands" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Brands</SelectItem>
            {brands.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      <div className="flex gap-2">
        <Button type="submit">Filter</Button>
        {(search || category !== 'all' || condition !== 'all' || brand !== 'all') && (
          <Button type="button" variant="outline" onClick={handleReset}>
            Clear
          </Button>
        )}
      </div>
    </form>
  );
}

