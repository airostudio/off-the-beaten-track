/**
 * Curated destination photography, keyed by a short destination code (usually
 * the IATA city/airport code). Used to make the dashboard and homepage feel
 * like the trip has already started rather than a generic booking form.
 *
 * The three brand hero shots (outback red dirt, Philippines, mountain
 * fireplace retreat) are custom images in /public, supplied by the site
 * owner. Everything else falls back to Pexels (free to use, no attribution
 * required) via direct CDN links — swap PEXELS_ID for a real Unsplash/Pexels
 * API search-by-destination call in Phase 3 for full airport coverage
 * instead of this static map.
 */

function pexels(id: number, w = 1920, h = 1080): string {
  return `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}&h=${h}&fit=crop`;
}

export interface Destination {
  code: string;
  label: string;
  region: string;
  images: string[];
}

export const DESTINATIONS: Destination[] = [
  {
    code: 'MNL',
    label: 'Philippines',
    region: 'Southeast Asia',
    images: ['/philippines1.jpg', '/philippines2.jpg', pexels(13874296), pexels(35646946), pexels(31533420)],
  },
  {
    code: 'DPS',
    label: 'Bali, Indonesia',
    region: 'Southeast Asia',
    images: [pexels(5933066), pexels(2516406), pexels(15451778)],
  },
  {
    code: 'BKK',
    label: 'Thailand',
    region: 'Southeast Asia',
    images: [pexels(29955705), pexels(11392617), pexels(28197585)],
  },
  {
    code: 'NRT',
    label: 'Japan',
    region: 'North Asia',
    images: [pexels(31071545)],
  },
  {
    code: 'ZQN',
    label: 'New Zealand',
    region: 'South Pacific',
    images: [pexels(11032559), pexels(9485548)],
  },
  {
    code: 'AYQ',
    label: 'Australian Outback',
    region: 'Australia',
    images: ['/red-dirt.jpg', pexels(10015971), pexels(11763707), pexels(9331953)],
  },
];

export const FALLBACK_DESTINATION: Destination = {
  code: 'ANY',
  label: 'Somewhere off the beaten track',
  region: 'Everywhere',
  images: [pexels(12858513), pexels(31387467), pexels(29917625)],
};

export function findDestination(code: string | null | undefined): Destination {
  if (!code) return FALLBACK_DESTINATION;
  const match = DESTINATIONS.find((d) => d.code === code.toUpperCase());
  return match ?? FALLBACK_DESTINATION;
}

/** Deterministic-but-varied pick so the same destination doesn't always show the same shot. */
export function pickImage(destination: Destination, seed = Date.now()): string {
  const index = seed % destination.images.length;
  return destination.images[index];
}

/**
 * A punchy "Clarendon-esque" Instagram-style treatment — boosted saturation
 * and contrast plus a warm highlight — for scenes that should feel like a
 * travel-feed shot rather than a flat, literal photo.
 */
export const INSTAGRAM_FILTER = 'saturate(1.6) contrast(1.15) brightness(1.05) sepia(0.08)';

/** The three hero scenes for the homepage brand slideshow — custom brand photography. */
export const HERO_SCENES = [
  {
    key: 'outback',
    eyebrow: 'This is where it starts',
    headline: 'Off the beaten track.',
    body: 'Red dirt, wide horizons, and a road most people never take.',
    image: '/red-dirt.jpg',
  },
  {
    key: 'philippines',
    eyebrow: 'Then somewhere like this',
    headline: 'Never overpay to get here.',
    body: 'We compare airlines and route combinations most search engines miss.',
    image: '/philippines1.jpg',
    filter: INSTAGRAM_FILTER,
    tint: 'linear-gradient(180deg, rgba(0,180,220,0.12), rgba(255,150,60,0.10))',
  },
  {
    key: 'mountain',
    eyebrow: 'Or somewhere like this',
    headline: 'Better fares. Earlier.',
    body: 'Members see our freshest deals first — before everyone else.',
    image: '/mountain.jpg',
  },
] as const;
