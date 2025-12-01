import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const productCode = searchParams.get('product_code');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let query = supabase
      .from('products')
      .select(`
        *,
        product_images (*)
      `);

    if (productCode) {
      query = query.eq('product_code', productCode);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (status) {
      query = query.eq('status', status);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated (admin)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      price,
      sale_price,
      condition,
      category,
      brand,
      product_code,
      status,
      metadata,
      is_published,
    } = body;

    const { data, error } = await supabase
      .from('products')
      .insert({
        title,
        description,
        price: parseFloat(price),
        sale_price: sale_price ? parseFloat(sale_price) : null,
        condition,
        category,
        brand: brand || null,
        product_code,
        status: status || 'available',
        metadata: metadata || {},
        is_published: is_published !== undefined ? is_published : true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating product:', error);
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

