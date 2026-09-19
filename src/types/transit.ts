export type RouteType = 0 | 1 | 2 | 3; // 1: Subway/Metro, 3: Bus

export interface Agency {
  agency_id: string;
  agency_name: string;
  agency_url: string;
  agency_timezone: string;
  agency_lang?: string;
  agency_phone?: string;
  agency_fare_url?: string;
}

export interface Route {
  route_id: string;
  agency_id: string;
  route_short_name: string; // e.g. "21G", "BLUE", "GREEN"
  route_long_name: string;  // e.g. "Broadway to Tambaram", "Wimco Nagar to Airport"
  route_desc?: string;
  route_type: RouteType;    // 1 for Metro, 3 for Bus
  route_url?: string;
  route_color?: string;     // Hex color e.g. "0072CE", "008A00", "E65100"
  route_text_color?: string;
  service_category?: 'metro_blue' | 'metro_green' | 'mtc_deluxe' | 'mtc_ordinary' | 'mtc_express' | 'mtc_ac';
  origin?: string;
  destination?: string;
  distance_km?: number;
  estimated_duration_min?: number;
  stops_count?: number;
  frequency_peak?: string;
  frequency_off_peak?: string;
  first_trip?: string;
  last_trip?: string;
  fare_min?: number;
  fare_max?: number;
  stops_sequence?: string[]; // Array of stop IDs or names
}

export interface Stop {
  stop_id: string;
  stop_code?: string;
  stop_name: string;
  stop_name_tamil?: string;
  stop_desc?: string;
  stop_lat: number;
  stop_lon: number;
  zone_id?: string;
  stop_url?: string;
  location_type?: number;
  wheelchair_boarding?: number;
  is_metro_station?: boolean;
  metro_line?: 'blue' | 'green' | 'interchange';
  interchange_available?: boolean;
  connected_routes?: string[];
}

export interface Calendar {
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

export interface TransitStats {
  mtcRoutesCount: number;
  mtcStopsCount: number;
  metroRoutesCount: number;
  metroStationsCount: number;
  totalAgencies: number;
  dataSource: 'supabase' | 'fallback';
}

export interface SearchFilterState {
  query: string;
  agency: 'all' | 'mtc' | 'cmrl';
  serviceType: 'all' | 'metro' | 'bus_ordinary' | 'bus_deluxe' | 'bus_ac';
  originQuery: string;
  destinationQuery: string;
}

export interface GroupedStop {
  id: string; // Unique group identifier
  stop_id?: string; // Primary stop_id for compatibility
  displayName: string; // Clean user-facing stop name
  stopIds: string[]; // All matching GTFS stop_ids (e.g. opposite sides of road, bays)
  lat: number | null;
  lon: number | null;
  stopsCount: number;
  locationInfo?: string; // Contextual display e.g. "12.9786° N, 80.2522° E · 3 stop points"
  isMetro: boolean;
  sampleStop: Stop;
}

export interface JourneyLeg {
  legNumber: number;
  routeId: string;
  routeShortName: string;
  routeLongName: string;
  routeType: number; // 1: Metro, 3: Bus
  agencyId: string;
  tripId: string;
  directionId?: number | null;
  serviceId?: string;
  boardStopId: string;
  boardStopName: string;
  boardStop?: Stop;
  departureTime: string;
  alightingStopId: string;
  alightingStopName: string;
  alightingStop?: Stop;
  arrivalTime: string;
  durationMinutes: number;
  stopsCount: number;
}

export interface TransferWait {
  transferStopId: string;
  transferStopName: string;
  waitMinutes: number;
  fromLegArrival: string;
  toLegDeparture: string;
}

export interface MultiLegJourney {
  id: string;
  type: 'direct' | 'connecting';
  transfers: number; // 0 for direct, 1, 2
  origin: Stop;
  destination: Stop;
  departureTime: string;
  arrivalTime: string;
  totalDurationMinutes: number;
  waitingTimeMinutes: number;
  inVehicleDurationMinutes: number;
  legs: JourneyLeg[];
  transfersInfo: TransferWait[];
  departsInMinutes: number;
  isUpcoming: boolean;
  routeSummary: string; // e.g. "21G" or "21G → 5E"
}

