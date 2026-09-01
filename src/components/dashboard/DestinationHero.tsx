'use client';

import { useEffect, useState } from 'react';
import { DESTINATIONS, FALLBACK_DESTINATION, findDestination, pickImage, type Destination } from '@/lib/destinationImages';

const STORAGE_KEY = 'otbt_dashboard_destination';

export function DestinationHero({ initialCode }: { initialCode?: string | null }) {
  const [destination, setDestination] = useState<Destination>(() => findDestination(initialCode));
  const [image, setImage] = useState<string>(() => pickImage(findDestination(initialCode)));

  // Prefer whatever the viewer last picked on this device, once we're in the browser.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const dest = findDestination(saved);
        setDestination(dest);
        setImage(pickImage(dest));
      }
    } catch {
      // localStorage unavailable (private mode, etc) — fall back to server-provided destination
    }
  }, []);

  function selectDestination(dest: Destination) {
    setDestination(dest);
    setImage(pickImage(dest, Date.now()));
    try {
      window.localStorage.setItem(STORAGE_KEY, dest.code);
    } catch {
      // best-effort only
    }
  }

  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl">
      <div
        className="h-56 w-full bg-cover bg-center transition-all duration-700 sm:h-64"
        style={{ backgroundImage: `url(${image})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-white/70">
          {destination.code === FALLBACK_DESTINATION.code ? 'Pick where you\'re headed' : destination.region}
        </p>
        <h2 className="text-2xl font-bold text-white">
          {destination.code === FALLBACK_DESTINATION.code ? 'Where to next?' : destination.label}
        </h2>

        <div className="mt-3 flex flex-wrap gap-2">
          {DESTINATIONS.map((d) => (
            <button
              key={d.code}
              onClick={() => selectDestination(d)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                d.code === destination.code
                  ? 'bg-accent-500 text-white'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
