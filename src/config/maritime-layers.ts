import { MaritimeLayer, MaritimeEventType } from '@/types/maritime';

export const MARITIME_LAYERS: Record<string, MaritimeLayer> = {
  VESSEL_TRACKING: {
    name: '⛴️ Vessel Tracking',
    id: 'vessel-tracking',
    type: 'vessel_tracking',
    enabled: true,
    sources: ['ais-hub', 'marine-traffic'],
    updateInterval: 60000, // 1 minute
    dataPoints: [],
    lastUpdated: new Date(),
    nextUpdate: new Date(Date.now() + 60000),
  },
  PIRACY_INCIDENTS: {
    name: '🏴‍☠️ Piracy & Maritime Crimes',
    id: 'piracy-incidents',
    type: 'piracy_incident',
    enabled: true,
    sources: ['icc-imd', 'naval-news', 'maritime-security-feeds'],
    updateInterval: 3600000, // 1 hour
    dataPoints: [],
    lastUpdated: new Date(),
    nextUpdate: new Date(Date.now() + 3600000),
  },
  WEATHER_ALERTS: {
    name: '🌊 Weather Events',
    id: 'weather-alerts',
    type: 'weather_alert',
    enabled: true,
    sources: ['noaa', 'open-meteo', 'weather-api'],
    updateInterval: 600000, // 10 minutes
    dataPoints: [],
    lastUpdated: new Date(),
    nextUpdate: new Date(Date.now() + 600000),
  },
  REFUGEE_MOVEMENTS: {
    name: '🚢 Refugee & Humanitarian',
    id: 'refugee-movements',
    type: 'refugee_movement',
    enabled: true,
    sources: ['unhcr', 'humanitarian-data', 'maritime-rescue-feeds'],
    updateInterval: 7200000, // 2 hours
    dataPoints: [],
    lastUpdated: new Date(),
    nextUpdate: new Date(Date.now() + 7200000),
  },
  POLICY_UPDATES: {
    name: '📋 Maritime Policy',
    id: 'policy-updates',
    type: 'policy_update',
    enabled: true,
    sources: ['imo-feeds', 'regulation-updates', 'policy-databases'],
    updateInterval: 86400000, // 24 hours
    dataPoints: [],
    lastUpdated: new Date(),
    nextUpdate: new Date(Date.now() + 86400000),
  },
  TRADE_ROUTES: {
    name: '🛣️ Trade Routes & Corridors',
    id: 'trade-routes',
    type: 'trade_route',
    enabled: true,
    sources: ['shipping-intelligence', 'trade-data', 'route-analytics'],
    updateInterval: 3600000, // 1 hour
    dataPoints: [],
    lastUpdated: new Date(),
    nextUpdate: new Date(Date.now() + 3600000),
  },
  PORT_STATUS: {
    name: '🏗️ Port Information',
    id: 'port-status',
    type: 'port_status',
    enabled: true,
    sources: ['port-authorities', 'congestion-data', 'port-databases'],
    updateInterval: 1800000, // 30 minutes
    dataPoints: [],
    lastUpdated: new Date(),
    nextUpdate: new Date(Date.now() + 1800000),
  },
};

// Layer display order in UI
export const MARITIME_LAYER_ORDER: (keyof typeof MARITIME_LAYERS)[] = [
  'VESSEL_TRACKING',
  'TRADE_ROUTES',
  'PIRACY_INCIDENTS',
  'WEATHER_ALERTS',
  'REFUGEE_MOVEMENTS',
  'POLICY_UPDATES',
  'PORT_STATUS',
];

// Color scheme for layers
export const LAYER_COLORS: Record<MaritimeEventType, string> = {
  vessel_tracking: '#00ff00',
  piracy_incident: '#ff3333',
  weather_alert: '#ffaa00',
  refugee_movement: '#00ccff',
  policy_update: '#9933ff',
  trade_route: '#00ff99',
  port_status: '#ffff00',
};

// Severity color scheme
export const SEVERITY_COLORS = {
  low: '#00ff00',
  medium: '#ffff00',
  high: '#ff9900',
  critical: '#ff0000',
};

// Get layer by ID
export function getMaritimeLayer(id: string): MaritimeLayer | undefined {
  return Object.values(MARITIME_LAYERS).find(layer => layer.id === id);
}

// Get all layers
export function getAllMaritimeLayers(): MaritimeLayer[] {
  return Object.values(MARITIME_LAYERS);
}

// Get enabled layers
export function getEnabledMaritimeLayers(): MaritimeLayer[] {
  return Object.values(MARITIME_LAYERS).filter(layer => layer.enabled);
}

// Update layer data
export function updateMaritimeLayer(layerId: string, dataPoints: any[]) {
  const layer = getMaritimeLayer(layerId);
  if (layer) {
    layer.dataPoints = dataPoints;
    layer.lastUpdated = new Date();
    layer.nextUpdate = new Date(Date.now() + layer.updateInterval);
  }
}
