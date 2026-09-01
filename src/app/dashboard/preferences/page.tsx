import { resolveViewer } from '@/lib/tiers';
import { createSupabaseServiceClient } from '@/lib/supabase/server';
import { PreferencesForm } from './PreferencesForm';

export default async function PreferencesPage() {
  const viewer = await resolveViewer();
  const service = createSupabaseServiceClient();
  const { data } = await service
    .from('travel_preferences')
    .select('*')
    .eq('user_id', viewer.userId ?? '')
    .maybeSingle();

  return (
    <PreferencesForm
      initial={
        data
          ? {
              homeAirport: data.home_airport,
              preferredCabin: data.preferred_cabin,
              longHaulCabin: data.long_haul_cabin,
              longHaulThresholdHours: data.long_haul_threshold_hours,
              maxStops: data.max_stops,
              minConnectionMinutes: data.min_connection_minutes,
            }
          : null
      }
    />
  );
}
