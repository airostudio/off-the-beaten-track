#!/usr/bin/env node
// ============================================================
// Off The Beaten Track — AI Image Generator
// Uses Google Gemini Imagen 3 for ultra-realistic travel photography
//
// Usage:
//   node generate-images.js
//   node generate-images.js --force   # re-generate all
// ============================================================

const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const FORCE = process.argv.includes('--force');
const IMAGES_DIR = path.join(__dirname, 'images');

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

// ---- Use Gemini text model to craft an intelligent, location-specific scene prompt ----
async function craftScenePrompt(name, imagePrompt, location) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{
        role: 'user',
        parts: [{ text: `You are a professional travel photographer preparing a shot list.

Tour/Destination: "${name}"
Location: ${location}
Context: ${imagePrompt}

Write a single vivid scene description (2–3 sentences) for a travel photograph that captures the most iconic, recognisable visual elements of this specific place: its unique landscape, architecture, cultural details, colours, atmosphere, and time of day. Be concrete and geographically precise — describe what you would actually see standing there. Output only the scene description, no extra commentary.` }]
      }]
    });
    return response.text?.trim() || imagePrompt;
  } catch (err) {
    // If text model fails, fall back to original prompt
    console.warn(`  ⚠️   Scene prompt generation failed for "${name}", using original. (${err.message})`);
    return imagePrompt;
  }
}

// ---- Generate one image ----
async function generateImage(name, imagePrompt, location) {
  const filename = nameToFilename(name);
  const filepath = path.join(IMAGES_DIR, filename);

  if (!FORCE && fs.existsSync(filepath)) {
    console.log(`  ✅  Skipping (exists): ${filename}`);
    return;
  }

  // Let Gemini craft the best scene description for this specific place
  process.stdout.write(`       ✨ Crafting scene prompt...\n`);
  const scenePrompt = await craftScenePrompt(name, imagePrompt, location);

  const prompt = [
    'Ultra-realistic travel photography.',
    scenePrompt,
    'Professional DSLR photo, natural lighting, vivid colours, sharp focus,',
    'cinematic composition, 16:9 aspect ratio, no text, no watermarks,',
    'National Geographic quality.'
  ].join(' ');

  try {
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
    await generateImage(item.name, item.imagePrompt, item.label);
    // Respect Imagen rate limits: ~1 req/2s on free tier (extra 800ms for text model call)
    await sleep(3000);
  }

  console.log(`\n✨  Done! ${done} images processed → ./images/\n`);
}

main().catch((err) => {
  console.error('\n💥  Fatal error:', err.message);
  process.exit(1);
});
