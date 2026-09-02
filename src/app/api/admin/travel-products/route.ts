import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

const schema = z.object({
  category: z.enum(['hotel', 'car_rental', 'insurance']),
  name: z.string().min(1),
  description: z.string().optional(),
  destinationCity: z.string().optional(),
  destinationCountry: z.string().optional(),
  partner: z.string().min(1),
  affiliateUrl: z.string().url(),
  publicPrice: z.coerce.number().positive().optional(), // dollars
  memberPrice: z.coerce.number().positive().optional(), // dollars — must be a genuine negotiated rate
  currency: z.string().length(3).default('AUD'),
  imageUrl: z.string().url().optional(),
  featured: z.boolean().default(false),
});

export async function POST(request: NextRequest) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid product', issues: parsed.error.issues }, { status: 400 });
  }
  if (parsed.data.memberPrice != null && parsed.data.publicPrice != null && parsed.data.memberPrice > parsed.data.publicPrice) {
    return NextResponse.json({ error: 'Member price cannot exceed the public price' }, { status: 400 });
  }

  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from('travel_products')
    .insert({
      category: parsed.data.category,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      destination_city: parsed.data.destinationCity ?? null,
      destination_country: parsed.data.destinationCountry ?? null,
      partner: parsed.data.partner,
      affiliate_url: parsed.data.affiliateUrl,
      public_price: parsed.data.publicPrice ? Math.round(parsed.data.publicPrice * 100) : null,
      member_price: parsed.data.memberPrice ? Math.round(parsed.data.memberPrice * 100) : null,
      currency: parsed.data.currency,
      image_url: parsed.data.imageUrl ?? null,
      featured: parsed.data.featured,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ product: data }, { status: 201 });
}
