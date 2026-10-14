import type { MetadataRoute } from 'next';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { buildRouteSlug } from '@/lib/seo/routeSlug';

const REGION_SLUGS = ['philippines', 'thailand', 'bali', 'vietnam', 'japan', 'premium-economy', 'business'];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://offthebeatentrack.example';
  const service = createSupabaseServiceClient();

  const [{ data: routes }, { data: airports }] = await Promise.all([
    service.from('routes').select('origin, destination').order('popularity', { ascending: false }).limit(30),
    service.from('airports').select('iata, city'),
  ]);
  const cityByCode = new Map((airports ?? []).map((a) => [a.iata, a.city]));

  const flightUrls: MetadataRoute.Sitemap = (routes ?? [])
    .filter((r) => cityByCode.has(r.origin) && cityByCode.has(r.destination))
    .map((r) => ({
      url: `${siteUrl}/flights/${buildRouteSlug(cityByCode.get(r.origin)!, cityByCode.get(r.destination)!)}`,
      changeFrequency: 'daily',
      priority: 0.7,
    }));

  const dealUrls: MetadataRoute.Sitemap = REGION_SLUGS.map((slug) => ({
    url: `${siteUrl}/deals/${slug}`,
    changeFrequency: 'hourly',
    priority: 0.6,
  }));

  return [
    { url: siteUrl, changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/search`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/deals`, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${siteUrl}/membership`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${siteUrl}/plan`, changeFrequency: 'weekly', priority: 0.6 },
    ...flightUrls,
    ...dealUrls,
  ];
}
