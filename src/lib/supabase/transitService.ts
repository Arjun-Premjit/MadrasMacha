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

export interface CalendarRecord {
  service_id: string;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
  start_date: string;
  end_date: string;
}

export interface NextDepartureInfo {
  nextDepartureTime: string | null; // e.g. "16:04:00"
  formattedNextDeparture: string | null; // e.g. "04:04 PM"
  upcomingDepartures: string[]; // e.g. ["16:04:00", "16:25:00"]
  allDeparturesToday: string[];
  activeServiceToday: boolean;
  serviceId: string | null;
  currentTimeInChennai: string;
  originStopName: string | null;
}

export interface JourneyMatch {
  trip_id: string;
  route: Route;
  direction_id: number | null;
  service_id: string;
  from_stop: Stop;
  to_stop: Stop;
  departure_time: string;
  arrival_time: string;
  duration_minutes: number;
  departs_in_minutes: number;
  stops_count: number;
  is_active_today: boolean;
  is_upcoming: boolean;
}

export interface CompleteJourneyStop {
  stop_id: string;
  stop_name: string;
  stop_sequence: number;
  arrival_time: string | null;
  departure_time: string | null;
  stop_lat: number | null;
  stop_lon: number | null;
}

export interface CompleteJourneyResult {
  route: Route;
  trip: RouteTripDetail;
  fromStop: Stop;
  toStop: Stop;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  totalIntermediateStops: number;
  stops: CompleteJourneyStop[];
}

/**
 * Utility: Convert browser date to Chennai (Asia/Kolkata / UTC+05:30) date & time
 */
export function getChennaiDateTime(date: Date = new Date()): {
  dayOfWeek: 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  formattedDateStr: string; // YYYY-MM-DD
  currentTimeStr: string; // HH:MM:SS
  formattedTime12: string; // e.g. 10:45 AM
} {
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || '';

    const year = getPart('year');
    const month = getPart('month');
    const day = getPart('day');
    const hour = getPart('hour');
    const minute = getPart('minute');
    const second = getPart('second');

    const formattedDateStr = `${year}-${month}-${day}`;
    const currentTimeStr = `${hour}:${minute}:${second}`;

    const dayOfWeekFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
    });
    const dayOfWeek = dayOfWeekFormatter.format(date).toLowerCase() as any;

    const time12Formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const formattedTime12 = time12Formatter.format(date);

    return { dayOfWeek, formattedDateStr, currentTimeStr, formattedTime12 };
  } catch (err) {
    // Fallback if Intl timeZone is unsupported
    const iso = date.toISOString();
    return {
      dayOfWeek: 'sunday',
      formattedDateStr: iso.split('T')[0],
      currentTimeStr: iso.split('T')[1].slice(0, 8),
      formattedTime12: '12:00 PM',
    };
  }
}

/**
 * Format "HH:MM:SS" into 12-hour "hh:mm AM/PM"
 */
export function formatTimeTo12Hour(time24: string | null): string {
  if (!time24) return 'N/A';
  const parts = time24.split(':');
  if (parts.length < 2) return time24;
  let hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 && hours < 24 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  return `${hours < 10 ? '0' + hours : hours}:${minutes} ${ampm}`;
}

/**
 * Calculate difference in minutes between two "HH:MM:SS" strings
 */
export function calculateDurationMinutes(startTime: string, endTime: string): number {
  try {
    const [h1, m1] = startTime.split(':').map(Number);
    const [h2, m2] = endTime.split(':').map(Number);
    const mins1 = h1 * 60 + m1;
    const mins2 = h2 * 60 + m2;
    const diff = mins2 - mins1;
    return diff >= 0 ? diff : diff + 24 * 60;
  } catch {
    return 0;
  }
}

/**
 * Fetch calendar rows and find service_ids active today
 */
export async function fetchActiveCalendarServices(date: Date = new Date()): Promise<{
  activeServiceIds: string[];
  calendar: CalendarRecord[];
}> {
  try {
    const { data: calendar, error } = await supabase.from('calendar').select('*');
    if (error || !calendar) {
      console.warn('Could not fetch calendar:', error?.message);
      return { activeServiceIds: ['Regular', 'Weekend', 'weekday', 'sunday', 'saturday'], calendar: [] };
    }

    const { dayOfWeek, formattedDateStr } = getChennaiDateTime(date);

    const activeServices = (calendar as CalendarRecord[]).filter((c) => {
      const inRange = c.start_date <= formattedDateStr && c.end_date >= formattedDateStr;
      const dayActive = (c as any)[dayOfWeek] === 1;
      return inRange && dayActive;
    });

    const ids = activeServices.map((c) => c.service_id);
    // If no active services found, fallback to all calendar service_ids
    return {
      activeServiceIds: ids.length > 0 ? ids : calendar.map((c) => c.service_id),
      calendar: calendar as CalendarRecord[],
    };
  } catch (err) {
    return { activeServiceIds: ['Regular'], calendar: [] };
  }
}

/**
 * Real Next Scheduled Bus on a Route
 * Evaluates active calendar services for device's current date,
 * gets trips and scheduled departures, and finds the earliest upcoming departure.
 */
export async function fetchNextDeparturesForRoute(
  routeId: string,
  directionId?: number
): Promise<NextDepartureInfo> {
  const { currentTimeStr, formattedDateStr } = getChennaiDateTime(new Date());

  const fallback: NextDepartureInfo = {
    nextDepartureTime: null,
    formattedNextDeparture: null,
    upcomingDepartures: [],
    allDeparturesToday: [],
    activeServiceToday: false,
    serviceId: null,
    currentTimeInChennai: currentTimeStr,
    originStopName: null,
  };

  try {
    const { activeServiceIds } = await fetchActiveCalendarServices();

    // Query trips for this route matching active services
    let tripQuery = supabase
      .from('trips')
      .select('trip_id, service_id, direction_id, trip_headsign')
      .eq('route_id', routeId);

    if (activeServiceIds.length > 0) {
      tripQuery = tripQuery.in('service_id', activeServiceIds);
    }

    if (directionId !== undefined) {
      tripQuery = tripQuery.eq('direction_id', directionId);
    }

    const { data: trips, error: tripsError } = await tripQuery.limit(80);

    if (tripsError || !trips || trips.length === 0) {
      // Check if route has ANY trips at all regardless of calendar
      const { data: anyTrips } = await supabase
        .from('trips')
        .select('trip_id, service_id, direction_id')
        .eq('route_id', routeId)
        .limit(20);

      if (!anyTrips || anyTrips.length === 0) {
        return fallback;
      }

      // If active today returned 0, query using all available trips for fallback
      return await calculateDeparturesForTrips(anyTrips.map((t) => t.trip_id), false);
    }

    return await calculateDeparturesForTrips(trips.map((t) => t.trip_id), true);
  } catch (err) {
    console.warn('[fetchNextDeparturesForRoute error]:', err);
    return fallback;
  }
}

async function calculateDeparturesForTrips(
  tripIds: string[],
  activeServiceToday: boolean
): Promise<NextDepartureInfo> {
  const { currentTimeStr } = getChennaiDateTime(new Date());

  if (tripIds.length === 0) {
    return {
      nextDepartureTime: null,
      formattedNextDeparture: null,
      upcomingDepartures: [],
      allDeparturesToday: [],
      activeServiceToday,
      serviceId: null,
      currentTimeInChennai: currentTimeStr,
      originStopName: null,
    };
  }

  // Fetch departure times from origin stop (stop_sequence = 1) for these trips
  const { data: stopTimes, error } = await supabase
    .from('stop_times')
    .select('trip_id, departure_time, stop_id')
    .in('trip_id', tripIds.slice(0, 60))
    .eq('stop_sequence', 1);

  if (error || !stopTimes || stopTimes.length === 0) {
    return {
      nextDepartureTime: null,
      formattedNextDeparture: null,
      upcomingDepartures: [],
      allDeparturesToday: [],
      activeServiceToday,
      serviceId: null,
      currentTimeInChennai: currentTimeStr,
      originStopName: null,
    };
  }

  // Get origin stop name
  let originStopName: string | null = null;
  const originStopId = stopTimes[0].stop_id;
  if (originStopId) {
    const { data: stopData } = await supabase
      .from('stops')
      .select('stop_name')
      .eq('stop_id', originStopId)
      .maybeSingle();
    if (stopData) {
      originStopName = stopData.stop_name;
    }
  }

  // Collect valid departure times and sort chronologically
  const allDepartures = Array.from(
    new Set(stopTimes.map((s) => s.departure_time).filter(Boolean) as string[])
  ).sort();

  // Find upcoming departures strictly after current Chennai time
  const upcoming = allDepartures.filter((time) => time >= currentTimeStr);
  const nextTime = upcoming.length > 0 ? upcoming[0] : allDepartures[0] || null;

  return {
    nextDepartureTime: nextTime,
    formattedNextDeparture: formatTimeTo12Hour(nextTime),
    upcomingDepartures: upcoming.slice(0, 5),
    allDeparturesToday: allDepartures,
    activeServiceToday,
    serviceId: null,
    currentTimeInChennai: currentTimeStr,
    originStopName,
  };
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
    let query = supabase.from('routes').select('*', { count: 'exact' });

    // Mode filter based on database agency_id and route_type
    if (modeFilter === 'mtc') {
      query = query.or('agency_id.eq.69,route_type.eq.3');
    } else if (modeFilter === 'metro') {
      query = query.or('agency_id.eq.CMRL,route_type.eq.1');
    }

    // Search query by route_short_name, route_id, route_long_name
    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      const sanitized = trimmedSearch.replace(/[%_,]/g, ' ');
      query = query.or(
        `route_short_name.ilike.%${sanitized}%,route_long_name.ilike.%${sanitized}%,route_id.ilike.%${sanitized}%`
      );
    }

    // Default order
    query = query.order('route_short_name', { ascending: true }).range(from, to);

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
 * Fetch live counts for All Modes, MTC, and Metro routes directly from Supabase
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
 * Fetch detailed route information including trips, stop_times, and stops.
 * Properly handles routes with zero trips without treating as an error.
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

    // If zero trips exist, return route with empty trips/stops array (NOT an error!)
    if (trips.length === 0) {
      return {
        data: {
          route: route as Route,
          agency,
          trips: [],
          selectedTrip: null,
          stops: [],
          directions: [],
          services: [],
        },
        error: null,
      };
    }

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

    // 5. Query stop_times for the selected trip only (NOT all 1.36M stop_times!)
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
    let query = supabase.from('stops').select('*', { count: 'exact' });

    // Mode filter
    if (typeFilter === 'metro') {
      query = query.like('stop_id', 'CMRL%');
    } else if (typeFilter === 'bus') {
      query = query.not('stop_id', 'like', 'CMRL%');
    }

    // Search query by stop_name or stop_id
    const trimmedSearch = search.trim();
    if (trimmedSearch) {
      const sanitized = trimmedSearch.replace(/[%_,]/g, ' ');
      query = query.or(`stop_name.ilike.%${sanitized}%,stop_id.ilike.%${sanitized}%`);
    }

    // Default order
    query = query.order('stop_name', { ascending: true }).range(from, to);

    const { data, count, error } = await query;

    if (error) {
      console.error('[fetchPaginatedStops error]:', error.message);
      return {
        stops: [],
        totalCount: 0,
        error: error.message,
      };
    }

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

    // 2. Query stop_times for this stop
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

/**
 * Search stops by name or stop_id for autocomplete in the Journey Planner
 */
export async function searchStopsForPlanner(query: string, limit = 8): Promise<Stop[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    const sanitized = trimmed.replace(/[%_,]/g, ' ');
    const { data, error } = await supabase
      .from('stops')
      .select('*')
      .or(`stop_name.ilike.%${sanitized}%,stop_id.ilike.%${sanitized}%`)
      .order('stop_name', { ascending: true })
      .limit(limit);

    if (error || !data) return [];
    return (data as Stop[]).map((s) => ({
      ...s,
      is_metro_station: s.stop_id.startsWith('CMRL'),
    }));
  } catch (err) {
    console.warn('[searchStopsForPlanner error]:', err);
    return [];
  }
}

/**
 * Find Direct Bus Journeys between Stop A and Stop B
 *
 * Algorithm:
 * 1. Query stop_times for Stop A (limit 200).
 * 2. Query stop_times for Stop B matching Stop A's trip_ids.
 * 3. Filter trips where stop_sequence(A) < stop_sequence(B).
 * 4. Fetch trip metadata from trips table.
 * 5. Fetch route metadata from routes table.
 * 6. Match calendar services active today.
 * 7. Sort upcoming departures chronologically.
 */
export async function findDirectJourneys(
  stopAId: string,
  stopBId: string
): Promise<{ journeys: JourneyMatch[]; error: string | null }> {
  try {
    // 1. Fetch metadata for stop A and stop B
    const [stopARes, stopBRes] = await Promise.all([
      supabase.from('stops').select('*').eq('stop_id', stopAId).single(),
      supabase.from('stops').select('*').eq('stop_id', stopBId).single(),
    ]);

    if (!stopARes.data || !stopBRes.data) {
      return { journeys: [], error: 'One or both selected stops could not be found.' };
    }

    const stopA: Stop = {
      ...stopARes.data,
      is_metro_station: stopARes.data.stop_id.startsWith('CMRL'),
    };
    const stopB: Stop = {
      ...stopBRes.data,
      is_metro_station: stopBRes.data.stop_id.startsWith('CMRL'),
    };

    // 2. Query stop_times for stop A
    const { data: stAData, error: stAError } = await supabase
      .from('stop_times')
      .select('trip_id, stop_sequence, departure_time')
      .eq('stop_id', stopAId)
      .limit(250);

    if (stAError || !stAData || stAData.length === 0) {
      return { journeys: [], error: null };
    }

    const tripIdsA = Array.from(new Set(stAData.map((s) => s.trip_id)));

    // 3. Query stop_times for stop B matching tripIdsA (batching if necessary)
    const batchSize = 80;
    const batches: string[][] = [];
    for (let i = 0; i < tripIdsA.length; i += batchSize) {
      batches.push(tripIdsA.slice(i, i + batchSize));
    }

    const batchResults = await Promise.all(
      batches.map((batch) =>
        supabase
          .from('stop_times')
          .select('trip_id, stop_sequence, arrival_time')
          .eq('stop_id', stopBId)
          .in('trip_id', batch)
      )
    );

    const stBData = batchResults.flatMap((r) => r.data || []);
    if (stBData.length === 0) {
      return { journeys: [], error: null };
    }

    // 4. Filter trips where stop_sequence(A) < stop_sequence(B)
    const stAMap = new Map(stAData.map((s) => [s.trip_id, s]));
    const validMatches: {
      trip_id: string;
      depTime: string;
      arrTime: string;
      depSeq: number;
      arrSeq: number;
      stopsCount: number;
    }[] = [];

    for (const b of stBData) {
      const a = stAMap.get(b.trip_id);
      if (a && a.stop_sequence < b.stop_sequence && a.departure_time && b.arrival_time) {
        validMatches.push({
          trip_id: b.trip_id,
          depTime: a.departure_time,
          arrTime: b.arrival_time,
          depSeq: a.stop_sequence,
          arrSeq: b.stop_sequence,
          stopsCount: b.stop_sequence - a.stop_sequence,
        });
      }
    }

    if (validMatches.length === 0) {
      return { journeys: [], error: null };
    }

    // 5. Query trips metadata
    const matchedTripIds = Array.from(new Set(validMatches.map((m) => m.trip_id)));
    const { data: tripsData, error: tripsError } = await supabase
      .from('trips')
      .select('trip_id, route_id, service_id, direction_id, trip_headsign')
      .in('trip_id', matchedTripIds);

    if (tripsError || !tripsData) {
      return { journeys: [], error: 'Could not fetch trip attributes' };
    }

    const tripMap = new Map(tripsData.map((t) => [t.trip_id, t]));
    const routeIds = Array.from(new Set(tripsData.map((t) => t.route_id)));

    // 6. Query routes metadata
    const { data: routesData } = await supabase
      .from('routes')
      .select('*')
      .in('route_id', routeIds);

    const routeMap = new Map((routesData || []).map((r) => [r.route_id, r]));

    // 7. Check active calendar services today
    const { activeServiceIds } = await fetchActiveCalendarServices();
    const activeServiceSet = new Set(activeServiceIds);
    const { currentTimeStr } = getChennaiDateTime(new Date());

    // 8. Build journey results
    const upcomingJourneys: JourneyMatch[] = [];
    const pastJourneysToday: JourneyMatch[] = [];

    for (const m of validMatches) {
      const trip = tripMap.get(m.trip_id);
      if (!trip) continue;
      const route = routeMap.get(trip.route_id);
      if (!route) continue;

      // Only use trips whose service is active today
      const isActiveToday = activeServiceSet.has(trip.service_id);
      if (!isActiveToday) continue;

      const durationMinutes = calculateDurationMinutes(m.depTime, m.arrTime);
      const isUpcoming = m.depTime >= currentTimeStr;
      const departsInMinutes = isUpcoming ? calculateDurationMinutes(currentTimeStr, m.depTime) : 0;

      const journeyItem: JourneyMatch = {
        trip_id: m.trip_id,
        route: route as Route,
        direction_id: trip.direction_id,
        service_id: trip.service_id,
        from_stop: stopA,
        to_stop: stopB,
        departure_time: m.depTime,
        arrival_time: m.arrTime,
        duration_minutes: durationMinutes,
        departs_in_minutes: departsInMinutes,
        stops_count: m.stopsCount,
        is_active_today: true,
        is_upcoming: isUpcoming,
      };

      if (isUpcoming) {
        upcomingJourneys.push(journeyItem);
      } else {
        pastJourneysToday.push(journeyItem);
      }
    }

    // 9. Sort upcoming journeys by:
    // 1. Earliest upcoming departure from origin stop
    // 2. Shortest scheduled journey duration
    // 3. Service frequency / stops count
    const sortFn = (a: JourneyMatch, b: JourneyMatch) => {
      const depDiff = a.departure_time.localeCompare(b.departure_time);
      if (depDiff !== 0) return depDiff;
      const durDiff = a.duration_minutes - b.duration_minutes;
      if (durDiff !== 0) return durDiff;
      return a.stops_count - b.stops_count;
    };

    upcomingJourneys.sort(sortFn);
    pastJourneysToday.sort(sortFn);

    // Prioritize upcoming departures; if none remain today, include past departures clearly marked
    const journeys = upcomingJourneys.length > 0 ? upcomingJourneys : pastJourneysToday;

    return { journeys, error: null };
  } catch (err: any) {
    console.error('[findDirectJourneys exception]:', err);
    return { journeys: [], error: err?.message || 'Journey search failed' };
  }
}

/**
 * Fetch the complete step-by-step journey for a trip between origin and destination
 */
export async function fetchCompleteJourney(
  tripId: string,
  fromStopId: string,
  toStopId: string
): Promise<{ data: CompleteJourneyResult | null; error: string | null }> {
  try {
    // 1. Fetch trip and route
    const { data: trip, error: tripErr } = await supabase
      .from('trips')
      .select('*')
      .eq('trip_id', tripId)
      .single();

    if (tripErr || !trip) {
      return { data: null, error: tripErr?.message || 'Trip not found' };
    }

    const { data: route, error: routeErr } = await supabase
      .from('routes')
      .select('*')
      .eq('route_id', trip.route_id)
      .single();

    if (routeErr || !route) {
      return { data: null, error: routeErr?.message || 'Route not found' };
    }

    // 2. Fetch all stop_times for this trip ordered by stop_sequence
    const { data: allStopTimes, error: stErr } = await supabase
      .from('stop_times')
      .select('stop_id, stop_sequence, arrival_time, departure_time')
      .eq('trip_id', tripId)
      .order('stop_sequence', { ascending: true });

    if (stErr || !allStopTimes || allStopTimes.length === 0) {
      return { data: null, error: 'Stop sequences not found for this trip' };
    }

    // Find fromStop and toStop index in this trip
    const fromIndex = allStopTimes.findIndex((s) => s.stop_id === fromStopId);
    const toIndex = allStopTimes.findIndex((s) => s.stop_id === toStopId);

    if (fromIndex === -1 || toIndex === -1 || fromIndex > toIndex) {
      return { data: null, error: 'Origin or destination sequence misaligned' };
    }

    const tripSlice = allStopTimes.slice(fromIndex, toIndex + 1);
    const stopIds = tripSlice.map((s) => s.stop_id);

    // 3. Fetch stop records for coordinates and names
    const { data: stopsData } = await supabase
      .from('stops')
      .select('*')
      .in('stop_id', stopIds);

    const stopMap = new Map((stopsData || []).map((s) => [s.stop_id, s]));

    const journeyStops: CompleteJourneyStop[] = tripSlice.map((s) => {
      const stopObj = stopMap.get(s.stop_id);
      return {
        stop_id: s.stop_id,
        stop_name: stopObj?.stop_name || `Stop ${s.stop_id}`,
        stop_sequence: s.stop_sequence,
        arrival_time: s.arrival_time,
        departure_time: s.departure_time,
        stop_lat: stopObj?.stop_lat || null,
        stop_lon: stopObj?.stop_lon || null,
      };
    });

    const fromStopObj = stopMap.get(fromStopId) as Stop;
    const toStopObj = stopMap.get(toStopId) as Stop;
    const departureTime = tripSlice[0].departure_time || 'N/A';
    const arrivalTime = tripSlice[tripSlice.length - 1].arrival_time || 'N/A';
    const durationMinutes = calculateDurationMinutes(departureTime, arrivalTime);

    return {
      data: {
        route: route as Route,
        trip: trip as RouteTripDetail,
        fromStop: fromStopObj,
        toStop: toStopObj,
        departureTime,
        arrivalTime,
        durationMinutes,
        totalIntermediateStops: journeyStops.length,
        stops: journeyStops,
      },
      error: null,
    };
  } catch (err: any) {
    console.error('[fetchCompleteJourney exception]:', err);
    return { data: null, error: err?.message || 'Failed to assemble complete journey' };
  }
}
