-- Owner/Manager finance section: real operating costs an admin enters
-- manually (hosting, tooling, etc — nothing the app can observe on its
-- own), shown alongside computed income/cost figures on /admin/owner.
create table if not exists admin_costs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null default 'other' check (category in ('hosting', 'api', 'tooling', 'marketing', 'payroll', 'other')),
  amount int not null, -- minor units
  currency text not null default 'AUD',
  recurring boolean not null default true, -- true = monthly recurring, false = one-off
  created_at timestamptz not null default now()
);

-- Grants typhoon.tall69@gmail.com the platform-owner (superadmin) role.
-- Safe to re-run: inserts if the profile exists and isn't already an admin
-- row, otherwise promotes the existing row to superadmin. No-ops quietly
-- if that email hasn't signed up yet — run again after they do.
insert into admin_users (user_id, role)
select id, 'superadmin' from profiles where email = 'typhoon.tall69@gmail.com'
on conflict (user_id) do update set role = 'superadmin';
