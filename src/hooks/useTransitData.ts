import { useState, useEffect, useCallback } from 'react';
import { Agency, Route, Stop, Calendar, TransitStats } from '../types/transit';
import { getAgencies, getRoutes, getStops, getCalendar, calculateStats } from '../lib/supabase/api';
import { isSupabaseConfigured, getSupabaseConfigStatus, SupabaseConfigStatus } from '../lib/supabase/client';

export interface UseTransitDataReturn {
  agencies: Agency[];
  routes: Route[];
  stops: Stop[];
  calendar: Calendar[];
  stats: TransitStats;
  loading: boolean;
  error: string | null;
  isSupabaseConfigured: boolean;
  configStatus: SupabaseConfigStatus;
  refetch: () => Promise<void>;
  selectedAgencyId: string;
  setSelectedAgencyId: (agencyId: string) => void;
  selectedRoute: Route | null;
  setSelectedRoute: (route: Route | null) => void;
  selectedStop: Stop | null;
  setSelectedStop: (stop: Stop | null) => void;
}

export function useTransitData(): UseTransitDataReturn {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  const [calendar, setCalendar] = useState<Calendar[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>('all');
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [agencyRes, routesRes, stopsRes, calRes] = await Promise.all([
        getAgencies(),
        getRoutes(selectedAgencyId),
        getStops(),
        getCalendar(),
      ]);

      setAgencies(agencyRes.data);
      setRoutes(routesRes.data);
      setStops(stopsRes.data);
      setCalendar(calRes.data);

      const firstError = agencyRes.error || routesRes.error || stopsRes.error || calRes.error;
      if (firstError) {
        setError(firstError);
      }
    } catch (err: any) {
      console.error('Error fetching transit data:', err);
      setError(err?.message || 'Unable to connect to Supabase PostgreSQL database');
    } finally {
      setLoading(false);
    }
  }, [selectedAgencyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const stats = calculateStats(agencies, routes, stops);
  const configStatus = getSupabaseConfigStatus();

  return {
    agencies,
    routes,
    stops,
    calendar,
    stats,
    loading,
    error,
    isSupabaseConfigured,
    configStatus,
    refetch: fetchData,
    selectedAgencyId,
    setSelectedAgencyId,
    selectedRoute,
    setSelectedRoute,
    selectedStop,
    setSelectedStop,
  };
}
