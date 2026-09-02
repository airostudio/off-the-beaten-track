import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/admin';
import { createSupabaseServiceClient } from '@/lib/supabase/server';

const schema = z.object({
  origin: z.string().length(3).toUpperCase(),
  destination: z.string().length(3).toUpperCase(),
  outboundDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  airline: z.string().optional(),
  cabin: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).default('ECONOMY'),
  publicPrice: z.coerce.number().positive(), // dollars
  memberPrice: z.coerce.number().positive().optional(), // dollars — must be a genuine rate
  historicalAverage: z.coerce.number().positive().optional(),
  region: z.string().optional(),
  featured: z.boolean().default(false),
  expiresInHours: z.coerce.number().positive().max(24 * 30).default(48),
});

/** Admin deal management (section 29): create a deal manually, e.g. a genuinely negotiated promo. */
export async function POST(request: NextRequest) {
  const adminId = await requireAdmin();
  if (!adminId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid deal', issues: parsed.error.issues }, { status: 400 });
  }
  const d = parsed.data;
  if (d.memberPrice != null && d.memberPrice > d.publicPrice) {
    return NextResponse.json({ error: 'Member price cannot exceed the public price' }, { status: 400 });
  }

  const publicPriceCents = Math.round(d.publicPrice * 100);
  const memberPriceCents = d.memberPrice != null ? Math.round(d.memberPrice * 100) : null;
  const historicalAverageCents = d.historicalAverage != null ? Math.round(d.historicalAverage * 100) : null;
  const discountPercentage = historicalAverageCents
    ? Math.round(((historicalAverageCents - publicPriceCents) / historicalAverageCents) * 100)
    : null;

  const service = createSupabaseServiceClient();
  const { data, error } = await service
    .from('deals')
    .insert({
      route: `${d.origin} → ${d.destination}`,
      origin: d.origin,
      destination: d.destination,
      outbound_date: d.outboundDate ?? null,
      airline: d.airline ?? null,
      cabin: d.cabin,
      public_price: publicPriceCents,
      member_price: memberPriceCents,
      historical_average: historicalAverageCents,
      discount_percentage: discountPercentage,
      region: d.region ?? null,
      featured: d.featured,
      discovered_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + d.expiresInHours * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  await service.from('audit_logs').insert({
    actor_id: adminId,
    action: 'deal_created',
    entity: 'deals',
    entity_id: data.id,
    metadata: { route: data.route, public_price: publicPriceCents, member_price: memberPriceCents },
  });

  return NextResponse.json({ deal: data }, { status: 201 });
}
