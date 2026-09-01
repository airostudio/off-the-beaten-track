# Off the Beaten Track — Member-First Flight & Holiday Comparison Platform

**Better fares. Earlier.** Paying members see the freshest deals, strongest savings and early access
before everyone else — with every savings claim backed by real, auditable data.

The original static "hidden gem destinations" site has moved to [`legacy-site/`](./legacy-site) and is
no longer served by the app; this repo is now the Next.js platform described below.

## Stack

Next.js 14 (App Router) · TypeScript · React · Tailwind CSS · Supabase (Postgres + Auth) · Stripe
Billing · Zod validation. No external flight API keys are required for local development — the app
falls back to a deterministic mock `FlightProvider` (`src/lib/flights/providers/mock.ts`) whenever
`FLIGHT_PROVIDER_API_KEY` is unset.

## Getting started

```bash
npm install
cp .env.example .env.local   # fill in Supabase keys; Stripe/flight keys are optional locally
# apply supabase/migrations/*.sql to your Supabase project (via `supabase db push` or the SQL editor)
npm run dev
```

Without Supabase/Stripe configured you can still browse the homepage and run flight searches against
the mock provider; auth, dashboard, billing and admin require Supabase.

## Architecture

- `src/lib/flights/provider.ts` — the `FlightProvider` interface every data source implements
  (`searchFlights`, `getFareDetails`, `getFareRules`, `getSeatAvailability`, `getBaggage`,
  `createOrder`/`cancelOrder`/`getOrder`/`refreshOffer` for future direct booking).
- `src/lib/flights/registry.ts` — picks active providers from env vars; add Duffel/Amadeus/NDC adapters
  here without touching search, ranking or UI code.
- `src/types/flight.ts` — `NormalisedFlightOffer`, the canonical shape every provider adapter must
  produce.
- `src/lib/flights/dedupe.ts` — collapses equivalent itineraries across providers.
- `src/lib/flights/valueScore.ts` — `FlightValueScore` (0–100), blending price, duration, stops,
  flexibility and genuine member discount; assigns Best Value / Cheapest / Fastest / Best Member Deal /
  Best Premium Economy badges.
- `src/lib/tiers.ts` — `resolveViewer()` is the single source of truth for GUEST/FREE/MEMBER tier,
  derived server-side from Supabase auth + the webhook-populated `subscriptions` table. Client state is
  never trusted for entitlements.
- `src/lib/flights/applyTierAccess.ts` — converts scored offers into what a given viewer may see. Members
  get the real member price; everyone else gets the public price plus an honest "locked" saving computed
  from the same real offer — **never a manufactured discount**.
- `src/lib/rateLimit.ts` — per-tier daily search caps (API cost protection).
- `src/app/api/stripe/*` — Checkout, Billing Portal, and a signature-verified, idempotent webhook that is
  the only writer of subscription state.

## Database

See `supabase/migrations/0001_init.sql` for the full Phase 1 schema (users/profiles, subscriptions,
subscription_plans, travel_preferences, searches, saved_searches, flight_offers, fare_observations,
fare_savings, deals, deal_release_rules, alerts, notifications, bookings, affiliate_clicks, commissions,
member_rewards, providers, admin_users, audit_logs, webhook_events) with RLS enabled on all
user-scoped tables. `fare_savings` exists specifically so every "members save X%" marketing claim is
backed by a real, auditable public/member fare pair — see section 5 of the product brief.

## Honesty constraints baked into the code

- `member_price` in the DB and `memberPrice` in `NormalisedFlightOffer` are nullable and must only be
  populated from a genuine negotiated rate, commission-share reward, or lower service fee — never
  synthesised. The mock provider simulates this realistically for ~55% of demo offers; a real adapter
  must do the same only when a real member rate exists.
  - `fare_savings` DB constraint enforces `member_fare <= public_fare`.
- Every offer carries `lastVerifiedAt` and the UI always renders a freshness label ("Verified moments
  ago" vs "Last checked N hours ago") — cached pricing is never presented as live.
- No fake countdowns, seat counts, or viewer counts anywhere in the UI.

## Phased roadmap

This build implements **Phase 1** end-to-end: auth, Stripe subscriptions, three-tier access
(GUEST/FREE/MEMBER), homepage, search widget, `FlightProvider` abstraction + mock provider, normalised
results with value scoring, locked member-fare paywall, member dashboard, admin dashboard shell.

- **Phase 2** — alerts/notifications delivery, watchlists, fare history graphs (`fare_observations` is
  already modelled), deal-discovery background workers, member-first release timing enforcement,
  flexible-date fare calendars, nearby-airport search.
- **Phase 3** — real multi-provider comparison (Duffel/Amadeus adapters), alternative route/self-transfer
  intelligence, Smart Mixed Cabin route construction, deal scoring, richer admin analytics.
- **Phase 4** — mobile polish, referral program, commission-sharing payouts (`member_rewards` is already
  modelled), hotels/cars/insurance verticals.
- **Phase 5** — direct booking via Duffel Orders/NDC, AI trip planning.

## Testing

`npm run typecheck` and `npm run lint` should be run before shipping changes. Add Vitest specs under
`src/**/__tests__` as functionality grows (`npm test`).
