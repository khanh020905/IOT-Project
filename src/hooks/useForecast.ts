import { useState, useEffect, useRef, useCallback } from "react";
import { fetchForecast, type ForecastData } from "../api/openmeteo";

const CACHE_DURATION = 30 * 60 * 1000; // Refresh every 30 minutes

export interface LatLon {
  lat: number;
  lon: number;
}

export function useForecast() {
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useState<LatLon | null>(null);
  const [locationName, setLocationName] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);
  const locationRef = useRef<LatLon | null>(null);

  // Keep ref in sync
  locationRef.current = location;

  const load = useCallback(async () => {
    const loc = locationRef.current;
    const data = loc
      ? await fetchForecast(loc.lat, loc.lon)
      : await fetchForecast();
    if (data) {
      setForecast(data);
      setIsLoading(false);
    }
  }, []);

  // Reload on location change
  useEffect(() => {
    setIsLoading(true);
    load();

    // Reset the interval
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = window.setInterval(load, CACHE_DURATION);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [location, load]);

  const updateLocation = useCallback(
    (lat: number, lon: number, name?: string) => {
      setLocation({ lat, lon });
      setLocationName(name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`);
    },
    []
  );

  const resetLocation = useCallback(() => {
    setLocation(null);
    setLocationName(null);
  }, []);

  return {
    forecast,
    isLoading,
    location,
    locationName,
    updateLocation,
    resetLocation,
  };
}
