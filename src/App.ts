/**
 * Maritime Monitor Application
 * Main orchestrator for vessel tracking, weather monitoring, and security awareness
 */

import VesselTrackerService from './services/vessel-tracker';
import WeatherService from './services/weather-service';
import SecurityMonitorService from './services/security-monitor';
import MapController from './lib/map-controller';
import { store } from './store/maritime-store';
import type { MapBounds } from './types/maritime';

class MaritimeMonitorApp {
  private vesselTracker: VesselTrackerService;
  private weatherService: WeatherService;
  private securityMonitor: SecurityMonitorService;
  private mapController: MapController;
  private refreshInterval: NodeJS.Timeout | null = null;
  private storeUnsubscribe: (() => void) | null = null;

  constructor() {
    // Initialize services
    const aisHubKey = import.meta.env.VITE_AIS_HUB_API_KEY || '';
    const weatherKey = import.meta.env.VITE_OPENWEATHER_API_KEY || '';

    this.vesselTracker = new VesselTrackerService(aisHubKey);
    this.weatherService = new WeatherService(weatherKey);
    this.securityMonitor = new SecurityMonitorService();
    this.mapController = new MapController();

    console.log('[Maritime Monitor] Application initialized');
  }

  /**
   * Initialize the application
   */
  async init(): Promise<void> {
    try {
      console.log('[Maritime Monitor] Initializing...');

      // Initialize map
      const mapContainer = document.getElementById('map');
      if (!mapContainer) {
        throw new Error('Map container not found');
      }

      this.mapController.initialize({
        container: mapContainer,
        centerLat: 0,
        centerLon: 0,
        zoom: 3,
      });

      // Setup event listeners
      this.setupEventListeners();

      // Subscribe to state changes
      this.subscribeToStore();

      // Start data refresh cycle
      this.startAutoRefresh();

      // Load initial data
      await this.loadInitialData();

      console.log('[Maritime Monitor] Initialization complete');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[Maritime Monitor] Initialization failed:', message);
      store.setError(message);
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Map bounds changed
    window.addEventListener('mapBoundsChanged', (event: Event) => {
      const customEvent = event as CustomEvent<MapBounds>;
      store.setMapBounds(customEvent.detail);
      this.loadDataForBounds(customEvent.detail);
    });

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

    // Auto-refresh toggle
    window.addEventListener('autoRefreshToggle', () => {
      const state = store.getState();
      store.setAutoRefresh(!state.preferences.autoRefresh);
    });
  }

  /**
   * Subscribe to store changes
   */
  private subscribeToStore(): void {
    this.storeUnsubscribe = store.subscribe((state) => {
      // Update map when layers change
      this.mapController.toggleLayer('vessels', state.activeLayers.vessels);
      this.mapController.toggleLayer('weather', state.activeLayers.weather);
      this.mapController.toggleLayer('security', state.activeLayers.security);

      // Update map when data changes
      if (state.vessels.length > 0) {
        this.mapController.updateVessels(state.vessels);
      }
      if (state.weather.length > 0) {
        this.mapController.updateWeather(state.weather);
      }
      if (state.incidents.length > 0) {
        this.mapController.updateIncidents(state.incidents);
      }

      // Log stats
      const stats = store.getStats();
      console.log(
        `[Maritime Monitor] State: ${stats.vesselCount} vessels, ` +
          `${stats.incidentCount} incidents, ${stats.alertCount} alerts`
      );
    });
  }

  /**
   * Load initial data
   */
  private async loadInitialData(): Promise<void> {
    try {
      store.setLoading(true);

      // Default bounds (Indian Ocean)
      const bounds: MapBounds = {
        minLat: -20,
        maxLat: 20,
        minLon: 40,
        maxLon: 100,
      };

      await this.loadDataForBounds(bounds);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      store.setError(`Failed to load initial data: ${message}`);
    } finally {
      store.setLoading(false);
    }
  }

  /**
   * Load data for specific map bounds
   */
  private async loadDataForBounds(bounds: MapBounds): Promise<void> {
    try {
      const state = store.getState();

      // Fetch vessels
      if (state.activeLayers.vessels) {
        const vessels = await this.vesselTracker.getVesselsInBounds(bounds);
        store.setVessels(vessels);
      }

      // Fetch security incidents
      if (state.activeLayers.security) {
        const incidents = await this.securityMonitor.getSecurityIncidents(bounds);
        store.setIncidents(incidents);
      }

      // Fetch weather for center point
      if (state.activeLayers.weather) {
        const centerLat = (bounds.minLat + bounds.maxLat) / 2;
        const centerLon = (bounds.minLon + bounds.maxLon) / 2;
        const weather = await this.weatherService.getCurrentWeather(
          centerLat,
          centerLon
        );
        if (weather) {
          store.addWeather([weather]);
        }
      }

      store.setError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[Maritime Monitor] Error loading data:', message);
      store.addAlert(`Error loading data: ${message}`);
    }
  }

  /**
   * Start auto-refresh cycle
   */
  private startAutoRefresh(): void {
    const state = store.getState();

    if (!state.preferences.autoRefresh) {
      console.log('[Maritime Monitor] Auto-refresh disabled');
      return;
    }

    const interval = state.preferences.refreshInterval * 1000; // Convert to ms

    this.refreshInterval = setInterval(async () => {
      const currentState = store.getState();
      if (currentState.mapBounds && currentState.preferences.autoRefresh) {
        console.log('[Maritime Monitor] Auto-refreshing data...');
        await this.loadDataForBounds(currentState.mapBounds);
      }
    }, interval);

    console.log(
      `[Maritime Monitor] Auto-refresh started (${state.preferences.refreshInterval}s interval)`
    );
  }

  /**
   * Stop auto-refresh
   */
  private stopAutoRefresh(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('[Maritime Monitor] Auto-refresh stopped');
    }
  }

  /**
   * Handle keyboard shortcuts
   */
  private handleKeyboardShortcuts(e: KeyboardEvent): void {
    // Ctrl/Cmd + R: Refresh data
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      const state = store.getState();
      if (state.mapBounds) {
        this.loadDataForBounds(state.mapBounds);
      }
    }

    // Ctrl/Cmd + L: Toggle layers
    if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
      e.preventDefault();
      const state = store.getState();
      store.toggleLayer('vessels');
      console.log('[Maritime Monitor] Vessels layer toggled');
    }

    // Ctrl/Cmd + T: Toggle dark mode
    if ((e.ctrlKey || e.metaKey) && e.key === 't') {
      e.preventDefault();
      const state = store.getState();
      store.setDarkMode(!state.preferences.darkMode);
      this.applyTheme();
    }
  }

  /**
   * Apply theme based on preferences
   */
  private applyTheme(): void {
    const state = store.getState();
    const html = document.documentElement;

    if (state.preferences.darkMode) {
      html.classList.add('dark');
      html.style.colorScheme = 'dark';
    } else {
      html.classList.remove('dark');
      html.style.colorScheme = 'light';
    }
  }

  /**
   * Get service instances (for testing/debugging)
   */
  getServices() {
    return {
      vesselTracker: this.vesselTracker,
      weatherService: this.weatherService,
      securityMonitor: this.securityMonitor,
      mapController: this.mapController,
    };
  }

  /**
   * Cleanup and destroy
   */
  destroy(): void {
    console.log('[Maritime Monitor] Destroying...');

    // Stop auto-refresh
    this.stopAutoRefresh();

    // Unsubscribe from store
    if (this.storeUnsubscribe) {
      this.storeUnsubscribe();
    }

    // Destroy map
    this.mapController.destroy();

    // Clear caches
    this.vesselTracker.clearCache();
    this.weatherService.clearCache();
    this.securityMonitor.clearCache();

    console.log('[Maritime Monitor] Destroyed');
  }
}

// Global instance for debugging
let app: MaritimeMonitorApp | null = null;

/**
 * Initialize app when DOM is ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', async () => {
    app = new MaritimeMonitorApp();
    await app.init();
    (window as any).maritimeMonitor = app;
  });
} else {
  app = new MaritimeMonitorApp();
  app.init().then(() => {
    (window as any).maritimeMonitor = app;
  });
}

// Cleanup on unload
window.addEventListener('beforeunload', () => {
  if (app) {
    app.destroy();
  }
});

export default MaritimeMonitorApp;
