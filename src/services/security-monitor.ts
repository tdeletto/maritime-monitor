/**
 * Maritime Security Monitoring Service
 * Monitors security incidents, piracy alerts, and suspicious vessel activity
 * Sources: ReCAAP ISC (Southeast Asia), vessel analysis
 */

import type { SecurityIncident, CacheEntry, ServiceError } from '../types/maritime';

interface ReCAAP_Incident {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  latitude: number;
  longitude: number;
  type: string;
  status: string;
  details: string;
  link: string;
}

interface ParsedFeed {
  incidents: SecurityIncident[];
  lastUpdated: string;
  source: string;
}

class SecurityMonitorService {
  private recaapFeedUrl = 'https://www.recaap.org/services/api/Incidents';
  private cache: Map<string, CacheEntry> = new Map();
  private cacheTimeout = 30 * 60 * 1000; // 30 minutes
  private suspiciousPatterns = {
    minSpeed: 0.5,
    maxSpeed: 30,
    anomalousCourse: 180, // significant course changes
    noSignalTimeout: 12 * 60 * 60 * 1000, // 12 hours
  };

  constructor() {
    console.log('[SecurityMonitor] Service initialized');
  }

  /**
   * Fetch piracy and security incidents from ReCAAP
   */
  async getSecurityIncidents(
    bounds?: { minLat: number; maxLat: number; minLon: number; maxLon: number }
  ): Promise<SecurityIncident[]> {
    const cacheKey = 'security_incidents';

    // Check cache
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log('[SecurityMonitor] Returning cached incidents');
        return cached.data as SecurityIncident[];
      }
    }

    try {
      const incidents = await this.fetchReCAAP_Incidents();

      // Filter by bounds if provided
      const filtered = bounds
        ? incidents.filter(
            (i) =>
              i.latitude >= bounds.minLat &&
              i.latitude <= bounds.maxLat &&
              i.longitude >= bounds.minLon &&
              i.longitude <= bounds.maxLon
          )
        : incidents;

      // Cache results
      this.cache.set(cacheKey, {
        data: filtered,
        timestamp: Date.now(),
      });

      console.log(`[SecurityMonitor] Retrieved ${filtered.length} security incidents`);
      return filtered;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[SecurityMonitor] Error fetching incidents:', message);

      // Return cached data if available, even if stale
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log('[SecurityMonitor] Returning stale cache due to error');
        return cached.data as SecurityIncident[];
      }

      return [];
    }
  }

  /**
   * Detect suspicious vessel patterns
   */
  async detectSuspiciousActivity(
    vessel: any // Vessel type
  ): Promise<{ suspicious: boolean; reasons: string[] }> {
    const reasons: string[] = [];

    // Check for speed anomalies
    if (
      vessel.speed < this.suspiciousPatterns.minSpeed ||
      vessel.speed > this.suspiciousPatterns.maxSpeed
    ) {
      reasons.push(`Unusual speed: ${vessel.speed} knots`);
    }

    // Check for missing vessel identity
    if (!vessel.name || vessel.name === 'Unknown Vessel') {
      reasons.push('No vessel identity found');
    }

    // Check for unusual behavior (stopped in open ocean)
    if (vessel.speed === 0 && this.isOpenOcean(vessel.latitude, vessel.longitude)) {
      reasons.push('Stopped in open ocean');
    }

    // Check for AIS manipulation (common in illegal activities)
    if (vessel.status === 14 || vessel.status === 15) {
      reasons.push('Vessel status indicates fishing or unusual activity');
    }

    // Check for old transponder data
    if (vessel.timestamp && this.isDataStale(vessel.timestamp)) {
      reasons.push('Stale AIS data (possible transponder disabled)');
    }

    return {
      suspicious: reasons.length > 0,
      reasons,
    };
  }

  /**
   * Get high-risk maritime zones
   */
  async getHighRiskZones(): Promise<
    Array<{
      name: string;
      bounds: { minLat: number; maxLat: number; minLon: number; maxLon: number };
      riskLevel: 'high' | 'medium' | 'low';
      incidents: number;
    }>
  > {
    const incidents = await this.getSecurityIncidents();

    // Known high-risk zones
    const riskZones = [
      {
        name: 'Gulf of Aden',
        bounds: { minLat: 10, maxLat: 17, minLon: 40, maxLon: 55 },
        riskLevel: 'high' as const,
      },
      {
        name: 'Strait of Malacca',
        bounds: { minLat: 0, maxLat: 6, minLon: 95, maxLon: 105 },
        riskLevel: 'high' as const,
      },
      {
        name: 'Singapore Strait',
        bounds: { minLat: 1, maxLat: 2, minLon: 103, maxLon: 105 },
        riskLevel: 'medium' as const,
      },
      {
        name: 'Bay of Bengal',
        bounds: { minLat: 5, maxLat: 23, minLon: 80, maxLon: 95 },
        riskLevel: 'medium' as const,
      },
    ];

    // Count incidents per zone
    return riskZones.map((zone) => ({
      ...zone,
      incidents: incidents.filter(
        (i) =>
          i.latitude >= zone.bounds.minLat &&
          i.latitude <= zone.bounds.maxLat &&
          i.longitude >= zone.bounds.minLon &&
          i.longitude <= zone.bounds.maxLon
      ).length,
    }));
  }

  /**
   * Fetch and parse ReCAAP RSS feed
   */
  private async fetchReCAAP_Incidents(): Promise<SecurityIncident[]> {
    try {
      const response = await fetch(this.recaapFeedUrl);

      if (!response.ok) {
        throw new Error(`ReCAAP API error: ${response.status}`);
      }

      const data = await response.json();

      // Parse ReCAAP API response
      const incidents: SecurityIncident[] = (data.data || [])
        .slice(0, 100) // Last 100 incidents
        .map((incident: any) => ({
          id: `recaap_${incident.id}`,
          type: incident.subRegionName || 'security',
          description: incident.description || incident.remarks,
          location: `${incident.latitude}, ${incident.longitude}`,
          latitude: parseFloat(incident.latitude),
          longitude: parseFloat(incident.longitude),
          date: incident.date,
          severity: this.determineSeverity(incident.description),
          status: 'reported',
          source: 'ReCAAP ISC',
          timestamp: new Date(incident.date).toISOString(),
        }))
        .filter((i: SecurityIncident) => !isNaN(i.latitude) && !isNaN(i.longitude));

      return incidents;
    } catch (error) {
      console.error('[SecurityMonitor] Error fetching ReCAAP data:', error);
      throw error;
    }
  }

  /**
   * Determine incident severity from description
   */
  private determineSeverity(
    description: string
  ): 'critical' | 'high' | 'medium' | 'low' {
    const text = description.toLowerCase();

    if (
      text.includes('attack') ||
      text.includes('armed') ||
      text.includes('hostage') ||
      text.includes('fire')
    ) {
      return 'critical';
    }
    if (
      text.includes('boarding') ||
      text.includes('robbery') ||
      text.includes('attempted')
    ) {
      return 'high';
    }
    if (text.includes('suspicious') || text.includes('approach')) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Check if location is in open ocean
   */
  private isOpenOcean(lat: number, lon: number): boolean {
    const nearCoast = Math.abs(lat % 10) < 2 && Math.abs(lon % 10) < 2;
    return !nearCoast;
  }

  /**
   * Check if vessel data is stale
   */
  private isDataStale(timestamp: string): boolean {
    const vesselTime = new Date(timestamp).getTime();
    const now = Date.now();
    const staleness = now - vesselTime;
    return staleness > 12 * 60 * 60 * 1000; // 12 hours
  }

  /**
   * Check if cache entry is still valid
   */
  private isCacheValid(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    const age = Date.now() - entry.timestamp;
    return age < this.cacheTimeout;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    console.log('[SecurityMonitor] Cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: string[] } {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
    };
  }
}

export default SecurityMonitorService;
