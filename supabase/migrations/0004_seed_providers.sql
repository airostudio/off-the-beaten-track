insert into providers (id, name, enabled, cost_per_query)
values ('mock', 'Demo Fares (Mock Provider)', true, 0)
on conflict (id) do nothing;

-- To grant yourself admin access after signing up, run:
--   insert into admin_users (user_id) values ('<your-auth-uid>');
