/**
 * Geo-Spatial Mapping Constants & Utilities for Smart EV Parking Lot
 * Base Demo Location: IDEA Lab Smart Urban Facility Center [19.0760, 72.8777] (Configurable)
 */

export const PARKING_FACILITY_LOCATION = {
  lat: 19.0760,
  lng: 72.8777,
  name: 'IDEA Lab Smart Urban Parking Facility',
  address: 'Central Technology Corridor, Smart City District',
  city: 'Mumbai, MH',
  capacity: 30,
  evFastChargers: 6
};

export const DEFAULT_MAP_CENTER = [PARKING_FACILITY_LOCATION.lat, PARKING_FACILITY_LOCATION.lng];
export const DEFAULT_MAP_ZOOM = 19;

// Entrance & Exit Gate Geo-Coordinates
export const ENTRANCE_GATE_COORDS = [19.07545, 72.87740]; // South Entrance (0, 0)
export const EXIT_GATE_COORDS = [19.07665, 72.87805];     // North Exit

// Facility Boundary Polygon (for map visual footprint overlay)
export const FACILITY_BOUNDS_POLYGON = [
  [19.07530, 72.87715],
  [19.07680, 72.87715],
  [19.07680, 72.87830],
  [19.07530, 72.87830]
];

// Transit Lane Waypoints (Centerlines of driving aisles)
export const TRANSIT_AISLES = {
  aisle1: [
    [19.07565, 72.87725],
    [19.07565, 72.87820]
  ],
  aisle2: [
    [19.07600, 72.87725],
    [19.07600, 72.87820]
  ],
  aisle3: [
    [19.07635, 72.87725],
    [19.07635, 72.87820]
  ]
};

/**
 * Maps a spot object or spotId to accurate real-world Geo coordinates.
 * Generates precise spatial distribution aligned with 3-row layout:
 * - Row 1 (Lat ~19.07580): EV01-EV06 + R01-R04
 * - Row 2 (Lat ~19.07615): R05-R14
 * - Row 3 (Lat ~19.07650): R15-R24
 */
export function getSpotGeoCoords(spotOrId) {
  const spotId = typeof spotOrId === 'string' ? spotOrId : spotOrId?.id;
  if (!spotId) return DEFAULT_MAP_CENTER;

  // Lng start and column spacing
  const startLng = 72.87730;
  const colSpacing = 0.000095; // ~10.5 meters per bay

  // Row 1: EV01 - EV06 (Cols 1-6) + R01 - R04 (Cols 7-10)
  if (spotId.startsWith('EV')) {
    const colIndex = parseInt(spotId.replace('EV', ''), 10) || 1; // 1 to 6
    const lat = 19.07575;
    const lng = startLng + (colIndex - 1) * colSpacing;
    return [lat, lng];
  }

  if (spotId.startsWith('R')) {
    const rNum = parseInt(spotId.replace('R', ''), 10) || 1;

    // R01 - R04: Row 1 (Cols 7 to 10)
    if (rNum >= 1 && rNum <= 4) {
      const colIndex = 6 + rNum; // 7, 8, 9, 10
      const lat = 19.07575;
      const lng = startLng + (colIndex - 1) * colSpacing;
      return [lat, lng];
    }

    // R05 - R14: Row 2 (Cols 1 to 10)
    if (rNum >= 5 && rNum <= 14) {
      const colIndex = rNum - 4; // 1 to 10
      const lat = 19.07612;
      const lng = startLng + (colIndex - 1) * colSpacing;
      return [lat, lng];
    }

    // R15 - R24: Row 3 (Cols 1 to 10)
    if (rNum >= 15 && rNum <= 24) {
      const colIndex = rNum - 14; // 1 to 10
      const lat = 19.07648;
      const lng = startLng + (colIndex - 1) * colSpacing;
      return [lat, lng];
    }
  }

  // Fallback
  return DEFAULT_MAP_CENTER;
}

/**
 * Returns a complete realistic driving route polyline from Entrance Gate (0,0)
 * through transit aisles to the destination parking spot.
 */
export function getRouteGeoWaypoints(spotOrId) {
  const spotId = typeof spotOrId === 'string' ? spotOrId : spotOrId?.id;
  const spotCoords = getSpotGeoCoords(spotId);
  const entrance = ENTRANCE_GATE_COORDS;

  if (!spotId) {
    return [entrance, DEFAULT_MAP_CENTER];
  }

  const [destLat, destLng] = spotCoords;

  // Determine which row transit aisle to use
  let aisleLat = 19.07560; // Row 1 aisle
  if (spotId.startsWith('R')) {
    const rNum = parseInt(spotId.replace('R', ''), 10) || 1;
    if (rNum >= 5 && rNum <= 14) {
      aisleLat = 19.07598; // Row 2 aisle
    } else if (rNum >= 15) {
      aisleLat = 19.07632; // Row 3 aisle
    }
  }

  return [
    entrance,                                         // 1. Entrance Gate (0,0)
    [entrance[0], 72.87725],                          // 2. Turn into Main Internal Access Road
    [aisleLat, 72.87725],                             // 3. Drive up to target row aisle
    [aisleLat, destLng],                              // 4. Drive along row aisle to bay column
    [destLat, destLng]                                // 5. Pull directly into parking bay
  ];
}

/**
 * Generates turn-by-turn navigation instructions for a given spot.
 */
export function getTurnByTurnDirections(spotOrId) {
  const spotId = typeof spotOrId === 'string' ? spotOrId : spotOrId?.id;
  const isEV = spotId?.startsWith('EV');
  
  let row = 1;
  let col = 1;
  if (isEV) {
    col = parseInt(spotId.replace('EV', ''), 10) || 1;
  } else if (spotId) {
    const num = parseInt(spotId.replace('R', ''), 10) || 1;
    if (num <= 4) { row = 1; col = 6 + num; }
    else if (num <= 14) { row = 2; col = num - 4; }
    else { row = 3; col = num - 14; }
  }

  return [
    {
      step: 1,
      instruction: 'Enter facility via South Gate Gantry (0, 0)',
      distance: '20 m',
      icon: 'gate'
    },
    {
      step: 2,
      instruction: `Turn right onto Row ${row} Transit Corridor`,
      distance: '45 m',
      icon: 'turn-right'
    },
    {
      step: 3,
      instruction: `Proceed straight past Column ${Math.max(1, col - 1)}`,
      distance: `${col * 8} m`,
      icon: 'straight'
    },
    {
      step: 4,
      instruction: `Arrive at ${isEV ? '50kW Fast Charging Bay' : 'Regular Bay'} ${spotId} on your ${row % 2 === 1 ? 'left' : 'right'}`,
      distance: '0 m',
      icon: 'arrival'
    }
  ];
}
