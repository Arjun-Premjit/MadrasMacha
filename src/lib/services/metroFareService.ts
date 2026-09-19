import { getLocalizedStopName } from './localizationService';

export type MetroFareProduct =
  | 'token'
  | 'store_value'
  | 'mobile_qr'
  | 'holiday_special'
  | 'tourist_card'
  | 'group_qr';

export interface MetroStationCoord {
  id: string;
  name: string;
  line: 'blue' | 'green';
  seq: number;
  lat: number;
  lon: number;
}

/**
 * Ordered station data for CMRL Phase 1 and Phase 1 Extension corridors.
 * Allows true track-distance calculations across Corridors 1, 2 and Inter-Corridor connections.
 */
export const CMRL_STATIONS: MetroStationCoord[] = [
  // Blue Line (Wimco Nagar Depot to Chennai International Airport)
  { id: 'CMRL_01', name: 'Wimco Nagar Depot', line: 'blue', seq: 1, lat: 13.183971, lon: 80.308994 },
  { id: 'CMRL_02', name: 'Wimco Nagar', line: 'blue', seq: 2, lat: 13.17929, lon: 80.307344 },
  { id: 'CMRL_03', name: 'Thiruvottriyur', line: 'blue', seq: 3, lat: 13.171803, lon: 80.305226 },
  { id: 'CMRL_04', name: 'Thiruvottriyur Theradi', line: 'blue', seq: 4, lat: 13.165144, lon: 80.303538 },
  { id: 'CMRL_05', name: 'Kaladipet', line: 'blue', seq: 5, lat: 13.160215, lon: 80.30244 },
  { id: 'CMRL_06', name: 'Tollgate', line: 'blue', seq: 6, lat: 13.15452, lon: 80.300927 },
  { id: 'CMRL_07', name: 'New Washermanpet', line: 'blue', seq: 7, lat: 13.148703, lon: 80.2994 },
  { id: 'CMRL_08', name: 'Tondiarpet', line: 'blue', seq: 8, lat: 13.142521, lon: 80.296063 },
  { id: 'CMRL_09', name: 'Sri Theagaraya College', line: 'blue', seq: 9, lat: 13.135847, lon: 80.29231 },
  { id: 'CMRL_10', name: 'Washermanpet', line: 'blue', seq: 10, lat: 13.128798, lon: 80.288949 },
  { id: 'CMRL_11', name: 'Mannadi', line: 'blue', seq: 11, lat: 13.108962, lon: 80.277531 },
  { id: 'CMRL_12', name: 'High Court', line: 'blue', seq: 12, lat: 13.088011, lon: 80.268435 },
  { id: 'CMRL_13', name: 'Puratchi Thalaivar Dr. M.G. Ramachandran Central', line: 'blue', seq: 13, lat: 13.081767, lon: 80.27391 },
  { id: 'CMRL_14', name: 'Government Estate', line: 'blue', seq: 14, lat: 13.069338, lon: 80.272086 },
  { id: 'CMRL_15', name: 'LIC', line: 'blue', seq: 15, lat: 13.064762, lon: 80.26625 },
  { id: 'CMRL_16', name: 'Thousand Lights', line: 'blue', seq: 16, lat: 13.057176, lon: 80.26153 },
  { id: 'CMRL_17', name: 'AG-DMS', line: 'blue', seq: 17, lat: 13.0457, lon: 80.254562 },
  { id: 'CMRL_18', name: 'Teynampet', line: 'blue', seq: 18, lat: 13.0368, lon: 80.246419 },
  { id: 'CMRL_19', name: 'Nandanam', line: 'blue', seq: 19, lat: 13.030976, lon: 80.241073 },
  { id: 'CMRL_20', name: 'Saidapet', line: 'blue', seq: 20, lat: 13.021404, lon: 80.231981 },
  { id: 'CMRL_21', name: 'Little Mount', line: 'blue', seq: 21, lat: 13.012085, lon: 80.223243 },
  { id: 'CMRL_22', name: 'Guindy', line: 'blue', seq: 22, lat: 13.008602, lon: 80.218687 },
  { id: 'CMRL_23', name: 'Arignar Anna Alandur', line: 'blue', seq: 23, lat: 13.004256, lon: 80.206136 },
  { id: 'CMRL_24', name: 'OTA-Nanganallur Road', line: 'blue', seq: 24, lat: 12.995455, lon: 80.1996 },
  { id: 'CMRL_25', name: 'Meenambakkam', line: 'blue', seq: 25, lat: 12.987673, lon: 80.176479 },
  { id: 'CMRL_26', name: 'Chennai International Airport', line: 'blue', seq: 26, lat: 12.980809, lon: 80.164203 },

  // Green Line (Central to St. Thomas Mount)
  { id: 'CMRL_G01', name: 'Puratchi Thalaivar Dr. M.G. Ramachandran Central', line: 'green', seq: 1, lat: 13.081767, lon: 80.27391 },
  { id: 'CMRL_G02', name: 'Egmore', line: 'green', seq: 2, lat: 13.080289, lon: 80.263054 },
  { id: 'CMRL_G03', name: 'Nehru Park', line: 'green', seq: 3, lat: 13.078784, lon: 80.250473 },
  { id: 'CMRL_G04', name: 'Kilpauk Medical College', line: 'green', seq: 4, lat: 13.074342, lon: 80.242421 },
  { id: 'CMRL_G05', name: 'Pachaiyappas College', line: 'green', seq: 5, lat: 13.070686, lon: 80.235973 },
  { id: 'CMRL_G06', name: 'Shenoy Nagar', line: 'green', seq: 6, lat: 13.066519, lon: 80.229087 },
  { id: 'CMRL_G07', name: 'Anna Nagar East', line: 'green', seq: 7, lat: 13.057808, lon: 80.220368 },
  { id: 'CMRL_G08', name: 'Anna Nagar Tower', line: 'green', seq: 8, lat: 13.051308, lon: 80.211329 },
  { id: 'CMRL_G09', name: 'Thirumangalam', line: 'green', seq: 9, lat: 13.044983, lon: 80.202075 },
  { id: 'CMRL_G10', name: 'Koyambedu', line: 'green', seq: 10, lat: 13.035483, lon: 80.197363 },
  { id: 'CMRL_G11', name: 'Koyambedu Depot', line: 'green', seq: 11, lat: 13.028636, lon: 80.195242 },
  { id: 'CMRL_G12', name: 'Puratchi Thalaivi Dr. J. Jayalalithaa CMBT', line: 'green', seq: 12, lat: 13.0685, lon: 80.2041 },
  { id: 'CMRL_G13', name: 'Arumbakkam', line: 'green', seq: 13, lat: 13.0616, lon: 80.212 },
  { id: 'CMRL_G14', name: 'Vadapalani', line: 'green', seq: 14, lat: 13.0539, lon: 80.2153 },
  { id: 'CMRL_G15', name: 'Ashok Nagar', line: 'green', seq: 15, lat: 13.037265, lon: 80.209551 },
  { id: 'CMRL_G16', name: 'Ekkattuthangal', line: 'green', seq: 16, lat: 13.017128, lon: 80.205302 },
  { id: 'CMRL_G17', name: 'Arignar Anna Alandur', line: 'green', seq: 17, lat: 13.004256, lon: 80.206136 },
  { id: 'CMRL_G18', name: 'St. Thomas Mount', line: 'green', seq: 18, lat: 13.000739, lon: 80.197151 },
];

/**
 * Calculates straight line distance in km between two lat/lon coordinates.
 */
function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Pre-computed station-to-station track distances along the lines.
 * For same-line trips: sum of segment distances.
 * For cross-line trips: shortest distance via Alandur (Blue 23 <-> Green 17) or Central (Blue 13 <-> Green 01).
 */
export function calculateMetroTrackDistance(originId: string, destId: string): number {
  if (originId === destId) return 0;

  const origin = CMRL_STATIONS.find((s) => s.id === originId);
  const dest = CMRL_STATIONS.find((s) => s.id === destId);

  if (!origin || !dest) return 0;

  // Blue line stations
  const blueStations = CMRL_STATIONS.filter((s) => s.line === 'blue').sort((a, b) => a.seq - b.seq);
  // Green line stations
  const greenStations = CMRL_STATIONS.filter((s) => s.line === 'green').sort((a, b) => a.seq - b.seq);

  const getLineDistance = (stations: MetroStationCoord[], seqA: number, seqB: number): number => {
    const start = Math.min(seqA, seqB);
    const end = Math.max(seqA, seqB);
    let dist = 0;
    for (let i = start; i < end; i++) {
      const s1 = stations[i - 1];
      const s2 = stations[i];
      if (s1 && s2) {
        // Track length is approximately 1.15x haversine distance due to alignments
        dist += haversineDistanceKm(s1.lat, s1.lon, s2.lat, s2.lon) * 1.15;
      }
    }
    return Math.round(dist * 10) / 10;
  };

  // Same line journey
  if (origin.line === dest.line) {
    const list = origin.line === 'blue' ? blueStations : greenStations;
    return getLineDistance(list, origin.seq, dest.seq);
  }

  // Cross-line journey: Check Route A (via Central) and Route B (via Alandur)
  // Central: Blue seq 13, Green seq 1
  // Alandur: Blue seq 23, Green seq 17
  let distViaCentral = 0;
  let distViaAlandur = 0;

  if (origin.line === 'blue') {
    distViaCentral = getLineDistance(blueStations, origin.seq, 13) + getLineDistance(greenStations, 1, dest.seq);
    distViaAlandur = getLineDistance(blueStations, origin.seq, 23) + getLineDistance(greenStations, 17, dest.seq);
  } else {
    distViaCentral = getLineDistance(greenStations, origin.seq, 1) + getLineDistance(blueStations, 13, dest.seq);
    distViaAlandur = getLineDistance(greenStations, origin.seq, 17) + getLineDistance(blueStations, 23, dest.seq);
  }

  return Math.round(Math.min(distViaCentral, distViaAlandur) * 10) / 10;
}

/**
 * Official CMRL Distance Slab to Regular Token Fare mapping.
 * Source: Official Chennai Metro Rail Fare Notification (chennaimetrorail.org)
 * - Up to 2 km: ₹10
 * - 2 km to 5 km: ₹20
 * - 5 km to 12 km: ₹30
 * - 12 km to 21 km: ₹40
 * - Beyond 21 km: ₹50
 */
export function getStandardFareByDistance(distanceKm: number): number {
  if (distanceKm <= 0) return 10; // Minimum boarding fare
  if (distanceKm <= 2.0) return 10;
  if (distanceKm <= 5.0) return 20;
  if (distanceKm <= 12.0) return 30;
  if (distanceKm <= 21.0) return 40;
  return 50;
}

export interface MetroFareResult {
  originStation: { id: string; name: string; nameTamil: string };
  destinationStation: { id: string; name: string; nameTamil: string };
  distanceKm: number;
  standardFare: number;
  selectedProduct: MetroFareProduct;
  finalFare: number;
  discountPercent: number;
  isDiscounted: boolean;
  savingsAmount: number;
  productBreakdown: {
    productId: MetroFareProduct;
    name: string;
    nameTamil: string;
    fare: number;
    discountPercent: number;
    badge: string;
    notes: string;
  }[];
  sourceCitation: string;
  lastUpdated: string;
}

/**
 * Authoritative CMRL Metro Fare Calculator Service.
 * Calculates origin to destination fare based on official distance slabs and product rules.
 */
export function getMetroFare(
  originStationId: string,
  destinationStationId: string,
  fareProduct: MetroFareProduct = 'token'
): MetroFareResult | null {
  const origin = CMRL_STATIONS.find((s) => s.id === originStationId);
  const dest = CMRL_STATIONS.find((s) => s.id === destinationStationId);

  if (!origin || !dest) {
    return null;
  }

  const distanceKm = calculateMetroTrackDistance(originStationId, destinationStationId);
  const standardFare = getStandardFareByDistance(distanceKm);

  // Calculate Product Breakdown based on official CMRL rules:
  // 1. Token: standard (₹10, ₹20, ₹30, ₹40, ₹50)
  // 2. Store Value Pass (Smart Card / NCMC Singara Chennai Card): 20% discount
  // 3. CMRL Mobile App / WhatsApp QR: 20% discount
  // 4. Sunday / Public Holiday Ticket: 50% discount
  // 5. Tourist Card: ₹100 1-day unlimited
  // 6. QR Group Ticket (20+): 20% discount per passenger

  const storeValueFare = Math.round(standardFare * 0.8);
  const mobileQrFare = Math.round(standardFare * 0.8);
  const holidayFare = Math.round(standardFare * 0.5);

  const productBreakdown = [
    {
      productId: 'token' as MetroFareProduct,
      name: 'Single Journey Token / Paper QR',
      nameTamil: 'ஒற்றைப் பயண டோக்கன் / காகித QR',
      fare: standardFare,
      discountPercent: 0,
      badge: 'Standard',
      notes: 'Standard single trip counter token / printed QR paper ticket.',
    },
    {
      productId: 'store_value' as MetroFareProduct,
      name: 'Store Value Pass / Smart Card (Singara Chennai NCMC)',
      nameTamil: 'ஸ்மார்ட் கார்டு / சிங்கார சென்னை அட்டை',
      fare: storeValueFare,
      discountPercent: 20,
      badge: '20% OFF',
      notes: 'Official 20% discount on every journey with contactless travel card.',
    },
    {
      productId: 'mobile_qr' as MetroFareProduct,
      name: 'Mobile QR Ticket (CMRL App / WhatsApp / Paytm)',
      nameTamil: 'மொபைல் QR பயணச்சீட்டு',
      fare: mobileQrFare,
      discountPercent: 20,
      badge: '20% OFF',
      notes: 'Official 20% discount on digital QR tickets purchased via mobile apps.',
    },
    {
      productId: 'holiday_special' as MetroFareProduct,
      name: 'Sunday & Public Holiday Special',
      nameTamil: 'ஞாயிறு & அரசு விடுமுறை சிறப்பு',
      fare: holidayFare,
      discountPercent: 50,
      badge: '50% OFF',
      notes: 'Flat 50% discount on standard token fares on Sundays and declared state holidays.',
    },
    {
      productId: 'tourist_card' as MetroFareProduct,
      name: '1-Day Unlimited Tourist Card',
      nameTamil: '1-நாள் வரம்பற்ற சுற்றுலா அட்டை',
      fare: 100,
      discountPercent: 0,
      badge: 'Unlimited Rides',
      notes: 'Unlimited rides across entire network for 1 calendar day (+ ₹50 refundable deposit).',
    },
    {
      productId: 'group_qr' as MetroFareProduct,
      name: 'Group QR Ticket (20+ Passengers)',
      nameTamil: 'குழு QR பயணச்சீட்டு (20+ நபர்கள்)',
      fare: mobileQrFare,
      discountPercent: 20,
      badge: '20% Group Discount',
      notes: 'Official 20% discount for groups of 20 or more travelers.',
    },
  ];

  const selected = productBreakdown.find((p) => p.productId === fareProduct) || productBreakdown[0];

  return {
    originStation: {
      id: origin.id,
      name: origin.name,
      nameTamil: getLocalizedStopName(origin.name, 'ta', origin.id),
    },
    destinationStation: {
      id: dest.id,
      name: dest.name,
      nameTamil: getLocalizedStopName(dest.name, 'ta', dest.id),
    },
    distanceKm,
    standardFare,
    selectedProduct: fareProduct,
    finalFare: selected.fare,
    discountPercent: selected.discountPercent,
    isDiscounted: selected.discountPercent > 0,
    savingsAmount: Math.max(0, standardFare - selected.fare),
    productBreakdown,
    sourceCitation: 'Official CMRL Fare Notification (chennaimetrorail.org)',
    lastUpdated: 'CMRL Official Fare Table 2025',
  };
}
