import type { CabinClass } from '@/types/user';
import { DEFAULT_INTENT, type TripIntent } from './types';

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

const WORD_NUMBERS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  a: 1, an: 1, us: 2, myself: 1,
};

/**
 * Zero-dependency, always-available extraction of a TripIntent from free
 * text. Used directly when ANTHROPIC_API_KEY is unset, and as the fallback
 * whenever the Claude-backed parser errors — the trip planner must never be
 * blocked on an external API key (same principle as FLIGHT_PROVIDER_API_KEY).
 */
export function parseTripQuery(query: string): TripIntent {
  const text = query.toLowerCase();
  const notes: string[] = [];

  // "from X to Y" — greedy-safe stop words keep the city names tight.
  const fromTo = text.match(/from\s+(.+?)\s+to\s+(.+?)(?=\s+for\b|\s+in\b|\s+next\b|\s+this\b|\.|,|$)/i);
  const originQuery = fromTo?.[1]?.trim() ?? null;
  const destinationQuery = fromTo?.[2]?.trim() ?? null;
  if (!fromTo) notes.push("Couldn't confidently find both a departure and destination city — please fill them in.");

  // Passengers: "two people", "for 2", "3 passengers", "for us".
  let passengers = 1;
  const digitMatch = text.match(/\b(\d{1,2})\s*(people|passengers|adults|travellers|travelers)\b/);
  const forDigitMatch = text.match(/\bfor\s+(\d{1,2})\b/);
  const wordMatch = text.match(/\b(one|two|three|four|five|six|seven|eight|us|myself)\b\s*(people|of us|passengers|travellers|travelers)?/);
  if (digitMatch) passengers = parseInt(digitMatch[1], 10);
  else if (forDigitMatch) passengers = parseInt(forDigitMatch[1], 10);
  else if (wordMatch) passengers = WORD_NUMBERS[wordMatch[1]] ?? 1;
  passengers = Math.min(Math.max(passengers, 1), 9);

  // Cabin.
  let cabin: CabinClass = 'ECONOMY';
  if (/\bfirst class\b/.test(text)) cabin = 'FIRST';
  else if (/\bbusiness\b/.test(text)) cabin = 'BUSINESS';
  else if (/\bpremium economy\b/.test(text)) cabin = 'PREMIUM_ECONOMY';

  // Long-haul cabin preference + threshold ("premium economy on anything over 6 hours").
  let longHaulCabin: CabinClass = DEFAULT_INTENT.longHaulCabin;
  let longHaulThresholdHours = DEFAULT_INTENT.longHaulThresholdHours;
  const overHoursMatch = text.match(/over\s+(\d{1,2})\s*hours?/);
  if (overHoursMatch) longHaulThresholdHours = parseInt(overHoursMatch[1], 10);
  if (/premium economy.{0,40}(over|long.?haul|longer)/.test(text) || (cabin === 'PREMIUM_ECONOMY' && overHoursMatch)) {
    longHaulCabin = 'PREMIUM_ECONOMY';
  } else if (/business.{0,40}(over|long.?haul|longer)/.test(text)) {
    longHaulCabin = 'BUSINESS';
  }

  // Stops.
  let maxStops: number | null = null;
  if (/\b(direct|nonstop|non-stop)\b/.test(text)) maxStops = 0;
  else if (/\bone stop\b/.test(text)) maxStops = 1;

  // Month → nearest future occurrence.
  let departureDate = '';
  const monthMatch = MONTHS.findIndex((m) => text.includes(m));
  const now = new Date();
  if (monthMatch >= 0) {
    let year = now.getUTCFullYear();
    if (monthMatch < now.getUTCMonth() || (monthMatch === now.getUTCMonth() && now.getUTCDate() > 20)) year += 1;
    departureDate = new Date(Date.UTC(year, monthMatch, 15)).toISOString().slice(0, 10);
  } else {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 45);
    departureDate = d.toISOString().slice(0, 10);
    notes.push('No travel month mentioned — defaulted to 45 days from today.');
  }

  // Trip length → return date.
  let returnDate: string | null = null;
  if (/\ba month\b|\bone month\b|\b4 weeks\b|\bfour weeks\b/.test(text)) {
    returnDate = addDays(departureDate, 30);
  } else {
    const weeksMatch = text.match(/(\d{1,2})\s*weeks?/);
    const daysMatch = text.match(/(\d{1,2})\s*days?/);
    if (weeksMatch) returnDate = addDays(departureDate, parseInt(weeksMatch[1], 10) * 7);
    else if (daysMatch) returnDate = addDays(departureDate, parseInt(daysMatch[1], 10));
  }

  return {
    originQuery,
    destinationQuery,
    departureDate,
    returnDate,
    passengers,
    cabin,
    longHaulCabin,
    longHaulThresholdHours,
    maxStops,
    notes,
  };
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
