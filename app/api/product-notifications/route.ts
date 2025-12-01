import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const notificationSchema = z.object({
  product_id: z.string().uuid(),
  customer_name: z.string().min(2),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = notificationSchema.parse(body);

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('product_notifications')
      .insert({
        product_id: validatedData.product_id,
        customer_name: validatedData.customer_name,
        phone: validatedData.phone || null,
        email: validatedData.email || null,
        notified: false,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return NextResponse.json(
        { error: 'Failed to create notification' },
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

    // Check if user is authenticated (admin)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('product_id');
    const notified = searchParams.get('notified');

    let query = supabase
      .from('product_notifications')
      .select(`
        *,
        products (*)
      `)
      .order('created_at', { ascending: false });

    if (productId) {
      query = query.eq('product_id', productId);
    }

    if (notified !== null) {
      query = query.eq('notified', notified === 'true');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
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

