# Maritime Monitor - Setup & Development Guide

## Project Overview

**Maritime Monitor** is a real-time global maritime intelligence dashboard that aggregates and visualizes shipping data, security threats, humanitarian information, and policy updates from multiple authoritative sources.

### Key Features

- **Multi-Layer Intelligence**: Specialized data layers for vessel tracking, security monitoring, weather, humanitarian data, and policy updates
- **Real-Time Updates**: Continuous data synchronization with multiple external sources
- **Advanced Filtering**: Time-range selection, geographic filtering, and custom queries
- **Professional Dark UI**: Security-focused terminal-style interface
- **Modular Architecture**: Easy to extend with new data sources and visualization types

---

## Project Structure

```
maritim maritime-monitor/
├── src/
│   ├── config/
│   │   ├── maritime-layers.ts      # Layer definitions and configuration
│   │   └── data-sources.ts         # External data source configurations
│   ├── types/
│   │   └── maritime.ts             # TypeScript interfaces and types
│   ├── services/
│   │   ├── vessel-tracker.ts       # AIS/vessel tracking service
│   │   ├── security-monitor.ts     # Security intelligence service
│   │   ├── weather-service.ts      # Weather data integration
│   │   ├── humanitarian-data.ts    # Humanitarian assistance data
│   │   └── policy-monitor.ts       # Maritime policy updates
│   ├── styles/
│   │   └── main.css                # Application stylesheet
│   ├── App.ts                      # Main application component
│   └── main.ts                     # Application entry point
├── public/
│   └── index.html                  # Main HTML file
├── package.json                    # Node.js configuration
├── tsconfig.json                   # TypeScript configuration
├── vite.config.ts                  # Vite build configuration
├── README.md                       # Project documentation
├── SETUP_GUIDE.md                  # This file
└── LICENSE                         # MIT License
```

---

## Installation & Setup

### Prerequisites

- **Node.js** v18+ and **npm** v9+
- **Git** for version control
- **Visual Studio Code** (recommended) or your preferred editor

### Step 1: Clone the Repository

```bash
git clone https://github.com/tdeletto/maritime-monitor.git
cd maritime-monitor
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Environment Configuration

Create a `.env.local` file in the project root:

```env
# API Keys (obtain from respective services)
VITE_AIS_HUB_API_KEY=your_aishub_api_key_here
VITE_OPENWEATHER_API_KEY=your_openweather_api_key_here
VITE_MARITIME_AWARENESS_API_KEY=your_api_key_here

# Optional: Data refresh rates (in milliseconds)
VITE_AIS_UPDATE_INTERVAL=60000
VITE_SECURITY_UPDATE_INTERVAL=300000
VITE_WEATHER_UPDATE_INTERVAL=600000

# Optional: Map center coordinates (latitude, longitude)
VITE_MAP_CENTER_LAT=0
VITE_MAP_CENTER_LON=20
```

### Step 4: Development Server

Start the development server with hot reload:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Step 5: Build for Production

Create an optimized production build:

```bash
npm run build
```

Generated files will be in the `dist/` directory.

---

## Development Workflow

### Running Tests

```bash
# Run test suite
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Type checking
npm run type-check
```

### Available Scripts

```json
{
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "type-check": "tsc --noEmit",
  "lint": "eslint src --ext ts,tsx",
  "lint:fix": "eslint src --ext ts,tsx --fix",
  "format": "prettier --write \"src/**/*.{ts,tsx,css,json,md}\"",
  "test": "vitest",
  "test:watch": "vitest --watch",
  "test:coverage": "vitest --coverage"
}
```

---

## Architecture & Design

### Data Flow

```
External Data Sources
    ↓
Service Layer (vessel-tracker, security-monitor, etc.)
    ↓
Data Processing & Caching
    ↓
Application State (AppState)
    ↓
UI Components & Visualization
    ↓
User Interaction
```

### Maritime Layers

Each maritime layer represents a distinct data source and visualization:

1. **AIS Vessel Tracking** - Real-time ship positions from AIS signals
2. **Maritime Security** - Security alerts and incident reports
3. **Weather Services** - Oceanic weather patterns and alerts
4. **Humanitarian Assistance** - Crisis response and SAR operations
5. **Maritime Policy** - Regulatory updates and policy changes

Layers can be toggled independently and have customizable update intervals.

### Type System

The project uses strict TypeScript with comprehensive type definitions:

```typescript
// Example types from maritime.ts
interface MaritimeLayer {
  id: string;
  name: string;
  type: 'vessel' | 'security' | 'weather' | 'humanitarian' | 'policy';
  enabled: boolean;
  color: string;
  updateInterval: number;
}

interface Vessel {
  mmsi: string;
  name: string;
  position: { latitude: number; longitude: number };
  heading: number;
  speed: number;
  source: 'ais' | 'sais';
  lastUpdate: Date;
}
```

---

## Adding New Data Sources

### Example: Adding a New Maritime Layer

1. **Define the layer** in `config/maritime-layers.ts`:

```typescript
export const MARITIME_LAYERS: Record<string, MaritimeLayer> = {
  myNewLayer: {
    id: 'my-new-layer',
    name: 'My New Data Source',
    type: 'security',
    enabled: false,
    color: '#00ff99',
    updateInterval: 300000,
  },
  // ... other layers
};
```

2. **Create a service** in `services/my-service.ts`:

```typescript
export async function fetchMyData(): Promise<any[]> {
  try {
    const response = await fetch('https://api.example.com/data', {
      headers: { Authorization: `Bearer ${import.meta.env.VITE_MY_API_KEY}` },
    });
    return await response.json();
  } catch (error) {
    console.error('Error fetching my data:', error);
    return [];
  }
}
```

3. **Integrate into App.ts**:

```typescript
import { fetchMyData } from './services/my-service';

// In startDataFetching():
if (appState.activeLayers.find(l => l.id === 'my-new-layer')) {
  setInterval(async () => {
    const data = await fetchMyData();
    console.log('[Maritime Monitor] Updated my data:', data);
  }, 300000);
}
```

---

## API Integration Guide

### Supported Data Sources

#### 1. AIS Hub API
- **Purpose**: Real-time vessel position tracking
- **Endpoint**: `https://www.aishub.net/api/...`
- **Auth**: API key
- **Rate Limit**: Check provider documentation

#### 2. OpenWeather API
- **Purpose**: Maritime weather data
- **Endpoint**: `https://api.openweathermap.org/...`
- **Auth**: API key
- **Rate Limit**: 60 calls/minute (free tier)

#### 3. Maritime Awareness Service
- **Purpose**: Security incidents and alerts
- **Endpoint**: To be configured
- **Auth**: API key
- **Rate Limit**: Check provider documentation

### Error Handling

All service functions should implement proper error handling:

```typescript
export async function fetchData(): Promise<Data[]> {
  try {
    // API call
    return data;
  } catch (error) {
    if (error instanceof NetworkError) {
      console.error('[Maritime Monitor] Network error:', error);
      // Implement retry logic
    } else if (error instanceof AuthenticationError) {
      console.error('[Maritime Monitor] Auth failed:', error);
      // Handle token refresh
    } else {
      console.error('[Maritime Monitor] Unexpected error:', error);
    }
    return [];
  }
}
```

---

## Performance Optimization

### Data Caching Strategy

- Cache layer responses for 5-10 minutes
- Implement incremental updates rather than full refreshes
- Use IndexedDB for client-side persistence
- Limit map markers to visible viewport

### Bundle Size

```bash
# Analyze bundle size
npm run build -- --analyze
```

### Lazy Loading

- Load service modules on-demand
- Code-split by maritime layer
- Defer non-critical visualizations

---

## Deployment

### GitHub Pages

```bash
# Build the project
npm run build

# Deploy to GitHub Pages
git add dist/
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install && npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

---

## Troubleshooting

### Common Issues

**Issue**: Port 5173 already in use
```bash
VITE_PORT=3000 npm run dev
```

**Issue**: API key errors
- Verify `.env.local` contains correct keys
- Check API rate limits and remaining quota
- Ensure APIs are enabled in provider dashboard

**Issue**: TypeScript compilation errors
```bash
npm run type-check
```

**Issue**: Module not found
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Format with Prettier
- Write descriptive commit messages

---

## Support & Documentation

- **GitHub Issues**: [Report bugs or request features](https://github.com/tdeletto/maritime-monitor/issues)
- **Discussions**: [Community discussions](https://github.com/tdeletto/maritime-monitor/discussions)
- **Documentation**: See README.md for overview and features

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

**Last Updated**: February 2026
