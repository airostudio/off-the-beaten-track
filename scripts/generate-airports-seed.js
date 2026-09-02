#!/usr/bin/env node
/**
 * Regenerates supabase/migrations/0006_all_world_airports.sql from the
 * OpenFlights Airports Database (public domain / open data), via the npm
 * package "airport-data" (unmodified upstream JSON — no manual editing of
 * airport records, ever).
 *
 * Usage:
 *   npm install --no-save airport-data
 *   node scripts/generate-airports-seed.js
 */
const path = require('path');
const fs = require('fs');

let data;
try {
  data = require('airport-data/airports.json');
} catch {
  console.error('Run `npm install --no-save airport-data` first.');
  process.exit(1);
}

function esc(s) {
  if (s === null || s === undefined) return null;
  return String(s).replace(/'/g, "''");
}

const withIata = data.filter((a) => a.iata && a.iata !== '\\N' && /^[A-Za-z]{3}$/.test(a.iata));

const seen = new Set();
const rows = [];
for (const a of withIata) {
  const code = a.iata.toUpperCase();
  if (seen.has(code)) continue; // first occurrence wins if the upstream data ever has a collision
  seen.add(code);
  const icao = a.icao && a.icao !== '\\N' && /^[A-Za-z0-9]{3,4}$/.test(a.icao) ? a.icao.toUpperCase() : null;
  const lat = Number.isFinite(a.latitude) ? a.latitude : null;
  const lon = Number.isFinite(a.longitude) ? a.longitude : null;
  rows.push({
    code,
    name: esc(a.name) || 'Unknown Airport',
    city: esc(a.city) || esc(a.name) || 'Unknown',
    country: esc(a.country) || 'Unknown',
    lat,
    lon,
    icao,
  });
}

const CHUNK = 500;
let sql = `-- Seed every airport in the world with a real IATA code (${rows.length} airports).
-- Source: OpenFlights Airports Database (public domain / open data), via the
-- npm package "airport-data" (unmodified upstream JSON). Regenerate with
-- scripts/generate-airports-seed.js if the upstream dataset changes.

alter table airports add column if not exists icao text;

`;

for (let i = 0; i < rows.length; i += CHUNK) {
  const chunk = rows.slice(i, i + CHUNK);
  const values = chunk
    .map((r) => {
      const lat = r.lat === null ? 'null' : r.lat;
      const lon = r.lon === null ? 'null' : r.lon;
      const icao = r.icao === null ? 'null' : `'${r.icao}'`;
      return `('${r.code}', '${r.name}', '${r.city}', '${r.country}', ${lat}, ${lon}, ${icao})`;
    })
    .join(',\n');

  sql += `insert into airports (iata, name, city, country, lat, lon, icao) values\n${values}\non conflict (iata) do update set\n  name = excluded.name,\n  city = excluded.city,\n  country = excluded.country,\n  lat = excluded.lat,\n  lon = excluded.lon,\n  icao = excluded.icao;\n\n`;
}

const outPath = path.join(__dirname, '..', 'supabase', 'migrations', '0006_all_world_airports.sql');
fs.writeFileSync(outPath, sql);
console.log(`Wrote ${rows.length} airports to ${outPath}`);
