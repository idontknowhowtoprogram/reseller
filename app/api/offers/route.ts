import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const offerSchema = z.object({
  product_id: z.string().uuid(),
  name: z.string().min(2),
  phone: z.string().min(10),
  offer_price: z.number().positive(),
  notes: z.string().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = offerSchema.parse(body);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('offers')
      .insert({
        product_id: validatedData.product_id,
        name: validatedData.name,
        phone: validatedData.phone,
        offer_price: validatedData.offer_price,
        notes: validatedData.notes || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating offer:', error);
      return NextResponse.json(
        { error: 'Failed to create offer' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');

    let query = supabase
      .from('offers')
      .select(`
        *,
        products (*)
      `)
      .order('created_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching offers:', error);
      return NextResponse.json(
        { error: 'Failed to fetch offers' },
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

