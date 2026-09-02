import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { parseTripQuery } from '@/lib/tripPlanner/ruleBasedParser';
import { parseTripQueryWithClaude } from '@/lib/tripPlanner/claudeParser';
import { resolveAirport } from '@/lib/tripPlanner/resolveAirport';

const schema = z.object({ query: z.string().min(3).max(500) });

/**
 * Step 1 of the AI trip planner: extract a structured TripIntent from free
 * text and resolve airports, but run NO flight search yet — every search
 * call has a real cost, so the user reviews/edits this before Step 2
 * (/api/trip-planner/run) actually queries providers.
 */
export async function POST(request: NextRequest) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Tell us a bit about your trip first.' }, { status: 400 });
  }

  const claudeIntent = await parseTripQueryWithClaude(parsed.data.query);
  const intent = claudeIntent ?? parseTripQuery(parsed.data.query);
  const usedClaude = claudeIntent !== null;

  const [origin, destination] = await Promise.all([
    resolveAirport(intent.originQuery),
    resolveAirport(intent.destinationQuery),
  ]);

  const notes = [...intent.notes];
  if (!origin) notes.push("We couldn't identify a departure airport — please pick one.");
  if (!destination) notes.push("We couldn't identify a destination airport — please pick one.");

  return NextResponse.json({
    intent: {
      ...intent,
      notes,
    },
    origin,
    destination,
    usedClaude,
  });
}
