-- Phase 2: watchlists, notification visibility timing, popular-route seeding
-- for the deal-discovery worker, and supporting indexes.

-- ============================================================
-- WATCHLIST (section 36)
-- ============================================================

create table if not exists watched_trips (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  origin text not null,
  destination text not null,
  departure_date date not null,
  return_date date,
  cabin text not null default 'ECONOMY',
  price_when_watched int not null, -- minor units, the fare shown at the moment they clicked "Watch"
  currency text not null default 'AUD',
  latest_price int, -- refreshed by the price-check worker; null until first refresh
  latest_price_checked_at timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_watched_trips_user on watched_trips(user_id);
create index if not exists idx_watched_trips_route on watched_trips(origin, destination, departure_date) where active;

alter table watched_trips enable row level security;
create policy "watched_trips_self" on watched_trips for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- MEMBER-FIRST NOTIFICATION TIMING
-- ============================================================

-- A notification can exist in the DB before a non-member is allowed to see
-- it — visible_at enforces the member-first release delay (deal_release_rules)
-- at read time rather than by delaying the insert.
alter table notifications add column if not exists visible_at timestamptz not null default now();
create index if not exists idx_notifications_user_visible on notifications(user_id, visible_at);

-- ============================================================
-- FARE OBSERVATIONS: support upsert-free historical lookups
-- ============================================================

create index if not exists idx_fare_obs_route_captured on fare_observations(route_key, captured_at desc);

-- ============================================================
-- POPULAR ROUTES the deal-discovery worker scans
-- ============================================================

insert into airports (iata, name, city, country) values
  ('MEL', 'Melbourne Airport', 'Melbourne', 'Australia'),
  ('SYD', 'Sydney Airport', 'Sydney', 'Australia'),
  ('BNE', 'Brisbane Airport', 'Brisbane', 'Australia'),
  ('MNL', 'Ninoy Aquino International Airport', 'Manila', 'Philippines'),
  ('CEB', 'Mactan-Cebu International Airport', 'Cebu', 'Philippines'),
  ('BKK', 'Suvarnabhumi Airport', 'Bangkok', 'Thailand'),
  ('DPS', 'Ngurah Rai International Airport', 'Denpasar (Bali)', 'Indonesia'),
  ('SGN', 'Tan Son Nhat International Airport', 'Ho Chi Minh City', 'Vietnam'),
  ('NRT', 'Narita International Airport', 'Tokyo', 'Japan'),
  ('SIN', 'Singapore Changi Airport', 'Singapore', 'Singapore'),
  ('KUL', 'Kuala Lumpur International Airport', 'Kuala Lumpur', 'Malaysia'),
  ('HKG', 'Hong Kong International Airport', 'Hong Kong', 'Hong Kong')
on conflict (iata) do nothing;

insert into routes (origin, destination, popularity) values
  ('MEL', 'MNL', 90),
  ('SYD', 'MNL', 85),
  ('MEL', 'BKK', 88),
  ('SYD', 'BKK', 86),
  ('MEL', 'DPS', 92),
  ('SYD', 'DPS', 94),
  ('BNE', 'DPS', 80),
  ('MEL', 'SGN', 70),
  ('MEL', 'NRT', 82),
  ('SYD', 'NRT', 84),
  ('MEL', 'HKG', 75),
  ('SYD', 'SIN', 78)
on conflict (origin, destination) do nothing;
