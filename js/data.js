// ============================================================
// Off The Beaten Track - Hidden Gems Database
// ============================================================

const LOCATIONS = {
  "United States": {
    "California": {
      areas: ["Northern Coast", "Sierra Nevada Foothills", "Central Valley", "Channel Islands"],
      gems: [
        {
          name: "Glass Beach, Fort Bragg",
          description: "A stunning beach covered in colorful sea glass, formed from decades of discarded glass smoothed by the ocean waves. A magical sight at sunset.",
          category: "nature",
          rating: 4.6,
          reviews: 2340,
          price: "Free",
          platform: "tripadvisor",
          image: "🏖️",
          type: "destination",
          area: "Northern Coast"
        },
        {
          name: "Lava Beds National Monument",
          description: "Explore over 700 lava tube caves in this remote volcanic landscape. A spelunker's paradise with Native American rock art.",
          category: "nature",
          rating: 4.8,
          reviews: 890,
          price: "$25",
          platform: "tripadvisor",
          image: "🌋",
          type: "tour",
          area: "Sierra Nevada Foothills"
        },
        {
          name: "Channel Islands Kayak Tour",
          description: "Paddle through sea caves and spot dolphins, seals, and whales on this guided kayak adventure to the 'Galapagos of North America'.",
          category: "tours",
          rating: 4.9,
          reviews: 1560,
          price: "$95",
          platform: "getyourguide",
          image: "🛶",
          type: "tour",
          area: "Channel Islands"
        },
        {
          name: "Underground Gardens of Fresno",
          description: "A hand-dug underground network of rooms and gardens created by Sicilian immigrant Baldassare Forestiere over 40 years.",
          category: "culture",
          rating: 4.7,
          reviews: 620,
          price: "$19",
          platform: "tripadvisor",
          image: "🌿",
          type: "destination",
          area: "Central Valley"
        }
      ]
    },
    "New Mexico": {
      areas: ["Santa Fe Region", "White Sands", "Carlsbad", "Taos"],
      gems: [
        {
          name: "Meow Wolf Santa Fe",
          description: "An immersive, mind-bending art installation inside a converted bowling alley. A portal to another dimension created by 200+ artists.",
          category: "culture",
          rating: 4.7,
          reviews: 5200,
          price: "$45",
          platform: "tripadvisor",
          image: "🎨",
          type: "destination",
          area: "Santa Fe Region"
        },
        {
          name: "Tent Rocks Slot Canyon Hike",
          description: "Walk through a narrow slot canyon surrounded by cone-shaped tent rock formations created by volcanic eruptions 7 million years ago.",
          category: "nature",
          rating: 4.8,
          reviews: 1890,
          price: "$5",
          platform: "getyourguide",
          image: "⛰️",
          type: "tour",
          area: "Santa Fe Region"
        },
        {
          name: "Rio Grande Gorge Hot Springs",
          description: "Soak in natural hot springs along the Rio Grande, accessible only by a steep hike down into the gorge. A secret local favorite.",
          category: "nature",
          rating: 4.5,
          reviews: 340,
          price: "Free",
          platform: "withlocals",
          image: "♨️",
          type: "destination",
          area: "Taos"
        }
      ]
    },
    "Oregon": {
      areas: ["Coast", "Columbia Gorge", "Bend", "Southern Oregon"],
      gems: [
        {
          name: "Thor's Well",
          description: "A natural saltwater fountain on the Oregon coast that appears to drain the Pacific Ocean into an endless sinkhole. Best viewed at high tide.",
          category: "nature",
          rating: 4.6,
          reviews: 780,
          price: "Free",
          platform: "tripadvisor",
          image: "🌊",
          type: "destination",
          area: "Coast"
        },
        {
          name: "Painted Hills Sunset Tour",
          description: "Witness the surreal, colorfully striped hills that look like a painting come alive, especially during golden hour.",
          category: "tours",
          rating: 4.9,
          reviews: 450,
          price: "$65",
          platform: "getyourguide",
          image: "🎨",
          type: "tour",
          area: "Bend"
        },
        {
          name: "Oregon Vortex Mystery Tour",
          description: "Visit the mysterious spot where the laws of physics seem to go haywire. Balls roll uphill and brooms stand on end.",
          category: "culture",
          rating: 4.2,
          reviews: 1200,
          price: "$15",
          platform: "tripadvisor",
          image: "🌀",
          type: "tour",
          area: "Southern Oregon"
        }
      ]
    }
  },
  "Italy": {
    "Puglia": {
      areas: ["Valle d'Itria", "Salento", "Gargano", "Murgia"],
      gems: [
        {
          name: "Trulli Village of Alberobello",
          description: "Wander through a fairytale village of whitewashed stone huts with conical roofs. UNESCO World Heritage site that feels frozen in time.",
          category: "culture",
          rating: 4.8,
          reviews: 3400,
          price: "Free",
          platform: "tripadvisor",
          image: "🏘️",
          type: "destination",
          area: "Valle d'Itria"
        },
        {
          name: "Puglia Farm-to-Table Cooking Class",
          description: "Learn to make orecchiette pasta and burrata from scratch with a local nonna on a family farm surrounded by olive groves.",
          category: "food",
          rating: 4.9,
          reviews: 890,
          price: "€75",
          platform: "withlocals",
          image: "👩‍🍳",
          type: "tour",
          area: "Valle d'Itria"
        },
        {
          name: "Grotta della Poesia",
          description: "One of the most beautiful natural swimming pools in the world - a collapsed sea cave with crystal-clear turquoise water.",
          category: "nature",
          rating: 4.7,
          reviews: 2100,
          price: "Free",
          platform: "tripadvisor",
          image: "🏊",
          type: "destination",
          area: "Salento"
        },
        {
          name: "Gargano Coastal Boat Tour",
          description: "Discover hidden sea caves, secret beaches, and dramatic white cliffs along Italy's untouched 'spur' coast by private boat.",
          category: "tours",
          rating: 4.8,
          reviews: 670,
          price: "€85",
          platform: "getyourguide",
          image: "⛵",
          type: "tour",
          area: "Gargano"
        }
      ]
    },
    "Sicily": {
      areas: ["Palermo", "Aeolian Islands", "Val di Noto", "Mount Etna"],
      gems: [
        {
          name: "Palermo Street Food Tour",
          description: "Dive into Palermo's chaotic markets and taste arancini, panelle, and sfincione with a passionate local foodie guide.",
          category: "food",
          rating: 4.9,
          reviews: 2800,
          price: "€55",
          platform: "withlocals",
          image: "🍕",
          type: "tour",
          area: "Palermo"
        },
        {
          name: "Stromboli Night Volcano Hike",
          description: "Hike an active volcano at night to watch lava explosions light up the sky. An otherworldly once-in-a-lifetime experience.",
          category: "tours",
          rating: 4.8,
          reviews: 1450,
          price: "€80",
          platform: "getyourguide",
          image: "🌋",
          type: "tour",
          area: "Aeolian Islands"
        },
        {
          name: "Baroque Towns of Val di Noto",
          description: "Explore the stunning UNESCO Baroque towns of Noto, Modica, and Ragusa - rebuilt beautifully after a 1693 earthquake.",
          category: "culture",
          rating: 4.7,
          reviews: 980,
          price: "€45",
          platform: "getyourguide",
          image: "🏛️",
          type: "tour",
          area: "Val di Noto"
        }
      ]
    },
    "Sardinia": {
      areas: ["Costa Smeralda", "Barbagia", "Sulcis", "Gallura"],
      gems: [
        {
          name: "Tiscali Nuragic Village Hike",
          description: "Hike through a hidden canyon to discover an ancient village built inside a collapsed mountain dome, dating back 3,000 years.",
          category: "culture",
          rating: 4.8,
          reviews: 560,
          price: "€35",
          platform: "getyourguide",
          image: "🏔️",
          type: "tour",
          area: "Barbagia"
        },
        {
          name: "Sardinian Shepherd Lunch Experience",
          description: "Join a real shepherd in the mountains for a traditional lamb roast, fresh pecorino, and local wine under ancient cork oaks.",
          category: "food",
          rating: 5.0,
          reviews: 230,
          price: "€60",
          platform: "withlocals",
          image: "🐑",
          type: "tour",
          area: "Barbagia"
        }
      ]
    }
  },
  "Japan": {
    "Shikoku": {
      areas: ["Iya Valley", "Dogo Onsen", "Cape Ashizuri", "Shimanto River"],
      gems: [
        {
          name: "Iya Valley Vine Bridges",
          description: "Cross ancient vine bridges swaying over deep gorges in one of Japan's last untouched wilderness areas, the 'Tibet of Japan'.",
          category: "nature",
          rating: 4.7,
          reviews: 1200,
          price: "¥550",
          platform: "tripadvisor",
          image: "🌉",
          type: "destination",
          area: "Iya Valley"
        },
        {
          name: "88 Temple Pilgrimage Walking Tour",
          description: "Walk a section of the sacred 1,200km Shikoku pilgrimage trail with a local guide, visiting ancient mountain temples.",
          category: "culture",
          rating: 4.9,
          reviews: 340,
          price: "¥8,000",
          platform: "withlocals",
          image: "⛩️",
          type: "tour",
          area: "Iya Valley"
        },
        {
          name: "Shimanto River SUP Adventure",
          description: "Stand-up paddleboard down Japan's last free-flowing river through pristine emerald waters and untouched forest.",
          category: "tours",
          rating: 4.6,
          reviews: 180,
          price: "¥6,500",
          platform: "getyourguide",
          image: "🏄",
          type: "tour",
          area: "Shimanto River"
        }
      ]
    },
    "Tohoku": {
      areas: ["Aomori", "Yamagata", "Akita", "Miyagi Coast"],
      gems: [
        {
          name: "Oirase Gorge Nature Walk",
          description: "Walk alongside a magical mountain stream through ancient beech forest with cascading waterfalls at every turn.",
          category: "nature",
          rating: 4.8,
          reviews: 890,
          price: "Free",
          platform: "tripadvisor",
          image: "🌲",
          type: "destination",
          area: "Aomori"
        },
        {
          name: "Zao Fox Village Visit",
          description: "Interact with over 100 free-roaming foxes in a mountain sanctuary. An surreal, one-of-a-kind animal experience.",
          category: "nature",
          rating: 4.5,
          reviews: 2100,
          price: "¥1,500",
          platform: "tripadvisor",
          image: "🦊",
          type: "destination",
          area: "Miyagi Coast"
        },
        {
          name: "Akita Rural Farm Stay & Sake Tour",
          description: "Stay with a farming family, harvest rice, and visit artisan sake breweries in snow-country Japan.",
          category: "food",
          rating: 4.9,
          reviews: 120,
          price: "¥15,000",
          platform: "withlocals",
          image: "🍶",
          type: "tour",
          area: "Akita"
        }
      ]
    },
    "Okinawa": {
      areas: ["Kerama Islands", "Yanbaru Forest", "Miyako", "Iriomote"],
      gems: [
        {
          name: "Iriomote Mangrove Kayaking",
          description: "Paddle through mystical mangrove forests on a subtropical island where wild cats roam and waterfalls hide in the jungle.",
          category: "tours",
          rating: 4.8,
          reviews: 670,
          price: "¥7,000",
          platform: "getyourguide",
          image: "🛶",
          type: "tour",
          area: "Iriomote"
        },
        {
          name: "Kerama Islands Snorkeling",
          description: "Snorkel in 'Kerama Blue' - some of the clearest water on Earth with sea turtles, coral, and tropical fish.",
          category: "nature",
          rating: 4.9,
          reviews: 1340,
          price: "¥5,500",
          platform: "getyourguide",
          image: "🐢",
          type: "tour",
          area: "Kerama Islands"
        }
      ]
    }
  },
  "Portugal": {
    "Alentejo": {
      areas: ["Evora", "Comporta", "Monsaraz", "Rota Vicentina"],
      gems: [
        {
          name: "Rota Vicentina Coastal Hike",
          description: "Hike along Europe's most beautiful and unspoiled coastline on the Fishermen's Trail, with dramatic cliffs and hidden beaches.",
          category: "nature",
          rating: 4.9,
          reviews: 1670,
          price: "Free",
          platform: "tripadvisor",
          image: "🥾",
          type: "destination",
          area: "Rota Vicentina"
        },
        {
          name: "Alentejo Wine & Cork Tour",
          description: "Visit family-run vineyards and a cork forest, taste bold Alentejo wines paired with local cured meats and cheeses.",
          category: "food",
          rating: 4.8,
          reviews: 540,
          price: "€65",
          platform: "withlocals",
          image: "🍷",
          type: "tour",
          area: "Evora"
        },
        {
          name: "Monsaraz Stargazing Experience",
          description: "Gaze at the Milky Way from a medieval hilltop village in Europe's first certified Dark Sky Reserve.",
          category: "tours",
          rating: 4.9,
          reviews: 320,
          price: "€30",
          platform: "getyourguide",
          image: "🌌",
          type: "tour",
          area: "Monsaraz"
        }
      ]
    },
    "Azores": {
      areas: ["Sao Miguel", "Flores", "Pico", "Terceira"],
      gems: [
        {
          name: "Sete Cidades Twin Lakes Hike",
          description: "Hike around the breathtaking blue and green twin crater lakes on the rim of a dormant volcano in the mid-Atlantic.",
          category: "nature",
          rating: 4.9,
          reviews: 2300,
          price: "Free",
          platform: "tripadvisor",
          image: "🏞️",
          type: "destination",
          area: "Sao Miguel"
        },
        {
          name: "Whale Watching from Pico",
          description: "Spot sperm whales, dolphins, and blue whales from a traditional whaling village turned conservation hub.",
          category: "tours",
          rating: 4.8,
          reviews: 1890,
          price: "€65",
          platform: "getyourguide",
          image: "🐋",
          type: "tour",
          area: "Pico"
        },
        {
          name: "Cozido das Furnas Volcanic Lunch",
          description: "Eat a traditional stew slow-cooked underground by volcanic heat in the geothermal town of Furnas.",
          category: "food",
          rating: 4.7,
          reviews: 890,
          price: "€25",
          platform: "withlocals",
          image: "🍲",
          type: "tour",
          area: "Sao Miguel"
        }
      ]
    }
  },
  "Colombia": {
    "Boyaca": {
      areas: ["Villa de Leyva", "Cocuy", "Tunja", "Lago de Tota"],
      gems: [
        {
          name: "Villa de Leyva Fossil Trail",
          description: "Walk through an ancient seabed dotted with 130-million-year-old fossils, including a complete baby plesiosaur skeleton.",
          category: "culture",
          rating: 4.6,
          reviews: 450,
          price: "$15,000 COP",
          platform: "tripadvisor",
          image: "🦕",
          type: "destination",
          area: "Villa de Leyva"
        },
        {
          name: "Cocuy National Park Trek",
          description: "Trek to Colombia's only glaciers through páramo landscapes with frailejones plants found nowhere else on Earth.",
          category: "nature",
          rating: 4.8,
          reviews: 280,
          price: "$120,000 COP",
          platform: "getyourguide",
          image: "🏔️",
          type: "tour",
          area: "Cocuy"
        }
      ]
    },
    "Santander": {
      areas: ["Barichara", "Canyon del Chicamocha", "San Gil", "Mesa de los Santos"],
      gems: [
        {
          name: "Camino Real Colonial Trail",
          description: "Walk the ancient cobblestone path between Barichara and Guane, two of Colombia's most beautiful colonial villages.",
          category: "culture",
          rating: 4.7,
          reviews: 670,
          price: "Free",
          platform: "tripadvisor",
          image: "🏘️",
          type: "destination",
          area: "Barichara"
        },
        {
          name: "Chicamocha Canyon Paragliding",
          description: "Soar over one of the world's deepest canyons with a tandem paragliding flight. Views rivaling the Grand Canyon.",
          category: "tours",
          rating: 4.9,
          reviews: 890,
          price: "$180,000 COP",
          platform: "getyourguide",
          image: "🪂",
          type: "tour",
          area: "Canyon del Chicamocha"
        }
      ]
    }
  },
  "Morocco": {
    "Draa-Tafilalet": {
      areas: ["Todra Gorge", "Merzouga", "Dades Valley", "Rissani"],
      gems: [
        {
          name: "Todra Gorge Rock Climbing",
          description: "Climb towering 300m canyon walls in one of the world's most spectacular gorge settings, with routes for all levels.",
          category: "tours",
          rating: 4.7,
          reviews: 450,
          price: "€50",
          platform: "getyourguide",
          image: "🧗",
          type: "tour",
          area: "Todra Gorge"
        },
        {
          name: "Nomad Family Desert Stay",
          description: "Spend a night with a real Berber nomad family in the Sahara, learning their way of life under a canopy of stars.",
          category: "culture",
          rating: 4.9,
          reviews: 340,
          price: "€90",
          platform: "withlocals",
          image: "🏜️",
          type: "tour",
          area: "Merzouga"
        }
      ]
    },
    "Souss-Massa": {
      areas: ["Taroudant", "Paradise Valley", "Tiznit", "Anti-Atlas"],
      gems: [
        {
          name: "Paradise Valley Waterfall Hike",
          description: "Discover turquoise rock pools and waterfalls hidden in a palm-lined gorge that locals call their secret paradise.",
          category: "nature",
          rating: 4.6,
          reviews: 780,
          price: "Free",
          platform: "tripadvisor",
          image: "💧",
          type: "destination",
          area: "Paradise Valley"
        },
        {
          name: "Taroudant Medina Food Walk",
          description: "Explore the 'mini Marrakech' without the crowds. Taste traditional tangia, msemen, and mint tea with a local guide.",
          category: "food",
          rating: 4.8,
          reviews: 210,
          price: "€35",
          platform: "withlocals",
          image: "🫖",
          type: "tour",
          area: "Taroudant"
        }
      ]
    }
  },
  "Thailand": {
    "Isaan": {
      areas: ["Khon Kaen", "Udon Thani", "Nakhon Ratchasima", "Loei"],
      gems: [
        {
          name: "Pha Taem Cliff Paintings",
          description: "See 3,000-year-old prehistoric cliff paintings overlooking the Mekong River at Thailand's easternmost point.",
          category: "culture",
          rating: 4.5,
          reviews: 320,
          price: "฿100",
          platform: "tripadvisor",
          image: "🎨",
          type: "destination",
          area: "Udon Thani"
        },
        {
          name: "Isaan Home Cooking Experience",
          description: "Learn to cook fiery som tam, larb, and sticky rice with a local family in a traditional stilted house.",
          category: "food",
          rating: 4.9,
          reviews: 180,
          price: "฿1,200",
          platform: "withlocals",
          image: "🌶️",
          type: "tour",
          area: "Khon Kaen"
        },
        {
          name: "Phu Kradueng Mountain Trek",
          description: "Climb a flat-topped mountain through jungle to a misty plateau with cool pine forests and cliff-edge viewpoints.",
          category: "nature",
          rating: 4.7,
          reviews: 560,
          price: "฿400",
          platform: "getyourguide",
          image: "🌄",
          type: "tour",
          area: "Loei"
        }
      ]
    },
    "Trat": {
      areas: ["Koh Kood", "Koh Mak", "Koh Chang Interior", "Trat Town"],
      gems: [
        {
          name: "Koh Kood Fishing Village Stay",
          description: "Stay in a quiet fishing village on Thailand's most unspoiled island with no roads, no cars, and crystal-clear water.",
          category: "nature",
          rating: 4.8,
          reviews: 670,
          price: "฿2,500",
          platform: "tripadvisor",
          image: "🏝️",
          type: "destination",
          area: "Koh Kood"
        },
        {
          name: "Mangrove Kayak & Firefly Tour",
          description: "Paddle through bioluminescent mangroves at night as thousands of synchronous fireflies light up the trees.",
          category: "tours",
          rating: 4.9,
          reviews: 340,
          price: "฿1,800",
          platform: "getyourguide",
          image: "✨",
          type: "tour",
          area: "Koh Chang Interior"
        }
      ]
    }
  },
  "Georgia": {
    "Svaneti": {
      areas: ["Mestia", "Ushguli", "Mazeri", "Latali"],
      gems: [
        {
          name: "Ushguli Medieval Village",
          description: "Visit one of the highest continuously inhabited settlements in Europe, with 1,000-year-old stone defense towers and stunning Caucasus views.",
          category: "culture",
          rating: 4.9,
          reviews: 1200,
          price: "Free",
          platform: "tripadvisor",
          image: "🏰",
          type: "destination",
          area: "Ushguli"
        },
        {
          name: "Svaneti Tower Trail Trek",
          description: "Multi-day trek through the wild Caucasus mountains between medieval tower villages, with glacier views and wildflower meadows.",
          category: "tours",
          rating: 4.8,
          reviews: 560,
          price: "$85",
          platform: "getyourguide",
          image: "🥾",
          type: "tour",
          area: "Mestia"
        },
        {
          name: "Svan Feast & Traditions Evening",
          description: "Join a Svan family feast with kubdari meat pies, local cheese, and chacha brandy while learning ancient Svan traditions.",
          category: "food",
          rating: 4.9,
          reviews: 180,
          price: "$40",
          platform: "withlocals",
          image: "🥧",
          type: "tour",
          area: "Mestia"
        }
      ]
    },
    "Kakheti": {
      areas: ["Sighnaghi", "Tsinandali", "David Gareja", "Lagodekhi"],
      gems: [
        {
          name: "Qvevri Wine Making Experience",
          description: "Learn 8,000-year-old Georgian winemaking in clay qvevri vessels buried underground, at a family vineyard.",
          category: "food",
          rating: 4.8,
          reviews: 890,
          price: "$55",
          platform: "withlocals",
          image: "🏺",
          type: "tour",
          area: "Tsinandali"
        },
        {
          name: "David Gareja Cave Monastery",
          description: "Explore a 6th-century cave monastery complex carved into cliffs on the Azerbaijan border, with stunning frescoes.",
          category: "culture",
          rating: 4.7,
          reviews: 1450,
          price: "$30",
          platform: "getyourguide",
          image: "🕌",
          type: "tour",
          area: "David Gareja"
        }
      ]
    }
  }
};

// Events & Shows Database
const EVENTS = [
  {
    name: "Phi Ta Khon Ghost Festival",
    location: "Dan Sai, Loei, Thailand",
    country: "Thailand",
    state: "Isaan",
    date: "June 2026",
    description: "A colorful Buddhist festival where locals wear vibrant ghost masks and dance through the streets. A surreal spectacle rarely seen by outsiders.",
    category: "events",
    image: "👻",
    platform: "withlocals",
    price: "Free"
  },
  {
    name: "Festa dei Ceri",
    location: "Gubbio, Umbria, Italy",
    country: "Italy",
    state: "Puglia",
    date: "May 15, 2026",
    description: "A 900-year-old festival where teams race carrying enormous wooden pillars through medieval streets. Raw, intense, and unforgettable.",
    category: "events",
    image: "🏋️",
    platform: "tripadvisor",
    price: "Free"
  },
  {
    name: "Tbilisoba City Festival",
    location: "Tbilisi, Georgia",
    country: "Georgia",
    state: "Kakheti",
    date: "October 2026",
    description: "Tbilisi's annual city festival with traditional music, grape stomping, wine tasting, and Georgian polyphonic singing in the old town.",
    category: "events",
    image: "🎶",
    platform: "withlocals",
    price: "Free"
  },
  {
    name: "Festival of the Senses",
    location: "Comporta, Alentejo, Portugal",
    country: "Portugal",
    state: "Alentejo",
    date: "August 2026",
    description: "An intimate arts and music festival in the rice fields of Comporta with local food, wine, and Portuguese fado under the stars.",
    category: "events",
    image: "🎵",
    platform: "getyourguide",
    price: "€45"
  },
  {
    name: "Obon Dance Festival",
    location: "Awa, Tokushima, Japan",
    country: "Japan",
    state: "Shikoku",
    date: "August 12-15, 2026",
    description: "The most famous Bon dance festival in Japan with 100,000+ dancers in colorful kimonos flooding the streets for 4 days.",
    category: "events",
    image: "💃",
    platform: "tripadvisor",
    price: "Free"
  },
  {
    name: "Moussem of Tan-Tan",
    location: "Tan-Tan, Morocco",
    country: "Morocco",
    state: "Souss-Massa",
    date: "September 2026",
    description: "A UNESCO-recognized gathering of nomadic tribes with camel races, traditional music, and Saharan trading traditions.",
    category: "events",
    image: "🐪",
    platform: "withlocals",
    price: "Free"
  },
  {
    name: "Festival de las Flores",
    location: "Villa de Leyva, Colombia",
    country: "Colombia",
    state: "Boyaca",
    date: "August 2026",
    description: "A vibrant flower festival in one of South America's most beautiful colonial plazas with parades, music, and blooming displays.",
    category: "events",
    image: "🌺",
    platform: "tripadvisor",
    price: "Free"
  },
  {
    name: "Oregon Country Fair",
    location: "Veneta, Oregon, USA",
    country: "United States",
    state: "Oregon",
    date: "July 10-12, 2026",
    description: "A beloved counter-culture festival in the forest with artisan crafts, live music, circus performers, and organic food since 1969.",
    category: "events",
    image: "🎪",
    platform: "tripadvisor",
    price: "$35"
  }
];

// Location-to-coordinate mapping for geolocation matching
const LOCATION_COORDS = {
  "United States": { lat: 39.8, lng: -98.5 },
  "Italy": { lat: 41.9, lng: 12.5 },
  "Japan": { lat: 36.2, lng: 138.2 },
  "Portugal": { lat: 39.4, lng: -8.2 },
  "Colombia": { lat: 4.6, lng: -74.1 },
  "Morocco": { lat: 31.6, lng: -7.1 },
  "Thailand": { lat: 15.9, lng: 100.9 },
  "Georgia": { lat: 42.3, lng: 43.4 }
};
