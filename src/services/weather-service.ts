/**
 * OpenWeather Maritime Weather Service
 * Fetches weather data for maritime zones including wind, waves, and forecasts
 * Includes caching and multi-location support
 */

import type { WeatherData, CacheEntry, ServiceError } from '../types/maritime';

interface OpenWeatherResponse {
  coord: { lon: number; lat: number };
  weather: { id: number; main: string; description: string; icon: string }[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  visibility: number;
  wind: { speed: number; deg: number; gust?: number };
  clouds: { all: number };
  rain?: { '1h'?: number };
  snow?: { '1h'?: number };
  waves?: { height: number; period: number; direction: number };
  timestamp: number;
  name: string;
  sys: { country: string; sunrise: number; sunset: number };
}

interface ForecastResponse {
  list: Array<OpenWeatherResponse & { dt: number }>;
  city: { name: string; country: string; coord: { lat: number; lon: number } };
}

class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5/';
  private cache: Map<string, CacheEntry> = new Map();
  private cacheTimeout = 10 * 60 * 1000; // 10 minutes
  private requestCount = 0;
  private rateLimitWindow = 60 * 1000; // 1 minute
  private rateLimitMax = 60; // 60 calls/min
  private requestTimestamps: number[] = [];

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    if (!apiKey) {
      console.warn('[WeatherService] No API key provided. Service will be limited.');
    }
  }

  /**
   * Fetch current weather for a location
   */
  async getCurrentWeather(latitude: number, longitude: number): Promise<WeatherData | null> {
    const cacheKey = `weather_current_${latitude}_${longitude}`;

    // Check cache
    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        console.log('[WeatherService] Returning cached weather');
        return cached.data as WeatherData;
      }
    }

    try {
      await this.checkRateLimit();

      const params = new URLSearchParams({
        lat: latitude.toString(),
        lon: longitude.toString(),
        appid: this.apiKey,
        units: 'metric',
      });

      const url = `${this.baseUrl}weather?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`OpenWeather API error: ${response.status} ${response.statusText}`);
      }

      const data: OpenWeatherResponse = await response.json();

      const weather: WeatherData = {
        id: `weather_${latitude}_${longitude}`,
        latitude,
        longitude,
        temperature: data.main.temp,
        feelsLike: data.main.feels_like,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        windSpeed: data.wind.speed,
        windDirection: data.wind.deg,
        windGust: data.wind.gust || 0,
        description: data.weather[0]?.description || 'unknown',
        clouds: data.clouds.all,
        visibility: data.visibility,
        rain: data.rain?.['1h'] || 0,
        waves: data.waves?.height || 0,
        timestamp: new Date(data.timestamp * 1000).toISOString(),
        location: `${data.name}, ${data.sys.country}`,
        source: 'OpenWeather',
      };

      this.cache.set(cacheKey, {
        data: weather,
        timestamp: Date.now(),
      });

      return weather;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[WeatherService] Error fetching weather:', message);
      throw {
        service: 'OpenWeather',
        message,
        timestamp: new Date().toISOString(),
      } as ServiceError;
    }
  }

  /**
   * Fetch 5-day weather forecast
   */
  async getWeatherForecast(
    latitude: number,
    longitude: number,
    days = 5
  ): Promise<WeatherData[]> {
    const cacheKey = `weather_forecast_${latitude}_${longitude}_${days}`;

    if (this.isCacheValid(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached.data as WeatherData[];
      }
    }

    try {
      await this.checkRateLimit();

      const params = new URLSearchParams({
        lat: latitude.toString(),
        lon: longitude.toString(),
        appid: this.apiKey,
        units: 'metric',
      });

      const url = `${this.baseUrl}forecast?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`OpenWeather forecast error: ${response.status}`);
      }

      const data: ForecastResponse = await response.json();

      const forecasts: WeatherData[] = (data.list || [])
        .slice(0, days * 8) // 8 forecasts per day (every 3 hours)
        .map((f) => ({
          id: `forecast_${latitude}_${longitude}_${f.dt}`,
          latitude,
          longitude,
          temperature: f.main.temp,
          feelsLike: f.main.feels_like,
          humidity: f.main.humidity,
          pressure: f.main.pressure,
          windSpeed: f.wind.speed,
          windDirection: f.wind.deg,
          windGust: f.wind.gust || 0,
          description: f.weather[0]?.description || 'unknown',
          clouds: f.clouds.all,
          visibility: f.visibility,
          rain: f.rain?.['1h'] || 0,
          waves: f.waves?.height || 0,
          timestamp: new Date(f.dt * 1000).toISOString(),
          location: `${data.city.name}, ${data.city.country}`,
          source: 'OpenWeather',
        }));

      this.cache.set(cacheKey, {
        data: forecasts,
        timestamp: Date.now(),
      });

      console.log(`[WeatherService] Fetched ${forecasts.length} forecast entries`);
      return forecasts;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('[WeatherService] Error fetching forecast:', message);
      throw {
        service: 'OpenWeather',
        message,
        timestamp: new Date().toISOString(),
      } as ServiceError;
    }
  }

  /**
   * Get weather alerts (storms, high winds, etc.)
   */
  async getWeatherAlerts(latitude: number, longitude: number): Promise<string[]> {
    const weather = await this.getCurrentWeather(latitude, longitude);
    if (!weather) return [];

    const alerts: string[] = [];

    // Check for severe weather conditions
    if (weather.windSpeed > 10) {
      alerts.push(`High winds: ${weather.windSpeed} m/s`);
    }
    if (weather.windGust > 15) {
      alerts.push(`Severe wind gusts: ${weather.windGust} m/s`);
    }
    if (weather.rain > 5) {
      alerts.push(`Heavy rainfall: ${weather.rain} mm/h`);
    }
    if (weather.visibility < 500) {
      alerts.push(`Low visibility: ${weather.visibility} m`);
    }
    if (weather.waves > 2) {
      alerts.push(`High sea state: ${weather.waves} m waves`);
    }

    return alerts;
  }

  /**
   * Check rate limiting (60 calls/min)
   */
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();

    // Remove old timestamps outside the window
    this.requestTimestamps = this.requestTimestamps.filter(
      (t) => now - t < this.rateLimitWindow
    );

    if (this.requestTimestamps.length >= this.rateLimitMax) {
      const oldestRequest = this.requestTimestamps[0];
      const waitTime = this.rateLimitWindow - (now - oldestRequest) + 100;
      console.log(`[WeatherService] Rate limit approaching, waiting ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.requestTimestamps.push(Date.now());
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
    console.log('[WeatherService] Cache cleared');
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

export default WeatherService;
