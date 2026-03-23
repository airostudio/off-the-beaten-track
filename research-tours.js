#!/usr/bin/env node
// ============================================================
// Off The Beaten Track — Weekly Tour Research Script
//
// Fetches latest blogs & tour recommendations from
// travelandtourworld.com, uses Gemini to extract structured
// tour data, then merges new entries into js/data.js.
//
// Usage:
//   node research-tours.js
//   node research-tours.js --dry-run   # preview only
//   node research-tours.js --limit 5   # cap articles processed
// ============================================================

const { GoogleGenAI } = require('@google/genai');
const fs   = require('fs');
const path = require('path');
const vm   = require('vm');
const http  = require('https');
const zlib  = require('zlib');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DRY_RUN  = process.argv.includes('--dry-run');
const LIMIT_IDX = process.argv.indexOf('--limit');
const MAX_ARTICLES = LIMIT_IDX !== -1 ? parseInt(process.argv[LIMIT_IDX + 1], 10) : 20;

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// ---- Request helpers ----
const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Referer': 'https://www.google.com/',
};

function fetchUrl(url, extraHeaders = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      headers: { ...BROWSER_HEADERS, ...extraHeaders },
      timeout: 15000,
    };
    const req = http.get(url, options, (res) => {
      // Follow redirects (up to 5 hops)
      if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location) {
        return fetchUrl(res.headers.location, extraHeaders).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
      }
      const chunks = [];
      const pipe = res.headers['content-encoding'] === 'gzip'
        ? res.pipe(zlib.createGunzip())
        : res.headers['content-encoding'] === 'br'
        ? res.pipe(zlib.createBrotliDecompress())
        : res.headers['content-encoding'] === 'deflate'
        ? res.pipe(zlib.createInflate())
        : res;
      pipe.on('data', d => chunks.push(d));
      pipe.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
      pipe.on('error', reject);
    });
    req.on('timeout', () => { req.destroy(); reject(new Error(`Timeout: ${url}`)); });
    req.on('error', reject);
  });
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ---- RSS / sitemap scraping ----
const FEED_URLS = [
  'https://travelandtourworld.com/feed/',
  'https://travelandtourworld.com/feed/rss2/',
  'https://travelandtourworld.com/category/tours/feed/',
  'https://travelandtourworld.com/category/travel-tips/feed/',
  'https://travelandtourworld.com/category/destinations/feed/',
];

function extractTagContent(xml, tag) {
  const results = [];
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'gi');
  let m;
  while ((m = re.exec(xml)) !== null) {
    results.push(m[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim());
  }
  return results;
}

function extractLinks(html, baseUrl) {
  const links = new Set();
  const hrefRe = /href=["']([^"']+)["']/g;
  let m;
  while ((m = hrefRe.exec(html)) !== null) {
    const href = m[1];
    if (href.startsWith('http') && href.includes('travelandtourworld.com')) {
      // Only include article-like URLs (has a path segment, not just categories)
      const parsed = new URL(href);
      const segments = parsed.pathname.split('/').filter(Boolean);
      if (segments.length >= 1 && !['category', 'tag', 'author', 'page'].includes(segments[0])) {
        links.add(href.split('#')[0].split('?')[0]);
      }
    }
  }
  return [...links];
}

async function fetchRSSArticles() {
  const articles = []; // { title, url, summary }

  for (const feedUrl of FEED_URLS) {
    try {
      console.log(`  📡 Fetching feed: ${feedUrl}`);
      const xml = await fetchUrl(feedUrl);
      const titles = extractTagContent(xml, 'title');
      const links  = extractTagContent(xml, 'link');
      const descs  = extractTagContent(xml, 'description');

      for (let i = 0; i < Math.min(titles.length, links.length); i++) {
        const url = links[i];
        if (url && url.startsWith('http') && url.includes('travelandtourworld.com')) {
          articles.push({
            title: titles[i] || '',
            url: url.split('#')[0],
            summary: (descs[i] || '').replace(/<[^>]+>/g, '').trim().slice(0, 500),
          });
        }
      }
      await sleep(1500);
    } catch (err) {
      console.warn(`  ⚠️  Feed error (${feedUrl}): ${err.message}`);
    }
  }

  // Deduplicate by URL
  const seen = new Set();
  return articles.filter(a => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
}

async function fetchArticleBody(url) {
  try {
    const html = await fetchUrl(url);
    // Strip scripts, styles, nav, footer etc and return readable text
    const stripped = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<nav[\s\S]*?<\/nav>/gi, '')
      .replace(/<footer[\s\S]*?<\/footer>/gi, '')
      .replace(/<header[\s\S]*?<\/header>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{3,}/g, '\n')
      .trim()
      .slice(0, 8000); // Gemini context limit protection
    return stripped;
  } catch (err) {
    return null;
  }
}

// ---- Gemini extraction ----
async function extractToursFromArticle(article, bodyText) {
  const content = bodyText || article.summary;
  if (!content || content.length < 100) return [];

  const prompt = `You are a travel data curator for a website that lists off-the-beaten-track tours and hidden gem destinations.

Analyse this travel article and extract any specific tours, day trips, or destinations that are clearly recommended or described.

Article title: "${article.title}"
Article URL: ${article.url}
Article content:
---
${content}
---

For each distinct tour or destination you find, output a JSON array of objects. Each object must have EXACTLY these fields:
{
  "name": "Short descriptive name (max 8 words)",
  "country": "Country name",
  "state": "Region, state, or province (empty string if unknown)",
  "area": "Local area or district (empty string if unknown)",
  "description": "2–3 sentence description of what makes this special (80–120 words)",
  "category": one of "nature" | "tours" | "food" | "culture",
  "type": one of "tour" | "destination",
  "rating": a realistic number between 4.2 and 5.0,
  "reviews": a realistic integer between 200 and 8000,
  "price": e.g. "Free" | "$25" | "$120" | "From $45",
  "platform": one of "tripadvisor" | "getyourguide" | "withlocals",
  "imagePrompt": "Detailed 1–2 sentence description of what an ideal travel photo of this place would look like — specific colours, landmarks, atmosphere, time of day"
}

Rules:
- Only include tours/destinations EXPLICITLY mentioned or recommended in the article
- Minimum quality threshold: the article must give enough detail to write a meaningful description
- If no qualifying tours are found, return an empty array []
- Output ONLY valid JSON array, no markdown, no commentary`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: { responseMimeType: 'application/json' },
    });

    const raw = response.text?.trim() || '[]';
    const parsed = JSON.parse(raw.replace(/^```json\n?|```$/g, ''));
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn(`  ⚠️  Gemini extraction failed: ${err.message}`);
    return [];
  }
}

// ---- Load & save data.js ----
function loadData() {
  const src = fs.readFileSync(path.join(__dirname, 'js', 'data.js'), 'utf8');
  const ctx = { LOCATIONS: {}, EVENTS: [], LOCATION_COORDS: {} };
  vm.createContext(ctx);
  vm.runInContext(src.replace(/\b(const|let|var)\s+/g, ''), ctx);
  return ctx;
}

function gemNameKey(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function mergeNewGems(LOCATIONS, newGems) {
  let added = 0;

  // Build a set of existing names for dedup
  const existing = new Set();
  for (const states of Object.values(LOCATIONS)) {
    for (const data of Object.values(states)) {
      for (const gem of data.gems) existing.add(gemNameKey(gem.name));
    }
  }

  for (const gem of newGems) {
    const country = gem.country?.trim();
    const state   = gem.state?.trim() || 'General';
    const area    = gem.area?.trim() || state;

    if (!country) continue;
    if (existing.has(gemNameKey(gem.name))) continue; // duplicate

    if (!LOCATIONS[country]) {
      LOCATIONS[country] = {};
    }
    if (!LOCATIONS[country][state]) {
      LOCATIONS[country][state] = { areas: [], gems: [] };
    }
    if (area && !LOCATIONS[country][state].areas.includes(area)) {
      LOCATIONS[country][state].areas.push(area);
    }

    // Build a clean gem entry in the same format as the rest of data.js
    LOCATIONS[country][state].gems.push({
      name:        gem.name,
      description: gem.description,
      category:    gem.category || 'tours',
      rating:      parseFloat(gem.rating) || 4.5,
      reviews:     parseInt(gem.reviews)  || 500,
      price:       gem.price || 'Varies',
      platform:    gem.platform || 'getyourguide',
      image:       categoryEmoji(gem.category),
      type:        gem.type || 'tour',
      area:        area,
      imagePrompt: gem.imagePrompt || gem.name,
    });

    existing.add(gemNameKey(gem.name));
    added++;
  }

  return added;
}

function categoryEmoji(cat) {
  return { nature: '🌿', tours: '🗺️', food: '🍜', culture: '🏛️' }[cat] || '🗺️';
}

function buildDataJs(LOCATIONS, EVENTS, LOCATION_COORDS) {
  const locsJson  = JSON.stringify(LOCATIONS, null, 2)
    .replace(/"([a-zA-Z_][a-zA-Z0-9_]*)":/g, '$1:'); // unquote simple keys for style parity
  const eventsJson = JSON.stringify(EVENTS, null, 2);
  const coordsJson = JSON.stringify(LOCATION_COORDS, null, 2);

  return `// ============================================================
// Off The Beaten Track - Hidden Gems Database
// Auto-updated by research-tours.js — Last run: ${new Date().toISOString().slice(0, 10)}
// ============================================================

const LOCATIONS = ${locsJson};

const EVENTS = ${eventsJson};

// Location-to-coordinate mapping for geolocation matching
const LOCATION_COORDS = ${coordsJson};
`;
}

// ---- Main ----
async function main() {
  console.log('\n🌍  Off The Beaten Track — Weekly Tour Research');
  console.log(`    Source: travelandtourworld.com`);
  console.log(`    Mode: ${DRY_RUN ? 'DRY RUN (no file changes)' : 'LIVE'}`);
  console.log(`    Max articles: ${MAX_ARTICLES}\n`);

  // 1. Fetch article list from RSS feeds
  console.log('📰 Fetching RSS feeds...');
  let articles = await fetchRSSArticles();

  if (articles.length === 0) {
    // Fallback: scrape the homepage directly
    console.log('  ⚠️  No RSS articles found, trying homepage...');
    try {
      const html = await fetchUrl('https://travelandtourworld.com/');
      const links = extractLinks(html, 'https://travelandtourworld.com');
      articles = links.slice(0, MAX_ARTICLES).map(url => ({ title: '', url, summary: '' }));
    } catch (err) {
      console.error(`  ❌  Homepage fetch failed: ${err.message}`);
    }
  }

  articles = articles.slice(0, MAX_ARTICLES);
  console.log(`  Found ${articles.length} articles to process.\n`);

  // 2. Extract tours from each article
  const allNewGems = [];
  let artIdx = 0;

  for (const article of articles) {
    artIdx++;
    const label = article.title || article.url;
    process.stdout.write(`  [${artIdx}/${articles.length}] ${label.slice(0, 70)}\n`);

    let body = null;
    if (article.url) {
      process.stdout.write(`         Fetching article body...\n`);
      body = await fetchArticleBody(article.url);
      await sleep(1200); // polite crawling
    }

    process.stdout.write(`         Extracting tours via Gemini...\n`);
    const gems = await extractToursFromArticle(article, body);

    if (gems.length > 0) {
      console.log(`         ✅ Found ${gems.length} tour(s): ${gems.map(g => g.name).join(', ')}`);
      allNewGems.push(...gems);
    } else {
      console.log(`         — No qualifying tours found.`);
    }

    await sleep(2000); // Gemini rate limit
  }

  console.log(`\n📊 Total new tours extracted: ${allNewGems.length}`);

  if (allNewGems.length === 0) {
    console.log('   Nothing new to add. Done.\n');
    return;
  }

  // 3. Merge into data.js
  const { LOCATIONS, EVENTS, LOCATION_COORDS } = loadData();
  const added = mergeNewGems(LOCATIONS, allNewGems);

  console.log(`   New unique tours added: ${added}`);
  console.log(`   Skipped duplicates: ${allNewGems.length - added}`);

  if (DRY_RUN) {
    console.log('\n🔍  DRY RUN — no changes written.\n');
    console.log('New gems that would be added:');
    allNewGems.forEach(g => console.log(`  • ${g.name} (${g.country})`));
    return;
  }

  if (added === 0) {
    console.log('   All extracted tours already exist in database. Done.\n');
    return;
  }

  // 4. Write updated data.js
  const dataPath = path.join(__dirname, 'js', 'data.js');
  const newContent = buildDataJs(LOCATIONS, EVENTS, LOCATION_COORDS);
  fs.writeFileSync(dataPath, newContent, 'utf8');

  console.log(`\n✅  js/data.js updated with ${added} new tour(s).`);
  console.log('   Run "node generate-images.js" to generate images for new entries.\n');
}

main().catch(err => {
  console.error('\n💥  Fatal error:', err.message);
  process.exit(1);
});
