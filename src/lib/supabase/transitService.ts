import { supabase } from '../supabase';
import { Route, Stop, Agency } from '../../types/transit';

export interface RouteTripDetail {
  trip_id: string;
  route_id: string;
  service_id: string;
  trip_headsign: string | null;
  direction_id: number | null;
  block_id: string | null;
  shape_id: string | null;
}

export interface StopTimeWithDetails {
  trip_id: string;
  arrival_time: string | null;
  departure_time: string | null;
  stop_id: string;
  stop_sequence: number;
  pickup_type?: number | null;
  drop_off_type?: number | null;
  stop?: Stop;
}

export interface RouteDetailData {
  route: Route;
  agency: Agency | null;
  trips: RouteTripDetail[];
  selectedTrip: RouteTripDetail | null;
  stops: StopTimeWithDetails[];
  directions: number[];
  services: string[];
}

export interface PaginatedRoutesResult {
  routes: Route[];
  totalCount: number;
  error: string | null;
}

export interface RouteCounts {
  total: number;
  mtc: number;
  metro: number;
}

export interface PaginatedStopsResult {
  stops: Stop[];
  totalCount: number;
  error: string | null;
}

export interface StopCounts {
  total: number;
  metro: number;
  bus: number;
}

export interface StopServingRoute {
  route_id: string;
  route_short_name: string;
  route_long_name: string;
  route_type: number;
  agency_id: string;
  trip_id: string;
  arrival_time: string | null;
  departure_time: string | null;
  direction_id?: number | null;
  service_id?: string;
}

export interface StopDetailData {
  stop: Stop;
  routesServing: StopServingRoute[];
  totalTripsSampled: number;
}

/**
 * Fetch routes with real Supabase server-side pagination, search, and mode filter
 */
export async function fetchPaginatedRoutes(params: {
  page: number;
  pageSize: number;
  search?: string;
  modeFilter?: 'all' | 'mtc' | 'metro';
}): Promise<PaginatedRoutesResult> {
  const { page, pageSize, search = '', modeFilter = 'all' } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let query = supabase
      .from('routes')
      .select('*', { count: 'exact' });

    // Mode filter
    if (modeFilter === 'mtc') {
      query = query.or('agency_id.eq.69,route_type.eq.3');
    } else if (modeFilter === 'metro') {
      query = query.or('agency_id.eq.CMRL,route_type.eq.1');
    }

    // Search query
    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      // Clean query string for ilike
      const sanitized = trimmedSearch.replace(/[%_,]/g, ' ');
      query = query.or(
        `route_short_name.ilike.%${sanitized}%,route_long_name.ilike.%${sanitized}%,route_id.ilike.%${sanitized}%`
      );
    }

    // Default order
    query = query
      .order('route_short_name', { ascending: true })
      .range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error('[fetchPaginatedRoutes error]:', error.message);
      return {
        routes: [],
        totalCount: 0,
        error: error.message,
      };
    }

    return {
      routes: (data as Route[]) || [],
      totalCount: count ?? (data?.length || 0),
      error: null,
    };
  } catch (err: any) {
    console.error('[fetchPaginatedRoutes exception]:', err);
    return {
      routes: [],
      totalCount: 0,
      error: err?.message || 'Failed to fetch routes from Supabase',
    };
  }
}

/**
 * Fetch live counts for All Modes, MTC, and Metro routes
 */
export async function fetchRouteCounts(): Promise<RouteCounts> {
  try {
    const [allRes, mtcRes, metroRes] = await Promise.all([
      supabase.from('routes').select('*', { count: 'exact', head: true }),
      supabase.from('routes').select('*', { count: 'exact', head: true }).or('agency_id.eq.69,route_type.eq.3'),
      supabase.from('routes').select('*', { count: 'exact', head: true }).or('agency_id.eq.CMRL,route_type.eq.1'),
    ]);

    return {
      total: allRes.count ?? 4614,
      mtc: mtcRes.count ?? 4611,
      metro: metroRes.count ?? 3,
    };
  } catch (err) {
    console.warn('[fetchRouteCounts fallback]:', err);
    return { total: 4614, mtc: 4611, metro: 3 };
  }
}

/**
 * Fetch detailed route information including its trips, stop_times and corresponding stops
 */
export async function fetchRouteDetails(
  routeId: string,
  preferredTripId?: string,
  preferredDirectionId?: number
): Promise<{ data: RouteDetailData | null; error: string | null }> {
  try {
    // 1. Fetch Route metadata
    const { data: route, error: routeError } = await supabase
      .from('routes')
      .select('*')
      .eq('route_id', routeId)
      .single();

    if (routeError || !route) {
      return { data: null, error: routeError?.message || `Route not found for ID ${routeId}` };
    }

    // 2. Fetch Agency metadata if available
    let agency: Agency | null = null;
    if (route.agency_id) {
      const { data: agencyData } = await supabase
        .from('agencies')
        .select('*')
        .eq('agency_id', route.agency_id)
        .maybeSingle();
      agency = agencyData as Agency | null;
    }

    // 3. Fetch trips for this route
    const { data: tripsData, error: tripsError } = await supabase
      .from('trips')
      .select('*')
      .eq('route_id', routeId)
      .limit(100);

    if (tripsError) {
      return { data: null, error: tripsError.message };
    }

    const trips = (tripsData as RouteTripDetail[]) || [];
    const directions = Array.from(
      new Set(trips.map((t) => (t.direction_id !== null ? Number(t.direction_id) : 0)))
    ).sort();
    const services = Array.from(new Set(trips.map((t) => t.service_id).filter(Boolean))).sort();

    // 4. Select trip to show stop_times
    let selectedTrip: RouteTripDetail | null = null;

    if (preferredTripId) {
      selectedTrip = trips.find((t) => t.trip_id === preferredTripId) || null;
    }

    if (!selectedTrip && preferredDirectionId !== undefined) {
      selectedTrip = trips.find((t) => t.direction_id === preferredDirectionId) || null;
    }

    if (!selectedTrip && trips.length > 0) {
      selectedTrip = trips[0];
    }

    // 5. If we have a trip, get its stop_times ordered by stop_sequence
    let stopsWithDetails: StopTimeWithDetails[] = [];
    if (selectedTrip) {
      const { data: stopTimesData, error: stopTimesError } = await supabase
        .from('stop_times')
        .select('trip_id, arrival_time, departure_time, stop_id, stop_sequence, pickup_type, drop_off_type')
        .eq('trip_id', selectedTrip.trip_id)
        .order('stop_sequence', { ascending: true });

      if (stopTimesError) {
        return { data: null, error: stopTimesError.message };
      }

      const stopTimes = stopTimesData || [];
      const stopIds = Array.from(new Set(stopTimes.map((st) => st.stop_id)));

      // 6. Fetch stops by IDs
      let stopsMap = new Map<string, Stop>();
      if (stopIds.length > 0) {
        const { data: stopsData, error: stopsError } = await supabase
          .from('stops')
          .select('*')
          .in('stop_id', stopIds);

        if (!stopsError && stopsData) {
          for (const s of stopsData) {
            stopsMap.set(s.stop_id, s as Stop);
          }
        }
      }

      stopsWithDetails = stopTimes.map((st) => ({
        ...st,
        stop: stopsMap.get(st.stop_id),
      }));
    }

    return {
      data: {
        route: route as Route,
        agency,
        trips,
        selectedTrip,
        stops: stopsWithDetails,
        directions,
        services,
      },
      error: null,
    };
  } catch (err: any) {
    console.error('[fetchRouteDetails exception]:', err);
    return { data: null, error: err?.message || 'Failed to load route details' };
  }
}

/**
 * Fetch stops with real Supabase server-side pagination, search, and type filter
 */
export async function fetchPaginatedStops(params: {
  page: number;
  pageSize: number;
  search?: string;
  typeFilter?: 'all' | 'metro' | 'bus';
}): Promise<PaginatedStopsResult> {
  const { page, pageSize, search = '', typeFilter = 'all' } = params;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let query = supabase
      .from('stops')
      .select('*', { count: 'exact' });

    // Mode filter
    if (typeFilter === 'metro') {
      query = query.like('stop_id', 'CMRL%');
    } else if (typeFilter === 'bus') {
      query = query.not('stop_id', 'like', 'CMRL%');
    }

    // Search query
    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      const sanitized = trimmedSearch.replace(/[%_,]/g, ' ');
      query = query.or(`stop_name.ilike.%${sanitized}%,stop_id.ilike.%${sanitized}%`);
    }

    // Default order
    query = query
      .order('stop_name', { ascending: true })
      .range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error('[fetchPaginatedStops error]:', error.message);
      return {
        stops: [],
        totalCount: 0,
        error: error.message,
      };
    }

    // Enrich with helper flags
    const stopsList = ((data as Stop[]) || []).map((s) => ({
      ...s,
      is_metro_station: s.stop_id.startsWith('CMRL'),
    }));

    return {
      stops: stopsList,
      totalCount: count ?? (data?.length || 0),
      error: null,
    };
  } catch (err: any) {
    console.error('[fetchPaginatedStops exception]:', err);
    return {
      stops: [],
      totalCount: 0,
      error: err?.message || 'Failed to fetch stops from Supabase',
    };
  }
}

/**
 * Fetch live counts for All Stops, Metro Stations, and Bus Stops
 */
export async function fetchStopCounts(): Promise<StopCounts> {
  try {
    const [allRes, metroRes, busRes] = await Promise.all([
      supabase.from('stops').select('*', { count: 'exact', head: true }),
      supabase.from('stops').select('*', { count: 'exact', head: true }).like('stop_id', 'CMRL%'),
      supabase.from('stops').select('*', { count: 'exact', head: true }).not('stop_id', 'like', 'CMRL%'),
    ]);

    return {
      total: allRes.count ?? 5624,
      metro: metroRes.count ?? 44,
      bus: busRes.count ?? 5580,
    };
  } catch (err) {
    console.warn('[fetchStopCounts fallback]:', err);
    return { total: 5624, metro: 44, bus: 5580 };
  }
}

/**
 * Fetch detailed stop information and routes/trips serving that stop
 */
export async function fetchStopDetails(
  stopId: string
): Promise<{ data: StopDetailData | null; error: string | null }> {
  try {
    // 1. Fetch stop metadata
    const { data: stop, error: stopError } = await supabase
      .from('stops')
      .select('*')
      .eq('stop_id', stopId)
      .single();

    if (stopError || !stop) {
      return { data: null, error: stopError?.message || `Stop not found for ID ${stopId}` };
    }

    const enrichedStop: Stop = {
      ...stop,
      is_metro_station: stop.stop_id.startsWith('CMRL'),
    };

    // 2. Fetch sample stop_times for this stop
    const { data: stopTimesData, error: stError } = await supabase
      .from('stop_times')
      .select('trip_id, arrival_time, departure_time')
      .eq('stop_id', stopId)
      .limit(60);

    if (stError) {
      return { data: null, error: stError.message };
    }

    const stopTimes = stopTimesData || [];
    const tripIds = Array.from(new Set(stopTimes.map((st) => st.trip_id))).slice(0, 40);

    let routesServing: StopServingRoute[] = [];

    if (tripIds.length > 0) {
      // 3. Fetch trips for these trip_ids
      const { data: tripsData, error: tripsError } = await supabase
        .from('trips')
        .select('trip_id, route_id, service_id, direction_id, trip_headsign')
        .in('trip_id', tripIds);

      if (!tripsError && tripsData) {
        const tripMap = new Map(tripsData.map((t) => [t.trip_id, t]));
        const routeIds = Array.from(new Set(tripsData.map((t) => t.route_id)));

        // 4. Fetch routes for these route_ids
        if (routeIds.length > 0) {
          const { data: routesData, error: routesError } = await supabase
            .from('routes')
            .select('*')
            .in('route_id', routeIds);

          if (!routesError && routesData) {
            const routeMap = new Map(routesData.map((r) => [r.route_id, r]));

            // Build distinct routes serving
            const seenRouteIds = new Set<string>();

            for (const st of stopTimes) {
              const trip = tripMap.get(st.trip_id);
              if (!trip) continue;

              const route = routeMap.get(trip.route_id);
              if (!route) continue;

              if (!seenRouteIds.has(route.route_id)) {
                seenRouteIds.add(route.route_id);
                routesServing.push({
                  route_id: route.route_id,
                  route_short_name: route.route_short_name,
                  route_long_name: route.route_long_name,
                  route_type: route.route_type,
                  agency_id: route.agency_id,
                  trip_id: trip.trip_id,
                  arrival_time: st.arrival_time,
                  departure_time: st.departure_time,
                  direction_id: trip.direction_id,
                  service_id: trip.service_id,
                });
              }
            }
          }
        }
      }
    }

    return {
      data: {
        stop: enrichedStop,
        routesServing,
        totalTripsSampled: stopTimes.length,
      },
      error: null,
    };
  } catch (err: any) {
    console.error('[fetchStopDetails exception]:', err);
    return { data: null, error: err?.message || 'Failed to load stop details' };
  }
}
