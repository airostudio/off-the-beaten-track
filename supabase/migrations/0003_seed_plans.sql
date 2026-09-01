-- Placeholder plan rows. Replace stripe_product_id/stripe_price_id with real
-- Stripe IDs after creating the products in the Stripe dashboard/CLI — the
-- app never hard-codes prices, it always reads from this table.
insert into subscription_plans (name, stripe_product_id, stripe_price_id, billing_interval, price, currency, search_limit, alerts_limit, early_access_hours, features)
values
  ('Monthly Membership', 'prod_replace_me_monthly', 'price_replace_me_monthly', 'month', 1499, 'aud', null, null, 0,
   '["Unlimited live search","Member fares first","Fare-drop alerts","Fare history & predictions","Mixed-cabin optimisation"]'),
  ('Annual Membership', 'prod_replace_me_annual', 'price_replace_me_annual', 'year', 11900, 'aud', null, null, 0,
   '["Everything in Monthly","2 months free vs monthly","Priority deal alerts"]'),
  ('Family Membership', 'prod_replace_me_family', 'price_replace_me_family', 'year', 17900, 'aud', null, null, 0,
   '["Everything in Annual","Up to 5 linked members","Shared travel preferences"]')
on conflict (stripe_price_id) do nothing;
