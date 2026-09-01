-- Off the Beaten Track: Phase 1 core schema
-- Members-first flight & holiday comparison platform.
-- All monetary values stored as integer minor units (cents) unless noted.

create extension if not exists "uuid-ossp";

-- ============================================================
-- USERS & PROFILES
-- ============================================================

-- profiles extends auth.users (Supabase managed) 1:1
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  tier text not null default 'FREE' check (tier in ('GUEST', 'FREE', 'MEMBER')),
  home_airport text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists travel_preferences (
  user_id uuid primary key references profiles(id) on delete cascade,
  home_airport text,
  preferred_airlines text[] default '{}',
  avoided_airlines text[] default '{}',
  preferred_cabin text default 'ECONOMY' check (preferred_cabin in ('ECONOMY','PREMIUM_ECONOMY','BUSINESS','FIRST')),
  long_haul_cabin text default 'PREMIUM_ECONOMY',
  long_haul_threshold_hours numeric default 6,
  max_stops int default 2,
  min_connection_minutes int default 60,
  max_connection_minutes int default 240,
  favourite_destinations text[] default '{}',
  frequent_flyer_programs jsonb default '[]',
  preferred_travel_months int[] default '{}',
  updated_at timestamptz not null default now()
);

-- ============================================================
-- SUBSCRIPTIONS (Stripe-backed, server/webhook authoritative)
-- ============================================================

create table if not exists subscription_plans (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  stripe_product_id text not null,
  stripe_price_id text not null unique,
  billing_interval text not null check (billing_interval in ('month','year')),
  price int not null, -- minor units
  currency text not null default 'aud',
  active boolean not null default true,
  search_limit int, -- null = unlimited
  alerts_limit int,
  early_access_hours numeric not null default 0,
  features jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table if not exists subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  plan_id uuid references subscription_plans(id),
  stripe_customer_id text not null,
  stripe_subscription_id text unique,
  status text not null check (status in ('trialing','active','past_due','canceled','incomplete','incomplete_expired','unpaid','paused')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  grace_period_ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_subscriptions_user on subscriptions(user_id);

create table if not exists webhook_events (
  id text primary key, -- stripe event id, enforces idempotency
  type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default now()
);

-- ============================================================
-- PROVIDERS (flight data sources)
-- ============================================================

create table if not exists providers (
  id text primary key, -- e.g. 'mock', 'duffel', 'amadeus'
  name text not null,
  enabled boolean not null default true,
  cost_per_query numeric default 0,
  avg_latency_ms int,
  failure_rate numeric default 0,
  created_at timestamptz not null default now()
);

create table if not exists provider_api_logs (
  id uuid primary key default uuid_generate_v4(),
  provider_id text references providers(id),
  request jsonb,
  response_status int,
  latency_ms int,
  error text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- AIRPORTS / AIRLINES / ROUTES (reference data)
-- ============================================================

create table if not exists airports (
  iata text primary key,
  name text not null,
  city text not null,
  country text not null,
  lat numeric,
  lon numeric
);

create table if not exists airlines (
  iata text primary key,
  name text not null,
  rating numeric
);

create table if not exists routes (
  id uuid primary key default uuid_generate_v4(),
  origin text references airports(iata),
  destination text references airports(iata),
  popularity int default 0,
  unique(origin, destination)
);

-- ============================================================
-- SEARCHES / SAVED SEARCHES / FLIGHT OFFERS
-- ============================================================

create table if not exists searches (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  session_id text, -- for guests, cookie/anon id
  tier text not null check (tier in ('GUEST','FREE','MEMBER')),
  origin text not null,
  destination text not null,
  departure_date date not null,
  return_date date,
  cabin text not null default 'ECONOMY',
  passengers int not null default 1,
  ip_address text,
  created_at timestamptz not null default now()
);
create index if not exists idx_searches_user on searches(user_id);
create index if not exists idx_searches_created on searches(created_at);

create table if not exists saved_searches (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  label text,
  origin text not null,
  destination text not null,
  departure_date date,
  return_date date,
  cabin text default 'ECONOMY',
  flexible_days int default 0,
  created_at timestamptz not null default now()
);

create table if not exists flight_offers (
  id uuid primary key default uuid_generate_v4(),
  search_id uuid references searches(id) on delete cascade,
  provider_id text references providers(id),
  airline text not null,
  flight_number text,
  origin text not null,
  destination text not null,
  departure_at timestamptz not null,
  arrival_at timestamptz not null,
  duration_minutes int not null,
  stops int not null default 0,
  cabin text not null,
  fare_class text,
  public_price int not null, -- minor units
  member_price int, -- minor units, null if no genuine member rate exists
  currency text not null default 'AUD',
  baggage jsonb,
  cancellation_policy text,
  changes_policy text,
  booking_url text,
  affiliate_commission numeric,
  offer_expires_at timestamptz,
  last_verified_at timestamptz not null default now(),
  value_score numeric,
  created_at timestamptz not null default now()
);
create index if not exists idx_flight_offers_search on flight_offers(search_id);

-- ============================================================
-- FARE INTELLIGENCE (history + audited savings evidence)
-- ============================================================

create table if not exists fare_observations (
  id uuid primary key default uuid_generate_v4(),
  route_key text not null, -- e.g. 'MEL-MNL'
  origin text not null,
  destination text not null,
  outbound_date date not null,
  inbound_date date,
  airline text,
  cabin text not null default 'ECONOMY',
  provider_id text references providers(id),
  price int not null,
  currency text not null default 'AUD',
  captured_at timestamptz not null default now()
);
create index if not exists idx_fare_obs_route on fare_observations(route_key, captured_at);

-- Audit trail proving every member-savings marketing claim is real.
create table if not exists fare_savings (
  id uuid primary key default uuid_generate_v4(),
  route text not null,
  airline text,
  cabin text not null default 'ECONOMY',
  public_fare int not null,
  member_fare int not null,
  saving_amount int not null,
  saving_percentage numeric not null,
  public_provider text,
  member_provider text,
  captured_at timestamptz not null default now(),
  expires_at timestamptz,
  verification_status text not null default 'unverified' check (verification_status in ('unverified','verified','expired')),
  constraint fare_savings_amount_check check (member_fare <= public_fare)
);

-- ============================================================
-- DEALS & MEMBER-FIRST RELEASE RULES
-- ============================================================

create table if not exists deals (
  id uuid primary key default uuid_generate_v4(),
  route text not null,
  origin text not null,
  destination text not null,
  outbound_date date,
  inbound_date date,
  airline text,
  cabin text not null default 'ECONOMY',
  public_price int not null,
  member_price int,
  historical_average int,
  discount_percentage numeric,
  deal_score numeric,
  region text,
  featured boolean not null default false,
  discovered_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists deal_release_rules (
  id uuid primary key default uuid_generate_v4(),
  tier text not null check (tier in ('GUEST','FREE','MEMBER')),
  release_delay_minutes int not null default 0,
  notification_priority int not null default 0,
  allow_booking boolean not null default true,
  allow_price_visibility boolean not null default true
);
insert into deal_release_rules (tier, release_delay_minutes, notification_priority, allow_booking, allow_price_visibility)
values
  ('MEMBER', 0, 100, true, true),
  ('FREE', 720, 50, true, true),
  ('GUEST', 1440, 10, true, false)
on conflict do nothing;

-- ============================================================
-- ALERTS & NOTIFICATIONS
-- ============================================================

create table if not exists alerts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  origin text not null,
  destination text not null,
  max_price int,
  cabin text default 'ECONOMY',
  travel_month date,
  flexible_days int default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  alert_id uuid references alerts(id) on delete set null,
  deal_id uuid references deals(id) on delete set null,
  channel text not null default 'in_app' check (channel in ('email','push','in_app','sms')),
  title text not null,
  body text,
  read boolean not null default false,
  sent_at timestamptz not null default now()
);

-- ============================================================
-- BOOKINGS, AFFILIATE & COMMISSION SHARING
-- ============================================================

create table if not exists bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  offer_id uuid references flight_offers(id),
  status text not null default 'redirected' check (status in ('redirected','confirmed','cancelled')),
  amount int,
  currency text default 'AUD',
  booked_at timestamptz not null default now()
);

create table if not exists affiliate_clicks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references profiles(id) on delete set null,
  offer_id uuid references flight_offers(id),
  partner text not null,
  campaign text,
  estimated_commission numeric,
  confirmed_commission numeric,
  created_at timestamptz not null default now()
);

create table if not exists commissions (
  id uuid primary key default uuid_generate_v4(),
  affiliate_click_id uuid references affiliate_clicks(id) on delete cascade,
  booking_id uuid references bookings(id),
  amount numeric not null,
  currency text default 'AUD',
  status text not null default 'pending' check (status in ('pending','confirmed','paid','void')),
  created_at timestamptz not null default now()
);

create table if not exists member_rewards (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) on delete cascade,
  commission numeric not null,
  member_reward numeric not null,
  platform_margin numeric not null,
  status text not null default 'pending' check (status in ('pending','credited','paid')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- ADMIN & AUDIT
-- ============================================================

create table if not exists admin_users (
  user_id uuid primary key references profiles(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin','superadmin')),
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default uuid_generate_v4(),
  actor_id uuid references profiles(id),
  action text not null,
  entity text,
  entity_id text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles enable row level security;
alter table travel_preferences enable row level security;
alter table subscriptions enable row level security;
alter table searches enable row level security;
alter table saved_searches enable row level security;
alter table alerts enable row level security;
alter table notifications enable row level security;
alter table bookings enable row level security;
alter table admin_users enable row level security;

create policy "profiles_self_select" on profiles for select using (auth.uid() = id);
create policy "profiles_self_update" on profiles for update using (auth.uid() = id);

create policy "travel_prefs_self" on travel_preferences for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "subscriptions_self_select" on subscriptions for select using (auth.uid() = user_id);

create policy "searches_self_select" on searches for select using (auth.uid() = user_id);
create policy "searches_self_insert" on searches for insert with check (auth.uid() = user_id or user_id is null);

create policy "saved_searches_self" on saved_searches for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "alerts_self" on alerts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "notifications_self" on notifications for select using (auth.uid() = user_id);

create policy "bookings_self_select" on bookings for select using (auth.uid() = user_id);

create policy "admin_users_self_select" on admin_users for select using (auth.uid() = user_id);

-- Public/reference tables (deals, fare_savings, subscription_plans, airports, airlines, routes,
-- flight_offers, fare_observations) are readable via the server using the service role key only;
-- no public RLS policies are defined so anon/authenticated clients cannot read them directly.
-- All reads for those tables must go through server-side API routes that apply tier-based rules.
