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

`0005_phase2.sql` adds `watched_trips` and notification release timing; `0006_all_world_airports.sql`
seeds **every airport in the world with a real IATA code** (5,614 airports, from the OpenFlights
Airports Database — public domain, sourced via the `airport-data` npm package). Regenerate it with
`npm install --no-save airport-data && node scripts/generate-airports-seed.js` if you want to refresh
against upstream. This is the airport-picker used by `AirportAutocomplete` on the search widget
(`/api/airports/search`), not just a handful of hardcoded routes.

`0007_phase4.sql` adds the referral program (`referrals`, `profiles.referral_code` /
`membership_credit_expires_at`), commission-sharing columns on `commissions`, and `travel_products`
(hotels/cars/insurance affiliate listings).

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

- **Phase 1** (done) — auth, Stripe subscriptions, three-tier access (GUEST/FREE/MEMBER), homepage,
  search widget, `FlightProvider` abstraction + mock provider, normalised results with value scoring,
  locked member-fare paywall, member dashboard, admin dashboard shell.
- **Phase 2** (done) — fare alerts (create/toggle/delete), watchlist ("Watch this trip" +
  price-vs-watched tracking), fare history (`fare_observations` + 30-day sparkline), deal-discovery
  cron worker (`/api/cron/discover-deals`, real historical-average comparison), member-first
  notification release timing (`deal_release_rules` + `notifications.visible_at`), flexible-date fare
  calendar, nearby/alternative-airport search.
- **Phase 3** (done) — every world airport seeded + searchable (`AirportAutocomplete`,
  `/api/airports/search`); Alternative Route Engine and Smart Mixed Cabin
  (`src/lib/flights/hubItineraries.ts` — genuinely priced two-leg self-transfer itineraries via SIN/
  BKK/KUL/HKG, cabin chosen per leg from real queried duration vs the traveller's long-haul threshold);
  provider fallback to cached fares when every live provider fails (`mapCachedOfferToClient`); a
  `DuffelFlightProvider` scaffold (`src/lib/flights/providers/duffel.ts`, intentionally not wired in
  until real API calls are implemented); richer admin analytics (ARR, average verified saving, popular
  routes, provider error/latency stats from `provider_api_logs`).
- **Phase 4** (done) — mobile bottom nav (`MobileBottomNav`, section 39); referral program (`referrals`
  table, `profiles.referral_code`/`membership_credit_expires_at`, `/signup?ref=CODE`, 30 days credited
  to both parties, `resolveViewer()` honours the credit as real MEMBER access alongside a paid
  subscription — never fabricated); Commission Sharing Engine (`src/lib/commissionSharing.ts` — 35% of
  a confirmed real commission is credited back to the member as `member_rewards`, feeding the dashboard
  Savings Meter); an affiliate-click → booking → commission pipeline
  (`/api/affiliate/click`, `dbOfferId` on every live/cached offer, `/admin/bookings` to confirm a real
  outcome until a live affiliate-network webhook exists); hotels/cars/insurance affiliate verticals
  (`travel_products` table, `/hotels` `/cars` `/insurance`, `/admin/travel-products` to manage listings).
- **Phase 5** (done) — direct booking architecture and an AI trip planner, built honestly against what
  actually exists: real airline NDC/GDS credentials don't, so the booking path is fully wired end-to-end
  against the mock provider (`MockFlightProvider.createOrder/getOrder/cancelOrder` now really work) using
  the exact same `FlightProvider` interface a live Duffel adapter would use — a real one-time Stripe
  Checkout Session collects payment (`/api/bookings/checkout`), and only a confirmed `checkout.session.completed`
  webhook triggers `provider.createOrder()` (never before payment, and a ticketing failure after payment
  is marked for manual follow-up, never silently "confirmed"). A "Book directly" button sits alongside
  the affiliate link on every offer with a stable `dbOfferId`, per section 32's "don't make search depend
  on affiliate redirects." The **AI Trip Planner** (`/plan`) extracts a structured trip request from free
  text with a zero-dependency rule-based parser (`src/lib/tripPlanner/ruleBasedParser.ts`) that always
  works, optionally upgraded to Claude (`claudeParser.ts`, strict tool-use extraction) when
  `ANTHROPIC_API_KEY` is set — same never-block-on-a-missing-key pattern as `FLIGHT_PROVIDER_API_KEY`.
  Extraction is a separate step from search (`/api/trip-planner/parse` → user reviews/edits →
  `/api/trip-planner/run`) since every search has a real cost and a misparse shouldn't spend it. Results
  reuse the existing engines rather than reinventing them: Best Value/Cheapest/Fastest/Best Member Deal
  from `FlightValueScore`, Smart Route from the Phase 3 Alternative Route Engine, Most Comfortable from
  Smart Mixed Cabin.

## Testing

`npm run typecheck` and `npm run lint` should be run before shipping changes. Add Vitest specs under
`src/**/__tests__` as functionality grows (`npm test`).
