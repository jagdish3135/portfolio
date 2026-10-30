import type { CaseStudy } from '../projects'

const caseStudy: CaseStudy = {
  problem: [
    'What is happening on the planet right now (a tremor near the Andamans, a cyclone off Odisha, the ISS overhead) is all public, but it lives on a dozen agency sites with different formats and no shared picture.',
    'Most world dashboards also start from a Western view, and many draw India’s borders wrong.',
  ],
  built: [
    'Sanjaya puts seven live layers on one globe: earthquakes, satellites, day and night, disasters, wildfires, rain and wind, and undersea cables. Each has its own switch and filters, refreshes on its own schedule, and links to its source.',
    'It is India-first: India is drawn with its official boundary as per the Survey of India, 88 ISRO satellites are tracked by name, and the Sanjaya narrates feed describes each event in plain sentences, like the charioteer who narrated the war to a king who could not see it.',
  ],
  builtList: [
    'One small API route per feed, cached in memory and on the CDN',
    'Satellite positions calculated on your device with SGP4',
    'Quakes from USGS and EMSC merged into one list',
    'No database, no sign-in, no tracking and no API keys',
    'A brass sighting dial inspired by the Jantar Mantar instruments',
  ],
  diagram: {
    lanes: [
      {
        title: 'Free open feeds',
        nodes: [
          { id: 'quakes', label: 'USGS + EMSC', sub: 'earthquakes' },
          { id: 'tle', label: 'CelesTrak', sub: 'satellite orbits' },
          { id: 'hazards', label: 'GDACS · FIRMS', sub: 'GIBS · Open-Meteo' },
        ],
      },
      {
        title: 'Next.js routes',
        nodes: [
          { id: 'routes', label: 'Route per feed', sub: 'compact JSON shape', accent: true },
          { id: 'cache', label: 'Cache', sub: 'memory + CDN' },
        ],
      },
      { title: 'Backup', nodes: [{ id: 'snap', label: 'Saved orbits', sub: 'if CelesTrak is busy' }] },
      { title: 'Browser', nodes: [{ id: 'fetch', label: 'Fetch what’s on', sub: 'only visible layers' }] },
      {
        title: 'On your device',
        nodes: [
          { id: 'sgp4', label: 'SGP4 positions', sub: '1,200 per frame', accent: true },
          { id: 'sun', label: 'Sun and night', sub: 'worked out locally' },
        ],
      },
      {
        title: 'Globe',
        nodes: [
          { id: 'globe', label: 'MapLibre globe', sub: 'official India boundary', accent: true },
          { id: 'narrate', label: 'Sanjaya narrates', sub: 'plain-sentence feed' },
        ],
      },
    ],
    edges: [
      { from: 'quakes', to: 'routes' },
      { from: 'tle', to: 'routes' },
      { from: 'hazards', to: 'routes' },
      { from: 'routes', to: 'cache' },
      { from: 'cache', to: 'fetch' },
      { from: 'snap', to: 'fetch', label: 'if busy', dashed: true },
      { from: 'fetch', to: 'sgp4' },
      { from: 'fetch', to: 'sun' },
      { from: 'sgp4', to: 'globe' },
      { from: 'sun', to: 'globe' },
      { from: 'globe', to: 'narrate' },
    ],
    band: {
      label: 'Always current, never blank',
      sub: 'A failed feed keeps its last good data · each satellite card shows its orbit’s age',
      lanes: [1, 4],
    },
  },
  how: [
    {
      title: 'One route per feed',
      body: 'Each feed (/api/earthquakes, /api/satellites, /api/disasters, /api/fires, /api/wind, /api/cables) fetches its source with a timeout and retry, turns it into a compact shape and caches it.',
    },
    {
      title: 'Merge and narrate',
      body: 'USGS and EMSC quakes are treated as one event when they are within 90 seconds, 150 km and one magnitude unit, and USGS details win. Each event becomes a plain sentence in the feed.',
    },
    {
      title: 'Ask only for what’s on',
      body: 'The browser requests a feed only while its layer is switched on, so a first visit loads earthquakes, satellites and day and night, not everything.',
    },
    {
      title: 'Orbits on your device',
      body: 'Satellite positions are calculated in the browser with SGP4 from CelesTrak’s orbit data. If CelesTrak is busy, orbits come from a copy saved at build time.',
    },
    {
      title: 'Draw the globe',
      body: 'MapLibre draws a night-observatory basemap with India’s official boundary and state lines. Click any event, satellite or cable to fly there and open its card.',
    },
  ],
  features: [
    {
      title: 'India-first',
      body: 'The globe spins in to India, drawn with its official boundary, and the narration names the nearest Indian place: “M5.1, 218 km NNW of Bamboo Flat, India, 10 km below the surface.”',
      image: '/work/sanjaya/feature-india',
      alt: 'Sanjaya globe centred on India with an earthquake card open',
      shape: 'wide',
    },
    {
      title: 'Satellites, moving live',
      body: 'Space stations, 88 ISRO satellites, navigation, weather and Starlink move in real time. Click one for its next orbit and how old its orbit data is.',
      image: '/work/sanjaya/feature-iss',
      alt: 'The International Space Station selected on the globe with its ground track',
      shape: 'wide',
    },
    {
      title: 'Disasters and fires',
      body: 'Cyclones, floods, volcanoes and droughts with GDACS alert levels, and every wildfire hotspot NASA saw from orbit in the last 24 hours.',
      image: '/work/sanjaya/feature-hazards',
      alt: 'The globe with disaster alerts and wildfire hotspots switched on',
      shape: 'wide',
    },
    {
      title: 'On a phone',
      body: 'The layer panel and the narration become bottom sheets, and everything calms down when your system asks for reduced motion.',
      image: '/work/sanjaya/feature-mobile',
      alt: 'Sanjaya on a phone with the layers panel open',
      shape: 'tall',
    },
  ],
  hardest: {
    problem:
      'Starlink alone has thousands of satellites. Working out every position with SGP4 on every frame would freeze the page, especially on a phone.',
    solution: [
      'The animation loop works through the satellite list in chunks of 1,200 per frame and picks up where it left off on the next frame. Only after a full pass does it send the new positions to the map, about once a second, or every two seconds when there are more than 3,000.',
      'The ISS and Tiangong are drawn last, on top of the capsules docked to them, so a click picks the station. And if CelesTrak is down, a snapshot of orbits saved at build time keeps the layer working.',
    ],
    code: {
      file: 'src/components/Globe.tsx',
      source: `if (vis.satellites && satList.length) {
  const now = new Date();
  const end = Math.min(satList.length, satIdx + 1200);
  for (; satIdx < end; satIdx++) {
    const s = satList[satIdx];
    const st = satState(s.rec, now);
    satFeatures[satIdx] = st && {
      type: "Feature",
      properties: { id: s.id, group: s.group, short: s.short },
      geometry: { type: "Point", coordinates: [st.lon, st.lat] },
    };
  }
  if (satIdx >= satList.length) {
    satIdx = 0;
    const every = satList.length > 3000 ? 2000 : 1000;
    if (t - lastPush > every) { lastPush = t; /* push to the map */ }
  }
}`,
    },
  },
  next: [
    'Flights, air quality and world events as new layers.',
    'Ships in the Indian Ocean.',
    'Ask in plain English: an AI assistant that flies the map and switches layers for you.',
  ],
}

export default caseStudy
