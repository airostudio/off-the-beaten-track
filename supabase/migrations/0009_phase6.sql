-- Phase 6: onboarding wizard support.
alter table travel_preferences add column if not exists trips_per_year int;
