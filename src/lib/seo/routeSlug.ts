import { resolveAirport, type ResolvedAirport } from '@/lib/tripPlanner/resolveAirport';

export function citySlug(city: string): string {
  return city
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-');
}

export function buildRouteSlug(originCity: string, destinationCity: string): string {
  return `${citySlug(originCity)}-to-${citySlug(destinationCity)}`;
}

export interface ResolvedRoute {
  origin: ResolvedAirport;
  destination: ResolvedAirport;
}

/**
 * Parses an SEO slug like "melbourne-to-manila" and resolves both ends
 * against the full world-airports table via the same fuzzy matcher the AI
 * trip planner uses. Returns null if either side can't be confidently
 * resolved — the page should 404 rather than guess.
 */
export async function resolveRouteSlug(slug: string): Promise<ResolvedRoute | null> {
  const parts = slug.split('-to-');
  if (parts.length !== 2) return null;

  const [originQuery, destinationQuery] = parts.map((p) => p.replace(/-/g, ' '));
  const [origin, destination] = await Promise.all([resolveAirport(originQuery), resolveAirport(destinationQuery)]);

  if (!origin || !destination) return null;
  return { origin, destination };
}
