import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching settings:', error);
      return NextResponse.json(
        { error: 'Failed to fetch settings' },
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

export async function PATCH(request: NextRequest) {
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

    // Convert numeric fields
    if (body.free_delivery_threshold) {
      body.free_delivery_threshold = parseFloat(body.free_delivery_threshold);
    }
    if (body.discount_150_threshold) {
      body.discount_150_threshold = parseFloat(body.discount_150_threshold);
    }
    if (body.discount_200_threshold) {
      body.discount_200_threshold = parseFloat(body.discount_200_threshold);
    }
    if (body.delivery_charge) {
      body.delivery_charge = parseFloat(body.delivery_charge);
    }

    const query = supabase.from('settings') as any;
    const { data, error } = await query
      .update(body)
      .eq('id', '00000000-0000-0000-0000-000000000001')
      .select()
      .single();

    if (error) {
      console.error('Error updating settings:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json(
        { 
          error: 'Failed to update settings',
          details: error.message || 'Unknown error',
          code: error.code || 'UNKNOWN'
        },
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

