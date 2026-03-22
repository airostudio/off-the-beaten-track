// ============================================================
// Off The Beaten Track - Main Application
// ============================================================

let currentCategory = 'all';
let currentPlatform = 'all';
let userLocation = null;
let userCountry = null;

// ---- Initialization ----
document.addEventListener('DOMContentLoaded', () => {
  populateCountryDropdown();
  detectLocation();
  renderFeaturedDestinations();
  renderTours();
  renderEvents();
  setupNavbar();
  setupMobileNav();
});

// ---- Geolocation Detection ----
function detectLocation() {
  const banner = document.getElementById('locationBanner');
  const text = document.getElementById('locationText');

  if (!navigator.geolocation) {
    text.textContent = 'Location detection not available. Search manually below.';
    showDefaultNearYou();
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      reverseGeocode(latitude, longitude);
    },
    () => {
      text.textContent = 'Location access denied. Showing global hidden gems.';
      showDefaultNearYou();
    },
    { timeout: 8000 }
  );
}

function reverseGeocode(lat, lng) {
  const text = document.getElementById('locationText');

  // Find nearest country from our database
  let nearestCountry = null;
  let minDist = Infinity;

  for (const [country, coords] of Object.entries(LOCATION_COORDS)) {
    const dist = Math.sqrt(
      Math.pow(lat - coords.lat, 2) + Math.pow(lng - coords.lng, 2)
    );
    if (dist < minDist) {
      minDist = dist;
      nearestCountry = country;
    }
  }

  userCountry = nearestCountry;
  userLocation = { lat, lng };

  text.innerHTML = `Showing hidden gems near <strong>${nearestCountry}</strong>`;

  // Pre-select the country in search
  const countrySelect = document.getElementById('searchCountry');
  for (let i = 0; i < countrySelect.options.length; i++) {
    if (countrySelect.options[i].value === nearestCountry) {
      countrySelect.selectedIndex = i;
      updateStates();
      break;
    }
  }

  renderNearYou(nearestCountry);
}

function showDefaultNearYou() {
  // Show a mix of gems from all countries
  const allGems = getAllGems();
  const shuffled = allGems.sort(() => Math.random() - 0.5).slice(0, 6);
  const grid = document.getElementById('nearYouGrid');
  const subtitle = document.getElementById('nearYouSubtitle');
  subtitle.textContent = 'Popular hidden gems from around the world';
  grid.innerHTML = shuffled.map(gem => createGemCard(gem)).join('');
}

function renderNearYou(country) {
  const gems = getGemsByCountry(country);
  const grid = document.getElementById('nearYouGrid');
  const subtitle = document.getElementById('nearYouSubtitle');
  subtitle.textContent = `Top off-the-beaten-track experiences in ${country}`;
  grid.innerHTML = gems.slice(0, 6).map(gem => createGemCard(gem)).join('');
}

// ---- Data Helpers ----
function getAllGems() {
  const gems = [];
  for (const [country, states] of Object.entries(LOCATIONS)) {
    for (const [state, data] of Object.entries(states)) {
      for (const gem of data.gems) {
        gems.push({ ...gem, country, state });
      }
    }
  }
  return gems;
}

function getGemsByCountry(country) {
  const gems = [];
  if (!LOCATIONS[country]) return gems;
  for (const [state, data] of Object.entries(LOCATIONS[country])) {
    for (const gem of data.gems) {
      gems.push({ ...gem, country, state });
    }
  }
  return gems;
}

function getGemsByState(country, state) {
  if (!LOCATIONS[country] || !LOCATIONS[country][state]) return [];
  return LOCATIONS[country][state].gems.map(g => ({ ...g, country, state }));
}

function getGemsByArea(country, state, area) {
  return getGemsByState(country, state).filter(g => g.area === area);
}

// ---- Search & Dropdowns ----
function populateCountryDropdown() {
  const select = document.getElementById('searchCountry');
  for (const country of Object.keys(LOCATIONS)) {
    const opt = document.createElement('option');
    opt.value = country;
    opt.textContent = country;
    select.appendChild(opt);
  }
}

function updateStates() {
  const country = document.getElementById('searchCountry').value;
  const stateSelect = document.getElementById('searchState');
  const regionSelect = document.getElementById('searchRegion');

  stateSelect.innerHTML = '<option value="">Select State</option>';
  regionSelect.innerHTML = '<option value="">Select Area</option>';

  if (country && LOCATIONS[country]) {
    for (const state of Object.keys(LOCATIONS[country])) {
      const opt = document.createElement('option');
      opt.value = state;
      opt.textContent = state;
      stateSelect.appendChild(opt);
    }
  }
}

function updateRegions() {
  const country = document.getElementById('searchCountry').value;
  const state = document.getElementById('searchState').value;
  const regionSelect = document.getElementById('searchRegion');

  regionSelect.innerHTML = '<option value="">Select Area</option>';

  if (country && state && LOCATIONS[country] && LOCATIONS[country][state]) {
    for (const area of LOCATIONS[country][state].areas) {
      const opt = document.createElement('option');
      opt.value = area;
      opt.textContent = area;
      regionSelect.appendChild(opt);
    }
  }
}

function performSearch() {
  const country = document.getElementById('searchCountry').value;
  const state = document.getElementById('searchState').value;
  const area = document.getElementById('searchRegion').value;

  if (!country) {
    alert('Please select a country to explore.');
    return;
  }

  let results = [];
  let locationName = country;

  if (area && state) {
    results = getGemsByArea(country, state, area);
    locationName = `${area}, ${state}, ${country}`;
  } else if (state) {
    results = getGemsByState(country, state);
    locationName = `${state}, ${country}`;
  } else {
    results = getGemsByCountry(country);
  }

  // Add matching events
  const matchingEvents = EVENTS.filter(e => {
    if (area) return e.country === country && e.state === state;
    if (state) return e.country === country && e.state === state;
    return e.country === country;
  });

  displaySearchResults(results, matchingEvents, locationName);
}

function displaySearchResults(gems, events, locationName) {
  const section = document.getElementById('searchResults');
  const title = document.getElementById('searchResultsTitle');
  const count = document.getElementById('searchResultsCount');
  const grid = document.getElementById('searchResultsGrid');

  title.textContent = locationName;
  const total = gems.length + events.length;
  count.textContent = `${total} hidden gem${total !== 1 ? 's' : ''} found`;

  const allCards = [
    ...gems.map(gem => createGemCard(gem)),
    ...events.map(event => createEventCard(event))
  ];

  grid.innerHTML = allCards.length > 0
    ? allCards.join('')
    : '<div class="no-results"><span>🗺️</span><p>No hidden gems found for this location yet. Try a broader search!</p></div>';

  section.style.display = 'block';
  section.scrollIntoView({ behavior: 'smooth' });
}

function filterResults(category, btn) {
  document.querySelectorAll('.results-filters .filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');

  const cards = document.querySelectorAll('#searchResultsGrid .card');
  cards.forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

// ---- Image URL helpers ----
const IMG_STOP_WORDS = new Set([
  'with','from','into','over','through','across','along','between','against',
  'around','during','upon','about','this','that','these','those','have','been',
  'were','will','would','could','should','their','there','where','which','while',
  'after','before','when','then','than','also','some','more','most','onto','only',
  'very','each','both','such','even','just','here','like','high','wide','deep',
  'vast','under','near','away','views','light','ancient','local','small','large',
]);

function nameToFilename(name) {
  return (name || '')
    .toLowerCase()
    .replace(/['''`]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') + '.jpg';
}

function getLocalImagePath(item) {
  return `/images/${nameToFilename(item.name)}`;
}

function getLoremFlickrUrl(item) {
  const seed = [...(item.name || '')].reduce((a, c) => (a * 31 + c.charCodeAt(0)) & 0xfffff, 0);
  const source = item.name || item.imagePrompt || '';
  const keywords = source
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 3 && !IMG_STOP_WORDS.has(w))
    .slice(0, 3)
    .join(',') || 'travel,landscape';
  return `https://loremflickr.com/800/600/${keywords}?lock=${seed}`;
}

// ---- Rendering ----
function createGemCard(gem) {
  const platformBadge = getPlatformBadge(gem.platform);
  const stars = getStarRating(gem.rating);
  const bookingUrl = getBookingUrl(gem.platform, gem.name);
  return `
    <div class="card" data-category="${gem.category}" data-platform="${gem.platform}">
      <div class="card-image">
        <img class="card-img" src="${getLocalImagePath(gem)}" onerror="this.onerror=null;this.src='${getLoremFlickrUrl(gem)}'" alt="${gem.name}" loading="lazy">
        <span class="card-badge ${gem.type}">${gem.type === 'tour' ? 'Tour' : 'Destination'}</span>
        ${platformBadge}
      </div>
      <div class="card-content">
        <h3 class="card-title">${gem.name}</h3>
        <p class="card-location">${gem.state ? gem.state + ', ' : ''}${gem.country || ''}</p>
        <p class="card-description">${gem.description}</p>
        <div class="card-meta">
          <span class="card-rating">${stars} ${gem.rating}</span>
          <span class="card-reviews">(${gem.reviews.toLocaleString()} reviews)</span>
        </div>
        <div class="card-footer">
          <span class="card-price">${gem.price}</span>
          <a href="${bookingUrl}" target="_blank" rel="noopener" class="card-btn">View on ${capitalize(gem.platform)}</a>
        </div>
      </div>
    </div>
  `;
}

function createEventCard(event) {
  const platformBadge = getPlatformBadge(event.platform);
  const bookingUrl = getBookingUrl(event.platform, event.name);
  return `
    <div class="card event-card" data-category="events" data-platform="${event.platform}">
      <div class="card-image event-image">
        <img class="card-img" src="${getLocalImagePath(event)}" onerror="this.onerror=null;this.src='${getLoremFlickrUrl(event)}'" alt="${event.name}" loading="lazy">
        <span class="card-badge events">Event</span>
        ${platformBadge}
      </div>
      <div class="card-content">
        <h3 class="card-title">${event.name}</h3>
        <p class="card-location">${event.location}</p>
        <p class="card-date">${event.date}</p>
        <p class="card-description">${event.description}</p>
        <div class="card-footer">
          <span class="card-price">${event.price}</span>
          <a href="${bookingUrl}" target="_blank" rel="noopener" class="card-btn">Learn More</a>
        </div>
      </div>
    </div>
  `;
}

function createEventTimelineItem(event) {
  const bookingUrl = getBookingUrl(event.platform, event.name);

  return `
    <div class="timeline-item" data-category="events">
      <div class="timeline-date">
        <img class="timeline-img" src="${getLocalImagePath(event)}" onerror="this.onerror=null;this.src='${getLoremFlickrUrl(event)}'" alt="${event.name}" loading="lazy">
        <span>${event.date}</span>
      </div>
      <div class="timeline-content">
        <h3>${event.name}</h3>
        <p class="timeline-location">${event.location}</p>
        <p>${event.description}</p>
        <div class="timeline-footer">
          <span class="platform-tag ${event.platform}">${capitalize(event.platform)}</span>
          <span class="card-price">${event.price}</span>
          <a href="${bookingUrl}" target="_blank" rel="noopener" class="card-btn small">Learn More</a>
        </div>
      </div>
    </div>
  `;
}

function renderFeaturedDestinations() {
  const allGems = getAllGems();
  // Pick top rated
  const featured = allGems
    .sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
    .slice(0, 8);

  const grid = document.getElementById('featuredGrid');
  grid.innerHTML = featured.map(gem => createGemCard(gem)).join('');
}

function renderTours() {
  const allGems = getAllGems().filter(g => g.type === 'tour');
  const grid = document.getElementById('toursGrid');
  grid.innerHTML = allGems.map(gem => createGemCard(gem)).join('');
}

function renderEvents() {
  const timeline = document.getElementById('eventsTimeline');
  timeline.innerHTML = EVENTS.map(e => createEventTimelineItem(e)).join('');
}

// ---- Filters ----
function filterCategory(category, btn) {
  currentCategory = category;
  document.querySelectorAll('.quick-filters .filter-chip').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');
  // Scroll to discover and filter
  showSection('discover');
  filterDisplayedCards('featuredGrid', category, currentPlatform);
}

function filterPlatform(platform, btn) {
  currentPlatform = platform;
  document.querySelectorAll('.platform-tabs .platform-tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  filterDisplayedCards('toursGrid', currentCategory, platform);
}

function filterDisplayedCards(gridId, category, platform) {
  const cards = document.querySelectorAll(`#${gridId} .card`);
  cards.forEach(card => {
    const matchCat = category === 'all' || card.dataset.category === category;
    const matchPlat = platform === 'all' || card.dataset.platform === platform;
    card.style.display = (matchCat && matchPlat) ? '' : 'none';
  });
}

// ---- Platform Helpers ----
function getPlatformBadge(platform) {
  const labels = {
    tripadvisor: '🟢 TripAdvisor',
    getyourguide: '🟠 GetYourGuide',
    withlocals: '🔵 Withlocals'
  };
  return `<span class="platform-badge ${platform}">${labels[platform] || platform}</span>`;
}

function getBookingUrl(platform, name) {
  const query = encodeURIComponent(name);
  const urls = {
    tripadvisor: `https://www.tripadvisor.com/Search?q=${query}`,
    getyourguide: `https://www.getyourguide.com/s/?q=${query}`,
    withlocals: `https://www.withlocals.com/search/?q=${query}`
  };
  return urls[platform] || '#';
}

function getStarRating(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
}

function capitalize(str) {
  if (str === 'tripadvisor') return 'TripAdvisor';
  if (str === 'getyourguide') return 'GetYourGuide';
  if (str === 'withlocals') return 'Withlocals';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ---- Navigation ----
function showSection(sectionId) {
  const el = document.getElementById(sectionId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
  // Close mobile nav
  document.querySelector('.nav-links').classList.remove('open');
  document.getElementById('navToggle').classList.remove('active');
}

function setupNavbar() {
  let lastScroll = 0;
  const navbar = document.getElementById('navbar');

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });
}

function setupMobileNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.querySelector('.nav-links');

  toggle.addEventListener('click', () => {
    links.classList.toggle('open');
    toggle.classList.toggle('active');
  });
}
