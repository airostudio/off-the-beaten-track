import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { resolveViewer } from '@/lib/tiers';
import { checkSearchLimit } from '@/lib/rateLimit';
import { getActiveProviders } from '@/lib/flights/registry';
import { dedupeOffers } from '@/lib/flights/dedupe';

const schema = z.object({
  origin: z.string().length(3).toUpperCase(),
  destination: z.string().length(3).toUpperCase(),
  centerDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  cabin: z.enum(['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST']).default('ECONOMY'),
  rangeDays: z.coerce.number().int().refine((n) => [1, 3, 7].includes(n), 'rangeDays must be 1, 3 or 7').default(3),
});

/**
 * Flexible-date fare calendar (section 13). Queries the cheapest fare for
 * each day in [centerDate - rangeDays, centerDate + rangeDays] so the UI can
 * show "Save $X by leaving N days later" — counted as a single search
 * against the viewer's daily quota rather than one per day.
 */
export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid calendar request', issues: parsed.error.issues }, { status: 400 });
  }

  const viewer = await resolveViewer();
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null;
  const withinLimit = await checkSearchLimit(viewer, ipAddress);
  if (!withinLimit) {
    return NextResponse.json({ error: 'Daily search limit reached', upgrade: viewer.tier !== 'MEMBER' }, { status: 429 });
  }

  const { origin, destination, centerDate, cabin, rangeDays } = parsed.data;
  const providers = getActiveProviders();
  const center = new Date(`${centerDate}T00:00:00Z`);

  const dates: string[] = [];
  for (let offset = -rangeDays; offset <= rangeDays; offset++) {
    const d = new Date(center);
    d.setUTCDate(d.getUTCDate() + offset);
    dates.push(d.toISOString().slice(0, 10));
  }

  const days = await Promise.all(
    dates.map(async (date) => {
      const settled = await Promise.allSettled(
        providers.map((p) => p.searchFlights({ origin, destination, departureDate: date, cabin, passengers: 1 }))
      );
      const rawOffers = settled.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
      if (rawOffers.length === 0) return { date, price: null, memberPrice: null };

      const deduped = dedupeOffers(rawOffers);
      const cheapestPublic = Math.min(...deduped.map((o) => o.publicPrice));
      const memberOffers = deduped.filter((o) => o.memberEligible && o.memberPrice != null);
      const cheapestMember = memberOffers.length > 0 ? Math.min(...memberOffers.map((o) => o.memberPrice!)) : null;

      return {
        date,
        price: cheapestPublic,
        memberPrice: viewer.limits.canSeeMemberPrice ? cheapestMember : null,
      };
    })
  );

  const priced = days.filter((d) => d.price !== null);
  const cheapestDay = priced.length > 0 ? priced.reduce((min, d) => (d.price! < min.price! ? d : min)) : null;
  const centerDay = days.find((d) => d.date === centerDate) ?? null;

  return NextResponse.json({
    origin,
    destination,
    cabin,
    days,
    cheapestDay,
    savingVsSelected:
      cheapestDay && centerDay?.price ? Math.max(0, centerDay.price - (cheapestDay.price ?? 0)) : 0,
  });
}
