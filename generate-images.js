#!/usr/bin/env node
// ============================================================
// Off The Beaten Track — AI Image Generator
// Uses Google Gemini Imagen 3 (gemini-imagen-pro) for
// ultra-realistic, true-to-life travel photography
//
// Usage:
//   GEMINI_API_KEY=your_key node generate-images.js
//   GEMINI_API_KEY=your_key node generate-images.js --force   # re-generate all
// ============================================================

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const FORCE = process.argv.includes('--force');
const IMAGES_DIR = path.join(__dirname, 'images');

if (!GEMINI_API_KEY) {
  console.error('\n❌  GEMINI_API_KEY not set.');
  console.error('    Usage: GEMINI_API_KEY=your_key node generate-images.js\n');
  process.exit(1);
}

if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// ---- Filename helper (must match app.js) ----
function nameToFilename(name) {
  return name
    .toLowerCase()
    .replace(/['''`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '.jpg';
}

// ---- Generate one image ----
async function generateImage(name, imagePrompt) {
  const filename = nameToFilename(name);
  const filepath = path.join(IMAGES_DIR, filename);

  if (!FORCE && fs.existsSync(filepath)) {
    console.log(`  ✅  Skipping (exists): ${filename}`);
    return;
  }

  const prompt = [
    'Ultra-realistic travel photography,',
    imagePrompt,
    'Professional DSLR photo, natural lighting, vivid colors, sharp focus,',
    'cinematic composition, 16:9 aspect ratio, no text, no watermarks,',
    'National Geographic quality.'
  ].join(' ');

  try {
    // Primary: Imagen 3 via Gemini AI (gemini-imagen-pro quality)
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: '16:9',
        outputMimeType: 'image/jpeg',
        personGeneration: 'allow_adult',
      },
    });

    if (response.generatedImages?.length > 0) {
      const imageBytes = response.generatedImages[0].image.imageBytes;
      fs.writeFileSync(filepath, Buffer.from(imageBytes, 'base64'));
      console.log(`  🖼️   Saved: images/${filename}`);
    } else {
      console.warn(`  ⚠️   No image returned for: ${name}`);
    }
  } catch (err) {
    console.error(`  ❌  Failed [${name}]: ${err.message}`);
  }
}

// ---- Rate-limit helper ----
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- Load data.js in a VM sandbox ----
function loadData() {
  const src = fs.readFileSync(path.join(__dirname, 'js', 'data.js'), 'utf8');
  const ctx = { LOCATIONS: {}, EVENTS: [], LOCATION_COORDS: {} };
  vm.createContext(ctx);
  // Strip const/let/var so assignments land on the context object
  vm.runInContext(src.replace(/\b(const|let|var)\s+/g, ''), ctx);
  return ctx;
}

// ---- Main ----
async function main() {
  console.log('\n🌍  Off The Beaten Track — Gemini Imagen Generator');
  console.log('    Model: imagen-3.0-generate-002 (Gemini AI)\n');

  const { LOCATIONS, EVENTS } = loadData();

  // Collect all items that need images
  const items = [];

  for (const [country, regions] of Object.entries(LOCATIONS)) {
    for (const [region, data] of Object.entries(regions)) {
      for (const gem of data.gems) {
        if (gem.imagePrompt) {
          items.push({ name: gem.name, imagePrompt: gem.imagePrompt, label: `${region}, ${country}` });
        }
      }
    }
  }

  for (const event of EVENTS) {
    if (event.imagePrompt) {
      items.push({ name: event.name, imagePrompt: event.imagePrompt, label: event.location });
    }
  }

  console.log(`  Found ${items.length} packages to generate images for.\n`);

  let done = 0;
  for (const item of items) {
    process.stdout.write(`  [${++done}/${items.length}] ${item.name} (${item.label})\n`);
    await generateImage(item.name, item.imagePrompt);
    // Respect Imagen rate limits: ~1 req/2s on free tier
    await sleep(2200);
  }

  console.log(`\n✨  Done! ${done} images processed → ./images/\n`);
}

main().catch((err) => {
  console.error('\n💥  Fatal error:', err.message);
  process.exit(1);
});
