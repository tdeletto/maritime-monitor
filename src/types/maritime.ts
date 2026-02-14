// Maritime Intelligence Data Types

export type MaritimeEventType = 
  | 'vessel_tracking'
  | 'piracy_incident'
  | 'weather_alert'
  | 'refugee_movement'
  | 'policy_update'
  | 'trade_route'
  | 'port_status';

export type VesselType = 
  | 'container_ship'
  | 'bulk_carrier'
  | 'tanker'
  | 'general_cargo'
  | 'passenger'
  | 'fishing'
  | 'military'
  | 'other';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export type WeatherEventType = 
  | 'storm'
  | 'hurricane'
  | 'typhoon'
  | 'fog'
  | 'ice'
  | 'wave_height'
  | 'tsunami';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Vessel {
  imo: string;
  mmsi: string;
  name: string;
  type: VesselType;
  flagState: string;
  position: Coordinates;
  heading: number; // 0-359 degrees
  speed: number; // knots
  timestamp: Date;
  source: 'ais' | 'marinetraffic' | 'other';
  destination?: string;
  eta?: Date;
  captain?: string;
  crew?: number;
  cargo?: string;
}

export interface PiracyIncident {
  id: string;
  date: Date;
  location: Coordinates;
  region: string;
  description: string;
  severity: AlertSeverity;
  vesselInvolved?: string;
  casualties?: number;
  status: 'reported' | 'ongoing' | 'resolved';
  source: string;
  references?: string[];
}

export interface WeatherAlert {
  id: string;
  type: WeatherEventType;
  location: Coordinates;
  region: string;
  severity: AlertSeverity;
  description: string;
  timestamp: Date;
  expectedDuration?: number; // hours
  affectedArea?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  windSpeed?: number; // knots
  waveHeight?: number; // meters
}

export interface RefugeeMovement {
  id: string;
  date: Date;
  departureLocation: Coordinates;
  destinationLocation: Coordinates;
  estimatedNumber: number;
  status: 'reported' | 'in_transit' | 'arrived' | 'rescue';
  severity: AlertSeverity;
  description: string;
  source: string;
  rescueOperations?: string[];
}

export interface MaritimePolicy {
  id: string;
  date: Date;
  type: 'regulation' | 'sanction' | 'agreement' | 'update';
  organization: string; // IMO, UN, etc.
  title: string;
  description: string;
  affectedRegions: string[];
  effectiveDate: Date;
  summary: string;
  references?: string[];
}

export interface TradeRoute {
  id: string;
  name: string;
  origin: {
    port: string;
    coordinates: Coordinates;
  };
  destination: {
    port: string;
    coordinates: Coordinates;
  };
  commodities: string[];
  volumePerYear: number; // TEU or tons
  estimatedTransitTime: number; // hours
  criticalChokPoints?: Coordinates[];
  currentStatus: 'active' | 'disrupted' | 'blocked';
  disruptions?: string[];
}

export interface PortStatus {
  id: string;
  name: string;
  coordinates: Coordinates;
  country: string;
  status: 'operational' | 'congested' | 'closed' | 'limited';
  congestionLevel: number; // 0-100
  vesselCount: number;
  avgWaitTime: number; // hours
  weather: string;
  timestamp: Date;
  capacity: {
    current: number; // vessels
    maximum: number; // vessels
  };
}

export interface MaritimeLayer {
  name: string;
  id: string;
  type: MaritimeEventType;
  enabled: boolean;
  sources: string[];
  updateInterval: number; // milliseconds
  dataPoints: MaritimeEvent[];
  lastUpdated: Date;
  nextUpdate: Date;
}

export interface MaritimeEvent {
  id: string;
  type: MaritimeEventType;
  timestamp: Date;
  location: Coordinates;
  severity: AlertSeverity;
  title: string;
  description: string;
  data: Vessel | PiracyIncident | WeatherAlert | RefugeeMovement | MaritimePolicy | TradeRoute | PortStatus;
  source: string;
  tags: string[];
}

export interface FeedSource {
  name: string;
  url: string;
  type: 'rss' | 'api' | 'webhook';
  category: MaritimeEventType;
  updateInterval: number; // milliseconds
  enabled: boolean;
  auth?: {
    type: 'apikey' | 'oauth' | 'basic';
    credentials?: string;
  };
}

export interface MapConfig {
  center: Coordinates;
  zoom: number;
  style: 'dark' | 'light' | 'satellite';
  layers: MaritimeLayer[];
}

export interface AppState {
  map: MapConfig;
  activeLayers: MaritimeLayer[];
  selectedEvent?: MaritimeEvent;
  timeRange: {
    start: Date;
    end: Date;
  };
  filters: {
    vesselType?: VesselType[];
    region?: string[];
    severity?: AlertSeverity[];
  };
  lastSync: Date;
}
