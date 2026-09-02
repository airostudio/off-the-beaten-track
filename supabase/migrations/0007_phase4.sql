-- Phase 4: referral program, commission-sharing, and travel-vertical (hotels/
-- cars/insurance) affiliate tables.

-- ============================================================
-- REFERRAL PROGRAM (section 34)
-- ============================================================

alter table profiles add column if not exists referral_code text unique;
alter table profiles add column if not exists referred_by uuid references profiles(id);
-- A non-null future timestamp grants MEMBER-tier access without a paid
-- subscription — see resolveViewer() in src/lib/tiers.ts. Referral credits
-- stack by extending this date rather than replacing it.
alter table profiles add column if not exists membership_credit_expires_at timestamptz;

create table if not exists referrals (
  id uuid primary key default uuid_generate_v4(),
  referrer_id uuid not null references profiles(id) on delete cascade,
  referred_id uuid not null references profiles(id) on delete cascade,
  reward_days int not null default 30,
  status text not null default 'credited' check (status in ('pending', 'credited')),
  created_at timestamptz not null default now(),
  credited_at timestamptz,
  unique (referred_id) -- a user can only ever be credited as someone's referral once
);
create index if not exists idx_referrals_referrer on referrals(referrer_id);

alter table referrals enable row level security;
create policy "referrals_referrer_select" on referrals for select using (auth.uid() = referrer_id);

-- Backfill referral codes for any existing profiles (new ones get one from the trigger below).
update profiles set referral_code = upper(substr(id::text, 1, 8)) where referral_code is null;

-- Extends handle_new_user (0002) to also generate a referral code and, when
-- the signup carried a referral code in user metadata, credit both parties
-- 30 days of membership atomically.
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_referrer_id uuid;
  v_reward_days int := 30;
begin
  insert into public.profiles (id, email, tier, referral_code)
  values (new.id, new.email, 'FREE', upper(substr(new.id::text, 1, 8)))
  on conflict (id) do nothing;

  if new.raw_user_meta_data ? 'referred_by_code' then
    select id into v_referrer_id
    from public.profiles
    where referral_code = upper(new.raw_user_meta_data->>'referred_by_code')
      and id <> new.id;

    if v_referrer_id is not null then
      insert into public.referrals (referrer_id, referred_id, reward_days, status, credited_at)
      values (v_referrer_id, new.id, v_reward_days, 'credited', now())
      on conflict (referred_id) do nothing;

      update public.profiles
        set referred_by = v_referrer_id,
            membership_credit_expires_at = now() + (v_reward_days || ' days')::interval
        where id = new.id;

      update public.profiles
        set membership_credit_expires_at =
          greatest(coalesce(membership_credit_expires_at, now()), now()) + (v_reward_days || ' days')::interval
        where id = v_referrer_id;
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- ============================================================
-- COMMISSION SHARING (section 46)
-- ============================================================

alter table commissions add column if not exists platform_share numeric;
alter table commissions add column if not exists member_share numeric;

-- ============================================================
-- TRAVEL VERTICALS: hotels / cars / insurance (section 33, item 4-6)
-- ============================================================

create table if not exists travel_products (
  id uuid primary key default uuid_generate_v4(),
  category text not null check (category in ('hotel', 'car_rental', 'insurance')),
  name text not null,
  description text,
  destination_city text,
  destination_country text,
  partner text not null,
  affiliate_url text not null,
  public_price int, -- minor units, nullable: not every listing has a headline price
  member_price int,
  currency text not null default 'AUD',
  image_url text,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_travel_products_category on travel_products(category, active);
