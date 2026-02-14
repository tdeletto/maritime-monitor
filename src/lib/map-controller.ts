/**
 * Map Controller
 * Manages Leaflet map instance, layers, and real-time marker updates
 * Integrates vessel tracking, weather, and security data visualization
 */

import L from 'leaflet';
import type { Vessel, WeatherData, SecurityIncident, MapBounds } from '../types/maritime';

interface MapOptions {
  container: HTMLElement | string;
  centerLat: number;
  centerLon: number;
  zoom: number;
}

class MapController {
  private map: L.Map | null = null;
  private vesselMarkers: Map<string, L.Marker> = new Map();
  private weatherMarkers: Map<string, L.CircleMarker> = new Map();
  private incidentMarkers: Map<string, L.Marker> = new Map();
  private layerGroups: {
    vessels: L.LayerGroup;
    weather: L.LayerGroup;
    security: L.LayerGroup;
  } | null = null;

  constructor() {
    this.setupLeaflet();
  }

  /**
   * Initialize Leaflet with custom icons
   */
  private setupLeaflet(): void {
    // Fix default Leaflet icon paths
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    });
  }

  /**
   * Initialize map
   */
  initialize(options: MapOptions): L.Map {
    if (this.map) {
      console.warn('[MapController] Map already initialized');
      return this.map;
    }

    // Create map
    this.map = L.map(options.container).setView(
      [options.centerLat, options.centerLon],
      options.zoom
    );

    // Add base layer (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map);

    // Create layer groups
    this.layerGroups = {
      vessels: L.layerGroup().addTo(this.map),
      weather: L.layerGroup().addTo(this.map),
      security: L.layerGroup().addTo(this.map),
    };

    // Listen to map bounds change
    this.map.on('moveend', () => this.onMapMoveEnd());

    console.log('[MapController] Map initialized');
    return this.map;
  }

  /**
   * Update vessel markers on map
   */
  updateVessels(vessels: Vessel[]): void {
    if (!this.layerGroups) return;

    const visibleIds = new Set<string>();

    vessels.forEach((vessel) => {
      visibleIds.add(vessel.id);

      const existing = this.vesselMarkers.get(vessel.id);

      if (existing) {
        // Update existing marker position
        existing.setLatLng([vessel.latitude, vessel.longitude]);
        // Update popup
        existing.setPopupContent(this.createVesselPopup(vessel));
      } else {
        // Create new marker
        const marker = L.marker([vessel.latitude, vessel.longitude], {
          icon: this.getVesselIcon(vessel),
          title: vessel.name,
        })
          .bindPopup(this.createVesselPopup(vessel))
          .addTo(this.layerGroups.vessels);

        this.vesselMarkers.set(vessel.id, marker);
      }
    });

    // Remove markers for vessels no longer in view
    this.vesselMarkers.forEach((marker, id) => {
      if (!visibleIds.has(id)) {
        this.layerGroups!.vessels.removeLayer(marker);
        this.vesselMarkers.delete(id);
      }
    });
  }

  /**
   * Update weather markers on map
   */
  updateWeather(weatherData: WeatherData[]): void {
    if (!this.layerGroups) return;

    const visibleIds = new Set<string>();

    weatherData.forEach((data) => {
      visibleIds.add(data.id);

      const existing = this.weatherMarkers.get(data.id);
      const radius = Math.min(Math.max(data.windSpeed * 100, 1000), 5000); // Scale circle by wind speed
      const color = this.getWeatherColor(data);

      if (existing) {
        existing.setLatLng([data.latitude, data.longitude]);
        existing.setStyle({ color, fillColor: color });
        existing.setPopupContent(this.createWeatherPopup(data));
      } else {
        const circle = L.circleMarker([data.latitude, data.longitude], {
          radius,
          color,
          fillColor: color,
          weight: 2,
          opacity: 0.7,
          fillOpacity: 0.5,
        })
          .bindPopup(this.createWeatherPopup(data))
          .addTo(this.layerGroups.weather);

        this.weatherMarkers.set(data.id, circle);
      }
    });

    // Remove old markers
    this.weatherMarkers.forEach((marker, id) => {
      if (!visibleIds.has(id)) {
        this.layerGroups!.weather.removeLayer(marker);
        this.weatherMarkers.delete(id);
      }
    });
  }

  /**
   * Update security incident markers on map
   */
  updateIncidents(incidents: SecurityIncident[]): void {
    if (!this.layerGroups) return;

    const visibleIds = new Set<string>();

    incidents.forEach((incident) => {
      visibleIds.add(incident.id);

      const existing = this.incidentMarkers.get(incident.id);

      if (existing) {
        existing.setPopupContent(this.createIncidentPopup(incident));
      } else {
        const marker = L.marker([incident.latitude, incident.longitude], {
          icon: this.getIncidentIcon(incident),
          title: incident.description,
        })
          .bindPopup(this.createIncidentPopup(incident))
          .addTo(this.layerGroups.security);

        this.incidentMarkers.set(incident.id, marker);
      }
    });

    // Remove old markers
    this.incidentMarkers.forEach((marker, id) => {
      if (!visibleIds.has(id)) {
        this.layerGroups!.security.removeLayer(marker);
        this.incidentMarkers.delete(id);
      }
    });
  }

  /**
   * Get vessel icon based on type and status
   */
  private getVesselIcon(vessel: Vessel): L.Icon {
    let color = '#3388ff'; // Default blue

    if (vessel.type === 'cargo') color = '#1e40af';
    if (vessel.type === 'tanker') color = '#dc2626';
    if (vessel.type === 'fishing') color = '#7c3aed';
    if (vessel.type === 'military') color = '#000000';
    if (vessel.speed === 0) color = '#fbbf24'; // Stopped

    return L.divIcon({
      className: 'vessel-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transform: rotate(${vessel.course || 0}deg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 12px;
          font-weight: bold;
        ">→</div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  }

  /**
   * Get incident icon based on severity
   */
  private getIncidentIcon(incident: SecurityIncident): L.Icon {
    const colors: Record<string, string> = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#f59e0b',
      low: '#fbbf24',
    };

    const color = colors[incident.severity] || '#fbbf24';

    return L.divIcon({
      className: 'incident-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 10px ${color};
        "></div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  }

  /**
   * Get weather circle color based on conditions
   */
  private getWeatherColor(data: WeatherData): string {
    if (data.windSpeed > 15) return '#dc2626'; // Red
    if (data.windSpeed > 10) return '#ea580c'; // Orange
    if (data.rain > 5) return '#0284c7'; // Blue
    return '#22c55e'; // Green
  }

  /**
   * Create vessel popup content
   */
  private createVesselPopup(vessel: Vessel): string {
    return `
      <div class="popup-content">
        <h3>${vessel.name}</h3>
        <p><strong>MMSI:</strong> ${vessel.mmsi}</p>
        <p><strong>Type:</strong> ${vessel.type}</p>
        <p><strong>Speed:</strong> ${vessel.speed} knots</p>
        <p><strong>Course:</strong> ${vessel.course}°</p>
        <p><strong>Position:</strong> ${vessel.latitude.toFixed(4)}, ${vessel.longitude.toFixed(4)}</p>
        <p><strong>Updated:</strong> ${new Date(vessel.timestamp).toLocaleTimeString()}</p>
      </div>
    `;
  }

  /**
   * Create weather popup content
   */
  private createWeatherPopup(data: WeatherData): string {
    return `
      <div class="popup-content">
        <h3>${data.location}</h3>
        <p><strong>Condition:</strong> ${data.description}</p>
        <p><strong>Temperature:</strong> ${data.temperature}°C</p>
        <p><strong>Wind:</strong> ${data.windSpeed} m/s from ${data.windDirection}°</p>
        <p><strong>Humidity:</strong> ${data.humidity}%</p>
        <p><strong>Pressure:</strong> ${data.pressure} hPa</p>
        ${data.waves > 0 ? `<p><strong>Wave Height:</strong> ${data.waves} m</p>` : ''}
        <p><strong>Updated:</strong> ${new Date(data.timestamp).toLocaleTimeString()}</p>
      </div>
    `;
  }

  /**
   * Create incident popup content
   */
  private createIncidentPopup(incident: SecurityIncident): string {
    return `
      <div class="popup-content">
        <h3>${incident.description}</h3>
        <p><strong>Type:</strong> ${incident.type}</p>
        <p><strong>Severity:</strong> ${incident.severity}</p>
        <p><strong>Location:</strong> ${incident.location}</p>
        <p><strong>Date:</strong> ${new Date(incident.date).toLocaleDateString()}</p>
        <p><strong>Source:</strong> ${incident.source}</p>
      </div>
    `;
  }

  /**
   * Handle map movement
   */
  private onMapMoveEnd(): void {
    if (!this.map) return;

    const bounds = this.map.getBounds();
    const mapBounds: MapBounds = {
      minLat: bounds.getSouth(),
      maxLat: bounds.getNorth(),
      minLon: bounds.getWest(),
      maxLon: bounds.getEast(),
    };

    // Dispatch custom event
    window.dispatchEvent(
      new CustomEvent('mapBoundsChanged', { detail: mapBounds })
    );
  }

  /**
   * Set map view
   */
  setView(lat: number, lon: number, zoom: number): void {
    if (!this.map) return;
    this.map.setView([lat, lon], zoom);
  }

  /**
   * Fit bounds
   */
  fitBounds(
    bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number }
  ): void {
    if (!this.map) return;
    this.map.fitBounds([
      [bounds.minLat, bounds.minLon],
      [bounds.maxLat, bounds.maxLon],
    ]);
  }

  /**
   * Toggle layer visibility
   */
  toggleLayer(layer: 'vessels' | 'weather' | 'security', visible: boolean): void {
    if (!this.map || !this.layerGroups) return;

    if (visible) {
      this.map.addLayer(this.layerGroups[layer]);
    } else {
      this.map.removeLayer(this.layerGroups[layer]);
    }
  }

  /**
   * Get current map instance
   */
  getMap(): L.Map | null {
    return this.map;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    this.vesselMarkers.clear();
    this.weatherMarkers.clear();
    this.incidentMarkers.clear();
    console.log('[MapController] Destroyed');
  }
}

export default MapController;
