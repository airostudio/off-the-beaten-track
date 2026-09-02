import Anthropic from '@anthropic-ai/sdk';
import { DEFAULT_INTENT, type TripIntent } from './types';

const EXTRACT_TOOL: Anthropic.Tool = {
  name: 'extract_trip_intent',
  description: 'Extract a structured trip request from the traveller\'s free-text description.',
  strict: true,
  input_schema: {
    type: 'object',
    additionalProperties: false,
    required: ['originQuery', 'destinationQuery', 'passengers', 'cabin', 'longHaulCabin', 'longHaulThresholdHours', 'notes'],
    properties: {
      originQuery: { type: ['string', 'null'], description: 'The departure city/airport as mentioned, or null if not stated.' },
      destinationQuery: { type: ['string', 'null'], description: 'The destination city/country as mentioned, or null if not stated.' },
      monthName: { type: ['string', 'null'], description: 'Lowercase English month name if a travel month was mentioned, else null.' },
      tripLengthDays: { type: ['number', 'null'], description: 'Approximate trip length in days if mentioned (e.g. "a month" = 30), else null.' },
      passengers: { type: 'number', description: 'Number of travellers, default 1.' },
      cabin: { type: 'string', enum: ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'], description: 'Default cabin for short segments.' },
      longHaulCabin: { type: 'string', enum: ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'], description: 'Preferred cabin for long-haul segments, if the traveller distinguished one.' },
      longHaulThresholdHours: { type: 'number', description: 'Hours above which a segment counts as "long-haul", default 6.' },
      maxStops: { type: ['number', 'null'], description: 'Maximum acceptable stops if stated (0 = direct only), else null.' },
      notes: { type: 'array', items: { type: 'string' }, description: 'Short notes on any assumption made or ambiguity found.' },
    },
  },
};

/**
 * Optional enhancement over the rule-based parser, used only when
 * ANTHROPIC_API_KEY is configured. Any failure (missing key, network,
 * refusal, malformed response) falls back to the rule-based parser — the
 * trip planner must never be blocked on an external API key.
 */
export async function parseTripQueryWithClaude(query: string): Promise<TripIntent | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  try {
    const client = new Anthropic();
    const response = await client.messages.create({
      model: 'claude-opus-5',
      max_tokens: 1024,
      output_config: { effort: 'low' },
      tools: [EXTRACT_TOOL],
      tool_choice: { type: 'tool', name: 'extract_trip_intent' },
      messages: [{ role: 'user', content: query }],
    });

    if (response.stop_reason === 'refusal') return null;

    const toolUse = response.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
    if (!toolUse) return null;

    const input = toolUse.input as {
      originQuery: string | null;
      destinationQuery: string | null;
      monthName: string | null;
      tripLengthDays: number | null;
      passengers: number;
      cabin: TripIntent['cabin'];
      longHaulCabin: TripIntent['cabin'];
      longHaulThresholdHours: number;
      maxStops: number | null;
      notes: string[];
    };

    const departureDate = resolveMonth(input.monthName);
    const returnDate = input.tripLengthDays ? addDays(departureDate, input.tripLengthDays) : null;

    return {
      originQuery: input.originQuery,
      destinationQuery: input.destinationQuery,
      departureDate,
      returnDate,
      passengers: Math.min(Math.max(input.passengers || 1, 1), 9),
      cabin: input.cabin || DEFAULT_INTENT.cabin,
      longHaulCabin: input.longHaulCabin || DEFAULT_INTENT.longHaulCabin,
      longHaulThresholdHours: input.longHaulThresholdHours || DEFAULT_INTENT.longHaulThresholdHours,
      maxStops: input.maxStops ?? null,
      notes: input.notes ?? [],
    };
  } catch {
    return null;
  }
}

function resolveMonth(monthName: string | null): string {
  const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const now = new Date();
  if (!monthName) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 45);
    return d.toISOString().slice(0, 10);
  }
  const index = months.indexOf(monthName.toLowerCase());
  if (index < 0) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 45);
    return d.toISOString().slice(0, 10);
  }
  let year = now.getUTCFullYear();
  if (index < now.getUTCMonth() || (index === now.getUTCMonth() && now.getUTCDate() > 20)) year += 1;
  return new Date(Date.UTC(year, index, 15)).toISOString().slice(0, 10);
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
