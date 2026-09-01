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
          area: "Northern Coast",
          imagePrompt: "A magical Northern California beach densely covered in smooth polished sea glass pieces in vivid emerald green, cobalt blue and amber, low golden sunset light making each piece glow, Pacific Ocean waves in background, Fort Bragg"
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
          area: "Sierra Nevada Foothills",
          imagePrompt: "Dark dramatic lava tube cave entrance with jagged black basalt rock formations, hikers with headlamps exploring underground, vast high desert plateau with sagebrush, dramatic blue sky, Lava Beds National Monument northern California"
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
          area: "Channel Islands",
          imagePrompt: "Sea kayakers paddling through dramatic rocky sea caves, Channel Islands California, crystal clear turquoise water, sea lions resting on golden sandstone cliffs, kelp forest visible underwater"
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
          area: "Central Valley",
          imagePrompt: "Subterranean underground garden rooms hand-dug into the earth, lush vines and citrus trees growing up through circular skylights, warm amber light filtering down through openings, arched stone passages, Fresno California"
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
          area: "Santa Fe Region",
          imagePrompt: "Psychedelic immersive art installation interior, neon glowing portals and cosmic rooms, vivid blacklight colors, visitors exploring otherworldly sculptures and environments, Meow Wolf Santa Fe New Mexico"
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
          area: "Santa Fe Region",
          imagePrompt: "Narrow slot canyon passage with cream and terracotta cone-shaped tent rock formations towering above, lone hiker silhouetted below, brilliant blue New Mexico sky, Kasha-Katuwe Tent Rocks National Monument"
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
          area: "Taos",
          imagePrompt: "Natural hot springs pools along the Rio Grande gorge, steam rising from turquoise geothermal water, dramatic red canyon walls rising 800 feet, New Mexico desert sunset sky, Taos"
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
          area: "Coast",
          imagePrompt: "Thor's Well natural saltwater drain on the Oregon coast, dramatic waves crashing and appearing to drain into a bottomless pit, stormy sky with orange glow, Cape Perpetua basalt rocks, Oregon"
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
          area: "Bend",
          imagePrompt: "Surreal colorfully banded Painted Hills at golden hour, vivid red, ochre, gold and black geological strata on rolling hills, wide open Oregon high desert, John Day Fossil Beds"
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
          area: "Southern Oregon",
          imagePrompt: "Quirky Oregon Vortex mystery spot, old wooden house in a dense southern Oregon forest, visitors looking puzzled and leaning at strange angles, tall Douglas firs, dappled forest light"
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
          area: "Valle d'Itria",
          imagePrompt: "Fairytale village of whitewashed trulli houses with distinctive conical grey stone roofs, narrow cobblestone lanes, potted geraniums, Alberobello Puglia Italy, warm afternoon light"
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
          area: "Valle d'Itria",
          imagePrompt: "Italian nonna teaching tourists to make orecchiette pasta by hand on a rustic wooden table, family farm kitchen in Puglia, olive grove visible through open door, fresh burrata and local wine on the table"
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
          area: "Salento",
          imagePrompt: "Stunning natural swimming pool inside a collapsed sea cave, Puglia Salento Italy, vivid turquoise crystal-clear water, white limestone rock walls, sunlight streaming through the collapsed ceiling"
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
          area: "Gargano",
          imagePrompt: "Private boat cruising along dramatic white limestone sea cliffs of the Gargano Peninsula, Puglia Italy, turquoise Adriatic water, hidden sea caves and secret beaches, bright Mediterranean sun"
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
          area: "Palermo",
          imagePrompt: "Chaotic vibrant Palermo street food market, Ballarò market stalls, arancini and street food vendors, locals and tourists tasting food, narrow Sicilian market alley, warm afternoon light"
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
          area: "Aeolian Islands",
          imagePrompt: "Stromboli active volcano erupting at night, glowing orange lava explosions against dark sky, hikers silhouetted on the crater rim, Aeolian Islands Sicily, dramatic volcanic light show"
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
          area: "Val di Noto",
          imagePrompt: "Stunning Baroque cathedral of Noto, Sicily, golden limestone facade glowing in afternoon sun, ornate carved balconies, wide piazza with locals, Val di Noto UNESCO World Heritage"
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
          area: "Barbagia",
          imagePrompt: "Ancient Nuragic village ruins inside a dramatic collapsed mountain dome, Tiscali Sardinia, stone dwellings hidden in vast natural cavern, hikers dwarfed by scale, dappled light through rock opening"
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
          area: "Barbagia",
          imagePrompt: "Traditional Sardinian shepherd lunch outdoors, whole lamb roasting on an open fire spit, aged pecorino cheese and local red wine on rustic wooden table, ancient cork oak trees, Barbagia highlands"
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
          area: "Iya Valley",
          imagePrompt: "Ancient vine suspension bridge swaying over a deep forested gorge, Iya Valley Shikoku Japan, morning mist rising from the ravine below, lush green cedar forests, traditional Japanese wilderness"
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
          area: "Iya Valley",
          imagePrompt: "Pilgrims in white robes and sedge hats walking the Shikoku 88 temple trail, ancient stone path through cedar forest, moss-covered stone lanterns, mountain temple gate at dawn, Japan"
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
          area: "Shimanto River",
          imagePrompt: "Person stand-up paddleboarding on the calm clear emerald-green Shimanto River, Japan's last free-flowing river, pristine subtropical forest on both banks, low wooden bridges, Shikoku Japan"
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
          area: "Aomori",
          imagePrompt: "Magical Oirase Gorge in Aomori Japan, moss-covered rocks beside crystal mountain stream, multiple cascading waterfalls, ancient beech forest canopy, autumn foliage in red and gold"
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
          area: "Miyagi Coast",
          imagePrompt: "Over 100 free-roaming red and silver foxes in a mountain sanctuary, visitor surrounded by curious foxes, snowy Japanese mountain landscape, Zao Fox Village Miyagi Japan, winter scene"
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
          area: "Akita",
          imagePrompt: "Japanese family harvesting rice in terraced paddy fields, Akita prefecture Japan, traditional rural farm with thatched farmhouse, snow-capped mountains, autumn golden rice stalks, sake brewery in background"
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
          area: "Iriomote",
          imagePrompt: "Kayakers paddling through mystical mangrove forest, Iriomote Island Okinawa Japan, dense subtropical jungle, crystal-clear water reflecting ancient trees, hidden waterfall at the end of the river"
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
          area: "Kerama Islands",
          imagePrompt: "Snorkeler swimming alongside sea turtle in Kerama Blue, Okinawa Japan, impossibly clear turquoise water, vivid coral reef below, tropical fish, bright sunshine filtering through pristine ocean"
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
          area: "Rota Vicentina",
          imagePrompt: "Hiker on the Fishermen's Trail, Rota Vicentina Portugal, dramatic Atlantic cliffs with crashing waves below, wildflowers on clifftop path, golden afternoon light, Alentejo coastline"
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
          area: "Evora",
          imagePrompt: "Family-run Alentejo vineyard with ancient cork oak forest, wine tasting outdoors in shade of cork trees, traditional Portuguese quinta stone farmhouse, terracotta wine amphoras, afternoon golden light"
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
          area: "Monsaraz",
          imagePrompt: "Milky Way galaxy blazing over a medieval Portuguese hilltop village, Monsaraz Alentejo, ancient stone castle walls silhouetted against star-filled sky, Europe's first Dark Sky Reserve, zero light pollution"
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
          area: "Sao Miguel",
          imagePrompt: "Breathtaking aerial view of twin crater lakes Sete Cidades, one emerald green and one sapphire blue, inside a dormant volcano caldera, Sao Miguel Azores, lush green crater walls, misty morning"
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
          area: "Pico",
          imagePrompt: "Sperm whale surfacing close to small zodiac boat, Pico Island Azores, dramatic volcanic island in background, deep blue Atlantic Ocean, whale watching from traditional whaling village"
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
          area: "Sao Miguel",
          imagePrompt: "Traditional Azorean cozido stew being lifted from the ground at Furnas geothermal valley, steam rising dramatically, volcanic earth, clay pots, locals gathering, Sao Miguel Azores"
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
          area: "Villa de Leyva",
          imagePrompt: "Ancient seabed fossil trail in Villa de Leyva Colombia, 130-million-year-old ammonite and marine reptile fossils embedded in rock, arid high plateau landscape, Boyaca region"
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
          area: "Cocuy",
          imagePrompt: "Colombia's only glaciers on Sierra Nevada del Cocuy, trekkers crossing a high-altitude paramo landscape with giant frailejones plants, white snow-capped peaks, dramatic Andes cloudscape"
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
          area: "Barichara",
          imagePrompt: "Ancient cobblestone Camino Real path winding between Barichara and Guane, Colombia, colonial stone walls with flowering bougainvillea, terracotta rooftops, canyon views, golden hour"
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
          area: "Canyon del Chicamocha",
          imagePrompt: "Tandem paragliders soaring over Chicamocha Canyon Colombia, one of the world's deepest canyons, dramatic vertical walls dropping thousands of feet, Santander region, clear blue sky"
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
          area: "Todra Gorge",
          imagePrompt: "Rock climbers on towering 300-metre ochre canyon walls of Todra Gorge, Morocco, narrow gorge with clear stream below, Berber guides, warm desert light, Atlas Mountains"
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
          area: "Merzouga",
          imagePrompt: "Berber nomad family tent in the Sahara Desert near Merzouga Morocco, traditional blue-robed host pouring mint tea, camel silhouette at sunset, vast dune landscape, Milky Way rising"
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
          area: "Paradise Valley",
          imagePrompt: "Hidden turquoise rock pools and waterfall in Paradise Valley Morocco, palm trees lining a gorge, Berber children swimming, ochre limestone cliffs, Atlas Mountains near Agadir"
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
          area: "Taroudant",
          imagePrompt: "Taroudant medina souks in Morocco, traditional market stalls with spices, tagines and handicrafts, local guide with tourists, ancient rose-coloured city walls in background, warm afternoon light"
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
          area: "Udon Thani",
          imagePrompt: "Ancient prehistoric cliff paintings 3000 years old, Pha Taem National Park Thailand, ochre figures painted on orange sandstone cliff face overlooking the Mekong River, lush tropical vegetation"
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
          area: "Khon Kaen",
          imagePrompt: "Thai family cooking class in a traditional stilted wooden house, Isaan Thailand, mortar and pestle papaya salad preparation, sticky rice in bamboo baskets, tropical garden, local spices and herbs"
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
          area: "Loei",
          imagePrompt: "Hikers ascending Phu Kradueng flat-topped mountain Thailand, misty pine forest at high altitude, dramatic cliff-edge viewpoint at sunrise, cool highland plateau, Loei province"
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
          area: "Koh Kood",
          imagePrompt: "Pristine unspoiled Thai fishing village on Koh Kood island, colourful wooden longboats on crystal clear turquoise water, no roads, no cars, lush jungle to the beach, Trat Thailand"
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
          area: "Koh Chang Interior",
          imagePrompt: "Kayakers paddling through bioluminescent mangrove forest at night, thousands of synchronous fireflies lighting up the dark trees, reflections in still water, Koh Chang Thailand, magical ethereal glow"
        }
      ]
    }
  },
  "Madagascar": {
    "Menabe Region": {
      areas: ["Allée des Baobabs", "Tsingy de Bemaraha", "Belo-sur-Mer"],
      gems: [
        {
          name: "Allée des Baobabs at Sunset",
          description: "Stand among giant baobab trees up to 800 years old as the sun sets over a dusty red road lined with these ancient giants. One of the most iconic sights in Africa.",
          category: "nature",
          rating: 4.9,
          reviews: 1560,
          price: "Free",
          platform: "tripadvisor",
          image: "🌳",
          type: "destination",
          area: "Allée des Baobabs",
          imagePrompt: "Avenue of the Baobabs at sunset Morondava Madagascar, enormous ancient baobab trees 800 years old lining a dusty red dirt road, vivid orange and purple sky, silhouettes of the giant trunks"
        },
        {
          name: "Grand Tsingy Needle Forest Trek",
          description: "Hike through a UNESCO-listed labyrinth of razor-sharp limestone needles, connected by suspension bridges, with endemic lemurs and birds found nowhere else on Earth.",
          category: "nature",
          rating: 4.8,
          reviews: 890,
          price: "€85",
          platform: "getyourguide",
          image: "⛰️",
          type: "tour",
          area: "Tsingy de Bemaraha",
          imagePrompt: "Tsingy de Bemaraha Madagascar, forest of razor-sharp grey limestone needle formations, trekkers on a suspension bridge between the tsingy spires, lemur watching from above, UNESCO World Heritage site"
        }
      ]
    },
    "Masoala Peninsula": {
      areas: ["Masoala National Park", "Antongil Bay", "Île Sainte-Marie"],
      gems: [
        {
          name: "Masoala Rainforest Trek",
          description: "Trek through the most biodiverse rainforest in Madagascar with a local Malagasy guide — chameleons on every branch, lemurs overhead, and zero other tourists.",
          category: "tours",
          rating: 4.9,
          reviews: 340,
          price: "€95",
          platform: "getyourguide",
          image: "🦎",
          type: "tour",
          area: "Masoala National Park",
          imagePrompt: "Masoala Peninsula rainforest Madagascar, local guide leading trek through dense tropical jungle, panther chameleon on a branch, lemurs in the canopy, red-vented coua bird, misty untouched rainforest"
        },
        {
          name: "Humpback Whale Bay Pirogue",
          description: "Watch humpback whale mothers nurse their calves in the sheltered waters of Antongil Bay — the world's most important humpback nursery — from a traditional dugout canoe.",
          category: "nature",
          rating: 4.9,
          reviews: 230,
          price: "€55",
          platform: "withlocals",
          image: "🐳",
          type: "tour",
          area: "Antongil Bay",
          imagePrompt: "Traditional Malagasy dugout pirogue canoe with tourists watching humpback whale mother and calf in Antongil Bay Madagascar, whale breaching with its calf, tropical island coastline, clear blue water"
        }
      ]
    }
  },
  "Armenia": {
    "Syunik Region": {
      areas: ["Tatev", "Goris", "Karahunj"],
      gems: [
        {
          name: "Tatev Monastery via Wings of Tatev",
          description: "Ride the world's longest reversible cable car — 5.7km over a dramatic gorge — to a 9th-century monastery clinging to a basalt cliff. Completely off most tourists' radar.",
          category: "culture",
          rating: 4.9,
          reviews: 2800,
          price: "AMD 5,000",
          platform: "tripadvisor",
          image: "🚡",
          type: "tour",
          area: "Tatev",
          imagePrompt: "Wings of Tatev cable car over the dramatic Vorotan Gorge, Armenia, 9th-century Tatev Monastery perched on basalt cliffs below, autumn forest colours, Syunik region, sweeping panorama"
        },
        {
          name: "Karahunj — Armenian Stonehenge",
          description: "Visit a 7,500-year-old stone circle believed to be the world's oldest astronomical observatory, predating Stonehenge by 3,500 years. Almost no one knows it exists.",
          category: "culture",
          rating: 4.6,
          reviews: 340,
          price: "AMD 1,500",
          platform: "getyourguide",
          image: "🗿",
          type: "destination",
          area: "Karahunj",
          imagePrompt: "Ancient Karahunj stone circle Armenia, 7500-year-old megalithic stones with drilled holes for astronomical observation, open highland steppe, Vorotan River valley below, dramatic sky"
        }
      ]
    },
    "Vayots Dzor": {
      areas: ["Noravank", "Areni", "Selim Pass"],
      gems: [
        {
          name: "Noravank Canyon & Monastery",
          description: "Hike to a 13th-century monastery built into flaming red canyon walls, accessible via a narrow external stone staircase with no handrail. Jaw-dropping.",
          category: "culture",
          rating: 4.8,
          reviews: 3400,
          price: "Free",
          platform: "tripadvisor",
          image: "⛪",
          type: "destination",
          area: "Noravank",
          imagePrompt: "Noravank monastery Armenia built into flaming red-orange canyon walls, 13th-century stone church with narrow external staircase, vivid red cliffs, Vayots Dzor gorge, bright blue sky"
        },
        {
          name: "Areni Cave 6,000-Year Wine Tasting",
          description: "Taste wine in a village with 6,100 years of winemaking tradition, next to the Areni-1 cave where the world's oldest winery was discovered by archaeologists in 2007.",
          category: "food",
          rating: 4.8,
          reviews: 450,
          price: "AMD 2,500",
          platform: "withlocals",
          image: "🍇",
          type: "tour",
          area: "Areni",
          imagePrompt: "Armenian wine tasting in the ancient Areni village, winemaker pouring deep red wine beside the Areni-1 cave entrance, vineyard with ancient grape vines, Vayots Dzor canyon backdrop"
        }
      ]
    }
  },
  "Namibia": {
    "Namib Desert": {
      areas: ["Sossusvlei", "Deadvlei", "Sesriem Canyon"],
      gems: [
        {
          name: "Dead Vlei Sunrise Walk",
          description: "Walk among 900-year-old ghost trees — dead camel thorns blackened by the sun — in a white clay pan surrounded by the world's tallest red sand dunes at golden hour.",
          category: "nature",
          rating: 4.9,
          reviews: 1890,
          price: "N$200",
          platform: "tripadvisor",
          image: "🌵",
          type: "destination",
          area: "Deadvlei",
          imagePrompt: "Dead Vlei Namibia at sunrise, ancient 900-year-old blackened dead camel thorn trees on white cracked clay pan, surrounded by towering orange-red sand dunes, dramatic warm golden light, Sossusvlei"
        },
        {
          name: "Sesriem Canyon Stargazing",
          description: "Zero light pollution. 300,000 stars. Experience the most spectacular night sky on Earth in one of the darkest places on the planet, with a ranger guide.",
          category: "tours",
          rating: 4.8,
          reviews: 560,
          price: "€40",
          platform: "getyourguide",
          image: "🌌",
          type: "tour",
          area: "Sesriem Canyon",
          imagePrompt: "Extraordinary Milky Way blazing over Sesriem Canyon Namibia, zero light pollution, 300000 stars reflected in a still desert pool, silhouette of canyon walls, one of the darkest skies on Earth"
        }
      ]
    },
    "Damaraland": {
      areas: ["Twyfelfontein", "Brandberg", "Spitzkoppe"],
      gems: [
        {
          name: "Twyfelfontein Rock Engraving Trail",
          description: "Walk among the largest concentration of Bushman rock engravings in Africa — 6,000-year-old images of giraffe, lion, rhino, and elephant etched into desert boulders.",
          category: "culture",
          rating: 4.7,
          reviews: 780,
          price: "N$100",
          platform: "tripadvisor",
          image: "🪨",
          type: "destination",
          area: "Twyfelfontein",
          imagePrompt: "Ancient San Bushman rock engravings on desert boulders at Twyfelfontein Namibia, giraffe and lion petroglyphs carved 6000 years ago, red rocky desert landscape, guide pointing out engravings"
        },
        {
          name: "Desert-Adapted Elephant Tracking",
          description: "Track desert-adapted elephants with a San Bushman guide through ancient dry riverbeds in one of the most extreme elephant habitats on Earth.",
          category: "nature",
          rating: 4.9,
          reviews: 230,
          price: "€150",
          platform: "withlocals",
          image: "🐘",
          type: "tour",
          area: "Damaraland",
          imagePrompt: "Desert-adapted elephants in Damaraland Namibia, herd walking across stark rocky desert landscape, ancient dry riverbed, San Bushman guide with tourists at safe distance, Namibian big sky"
        }
      ]
    }
  },
  "Vietnam": {
    "Hà Giang Province": {
      areas: ["Đồng Văn", "Lũng Cú", "Phố Bảng"],
      gems: [
        {
          name: "Hà Giang Loop Motorbike Adventure",
          description: "Four days of mountain roads through the UNESCO Dong Van Karst Plateau — rice terraces, H'mong villages, epic hairpin bends, and zero tourist crowds. Vietnam's best kept secret.",
          category: "tours",
          rating: 4.9,
          reviews: 2100,
          price: "₫450,000",
          platform: "getyourguide",
          image: "🏍️",
          type: "tour",
          area: "Đồng Văn",
          imagePrompt: "Motorbike rider on the dramatic Hà Giang Loop in northern Vietnam, winding mountain road with hairpin bends, rice terraces cascading down hillsides, H'mong villages, karst mountain scenery, late afternoon mist"
        },
        {
          name: "Đồng Văn Sunday Market",
          description: "Witness an extraordinary highland market where H'mong, Dao, Tay, and Lo Lo ethnic minorities descend from remote mountains in full traditional costume to trade.",
          category: "culture",
          rating: 4.7,
          reviews: 890,
          price: "Free",
          platform: "tripadvisor",
          image: "🎎",
          type: "destination",
          area: "Đồng Văn",
          imagePrompt: "Vibrant Dong Van Sunday market in northern Vietnam, H'mong women in colourful embroidered indigo costumes, traditional minority ethnic dress, mountain market stalls with textiles and local food, Ha Giang"
        }
      ]
    },
    "Mèo Vạc & Ma Pi Leng": {
      areas: ["Ma Pi Leng Pass", "Mèo Vạc Town", "Nho Que River"],
      gems: [
        {
          name: "Ma Pi Leng Pass Boat Trip",
          description: "Take a small wooden boat along the jade-green Nho Que River at the base of Vietnam's most spectacular mountain pass — walls of limestone soaring 1,000m on both sides.",
          category: "nature",
          rating: 4.8,
          reviews: 1340,
          price: "₫200,000",
          platform: "tripadvisor",
          image: "🚤",
          type: "tour",
          area: "Ma Pi Leng Pass",
          imagePrompt: "Small wooden boat on jade-green Nho Que River deep inside Ma Pi Leng gorge Vietnam, vertical limestone canyon walls rising 1000 metres on both sides, utterly dramatic and remote, Ha Giang"
        },
        {
          name: "H'mong Ethnic Minority Homestay",
          description: "Stay with a Black H'mong family in a traditional wooden house, share an evening meal, learn highland weaving, and sleep in the mountains above the clouds.",
          category: "food",
          rating: 4.9,
          reviews: 450,
          price: "₫350,000",
          platform: "withlocals",
          image: "🏮",
          type: "tour",
          area: "Mèo Vạc Town",
          imagePrompt: "Traditional Black H'mong family home in Ha Giang Vietnam, wooden stilted house, family in indigo embroidered clothing sharing meal around a fire, mountain village above the clouds at dusk"
        }
      ]
    }
  },
  "Bosnia & Herzegovina": {
    "Neretva Valley": {
      areas: ["Blagaj", "Kravice", "Mostar Surrounds"],
      gems: [
        {
          name: "Blagaj Tekke Dervish Monastery",
          description: "A 16th-century Sufi dervish monastery perched where the Buna River bursts from a cliff face — one of the most hauntingly beautiful spots in the Balkans.",
          category: "culture",
          rating: 4.8,
          reviews: 2800,
          price: "Free",
          platform: "tripadvisor",
          image: "🕌",
          type: "destination",
          area: "Blagaj",
          imagePrompt: "16th century Blagaj Tekke Dervish monastery built directly against a 200m limestone cliff, Buna River emerging from a cave below, lush green overhanging cliffs, turquoise water, Bosnia Herzegovina"
        },
        {
          name: "Kravice Waterfalls River Swim",
          description: "Swim in natural turquoise pools beneath a horseshoe of waterfalls in a jungle-like canyon. Bosnia's most beautiful natural wonder, still largely undiscovered.",
          category: "nature",
          rating: 4.9,
          reviews: 1200,
          price: "3 BAM",
          platform: "getyourguide",
          image: "💦",
          type: "destination",
          area: "Kravice",
          imagePrompt: "Kravice waterfalls Bosnia Herzegovina, horseshoe-shaped waterfall curtain in a lush canyon, visitors swimming in crystal clear turquoise pools, dense green vegetation, summer sunshine"
        }
      ]
    },
    "Central Bosnia": {
      areas: ["Lukomir", "Via Dinarica", "Prokoško Lake"],
      gems: [
        {
          name: "Lukomir Shepherd Village Trek",
          description: "Hike to Bosnia's highest permanently inhabited village (1,469m) where villagers still live without electricity through winter, cut off by snow for 5 months a year.",
          category: "culture",
          rating: 4.8,
          reviews: 340,
          price: "€35",
          platform: "withlocals",
          image: "🐏",
          type: "tour",
          area: "Lukomir",
          imagePrompt: "Lukomir ancient shepherd village Bosnia, stone and wooden houses with stećak medieval tombstones, shepherd with flock of sheep on cliff edge, dramatic Rakitnica Canyon below, no electricity poles, timeless"
        },
        {
          name: "Via Dinarica White Trail Hike",
          description: "Trek a section of the Balkans' most epic long-distance trail through wild mountain terrain where wolves and bears still roam, rarely visited by outsiders.",
          category: "tours",
          rating: 4.7,
          reviews: 230,
          price: "€55",
          platform: "getyourguide",
          image: "🥾",
          type: "tour",
          area: "Via Dinarica",
          imagePrompt: "Hikers on the Via Dinarica White Trail Bosnia, wild Dinaric Alps landscape, dramatic limestone peaks, untouched primeval forest, mountain wildflowers, no other people, raw Balkan wilderness"
        }
      ]
    }
  },
  "Faroe Islands": {
    "Vágar Island": {
      areas: ["Lake Sørvágsvatn", "Gásadalur", "Bøur"],
      gems: [
        {
          name: "Lake Sørvágsvatn Optical Illusion Hike",
          description: "Guided hike to the world-famous lake that appears to float high above the Atlantic Ocean — a mind-bending geological trick that has to be seen to be believed.",
          category: "nature",
          rating: 4.9,
          reviews: 1450,
          price: "195 DKK",
          platform: "getyourguide",
          image: "🌊",
          type: "tour",
          area: "Lake Sørvágsvatn",
          imagePrompt: "Stunning Lake Sørvágsvatn Faroe Islands appearing to float suspended high above the Atlantic Ocean, dramatic optical illusion from the cliff viewpoint, hikers on the edge, moody Nordic sky, Vágar island"
        },
        {
          name: "Gásadalur Waterfall & Puffin Walk",
          description: "Walk to the most photographed waterfall in the Faroes — it plunges straight into the Atlantic. Pass puffin burrows and ancient Norse field systems along the way.",
          category: "nature",
          rating: 4.8,
          reviews: 780,
          price: "Free",
          platform: "tripadvisor",
          image: "🐦",
          type: "destination",
          area: "Gásadalur",
          imagePrompt: "Múlafossur waterfall at Gásadalur village Faroe Islands, dramatic waterfall tumbling directly into the Atlantic Ocean, tiny Nordic village on the clifftop, puffins on the grass, moody cloudy sky"
        }
      ]
    },
    "Eastern Faroe Islands": {
      areas: ["Gjógv", "Kalsoy", "Eiðisvatn"],
      gems: [
        {
          name: "Gjógv Gorge Village Walk",
          description: "Explore a secret Norse fishing village tucked at the end of a natural sea gorge. One of the most magical and least-visited villages in the Faroes.",
          category: "culture",
          rating: 4.7,
          reviews: 560,
          price: "Free",
          platform: "tripadvisor",
          image: "🏘️",
          type: "destination",
          area: "Gjógv",
          imagePrompt: "Tiny Gjógv village in the Faroe Islands, colourful traditional turf-roofed houses, a natural sea gorge used as a harbour, dramatic basalt cliffs, Atlantic Ocean, moody Nordic atmosphere"
        },
        {
          name: "Kalsoy Kallur Lighthouse Hike",
          description: "Trek across a remote island to a solitary white lighthouse on sheer dramatic cliffs with puffins underfoot and views stretching to Iceland on a clear day.",
          category: "tours",
          rating: 4.9,
          reviews: 890,
          price: "Free",
          platform: "tripadvisor",
          image: "🔦",
          type: "tour",
          area: "Kalsoy",
          imagePrompt: "Kallur lighthouse on the dramatic cliff edge of Kalsoy island Faroe Islands, white lighthouse against dark basalt cliffs and stormy Atlantic sky, puffins on the clifftop grass, remote and wild"
        }
      ]
    }
  },
  "Kyrgyzstan": {
    "Tian Shan Highlands": {
      areas: ["Song-Kul Lake", "Bokonbaevo", "Kochkor"],
      gems: [
        {
          name: "Song-Kul Lake Nomad Yurt Stay",
          description: "Sleep in a traditional felt yurt on the shore of a 3,016m alpine lake surrounded by nomadic horse herders. Community-Based Tourism run entirely by local families.",
          category: "tours",
          rating: 4.9,
          reviews: 890,
          price: "$60",
          platform: "withlocals",
          image: "🏕️",
          type: "tour",
          area: "Song-Kul Lake",
          imagePrompt: "Traditional Kyrgyz yurt camp on the shores of Song-Kul alpine lake at 3000m altitude, horses grazing, nomadic herders in felt hats, reflection of mountains in still lake, high altitude Tian Shan grasslands"
        },
        {
          name: "Eagle Hunter Day with Berkutchi",
          description: "Spend a day with a traditional Kyrgyz eagle hunter near Bokonbaevo. Watch a trained golden eagle hunt across the steppe as it has for 2,000 years.",
          category: "culture",
          rating: 4.8,
          reviews: 560,
          price: "$75",
          platform: "getyourguide",
          image: "🦅",
          type: "tour",
          area: "Bokonbaevo",
          imagePrompt: "Traditional Kyrgyz eagle hunter berkutchi on horseback in the steppe, huge golden eagle on gloved arm, wearing traditional fox-fur hat and embroidered costume, vast open Central Asian grassland, Issyk-Kul region"
        }
      ]
    },
    "Fergana & Naryn": {
      areas: ["Tash Rabat", "Sary-Chelek", "Osh Bazaar"],
      gems: [
        {
          name: "Tash Rabat Silk Road Caravanserai",
          description: "Discover a perfectly preserved 15th-century stone caravanserai in a remote mountain valley — one of the best surviving relics of the ancient Silk Road.",
          category: "culture",
          rating: 4.7,
          reviews: 340,
          price: "$15",
          platform: "tripadvisor",
          image: "🏯",
          type: "destination",
          area: "Tash Rabat",
          imagePrompt: "Ancient Tash Rabat stone caravanserai in remote Kyrgyzstan mountain valley, perfectly preserved 15th-century domed building, rolling green hills, yurts of nomads nearby, Silk Road atmosphere"
        },
        {
          name: "Sary-Chelek Biosphere Lake Trek",
          description: "Trek through ancient walnut forests — among the world's largest — to a stunning alpine lake in a UNESCO biosphere reserve few outsiders ever visit.",
          category: "nature",
          rating: 4.8,
          reviews: 230,
          price: "$40",
          platform: "getyourguide",
          image: "🌰",
          type: "tour",
          area: "Sary-Chelek",
          imagePrompt: "Trekkers walking through vast ancient walnut forest in Kyrgyzstan, Sary-Chelek lake glimpsed through trees, autumn golden and amber light through the canopy, UNESCO biosphere reserve, remote and untouched"
        }
      ]
    }
  },
  "Albania": {
    "Northern Alps": {
      areas: ["Valbona Valley", "Theth Village", "Koman Lake"],
      gems: [
        {
          name: "Valbona to Theth Mountain Trek",
          description: "Cross the legendary Valbona Pass on a full-day hike through the Albanian Alps — Europe's last true wilderness. Reddit's top-rated hidden gem in Europe.",
          category: "tours",
          rating: 4.9,
          reviews: 1250,
          price: "€45",
          platform: "getyourguide",
          image: "🏔️",
          type: "tour",
          area: "Valbona Valley",
          imagePrompt: "Hiker crossing the dramatic Valbona Pass in the Albanian Alps, towering limestone peaks, deep green valleys, wildflowers, pristine European wilderness, golden afternoon light"
        },
        {
          name: "Koman Lake Ferry Journey",
          description: "A 3-hour fjord-like ferry ride through one of Europe's most dramatic lake gorges — the 'Fjord of Albania'. Locals commute; travellers are gobsmacked.",
          category: "nature",
          rating: 4.8,
          reviews: 890,
          price: "€8",
          platform: "tripadvisor",
          image: "⛴️",
          type: "destination",
          area: "Koman Lake",
          imagePrompt: "Small ferry boat cruising through the extraordinary Koman Lake gorge in Albania, sheer canyon walls plunging into emerald green water, dramatic narrow fjord-like landscape, morning mist"
        },
        {
          name: "Theth Village Homestay Experience",
          description: "Sleep in a centuries-old stone guesthouse in this car-free mountain village accessible only by trail, sharing meals with an Albanian highland family.",
          category: "food",
          rating: 4.9,
          reviews: 340,
          price: "€35",
          platform: "withlocals",
          image: "🏡",
          type: "tour",
          area: "Theth Village",
          imagePrompt: "Traditional Albanian stone guesthouse in Theth mountain village, family serving homemade raki and fresh feta on a wooden table, medieval lock-in tower visible, Accursed Mountains backdrop"
        }
      ]
    },
    "Southern Albania": {
      areas: ["Berat", "Gjirokastër", "Apollonia"],
      gems: [
        {
          name: "Berat City of a Thousand Windows",
          description: "Wander the UNESCO-listed Ottoman hilltop city with medieval castle, a mosque and church standing side by side, and windows staring down from every wall.",
          category: "culture",
          rating: 4.7,
          reviews: 2100,
          price: "Free",
          platform: "tripadvisor",
          image: "🪟",
          type: "destination",
          area: "Berat",
          imagePrompt: "UNESCO-listed Berat Albania, the city of a thousand windows, white Ottoman houses with rows of windows climbing the hillside, medieval Berat Castle at the top, Ottoman bridge over the Osum River"
        },
        {
          name: "Gjirokastër Old Bazaar Food Tour",
          description: "Taste byrek, tavë kosi, and homemade raki in Albania's best-preserved Ottoman bazaar town with a passionate local host. No tourists, just real life.",
          category: "food",
          rating: 4.8,
          reviews: 450,
          price: "€30",
          platform: "withlocals",
          image: "🥙",
          type: "tour",
          area: "Gjirokastër",
          imagePrompt: "Traditional Albanian food tour in Gjirokastër bazaar, stone-paved Ottoman market lane, local woman serving byrek pastry, cobblestone streets, old stone houses with grey slate roofs, Albania"
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
          area: "Ushguli",
          imagePrompt: "Medieval stone defence towers of Ushguli, Georgia, one of Europe's highest inhabited villages, snow-capped Greater Caucasus peaks behind, traditional stone houses, dramatic mountain light"
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
          area: "Mestia",
          imagePrompt: "Trekkers hiking between medieval Svan tower villages in the wild Caucasus mountains, Georgia, glacier views, alpine wildflower meadows, snow peaks, Mestia Svaneti region"
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
          area: "Mestia",
          imagePrompt: "Traditional Svan family feast in Georgia, kubdari meat pies and local cheese on wooden table, chacha brandy being poured, stone tower house interior, Caucasus mountain family in traditional dress"
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
          area: "Tsinandali",
          imagePrompt: "Georgian winemaker lowering clay qvevri amphora into the ground at a family vineyard, Kakheti Georgia, amber-coloured natural wine, ancient winemaking tradition, vineyard with autumn colours"
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
          area: "David Gareja",
          imagePrompt: "6th-century cave monastery David Gareja carved into dramatic red cliff face, Georgia-Azerbaijan border, ancient Byzantine frescoes inside carved chambers, semi-arid steppe landscape, wide sky"
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
  "Georgia": { lat: 42.3, lng: 43.4 },
  "Albania": { lat: 41.2, lng: 20.2 },
  "Kyrgyzstan": { lat: 41.2, lng: 74.7 },
  "Faroe Islands": { lat: 62.0, lng: -6.8 },
  "Bosnia & Herzegovina": { lat: 43.9, lng: 17.7 },
  "Vietnam": { lat: 23.0, lng: 105.3 },
  "Namibia": { lat: -22.9, lng: 18.5 },
  "Armenia": { lat: 40.1, lng: 45.0 },
  "Madagascar": { lat: -18.8, lng: 47.0 }
};
