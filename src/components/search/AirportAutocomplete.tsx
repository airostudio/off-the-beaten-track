'use client';

import { useEffect, useRef, useState } from 'react';

interface AirportResult {
  iata: string;
  name: string;
  city: string;
  country: string;
}

export function AirportAutocomplete({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
}) {
  const [query, setQuery] = useState(value);
  const [results, setResults] = useState<AirportResult[]>([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => setQuery(value), [value]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const handle = setTimeout(() => {
      fetch(`/api/airports/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((json) => setResults(json.airports ?? []))
        .catch(() => setResults([]));
    }, 200);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function select(airport: AirportResult) {
    onChange(airport.iata);
    setQuery(airport.iata);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <label className="block text-sm">
        <span className="mb-1 block font-medium text-navy-700">{label}</span>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value.toUpperCase());
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          required
          maxLength={40}
          placeholder={placeholder}
          className="input"
          autoComplete="off"
        />
      </label>

      {open && results.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full min-w-[220px] overflow-y-auto rounded-xl border border-slate-200 bg-white py-1 shadow-card">
          {results.map((a) => (
            <li key={a.iata}>
              <button
                type="button"
                onClick={() => select(a)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50"
              >
                <span>
                  <span className="font-medium text-navy-900">{a.city}</span>
                  <span className="ml-1 text-slate-500">
                    {a.name} · {a.country}
                  </span>
                </span>
                <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-semibold text-slate-600">
                  {a.iata}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
