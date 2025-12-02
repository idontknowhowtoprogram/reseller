import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();

    // Check if user is authenticated (admin)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: productId } = await params;
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No files provided' },
        { status: 400 }
      );
    }

    // Use service role client for storage operations to bypass RLS
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const uploadedImages = [];

    for (const file of files) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await serviceClient.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        continue; // Skip this file and continue with others
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = serviceClient.storage.from('product-images').getPublicUrl(filePath);

      // Get current images count for sort_order
      const { count } = await serviceClient
        .from('product_images')
        .select('*', { count: 'exact', head: true })
        .eq('product_id', productId);

      // Insert into database (use service client to bypass RLS)
      const query = (serviceClient.from('product_images') as any);
      const { data, error } = await query
        .insert({
          product_id: productId,
          image_url: publicUrl,
          sort_order: count || 0,
        })
        .select()
        .single();

      if (error) {
        console.error('Database insert error:', error);
        // Try to clean up uploaded file
        await serviceClient.storage
          .from('product-images')
          .remove([filePath]);
        continue;
      }

      uploadedImages.push(data);
    }

    if (uploadedImages.length === 0) {
      return NextResponse.json(
        { error: 'Failed to upload any images' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: uploadedImages });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

