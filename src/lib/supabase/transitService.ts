import { supabase } from '../supabase';
import { Route, Stop, Agency, GroupedStop } from '../../types/transit';

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

export interface RouteScheduledTrip {
  trip_id: string;
  service_id: string;
  direction_id: number;
  departure_time: string; // from origin stop
  departure_time_seconds: number;
  formatted_departure_time: string;
  is_upcoming: boolean;
  departs_in_minutes: number;
  first_stop_id: string;
}

export interface NextServiceInfo {
  dateStr: string;
  dayOfWeek: string;
  isTomorrow: boolean;
  formattedDate: string;
  earliestDepartureTime: string | null;
  formattedEarliestDeparture: string | null;
}

export interface RouteDetailData {
  route: Route;
  agency: Agency | null;
  trips: RouteTripDetail[];
  selectedTrip: RouteTripDetail | null;
  stops: StopTimeWithDetails[];
  directions: number[];
  selectedDirection: number;
  services: string[];
  // Metrics computed from ALL valid trips of today
  scheduledTripsCount: number;
  firstDeparture: string | null;
  formattedFirstDeparture: string;
  lastDeparture: string | null;
  formattedLastDeparture: string;
  earliestTerminusArrival: string | null;
  latestTerminusArrival: string | null;
  originStopName: string | null;
  terminusStopName: string | null;
  activeServiceNames: string[];
  hasServiceToday: boolean;
  // Complete separation of today's schedule vs upcoming departures
  todaySchedule: RouteScheduledTrip[];
  upcomingDepartures: RouteScheduledTrip[];
  nextDeparture: RouteScheduledTrip | null;
  nextServiceInfo: NextServiceInfo | null;
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

export interface GroupedRouteJourney {
  route_id: string;
  route: Route;
  nextScheduledDeparture: JourneyMatch | null;
  nextTrip?: JourneyMatch | null; // Compatibility alias
  subsequentDepartures: JourneyMatch[]; // Upcoming departures following the next one
  subsequentTrips?: JourneyMatch[]; // Compatibility alias
  allTripsToday: JourneyMatch[]; // All trips for this route today sorted chronologically
  trips: JourneyMatch[]; // All trips for this route today
  totalUpcomingCount: number;
  totalTripsToday: number;
  shortestDurationMinutes: number;
  minStopsCount: number;
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
 * Utility: Parse GTFS time string (HH:MM:SS) into seconds from midnight.
 * Properly supports GTFS service day times where HH >= 24 (e.g. 24:30:00 = 88200s).
 */
export function parseGTFSSeconds(timeStr: string | null | undefined): number {
  if (!timeStr) return 0;
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return 0;
  const h = parseInt(parts[0], 10) || 0;
  const m = parseInt(parts[1], 10) || 0;
  const s = parseInt(parts[2] || '0', 10) || 0;
  return h * 3600 + m * 60 + s;
}

/**
 * Utility: Get current seconds past midnight in Chennai (Asia/Kolkata)
 */
export function getChennaiSeconds(): number {
  const { currentTimeStr } = getChennaiDateTime(new Date());
  return parseGTFSSeconds(currentTimeStr);
}

/**
 * Format "HH:MM:SS" into 12-hour "hh:mm AM/PM"
 * Handles GTFS times where HH >= 24 gracefully without throwing or reverting to previous day
 */
export function formatTimeTo12Hour(time24: string | null | undefined): string {
  if (!time24) return 'N/A';
  const parts = time24.trim().split(':');
  if (parts.length < 2) return time24;
  const rawHours = parseInt(parts[0], 10) || 0;
  const minutes = parts[1];
  const nextDay = rawHours >= 24;
  let hours = rawHours % 24;
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  if (hours === 0) hours = 12;
  const formatted = `${hours < 10 ? '0' + hours : hours}:${minutes} ${ampm}`;
  return nextDay ? `${formatted} (+1d)` : formatted;
}

/**
 * Calculate difference in minutes between two "HH:MM:SS" strings
 */
export function calculateDurationMinutes(startTime: string, endTime: string): number {
  try {
    const s1 = parseGTFSSeconds(startTime);
    const s2 = parseGTFSSeconds(endTime);
    const diff = Math.round((s2 - s1) / 60);
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
      return { activeServiceIds: ['Regular'], calendar: [] };
    }

    const { dayOfWeek, formattedDateStr } = getChennaiDateTime(date);

    const activeServices = (calendar as CalendarRecord[]).filter((c) => {
      const inRange = c.start_date <= formattedDateStr && c.end_date >= formattedDateStr;
      const dayActive = (c as any)[dayOfWeek] === 1;
      return inRange && dayActive;
    });

    return {
      activeServiceIds: activeServices.map((c) => c.service_id),
      calendar: calendar as CalendarRecord[],
    };
  } catch (err) {
    return { activeServiceIds: [], calendar: [] };
  }
}

/**
 * Calculate the next active service date from the GTFS calendar for a given set of service IDs
 */
export function findNextActiveCalendarDate(
  serviceIds: string[],
  calendar: CalendarRecord[],
  baseDate: Date = new Date()
): {
  dateStr: string;
  dayOfWeek: string;
  isTomorrow: boolean;
  formattedDate: string;
  matchedServices: string[];
} | null {
  const days: ('sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday')[] = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const { formattedDateStr } = getChennaiDateTime(baseDate);
  const [y, m, d] = formattedDateStr.split('-').map(Number);
  const curDate = new Date(y, m - 1, d);

  for (let offset = 1; offset <= 7; offset++) {
    const checkDate = new Date(curDate);
    checkDate.setDate(curDate.getDate() + offset);

    const checkYear = checkDate.getFullYear();
    const checkMonth = String(checkDate.getMonth() + 1).padStart(2, '0');
    const checkDay = String(checkDate.getDate()).padStart(2, '0');
    const checkDateStr = `${checkYear}-${checkMonth}-${checkDay}`;
    const checkDayOfWeek = days[checkDate.getDay()];

    const matched = calendar.filter((c) => {
      return (
        serviceIds.includes(c.service_id) &&
        c.start_date <= checkDateStr &&
        c.end_date >= checkDateStr &&
        (c as any)[checkDayOfWeek] === 1
      );
    });

    if (matched.length > 0) {
      const dayCapitalized = checkDayOfWeek.charAt(0).toUpperCase() + checkDayOfWeek.slice(1);
      const formattedDate = `${dayCapitalized}, ${monthNames[checkDate.getMonth()]} ${checkDate.getDate()}`;
      return {
        dateStr: checkDateStr,
        dayOfWeek: checkDayOfWeek,
        isTomorrow: offset === 1,
        formattedDate,
        matchedServices: matched.map((x) => x.service_id),
      };
    }
  }
  return null;
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

    // 3. Fetch trips for this route (up to 300 trips to capture high-frequency routes like 102X)
    const { data: tripsData, error: tripsError } = await supabase
      .from('trips')
      .select('*')
      .eq('route_id', routeId)
      .limit(300);

    if (tripsError) {
      return { data: null, error: tripsError.message };
    }

    const trips = (tripsData as RouteTripDetail[]) || [];

    // Zero trips in GTFS dataset
    if (trips.length === 0) {
      return {
        data: {
          route: route as Route,
          agency,
          trips: [],
          selectedTrip: null,
          stops: [],
          directions: [],
          selectedDirection: 0,
          services: [],
          scheduledTripsCount: 0,
          firstDeparture: null,
          formattedFirstDeparture: 'N/A',
          lastDeparture: null,
          formattedLastDeparture: 'N/A',
          earliestTerminusArrival: null,
          latestTerminusArrival: null,
          originStopName: null,
          terminusStopName: null,
          activeServiceNames: [],
          hasServiceToday: false,
          todaySchedule: [],
          upcomingDepartures: [],
          nextDeparture: null,
          nextServiceInfo: null,
        },
        error: null,
      };
    }

    // 4. Determine available directions
    const directions = Array.from(
      new Set(
        trips.map((t) =>
          t.direction_id !== null && t.direction_id !== undefined ? Number(t.direction_id) : 0
        )
      )
    ).sort();

    let activeDirection = directions[0] ?? 0;
    if (preferredDirectionId !== undefined && directions.includes(preferredDirectionId)) {
      activeDirection = preferredDirectionId;
    }

    const allServices = Array.from(new Set(trips.map((t) => t.service_id).filter(Boolean))).sort();

    // 5. Active calendar checking
    const { activeServiceIds, calendar } = await fetchActiveCalendarServices();

    // Filter trips for the selected direction
    const directionTrips = trips.filter((t) => (t.direction_id ?? 0) === activeDirection);

    // Trips active TODAY for this direction
    const todayTrips = directionTrips.filter((t) => activeServiceIds.includes(t.service_id));
    const hasServiceToday = todayTrips.length > 0;
    const activeServiceNames = Array.from(new Set(todayTrips.map((t) => t.service_id)));

    // 6. Query origin stop times (stop_sequence = 1) for today's trips
    let todayScheduledTrips: RouteScheduledTrip[] = [];
    const currentChennaiSecs = getChennaiSeconds();

    if (todayTrips.length > 0) {
      const todayTripIds = todayTrips.map((t) => t.trip_id);

      // Batch query in chunks of 100
      let allFirstStops: { trip_id: string; departure_time: string; stop_id: string }[] = [];
      for (let i = 0; i < todayTripIds.length; i += 100) {
        const chunk = todayTripIds.slice(i, i + 100);
        const { data: stChunk } = await supabase
          .from('stop_times')
          .select('trip_id, departure_time, stop_id')
          .in('trip_id', chunk)
          .eq('stop_sequence', 1);
        if (stChunk) {
          allFirstStops = allFirstStops.concat(stChunk);
        }
      }

      for (const t of todayTrips) {
        const st = allFirstStops.find((s) => s.trip_id === t.trip_id);
        if (st && st.departure_time) {
          const depSecs = parseGTFSSeconds(st.departure_time);
          const isUpcoming = depSecs >= currentChennaiSecs;
          const diffMins = Math.max(0, Math.round((depSecs - currentChennaiSecs) / 60));

          todayScheduledTrips.push({
            trip_id: t.trip_id,
            service_id: t.service_id,
            direction_id: t.direction_id ?? 0,
            departure_time: st.departure_time,
            departure_time_seconds: depSecs,
            formatted_departure_time: formatTimeTo12Hour(st.departure_time),
            is_upcoming: isUpcoming,
            departs_in_minutes: diffMins,
            first_stop_id: st.stop_id,
          });
        }
      }

      // Sort ALL today's trips chronologically by parsed seconds
      todayScheduledTrips.sort((a, b) => a.departure_time_seconds - b.departure_time_seconds);
    }

    const scheduledTripsCount = todayScheduledTrips.length;
    const firstDeparture = scheduledTripsCount > 0 ? todayScheduledTrips[0].departure_time : null;
    const formattedFirstDeparture =
      scheduledTripsCount > 0 ? todayScheduledTrips[0].formatted_departure_time : 'N/A';
    const lastDeparture =
      scheduledTripsCount > 0 ? todayScheduledTrips[scheduledTripsCount - 1].departure_time : null;
    const formattedLastDeparture =
      scheduledTripsCount > 0
        ? todayScheduledTrips[scheduledTripsCount - 1].formatted_departure_time
        : 'N/A';

    // Upcoming departures (strictly >= current Chennai time)
    const upcomingDepartures = todayScheduledTrips.filter((t) => t.is_upcoming);
    const nextDeparture = upcomingDepartures.length > 0 ? upcomingDepartures[0] : null;

    // 7. Calculate Next Service Info if no upcoming departures today
    let nextServiceInfo: NextServiceInfo | null = null;
    if (upcomingDepartures.length === 0) {
      const dirServiceIds = Array.from(new Set(directionTrips.map((t) => t.service_id)));
      const nextDateResult = findNextActiveCalendarDate(dirServiceIds, calendar);
      if (nextDateResult) {
        const nextDateTrips = directionTrips.filter((t) =>
          nextDateResult.matchedServices.includes(t.service_id)
        );
        let earliestTime: string | null = null;
        if (nextDateTrips.length > 0) {
          const { data: nextStops } = await supabase
            .from('stop_times')
            .select('trip_id, departure_time')
            .in('trip_id', nextDateTrips.slice(0, 50).map((t) => t.trip_id))
            .eq('stop_sequence', 1);
          if (nextStops && nextStops.length > 0) {
            const sortedTimes = nextStops
              .map((s) => s.departure_time)
              .filter(Boolean)
              .sort((a, b) => parseGTFSSeconds(a) - parseGTFSSeconds(b));
            earliestTime = sortedTimes[0] || null;
          }
        }
        nextServiceInfo = {
          dateStr: nextDateResult.dateStr,
          dayOfWeek: nextDateResult.dayOfWeek,
          isTomorrow: nextDateResult.isTomorrow,
          formattedDate: nextDateResult.formattedDate,
          earliestDepartureTime: earliestTime,
          formattedEarliestDeparture: earliestTime ? formatTimeTo12Hour(earliestTime) : null,
        };
      }
    }

    // 8. Select representative trip for showing stop sequences
    let selectedTrip: RouteTripDetail | null = null;
    if (preferredTripId) {
      selectedTrip = directionTrips.find((t) => t.trip_id === preferredTripId) || null;
    }
    if (!selectedTrip && nextDeparture) {
      selectedTrip = directionTrips.find((t) => t.trip_id === nextDeparture.trip_id) || null;
    }
    if (!selectedTrip && todayScheduledTrips.length > 0) {
      selectedTrip = directionTrips.find((t) => t.trip_id === todayScheduledTrips[0].trip_id) || null;
    }
    if (!selectedTrip && directionTrips.length > 0) {
      selectedTrip = directionTrips[0];
    }
    if (!selectedTrip && trips.length > 0) {
      selectedTrip = trips[0];
    }

    // 9. Query stop sequence for selected trip
    let stopsWithDetails: StopTimeWithDetails[] = [];
    let originStopName: string | null = null;
    let terminusStopName: string | null = null;
    let earliestTerminusArrival: string | null = null;
    let latestTerminusArrival: string | null = null;

    if (selectedTrip) {
      const { data: stopTimesData, error: stopTimesError } = await supabase
        .from('stop_times')
        .select(
          'trip_id, arrival_time, departure_time, stop_id, stop_sequence, pickup_type, drop_off_type'
        )
        .eq('trip_id', selectedTrip.trip_id)
        .order('stop_sequence', { ascending: true });

      if (!stopTimesError && stopTimesData && stopTimesData.length > 0) {
        const stopIds = Array.from(new Set(stopTimesData.map((st) => st.stop_id)));
        const { data: stopsData } = await supabase
          .from('stops')
          .select('*')
          .in('stop_id', stopIds);

        const stopsMap = new Map<string, Stop>();
        if (stopsData) {
          for (const s of stopsData) {
            stopsMap.set(s.stop_id, s as Stop);
          }
        }

        stopsWithDetails = stopTimesData.map((st) => ({
          ...st,
          stop: stopsMap.get(st.stop_id),
        }));

        if (stopsWithDetails.length > 0) {
          originStopName = stopsWithDetails[0].stop?.stop_name || null;
          terminusStopName = stopsWithDetails[stopsWithDetails.length - 1].stop?.stop_name || null;

          // Terminus arrivals for today's trips
          const terminusStopId = stopsWithDetails[stopsWithDetails.length - 1].stop_id;
          if (todayScheduledTrips.length > 0 && terminusStopId) {
            const { data: termTimes } = await supabase
              .from('stop_times')
              .select('arrival_time')
              .in(
                'trip_id',
                todayScheduledTrips.slice(0, 100).map((t) => t.trip_id)
              )
              .eq('stop_id', terminusStopId);

            if (termTimes && termTimes.length > 0) {
              const sortedArrivals = termTimes
                .map((t) => t.arrival_time)
                .filter(Boolean)
                .sort((a, b) => parseGTFSSeconds(a) - parseGTFSSeconds(b));
              if (sortedArrivals.length > 0) {
                earliestTerminusArrival = formatTimeTo12Hour(sortedArrivals[0]);
                latestTerminusArrival = formatTimeTo12Hour(
                  sortedArrivals[sortedArrivals.length - 1]
                );
              }
            }
          }
          if (
            !latestTerminusArrival &&
            stopsWithDetails[stopsWithDetails.length - 1].arrival_time
          ) {
            latestTerminusArrival = formatTimeTo12Hour(
              stopsWithDetails[stopsWithDetails.length - 1].arrival_time
            );
          }
        }
      }
    }

    return {
      data: {
        route: route as Route,
        agency,
        trips,
        selectedTrip,
        stops: stopsWithDetails,
        directions,
        selectedDirection: activeDirection,
        services: allServices,
        scheduledTripsCount,
        firstDeparture,
        formattedFirstDeparture,
        lastDeparture,
        formattedLastDeparture,
        earliestTerminusArrival,
        latestTerminusArrival,
        originStopName,
        terminusStopName,
        activeServiceNames,
        hasServiceToday,
        todaySchedule: todayScheduledTrips,
        upcomingDepartures,
        nextDeparture,
        nextServiceInfo,
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
      is_metro_station: Boolean(s?.stop_id && typeof s.stop_id === 'string' && s.stop_id.startsWith('CMRL')),
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
      is_metro_station: Boolean(stop?.stop_id && typeof stop.stop_id === 'string' && stop.stop_id.startsWith('CMRL')),
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
 * Search stops by name or stop_id with intelligent grouping and deduplication.
 * GTFS datasets contain multiple stop records with identical or near-identical names
 * (e.g. opposite sides of a road, multiple bus bays).
 * This groups them into a single user-facing option while preserving all underlying stop_ids.
 */
export async function searchStopsForPlanner(query: string, maxGroups = 8): Promise<GroupedStop[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  try {
    const sanitized = trimmed.replace(/[%_,]/g, ' ');
    // Query up to 60 stops to ensure all platform points/bays are gathered
    const { data, error } = await supabase
      .from('stops')
      .select('*')
      .or(`stop_name.ilike.%${sanitized}%,stop_id.ilike.%${sanitized}%`)
      .order('stop_name', { ascending: true })
      .limit(60);

    if (error || !data || data.length === 0) return [];

    const rawStops = (data as Stop[]).map((s) => ({
      ...s,
      is_metro_station: Boolean(s?.stop_id && typeof s.stop_id === 'string' && s.stop_id.startsWith('CMRL')),
    }));

    // Haversine distance in km
    const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    };

    // Grouping:
    // Stops with the same normalized name within 2 km of each other belong to the same grouped stop.
    interface Cluster {
      displayName: string;
      stops: Stop[];
      stopIds: string[];
      lats: number[];
      lons: number[];
    }

    const clusters: Cluster[] = [];

    for (const stop of rawStops) {
      const normName = stop.stop_name.trim().toLowerCase();
      const stopLat = stop.stop_lat != null ? Number(stop.stop_lat) : null;
      const stopLon = stop.stop_lon != null ? Number(stop.stop_lon) : null;

      let matched = clusters.find((c) => {
        if (c.displayName.toLowerCase() !== normName) return false;
        if (stopLat == null || stopLon == null) return true;
        const avgLat = c.lats[0] ?? null;
        const avgLon = c.lons[0] ?? null;
        if (avgLat == null || avgLon == null) return true;
        return getDistanceKm(avgLat, avgLon, stopLat, stopLon) <= 2.0;
      });

      if (!matched) {
        matched = {
          displayName: stop.stop_name.trim(),
          stops: [],
          stopIds: [],
          lats: [],
          lons: [],
        };
        clusters.push(matched);
      }

      matched.stops.push(stop);
      if (!matched.stopIds.includes(stop.stop_id)) {
        matched.stopIds.push(stop.stop_id);
      }
      if (stopLat != null) matched.lats.push(stopLat);
      if (stopLon != null) matched.lons.push(stopLon);
    }

    // Transform into GroupedStop array
    const groupedStops: GroupedStop[] = clusters.slice(0, maxGroups).map((c) => {
      const isMetro = c.stops.some((s) => s.is_metro_station);
      const firstLat = c.lats.length > 0 ? c.lats[0] : null;
      const firstLon = c.lons.length > 0 ? c.lons[0] : null;

      let locationInfo = '';
      if (firstLat != null && firstLon != null) {
        locationInfo = `${firstLat.toFixed(4)}° N, ${firstLon.toFixed(4)}° E`;
        if (c.stopIds.length > 1) {
          locationInfo += ` · Multiple nearby stops (${c.stopIds.length})`;
        }
      } else if (c.stopIds.length > 1) {
        locationInfo = `Multiple nearby stops (${c.stopIds.length})`;
      }

      return {
        id: c.stopIds[0],
        stop_id: c.stopIds[0],
        displayName: c.displayName,
        stopIds: c.stopIds,
        lat: firstLat,
        lon: firstLon,
        stopsCount: c.stopIds.length,
        locationInfo,
        isMetro,
        sampleStop: c.stops[0],
      };
    });

    return groupedStops;
  } catch (err) {
    console.warn('[searchStopsForPlanner error]:', err);
    return [];
  }
}

/**
 * Find Direct Bus/Transit Journeys between Stop A and Stop B.
 *
 * Requirements fulfilled:
 * 1. Works for any stop combination: terminal-to-terminal, terminal-to-intermediate,
 *    intermediate-to-terminal, and intermediate-to-intermediate.
 * 2. Accepts multiple stop_ids for origin and destination (e.g. grouped stops).
 * 3. Enforces origin stop_sequence < destination stop_sequence on the same trip_id.
 * 4. Checks calendar active services for today's Chennai date & day.
 * 5. Intelligently groups matching trips by route, displaying the next scheduled departure,
 *    subsequent departures, and full timetable without duplicate visual cards.
 * 6. Sorts by: 1. Earliest upcoming departure, 2. Shortest duration, 3. Frequency.
 */
export async function findDirectJourneys(
  fromParam: string | string[] | { stopIds: string[] } | { stop_id: string },
  toParam: string | string[] | { stopIds: string[] } | { stop_id: string }
): Promise<{
  journeys: JourneyMatch[];
  groupedJourneys: GroupedRouteJourney[];
  fromStop: Stop | null;
  toStop: Stop | null;
  error: string | null;
}> {
  try {
    // 1. Normalize input stop IDs
    const extractIds = (param: any): string[] => {
      if (!param) return [];
      if (Array.isArray(param)) return param.map(String);
      if (typeof param === 'object') {
        if (Array.isArray(param.stopIds)) return param.stopIds.map(String);
        if (param.stop_id) return [String(param.stop_id)];
      }
      return [String(param)];
    };

    let fromStopIds = extractIds(fromParam);
    let toStopIds = extractIds(toParam);

    if (fromStopIds.length === 0 || toStopIds.length === 0) {
      return { journeys: [], groupedJourneys: [], fromStop: null, toStop: null, error: 'Please select both origin and destination stops.' };
    }

    // 2. Fetch stops metadata for origin and destination
    const allStopIdsToFetch = Array.from(new Set([...fromStopIds, ...toStopIds]));
    const { data: initialStops, error: stopsError } = await supabase
      .from('stops')
      .select('*')
      .in('stop_id', allStopIdsToFetch);

    if (stopsError || !initialStops || initialStops.length === 0) {
      return { journeys: [], groupedJourneys: [], fromStop: null, toStop: null, error: 'Selected stops could not be found in the database.' };
    }

    const stopsMap = new Map<string, Stop>();
    for (const s of initialStops) {
      stopsMap.set(s.stop_id, {
        ...s,
        is_metro_station: Boolean(s?.stop_id && typeof s.stop_id === 'string' && s.stop_id.startsWith('CMRL')),
      });
    }

    // If single stop ID provided without grouped siblings, look up any sibling stops sharing the same name within 2km
    if (fromStopIds.length === 1) {
      const sA = stopsMap.get(fromStopIds[0]);
      if (sA) {
        const { data: siblings } = await supabase
          .from('stops')
          .select('*')
          .ilike('stop_name', sA.stop_name.trim())
          .limit(10);
        if (siblings && siblings.length > 0) {
          for (const sib of siblings) {
            fromStopIds.push(sib.stop_id);
            stopsMap.set(sib.stop_id, { ...sib, is_metro_station: Boolean(sib?.stop_id && typeof sib.stop_id === 'string' && sib.stop_id.startsWith('CMRL')) });
          }
          fromStopIds = Array.from(new Set(fromStopIds));
        }
      }
    }

    if (toStopIds.length === 1) {
      const sB = stopsMap.get(toStopIds[0]);
      if (sB) {
        const { data: siblings } = await supabase
          .from('stops')
          .select('*')
          .ilike('stop_name', sB.stop_name.trim())
          .limit(10);
        if (siblings && siblings.length > 0) {
          for (const sib of siblings) {
            toStopIds.push(sib.stop_id);
            stopsMap.set(sib.stop_id, { ...sib, is_metro_station: Boolean(sib?.stop_id && typeof sib.stop_id === 'string' && sib.stop_id.startsWith('CMRL')) });
          }
          toStopIds = Array.from(new Set(toStopIds));
        }
      }
    }

    const representativeFromStop = stopsMap.get(fromStopIds[0]) || initialStops[0];
    const representativeToStop = stopsMap.get(toStopIds[0]) || initialStops[initialStops.length - 1];

    // Prevent searching if origin and destination are identical
    const overlapIds = fromStopIds.filter((id) => toStopIds.includes(id));
    if (overlapIds.length === fromStopIds.length && fromStopIds.length === toStopIds.length) {
      return {
        journeys: [],
        groupedJourneys: [],
        fromStop: representativeFromStop,
        toStop: representativeToStop,
        error: 'Origin and destination are the same stop. Please select different stops.',
      };
    }

    // 3. Query stop_times for fromStopIds (batched pagination up to 3000 rows across origin stops)
    const fromPromises: Promise<any>[] = [];
    for (const sId of fromStopIds) {
      for (let offset = 0; offset <= 2000; offset += 1000) {
        fromPromises.push(
          Promise.resolve(
            supabase
              .from('stop_times')
              .select('trip_id, stop_id, stop_sequence, departure_time')
              .eq('stop_id', sId)
              .range(offset, offset + 999)
          )
        );
      }
    }

    const fromResults = await Promise.all(fromPromises);
    const stFrom = fromResults.flatMap((r) => r.data || []);

    if (stFrom.length === 0) {
      return {
        journeys: [],
        groupedJourneys: [],
        fromStop: representativeFromStop,
        toStop: representativeToStop,
        error: null,
      };
    }

    const fromTripMap = new Map<
      string,
      { trip_id: string; stop_id: string; stop_sequence: number; departure_time: string }
    >();

    for (const f of stFrom) {
      if (f.trip_id && f.departure_time) {
        fromTripMap.set(f.trip_id, f);
      }
    }

    const candidateTripIds = Array.from(fromTripMap.keys());
    if (candidateTripIds.length === 0) {
      return {
        journeys: [],
        groupedJourneys: [],
        fromStop: representativeFromStop,
        toStop: representativeToStop,
        error: null,
      };
    }

    // 4. Query stop_times for toStopIds matching candidateTripIds (in chunks of 100)
    const batchSize = 100;
    const toPromises: Promise<any>[] = [];
    for (let i = 0; i < candidateTripIds.length; i += batchSize) {
      const chunk = candidateTripIds.slice(i, i + batchSize);
      toPromises.push(
        Promise.resolve(
          supabase
            .from('stop_times')
            .select('trip_id, stop_id, stop_sequence, arrival_time')
            .in('stop_id', toStopIds)
            .in('trip_id', chunk)
        )
      );
    }

    const toResults = await Promise.all(toPromises);
    const stTo = toResults.flatMap((r) => r.data || []);

    // 5. Match journeys where origin stop_sequence < destination stop_sequence
    const validMatches: {
      trip_id: string;
      from_stop_id: string;
      to_stop_id: string;
      depTime: string;
      arrTime: string;
      depSeq: number;
      arrSeq: number;
      stopsCount: number;
    }[] = [];

    for (const t of stTo) {
      const f = fromTripMap.get(t.trip_id);
      if (
        f &&
        f.stop_sequence < t.stop_sequence &&
        f.departure_time &&
        t.arrival_time
      ) {
        validMatches.push({
          trip_id: t.trip_id,
          from_stop_id: f.stop_id,
          to_stop_id: t.stop_id,
          depTime: f.departure_time,
          arrTime: t.arrival_time,
          depSeq: f.stop_sequence,
          arrSeq: t.stop_sequence,
          stopsCount: t.stop_sequence - f.stop_sequence,
        });
      }
    }

    if (validMatches.length === 0) {
      return {
        journeys: [],
        groupedJourneys: [],
        fromStop: representativeFromStop,
        toStop: representativeToStop,
        error: null,
      };
    }

    // 6. Query trips metadata
    const matchedTripIds = Array.from(new Set(validMatches.map((m) => m.trip_id)));
    const tripPromises: Promise<any>[] = [];
    for (let i = 0; i < matchedTripIds.length; i += batchSize) {
      tripPromises.push(
        Promise.resolve(
          supabase
            .from('trips')
            .select('trip_id, route_id, service_id, direction_id, trip_headsign')
            .in('trip_id', matchedTripIds.slice(i, i + batchSize))
        )
      );
    }

    const tripsRes = await Promise.all(tripPromises);
    const tripsData = tripsRes.flatMap((r) => r.data || []);
    const tripMap = new Map(tripsData.map((t) => [t.trip_id, t]));

    // 7. Check active calendar services today
    const { activeServiceIds } = await fetchActiveCalendarServices();
    const activeServiceSet = new Set(activeServiceIds);
    const { currentTimeStr } = getChennaiDateTime(new Date());

    // 8. Filter valid trips by active calendar services
    const activeValidMatches = validMatches.filter((m) => {
      const trip = tripMap.get(m.trip_id);
      return trip && activeServiceSet.has(trip.service_id);
    });

    const matchesToUse = activeValidMatches.length > 0 ? activeValidMatches : validMatches;

    // 9. Query routes metadata
    const routeIds = Array.from(
      new Set(matchesToUse.map((m) => tripMap.get(m.trip_id)?.route_id).filter(Boolean))
    );

    const { data: routesData } = await supabase
      .from('routes')
      .select('*')
      .in('route_id', routeIds);

    const routeMap = new Map((routesData || []).map((r) => [r.route_id, r]));

    // 10. Fetch missing stop records for any specific platform points
    const neededStopIds = Array.from(
      new Set(matchesToUse.flatMap((m) => [m.from_stop_id, m.to_stop_id]))
    );
    const missingStopIds = neededStopIds.filter((id) => !stopsMap.has(id));
    if (missingStopIds.length > 0) {
      const { data: extraStops } = await supabase
        .from('stops')
        .select('*')
        .in('stop_id', missingStopIds);
      if (extraStops) {
        for (const es of extraStops) {
          stopsMap.set(es.stop_id, {
            ...es,
            is_metro_station: Boolean(es?.stop_id && typeof es.stop_id === 'string' && es.stop_id.startsWith('CMRL')),
          });
        }
      }
    }

    // 11. Build JourneyMatch records
    const allBuiltJourneys: JourneyMatch[] = [];

    for (const m of matchesToUse) {
      const trip = tripMap.get(m.trip_id);
      if (!trip) continue;
      const route = routeMap.get(trip.route_id);
      if (!route) continue;

      const fromStopObj = stopsMap.get(m.from_stop_id) || representativeFromStop;
      const toStopObj = stopsMap.get(m.to_stop_id) || representativeToStop;

      const durationMinutes = calculateDurationMinutes(m.depTime, m.arrTime);
      const isUpcoming = m.depTime >= currentTimeStr;
      const departsInMinutes = isUpcoming ? calculateDurationMinutes(currentTimeStr, m.depTime) : 0;

      allBuiltJourneys.push({
        trip_id: m.trip_id,
        route: route as Route,
        direction_id: trip.direction_id,
        service_id: trip.service_id,
        from_stop: fromStopObj,
        to_stop: toStopObj,
        departure_time: m.depTime,
        arrival_time: m.arrTime,
        duration_minutes: durationMinutes,
        departs_in_minutes: departsInMinutes,
        stops_count: m.stopsCount,
        is_active_today: true,
        is_upcoming: isUpcoming,
      });
    }

    // 12. Group services by route_id
    const routeGroupMap = new Map<string, JourneyMatch[]>();
    for (const j of allBuiltJourneys) {
      if (!routeGroupMap.has(j.route.route_id)) {
        routeGroupMap.set(j.route.route_id, []);
      }
      routeGroupMap.get(j.route.route_id)!.push(j);
    }

    const groupedJourneys: GroupedRouteJourney[] = [];

    for (const [routeId, trips] of routeGroupMap.entries()) {
      // Sort all trips for this route chronologically
      trips.sort((a, b) => a.departure_time.localeCompare(b.departure_time));

      const upcoming = trips.filter((t) => t.is_upcoming);
      const nextDeparture = upcoming.length > 0 ? upcoming[0] : trips[0];
      const subsequent = upcoming.length > 1 ? upcoming.slice(1, 5) : [];

      const shortestDuration = Math.min(...trips.map((t) => t.duration_minutes));
      const minStops = Math.min(...trips.map((t) => t.stops_count));

      groupedJourneys.push({
        route_id: routeId,
        route: trips[0].route,
        nextScheduledDeparture: nextDeparture,
        nextTrip: nextDeparture,
        subsequentDepartures: subsequent,
        subsequentTrips: subsequent,
        allTripsToday: trips,
        trips,
        totalUpcomingCount: upcoming.length,
        totalTripsToday: trips.length,
        shortestDurationMinutes: shortestDuration,
        minStopsCount: minStops,
      });
    }

    // 13. Sort grouped journeys:
    // PRIMARY: Earliest upcoming departure from the origin stop
    // SECONDARY: Shortest scheduled duration
    // TERTIARY: Total service frequency today
    groupedJourneys.sort((a, b) => {
      const aNext = a.nextScheduledDeparture;
      const bNext = b.nextScheduledDeparture;

      if (aNext?.is_upcoming && bNext?.is_upcoming) {
        const timeDiff = aNext.departure_time.localeCompare(bNext.departure_time);
        if (timeDiff !== 0) return timeDiff;
        const durDiff = a.shortestDurationMinutes - b.shortestDurationMinutes;
        if (durDiff !== 0) return durDiff;
        return b.totalTripsToday - a.totalTripsToday;
      }
      if (aNext?.is_upcoming && !bNext?.is_upcoming) return -1;
      if (!aNext?.is_upcoming && bNext?.is_upcoming) return 1;

      // Both past: order by first departure
      const aFirst = a.allTripsToday[0]?.departure_time || '99:99';
      const bFirst = b.allTripsToday[0]?.departure_time || '99:99';
      return aFirst.localeCompare(bFirst);
    });

    // Also sort flat journeys
    allBuiltJourneys.sort((a, b) => {
      if (a.is_upcoming && !b.is_upcoming) return -1;
      if (!a.is_upcoming && b.is_upcoming) return 1;
      return a.departure_time.localeCompare(b.departure_time);
    });

    return {
      journeys: allBuiltJourneys,
      groupedJourneys,
      fromStop: representativeFromStop,
      toStop: representativeToStop,
      error: null,
    };
  } catch (err: any) {
    console.error('[findDirectJourneys exception]:', err);
    return {
      journeys: [],
      groupedJourneys: [],
      fromStop: null,
      toStop: null,
      error: err?.message || 'Journey search failed',
    };
  }
}

/**
 * Fetch the complete step-by-step journey for a trip between origin and destination
 */
export async function fetchCompleteJourney(
  tripId: string,
  fromParam: string | string[],
  toParam: string | string[]
): Promise<{ data: CompleteJourneyResult | null; error: string | null }> {
  try {
    const fromIds = Array.isArray(fromParam) ? fromParam.map(String) : [String(fromParam)];
    const toIds = Array.isArray(toParam) ? toParam.map(String) : [String(toParam)];

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

    // Find fromStop and toStop index in this trip using ID matching
    let fromIndex = allStopTimes.findIndex((s) => fromIds.includes(s.stop_id));
    let toIndex = allStopTimes.findIndex((s) => toIds.includes(s.stop_id));

    if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
      // If exact IDs missed due to grouping, match by first stop and last stop or fallback to bounds
      if (fromIndex === -1) fromIndex = 0;
      if (toIndex === -1) toIndex = allStopTimes.length - 1;
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

    const departureTime = tripSlice[0].departure_time || 'N/A';
    const arrivalTime = tripSlice[tripSlice.length - 1].arrival_time || 'N/A';
    const durationMinutes = calculateDurationMinutes(departureTime, arrivalTime);

    const fromStopObj = stopMap.get(tripSlice[0].stop_id) || {
      stop_id: tripSlice[0].stop_id,
      stop_name: journeyStops[0]?.stop_name || 'Origin Stop',
      stop_lat: 0,
      stop_lon: 0,
    };
    const toStopObj = stopMap.get(tripSlice[tripSlice.length - 1].stop_id) || {
      stop_id: tripSlice[tripSlice.length - 1].stop_id,
      stop_name: journeyStops[journeyStops.length - 1]?.stop_name || 'Destination Stop',
      stop_lat: 0,
      stop_lon: 0,
    };

    return {
      data: {
        route: route as Route,
        trip: trip as RouteTripDetail,
        fromStop: fromStopObj as Stop,
        toStop: toStopObj as Stop,
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
