/**
 * GTFS-Realtime Vehicle Positions Service Abstraction for Madras Macha.
 * 
 * Complies strictly with CUMTA and GTFS-RT standards:
 * - Does NOT fabricate mock/simulated vehicle coordinates.
 * - If verified CUMTA GTFS-RT public endpoint is unavailable or returns errors,
 *   gracefully returns `available: false` with standard message:
 *   "Live bus locations are currently unavailable."
 * - When a valid feed is connected, normalizes FeedMessage entities into LiveVehicle objects.
 */

export interface LiveVehicle {
  vehicleId: string;
  tripId?: string;
  routeId?: string;
  routeShortName?: string;
  destination?: string;
  destinationTamil?: string;
  latitude: number;
  longitude: number;
  bearing?: number;
  speed?: number; // m/s or km/h
  timestamp: number; // Unix epoch timestamp (seconds)
  currentStopSequence?: number;
  currentStatus?: 'INCOMING_AT' | 'STOPPED_AT' | 'IN_TRANSIT_TO';
  congestionLevel?: string;
  occupancyStatus?: string;
}

export interface VehicleFilter {
  routeId?: string;
  routeShortName?: string;
  directionId?: number;
}

export interface RealtimeFeedResponse {
  available: boolean;
  message: string;
  lastUpdated?: number; // Epoch seconds
  vehicles: LiveVehicle[];
  rawEntityCount?: number;
}

export interface StaleStatus {
  label: string;
  isStale: boolean;
  color: 'emerald' | 'sky' | 'amber' | 'neutral';
}

/**
 * Calculates human-readable staleness for a realtime vehicle timestamp.
 * - Under 30s: "Live"
 * - 30s - 2m: "Updated XXs ago"
 * - 2m - 10m: "Last updated XXm ago"
 * - Over 10m: "Live tracking temporarily unavailable"
 */
export function getVehicleStaleStatus(timestampSeconds?: number): StaleStatus {
  if (!timestampSeconds || timestampSeconds <= 0) {
    return {
      label: 'Live tracking temporarily unavailable',
      isStale: true,
      color: 'neutral',
    };
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  const delta = Math.max(0, nowSeconds - timestampSeconds);

  if (delta < 30) {
    return {
      label: 'Live',
      isStale: false,
      color: 'emerald',
    };
  }

  if (delta < 120) {
    return {
      label: `Updated ${delta}s ago`,
      isStale: false,
      color: 'sky',
    };
  }

  if (delta < 600) {
    const mins = Math.floor(delta / 60);
    return {
      label: `Last updated ${mins} min ago`,
      isStale: true,
      color: 'amber',
    };
  }

  return {
    label: 'Live tracking temporarily unavailable',
    isStale: true,
    color: 'neutral',
  };
}

/**
 * Realtime GTFS-RT feed configuration.
 * Checked in order:
 * 1. import.meta.env.VITE_GTFS_RT_VEHICLE_POSITIONS_URL
 * 2. Proxy route '/api/gtfs-rt/vehicles'
 */
const FEED_ENDPOINT: string =
  (typeof import.meta !== 'undefined' &&
    import.meta.env &&
    import.meta.env.VITE_GTFS_RT_VEHICLE_POSITIONS_URL) ||
  '/api/gtfs-rt/vehicles';

/**
 * Fetches and normalizes realtime vehicle positions from verified feed.
 * 
 * Safety Guarantee:
 * Never invents or generates random vehicle coordinates.
 * If endpoint does not exist or fails, returns { available: false, vehicles: [] }
 */
export async function getVehiclePositions(
  filter?: VehicleFilter
): Promise<RealtimeFeedResponse> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const response = await fetch(FEED_ENDPOINT, {
      method: 'GET',
      headers: {
        Accept: 'application/json, application/x-protobuf, */*',
      },
      signal: controller.signal,
    }).catch(() => null);

    clearTimeout(timeoutId);

    // If endpoint is not live or returns non-200 (e.g. 404, 503, connection refused)
    if (!response || !response.ok) {
      return {
        available: false,
        message: 'Live bus locations are currently unavailable.',
        vehicles: [],
      };
    }

    const contentType = response.headers.get('content-type') || '';

    // Handle JSON format feed (e.g. GTFS-RT JSON representation from proxy)
    if (contentType.includes('application/json')) {
      const data = await response.json();
      const rawEntities = Array.isArray(data.entity)
        ? data.entity
        : Array.isArray(data.entities)
        ? data.entities
        : [];

      const vehicles: LiveVehicle[] = [];

      for (const entity of rawEntities) {
        const vp = entity.vehicle;
        if (!vp || !vp.position || typeof vp.position.latitude !== 'number' || typeof vp.position.longitude !== 'number') {
          continue;
        }

        const vId = vp.vehicle?.id || entity.id || '';
        const rId = vp.trip?.route_id || vp.trip?.routeId;
        const tId = vp.trip?.trip_id || vp.trip?.tripId;

        // Apply route filters if provided
        if (filter?.routeId && rId && filter.routeId !== rId) {
          continue;
        }

        vehicles.push({
          vehicleId: vId,
          tripId: tId,
          routeId: rId,
          routeShortName: vp.vehicle?.label || vp.trip?.route_short_name,
          latitude: vp.position.latitude,
          longitude: vp.position.longitude,
          bearing: typeof vp.position.bearing === 'number' ? vp.position.bearing : undefined,
          speed: typeof vp.position.speed === 'number' ? vp.position.speed : undefined,
          timestamp: typeof vp.timestamp === 'number' ? vp.timestamp : Math.floor(Date.now() / 1000),
          currentStopSequence: vp.current_stop_sequence ?? vp.currentStopSequence,
          currentStatus: vp.current_status ?? vp.currentStatus,
        });
      }

      return {
        available: true,
        message: 'Realtime feed active',
        lastUpdated: Math.floor(Date.now() / 1000),
        vehicles,
        rawEntityCount: rawEntities.length,
      };
    }

    // Default fallback if unknown feed format
    return {
      available: false,
      message: 'Live bus locations are currently unavailable.',
      vehicles: [],
    };
  } catch (err) {
    // Expected graceful failure when public feed is unconfigured
    return {
      available: false,
      message: 'Live bus locations are currently unavailable.',
      vehicles: [],
    };
  }
}
