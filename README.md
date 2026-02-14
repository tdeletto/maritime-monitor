# Maritime Monitor

**AI-Powered Real-Time Maritime Intelligence Dashboard**

An advanced monitoring system for tracking global maritime activity including shipping routes, trade volumes, maritime conflicts, piracy incidents, weather events affecting shipping lanes, refugee movements via sea routes, and maritime policy developments. 

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)

## Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Data Sources](#data-sources)
- [Usage](#usage)
- [Troubleshooting](#troubleshooting)
- [Free Hosting Options](#free-hosting-options)
- [Development](#development)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Monitoring Capabilities

- **🚢 International Shipping Routes & Trade**
  - Real-time vessel tracking via AIS (Automatic Identification System)
  - Global shipping volume analytics
  - Trade corridor monitoring
  - Port congestion tracking
  - Container ship movements
  - Tanker activities

- **⚠️ Maritime Conflicts & Piracy**
  - Piracy incident reporting and mapping
  - Naval activity tracking
  - Territorial dispute monitoring
  - Maritime security incidents
  - Hijacking alerts
  - Regional conflict impacts on shipping

- **🌊 Weather & Environmental Events**
  - Storm tracking affecting shipping lanes
  - Hurricane and typhoon alerts
  - Sea ice conditions (Arctic/Antarctic)
  - Fog and visibility alerts
  - Wave height forecasting
  - Tsunami warnings
  - Port weather conditions

- **👥 Refugee & Humanitarian Tracking**
  - Sea-based refugee movements
  - Rescue operation alerts
  - Humanitarian crisis maritime impacts
  - Coastal migration patterns
  - Search and rescue activities

- **📋 Maritime Policy & Regulations**
  - IMO (International Maritime Organization) updates
  - Sanctions and embargo tracking
  - Port authority regulations
  - Environmental protection policies
  - Shipping restrictions by region
  - Flag state changes

- **🗺️ Geopolitical & Trade Intelligence**
  - Trade agreement impacts on shipping
  - Blockade monitoring
  - Territorial water disputes
  - Strategic shipping chokepoint status
  - International maritime law developments

- **📊 Real-Time Data Visualization**
  - Interactive world map with shipping data
  - Heat maps of maritime activity
  - Timeline-based event tracking
  - Vessel type categorization
  - Route optimization visualization

## System Architecture

```
┌─────────────────────────────────────────┐
│      Maritime Monitor Dashboard         │
│  (Vite + TypeScript + Deck.gl)          │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│    Data Aggregation Layer               │
│  • RSS Feed Processors                  │
│  • API Integrators                      │
│  • Data Normalization                   │
│  • Real-time Update Engine              │
└────────────┬────────────────────────────┘
             │
      ┌──────┴──────────┬──────────┬──────────┬──────────┐
      ▼                 ▼          ▼          ▼          ▼
  AIS Feeds      Weather APIs  News APIs   IMO Feeds  Policy DBs
  (ShipXML)      (NOAA/Windy) (NewsAPI)   (RSS)      (Regulations)
```

## System Requirements

### Minimum Requirements

- **Node.js**: 18.0.0 or higher
- **npm**: 9.0.0 or higher
- **RAM**: 512MB minimum (2GB recommended)
- **Storage**: 500MB for dependencies
- **Bandwidth**: For real-time feeds, consistent internet connection

### Supported Operating Systems

- macOS 10.15+
- Linux (Ubuntu 20.04+, Debian 11+)
- Windows 10/11
- Docker support (included)

### Browser Requirements

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/tdeletto/maritime-monitor.git
cd maritime-monitor
```

### Step 2: Install Dependencies

```bash
npm install
```

If you encounter issues with specific packages, try:

```bash
npm install --legacy-peer-deps
```

### Step 3: Setup Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your API keys and configuration:

```env
# Maritime Data Sources
VITE_AIS_ENDPOINT=https://api.aishub.net/v1/
VITE_AIS_API_KEY=your_aishub_key_here

# Weather Data
VITE_WEATHER_API_KEY=your_weather_api_key
VITE_NOAA_ENDPOINT=https://api.weather.gov/

# News and Intelligence Feeds
VITE_NEWS_API_KEY=your_newsapi_key
VITE_MARITIME_NEWS_RSS_FEEDS=https://feeds.bloomberg.com/markets/shipping.rss

# IMO and Policy Updates
VITE_IMO_RSS_ENDPOINT=https://www.imo.org/en/MediaCentre/HotTopics/Pages/default.aspx

# Database Configuration (optional)
VITE_REDIS_URL=redis://localhost:6379
VITE_DATABASE_URL=postgresql://user:password@localhost:5432/maritime_monitor

# Application Settings
VITE_APP_ENV=development
VITE_DEBUG_MODE=false
VITE_LOG_LEVEL=info

# Map and Visualization
VITE_MAPBOX_API_TOKEN=your_mapbox_token
VITE_MAP_CENTER=0,20
VITE_MAP_ZOOM_LEVEL=2
```

### Step 4: Build and Start

**Development Mode:**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

**Production Build:**
```bash
npm run build
npm run preview
```

## Configuration

### API Keys Required

#### Free Tier Options

1. **AIS Shipping Data** (Free)
   - [MarineTraffic API](https://www.marinetraffic.com/en/ais-api-services) - Limited free tier
   - [AISHUB.net](https://www.aishub.net/) - Free API access
   - [VesselFinder](https://www.vesselfinder.com/api) - Free historical data

2. **Weather Data** (Free)
   - [NOAA National Weather Service](https://www.weather.gov/documentation/services-web-api) - Free
   - [OpenWeatherMap](https://openweathermap.org/api) - Free tier available
   - [Open-Meteo](https://open-meteo.com/) - Free, no key required

3. **News & Information** (Free)
   - [NewsAPI](https://newsapi.org/) - Free tier (100 requests/day)
   - [Guardian API](https://open-platform.theguardian.com/) - Free
   - RSS feeds (No authentication required)

4. **Maritime Regulations** (Free)
   - IMO Official RSS feeds
   - SOLAS Updates
   - MARPOL Regulations

5. **Mapping** (Free)
   - [MapLibre GL](https://maplibre.org/) - Open source
   - [OpenStreetMap](https://www.openstreetmap.org/) - Free tiles

### Layer Configuration

Edit `src/config/maritime-layers.ts` to customize:

```typescript
export const MARITIME_LAYERS = {
  'VESSEL_TRACKING': {
    name: 'Vessel Tracking',
    sources: ['ais-hub', 'marine-traffic'],
    updateInterval: 60000,
    enabled: true
  },
  'PIRACY_INCIDENTS': {
    name: 'Piracy & Maritime Crimes',
    sources: ['icc-imd', 'naval-news'],
    updateInterval: 3600000,
    enabled: true
  },
  'WEATHER_ALERTS': {
    name: 'Weather Events',
    sources: ['noaa', 'open-meteo'],
    updateInterval: 600000,
    enabled: true
  },
  'REFUGEE_MOVEMENTS': {
    name: 'Refugee & Humanitarian',
    sources: ['unhcr', 'humanitarian-data'],
    updateInterval: 7200000,
    enabled: true
  },
  'POLICY_UPDATES': {
    name: 'Maritime Policy',
    sources: ['imo-feeds', 'regulation-updates'],
    updateInterval: 86400000,
    enabled: true
  },
  'TRADE_ROUTES': {
    name: 'Trade Routes & Corridors',
    sources: ['shipping-intelligence'],
    updateInterval: 3600000,
    enabled: true
  },
  'PORT_STATUS': {
    name: 'Port Information',
    sources: ['port-authorities', 'congestion-data'],
    updateInterval: 1800000,
    enabled: true
  }
};
```

## Data Sources

### Primary Maritime Data Sources

| Data Type | Primary Source | Update Interval | Coverage |
|-----------|----------------|-----------------|----------|
| Vessel Tracking | AIS feeds | 5-10 minutes | Global |
| Piracy Incidents | ICC-IMB, Naval News | 24 hours | Global |
| Weather Events | NOAA, Open-Meteo | 1 hour | Global |
| Refugee Movements | UNHCR, International Media | 12 hours | Migration routes |
| Maritime Policy | IMO, National Authorities | 24 hours | Global |
| Trade Routes | Shipping Intelligence | 1 hour | Global corridors |
| Port Status | Port Authorities | 6 hours | Major ports |

### RSS Feed Integrations

```typescript
export const MARITIME_FEEDS = [
  // Shipping News
  'https://www.hellenicshippingnews.com/feed/',
  'https://www.seatrade-global.com/feed/',
  'https://www.worldmaritimenews.com/feed/',
  
  // Maritime Security
  'https://www.icc-ccs.org/feed', // International Chamber of Commerce - Maritime News
  'https://www.navalnews.com/feed/',
  
  // Policy & Regulations
  'https://www.imo.org/feeds/rss.php',
  
  // Environmental
  'https://www.oceanweather.com/feed/',
];
```

## Usage

### Running the Application

```bash
# Development
npm run dev

# Production
npm run build && npm run preview
```

### Interactive Dashboard Features

1. **Layer Toggle Panel** (Left side)
   - Select/deselect maritime data layers
   - Maritime option appears in the dropdown
   - Real-time visibility control

2. **Map Controls** (Top-right)
   - Zoom controls
   - Map style selector (Dark/Light)
   - Time range selector for historical data

3. **Search & Filter**
   - Search by vessel name, IMO number
   - Filter by vessel type, flag state
   - Geographic region filters

4. **Info Panels**
   - Vessel details on click
   - Event information cards
   - Weather alerts and warnings

### Example Use Cases

**Monitoring Trade Route Disruptions:**
```
1. Enable "Trade Routes" layer
2. Enable "Piracy Incidents" layer
3. Look for anomalies in vessel patterns
4. Review associated policy updates
```

**Tracking Humanitarian Crises:**
```
1. Enable "Refugee & Humanitarian" layer
2. Enable "Weather Alerts" to correlate
3. Monitor rescue operation feeds
4. Track policy responses
```

**Weather Impact Analysis:**
```
1. Enable "Weather Events" layer
2. Compare with "Vessel Tracking" data
3. Check port status updates
4. Monitor shipping delays
```

## Troubleshooting

### Common Issues

**Port Already in Use**
```bash
# Change the default port
npm run dev -- --port 3000
```

**API Key Errors**
```
Error: Invalid API key for weather service
Solution: Check .env file for correct key format
Verify API key is active in provider dashboard
```

**Data Not Updating**
```bash
# Check data source connectivity
curl -H "Authorization: Bearer YOUR_KEY" https://api.aishub.net/v1/

# Restart the application
npm run dev

# Check browser console for errors (F12)
```

**Memory Issues on Low-End Systems**
```bash
# Reduce tile cache size in .env
VITE_TILE_CACHE_SIZE=50

# Reduce update frequency
VITE_UPDATE_INTERVAL=120000
```

**CORS Errors**
```
Solution: Enable CORS proxy for RSS feeds
Update src/config/feeds.ts to use CORS proxy:
const corsProxy = 'https://cors-anywhere.herokuapp.com/';
```

## Free Hosting Options

### Option 1: Vercel (Recommended)

1. **Deploy**
```bash
npm install -g vercel
vercel
```

2. **Set Environment Variables in Dashboard**
   - Go to Settings → Environment Variables
   - Add all API keys from .env

3. **Auto-deployment**
   - Push to GitHub
   - Vercel auto-deploys on push

**Limits**: 100GB/month bandwidth, 12 concurrent functions

### Option 2: Netlify

1. **Deploy**
```bash
npm install -g netlify-cli
netlify deploy --prod
```

2. **Set Environment Variables**
   - Build & Deploy → Environment
   - Add all .env variables

**Limits**: 300 minutes/month build time

### Option 3: GitHub Pages

1. **Build Static Site**
```bash
npm run build
```

2. **Deploy to gh-pages**
```bash
gh-pages -d dist
```

**Limits**: Static site only, limited backend capabilities

### Option 4: Render

1. **Deploy**
   - Connect GitHub repository
   - Select "Vite" as build command
   - Set environment variables

2. **Auto-redeploy** on push

**Limits**: Auto-sleep after 15 mins inactivity

### Option 5: Railway.app

1. **Deploy**
   - Link GitHub account
   - Select maritime-monitor repo
   - Configure environment

2. **Free tier**: $5/month credit

## Development

### Project Structure

```
maritim-monitor/
├── src/
│   ├── components/        # UI components
│   ├── config/           # Maritime layer configurations
│   ├── services/         # Data fetchers & processors
│   ├── styles/           # CSS/styling
│   ├── types/            # TypeScript definitions
│   ├── utils/            # Utility functions
│   ├── workers/          # Web workers for data processing
│   ├── App.ts            # Main application logic
│   └── main.ts           # Entry point
├── tests/                # Test files
├── .env.example          # Environment template
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
├── vite.config.ts        # Vite configuration
└── README.md             # This file
```

### Adding New Maritime Data Sources

1. **Create feed configuration** in `src/config/feeds.ts`

```typescript
export const MARITIME_FEEDS = [
  {
    name: 'New Shipping Feed',
    url: 'https://example.com/feed.rss',
    category: 'shipping',
    updateInterval: 3600000
  }
];
```

2. **Create data processor** in `src/services/feed-processors/`

```typescript
export class ShippingFeedProcessor {
  async process(feedData: any) {
    // Parse and normalize feed data
    return normalizedData;
  }
}
```

3. **Register in layer config** `src/config/maritime-layers.ts`

### Running Tests

```bash
# Run all tests
npm test

# Test maritime data
npm run test:data

# Watch mode
npm test -- --watch
```

### Type Checking

```bash
npm run typecheck
```

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/maritime-feature`
3. Commit changes: `git commit -am 'Add maritime feature'`
4. Push to branch: `git push origin feature/maritime-feature`
5. Submit pull request

## License

MIT License - See LICENSE file for details

## Support

- 📖 Documentation: [View Docs](./docs)
- 🐛 Issues: [GitHub Issues](https://github.com/tdeletto/maritime-monitor/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/tdeletto/maritime-monitor/discussions)

## Acknowledgments

- Based on [World Monitor](https://github.com/koala73/worldmonitor) architecture
- Maritime data sources: MarineTraffic, AIS Hub, NOAA, IMO
- Visualization: Deck.gl, MapLibre GL
- Created with ❤️ for maritime intelligence professionals

---

**Last Updated**: February 14, 2026  
**Status**: Active Development
