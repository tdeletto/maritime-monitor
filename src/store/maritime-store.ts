/**
 * Maritime Monitor Store
 * Centralized state management using reactive patterns
 * Manages vessels, weather, security incidents, and UI state
 */

import type {
  Vessel,
  WeatherData,
  SecurityIncident,
  MapBounds,
} from '../types/maritime';

export interface AppState {
  // Data
  vessels: Vessel[];
  weather: WeatherData[];
  incidents: SecurityIncident[];
  alerts: string[];

  // UI State
  mapBounds: MapBounds | null;
  selectedVessel: Vessel | null;
  selectedIncident: SecurityIncident | null;
  activeLayers: {
    vessels: boolean;
    weather: boolean;
    security: boolean;
    humanitarian: boolean;
    policy: boolean;
  };
  viewMode: 'map' | 'list' | 'dashboard';

  // Loading/Error
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Filters
  filters: {
    vesselType: string[];
    riskLevel: 'all' | 'high' | 'medium' | 'low';
    timeRange: number; // minutes
  };

  // User preferences
  preferences: {
    darkMode: boolean;
    autoRefresh: boolean;
    refreshInterval: number; // seconds
    notifications: boolean;
  };
}

type StateListener = (state: AppState) => void;

class MaritimeStore {
  private state: AppState;
  private listeners: Set<StateListener> = new Set();

  constructor() {
    this.state = this.getInitialState();
    this.loadPreferences();
  }

  /**
   * Get initial state
   */
  private getInitialState(): AppState {
    return {
      vessels: [],
      weather: [],
      incidents: [],
      alerts: [],
      mapBounds: null,
      selectedVessel: null,
      selectedIncident: null,
      activeLayers: {
        vessels: true,
        weather: true,
        security: true,
        humanitarian: false,
        policy: false,
      },
      viewMode: 'map',
      loading: false,
      error: null,
      lastUpdated: null,
      filters: {
        vesselType: [],
        riskLevel: 'all',
        timeRange: 60,
      },
      preferences: {
        darkMode: this.getSystemDarkMode(),
        autoRefresh: true,
        refreshInterval: 30,
        notifications: true,
      },
    };
  }

  /**
   * Get current state (read-only)
   */
  getState(): Readonly<AppState> {
    return Object.freeze({ ...this.state });
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<AppState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  /**
   * Notify all listeners of state change
   */
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener(this.state));
  }

  // ============================================================
  // Vessel Management
  // ============================================================

  setVessels(vessels: Vessel[]): void {
    this.updateState({
      vessels,
      lastUpdated: new Date(),
    });
  }

  addVessels(vessels: Vessel[]): void {
    const merged = [...this.state.vessels];
    vessels.forEach((newVessel) => {
      const index = merged.findIndex((v) => v.id === newVessel.id);
      if (index >= 0) {
        merged[index] = newVessel;
      } else {
        merged.push(newVessel);
      }
    });
    this.setVessels(merged);
  }

  removeVessel(vesselId: string): void {
    this.updateState({
      vessels: this.state.vessels.filter((v) => v.id !== vesselId),
    });
  }

  selectVessel(vessel: Vessel | null): void {
    this.updateState({ selectedVessel: vessel });
  }

  // ============================================================
  // Weather Management
  // ============================================================

  setWeather(weather: WeatherData[]): void {
    this.updateState({ weather });
  }

  addWeather(weather: WeatherData[]): void {
    const merged = [...this.state.weather];
    weather.forEach((newData) => {
      const index = merged.findIndex((w) => w.id === newData.id);
      if (index >= 0) {
        merged[index] = newData;
      } else {
        merged.push(newData);
      }
    });
    this.setWeather(merged);
  }

  // ============================================================
  // Security Incident Management
  // ============================================================

  setIncidents(incidents: SecurityIncident[]): void {
    this.updateState({
      incidents,
      lastUpdated: new Date(),
    });
  }

  addIncidents(incidents: SecurityIncident[]): void {
    const merged = [...this.state.incidents];
    incidents.forEach((newIncident) => {
      const index = merged.findIndex((i) => i.id === newIncident.id);
      if (index >= 0) {
        merged[index] = newIncident;
      } else {
        merged.push(newIncident);
      }
    });
    this.setIncidents(merged);
  }

  selectIncident(incident: SecurityIncident | null): void {
    this.updateState({ selectedIncident: incident });
  }

  // ============================================================
  // Alert Management
  // ============================================================

  addAlert(alert: string): void {
    this.updateState({
      alerts: [...this.state.alerts, alert],
    });
  }

  clearAlerts(): void {
    this.updateState({ alerts: [] });
  }

  removeAlert(index: number): void {
    const alerts = [...this.state.alerts];
    alerts.splice(index, 1);
    this.updateState({ alerts });
  }

  // ============================================================
  // Map Management
  // ============================================================

  setMapBounds(bounds: MapBounds | null): void {
    this.updateState({ mapBounds: bounds });
  }

  // ============================================================
  // Layer Management
  // ============================================================

  toggleLayer(layer: keyof AppState['activeLayers']): void {
    this.updateState({
      activeLayers: {
        ...this.state.activeLayers,
        [layer]: !this.state.activeLayers[layer],
      },
    });
  }

  setLayerActive(layer: keyof AppState['activeLayers'], active: boolean): void {
    this.updateState({
      activeLayers: {
        ...this.state.activeLayers,
        [layer]: active,
      },
    });
  }

  // ============================================================
  // View Management
  // ============================================================

  setViewMode(mode: 'map' | 'list' | 'dashboard'): void {
    this.updateState({ viewMode: mode });
  }

  // ============================================================
  // Loading/Error Management
  // ============================================================

  setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  setError(error: string | null): void {
    this.updateState({ error });
    if (error) {
      console.error('[Store] Error:', error);
    }
  }

  // ============================================================
  // Filter Management
  // ============================================================

  setFilters(
    filters: Partial<AppState['filters']>
  ): void {
    this.updateState({
      filters: { ...this.state.filters, ...filters },
    });
  }

  setVesselTypeFilter(types: string[]): void {
    this.updateState({
      filters: { ...this.state.filters, vesselType: types },
    });
  }

  setRiskLevelFilter(level: 'all' | 'high' | 'medium' | 'low'): void {
    this.updateState({
      filters: { ...this.state.filters, riskLevel: level },
    });
  }

  setTimeRangeFilter(minutes: number): void {
    this.updateState({
      filters: { ...this.state.filters, timeRange: minutes },
    });
  }

  // ============================================================
  // Preferences Management
  // ============================================================

  setPreferences(
    preferences: Partial<AppState['preferences']>
  ): void {
    const updated = { ...this.state.preferences, ...preferences };
    this.updateState({ preferences: updated });
    this.savePreferences();
  }

  setDarkMode(darkMode: boolean): void {
    this.setPreferences({ darkMode });
  }

  setAutoRefresh(enabled: boolean): void {
    this.setPreferences({ autoRefresh: enabled });
  }

  setRefreshInterval(seconds: number): void {
    this.setPreferences({ refreshInterval: seconds });
  }

  setNotifications(enabled: boolean): void {
    this.setPreferences({ notifications: enabled });
  }

  // ============================================================
  // Computed Selectors
  // ============================================================

  getVesselsByType(type: string): Vessel[] {
    return this.state.vessels.filter((v) => v.type === type);
  }

  getHighRiskVessels(): Vessel[] {
    return this.state.vessels.filter((v) => {
      // Heuristics for high-risk vessels
      const hasNoName = !v.name || v.name === 'Unknown Vessel';
      const isStopped = v.speed === 0;
      return hasNoName || isStopped;
    });
  }

  getCriticalIncidents(): SecurityIncident[] {
    return this.state.incidents.filter((i) => i.severity === 'critical');
  }

  getHighRiskIncidents(): SecurityIncident[] {
    return this.state.incidents.filter((i) =>
      ['critical', 'high'].includes(i.severity)
    );
  }

  getFilteredVessels(): Vessel[] {
    let filtered = [...this.state.vessels];

    // Apply vessel type filter
    if (this.state.filters.vesselType.length > 0) {
      filtered = filtered.filter((v) =>
        this.state.filters.vesselType.includes(v.type)
      );
    }

    // Apply time range filter
    const now = Date.now();
    const timeThreshold = now - this.state.filters.timeRange * 60 * 1000;
    filtered = filtered.filter(
      (v) => new Date(v.timestamp).getTime() > timeThreshold
    );

    return filtered;
  }

  // ============================================================
  // Persistence
  // ============================================================

  private loadPreferences(): void {
    try {
      const saved = localStorage.getItem('maritime-monitor-prefs');
      if (saved) {
        const prefs = JSON.parse(saved);
        this.updateState({ preferences: { ...this.state.preferences, ...prefs } });
      }
    } catch (error) {
      console.error('[Store] Error loading preferences:', error);
    }
  }

  private savePreferences(): void {
    try {
      localStorage.setItem(
        'maritime-monitor-prefs',
        JSON.stringify(this.state.preferences)
      );
    } catch (error) {
      console.error('[Store] Error saving preferences:', error);
    }
  }

  // ============================================================
  // Utilities
  // ============================================================

  private getSystemDarkMode(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  reset(): void {
    this.state = this.getInitialState();
    this.notifyListeners();
  }

  getStats(): {
    vesselCount: number;
    incidentCount: number;
    alertCount: number;
    lastUpdated: Date | null;
  } {
    return {
      vesselCount: this.state.vessels.length,
      incidentCount: this.state.incidents.length,
      alertCount: this.state.alerts.length,
      lastUpdated: this.state.lastUpdated,
    };
  }
}

// Export singleton instance
export const store = new MaritimeStore();
export default MaritimeStore;
