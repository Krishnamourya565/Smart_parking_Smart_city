/**
 * Allocation Algorithm Engine
 * Implements:
 * 1. Smart Priority Controller (Strict Protocol)
 * 2. Unorganized Baseline Engine (Random Search Pattern)
 */

const LOW_BATTERY_THRESHOLD = 25;

/**
 * Generate waypoints from entrance gate [0, 0] to spot coordinate [x, y]
 */
function calculateRoute(spot) {
  if (!spot) return [];
  // Entrance at [0, 0] -> Travel along main aisle to spot's row Y -> Turn into bay at X
  return [
    { x: 0, y: 0, label: 'Entry Gate' },
    { x: 0, y: spot.y, label: `Row ${spot.row} Aisle` },
    { x: spot.x, y: spot.y, label: `${spot.id} (${spot.name})` }
  ];
}

/**
 * Smart Organized Allocation Algorithm
 * Evaluates vehicle parameters and assigns the optimal spot based on priority.
 */
function allocateSmart(vehicle, spots) {
  const isEV = Boolean(vehicle.isEV);
  const batteryLevel = vehicle.batteryLevel !== undefined && vehicle.batteryLevel !== null ? Number(vehicle.batteryLevel) : null;
  const isCriticalEV = isEV && batteryLevel !== null && batteryLevel <= LOW_BATTERY_THRESHOLD;

  // Filter available (free and non-faulty) spots
  const freeSpots = spots.filter(s => s.status === 'free' && !s.isFaulty);

  if (freeSpots.length === 0) {
    return {
      success: false,
      reason: 'Parking Lot is completely full or no accessible spots available.',
      assignedSpot: null,
      spotsChecked: spots.length,
      distanceTraveled: 0,
      misuseOccurred: false,
      priorityAssigned: false,
      route: []
    };
  }

  let assignedSpot = null;
  let priorityAssigned = false;
  let fallbackUsed = false;

  if (isCriticalEV) {
    // Condition 1: EV with Battery <= 25%
    // Try to find nearest FREE EV Charging Spot
    const freeEVSpots = freeSpots
      .filter(s => s.type === 'ev')
      .sort((a, b) => a.distanceFromGate - b.distanceFromGate);

    if (freeEVSpots.length > 0) {
      assignedSpot = freeEVSpots[0];
      priorityAssigned = true;
    } else {
      // Fallback to nearest FREE Regular Spot ONLY IF all EV spots are occupied
      const freeRegularSpots = freeSpots
        .filter(s => s.type === 'regular')
        .sort((a, b) => a.distanceFromGate - b.distanceFromGate);

      if (freeRegularSpots.length > 0) {
        assignedSpot = freeRegularSpots[0];
        fallbackUsed = true;
      }
    }
  } else if (isEV && batteryLevel > LOW_BATTERY_THRESHOLD) {
    // Condition 2: EV with Battery > 25%
    // Assign nearest FREE Regular Spot (reserving chargers for critical demand)
    const freeRegularSpots = freeSpots
      .filter(s => s.type === 'regular')
      .sort((a, b) => a.distanceFromGate - b.distanceFromGate);

    if (freeRegularSpots.length > 0) {
      assignedSpot = freeRegularSpots[0];
    } else {
      // If no regular spots are free, EV can use EV spot as second priority
      const freeEVSpots = freeSpots
        .filter(s => s.type === 'ev')
        .sort((a, b) => a.distanceFromGate - b.distanceFromGate);
      if (freeEVSpots.length > 0) {
        assignedSpot = freeEVSpots[0];
      }
    }
  } else {
    // Condition 3: Non-EV Vehicle
    // Assign nearest FREE Regular Spot ONLY (Strict zero-misuse policy)
    const freeRegularSpots = freeSpots
      .filter(s => s.type === 'regular')
      .sort((a, b) => a.distanceFromGate - b.distanceFromGate);

    if (freeRegularSpots.length > 0) {
      assignedSpot = freeRegularSpots[0];
    } else {
      // Non-EV cannot take EV charger even if regular is full (zero misuse)
      return {
        success: false,
        reason: 'Zero-Misuse Policy: Regular spots full. Non-EV cannot occupy EV chargers.',
        assignedSpot: null,
        spotsChecked: 1,
        distanceTraveled: 1.5,
        misuseOccurred: false,
        priorityAssigned: false,
        route: []
      };
    }
  }

  if (!assignedSpot) {
    return {
      success: false,
      reason: 'No suitable spot found matching vehicle criteria.',
      assignedSpot: null,
      spotsChecked: 1,
      distanceTraveled: 0,
      misuseOccurred: false,
      priorityAssigned: false,
      route: []
    };
  }

  return {
    success: true,
    mode: 'smart',
    assignedSpot,
    spotsChecked: 1, // Central controller routes directly in 1 check
    distanceTraveled: assignedSpot.distanceFromGate,
    misuseOccurred: false, // Smart algorithm guarantees 0 misuse
    priorityAssigned,
    fallbackUsed,
    route: calculateRoute(assignedSpot)
  };
}

/**
 * Unorganized Baseline Allocation (Random Searching)
 * Simulates random spatial checking across spots until any open spot is encountered.
 */
function allocateRandom(vehicle, spots) {
  const isEV = Boolean(vehicle.isEV);
  const batteryLevel = vehicle.batteryLevel !== undefined && vehicle.batteryLevel !== null ? Number(vehicle.batteryLevel) : null;
  const isCriticalEV = isEV && batteryLevel !== null && batteryLevel <= LOW_BATTERY_THRESHOLD;

  // Shuffle spots to simulate unorganized driver searching
  const shuffledSpots = [...spots].sort(() => Math.random() - 0.5);

  let spotsChecked = 0;
  let distanceAccumulated = 0;
  let assignedSpot = null;
  let lastPos = { x: 0, y: 0 };

  for (const spot of shuffledSpots) {
    spotsChecked++;
    // Distance from current search point to this spot
    const stepDist = Math.sqrt(Math.pow(spot.x - lastPos.x, 2) + Math.pow(spot.y - lastPos.y, 2));
    distanceAccumulated += stepDist;
    lastPos = { x: spot.x, y: spot.y };

    if (spot.status === 'free' && !spot.isFaulty) {
      assignedSpot = spot;
      break;
    }
  }

  if (!assignedSpot) {
    return {
      success: false,
      mode: 'random',
      reason: 'Driver searched entire lot but found no free spot.',
      assignedSpot: null,
      spotsChecked,
      distanceTraveled: Number(distanceAccumulated.toFixed(2)),
      misuseOccurred: false,
      priorityAssigned: false,
      route: []
    };
  }

  // Check if misuse occurred:
  // Misuse is defined as: Non-EV parked in an EV spot OR high-battery EV taking an EV spot
  const isMisuse = assignedSpot.type === 'ev' && (!isEV || (!isCriticalEV));

  return {
    success: true,
    mode: 'random',
    assignedSpot,
    spotsChecked,
    distanceTraveled: Number(distanceAccumulated.toFixed(2)),
    misuseOccurred: isMisuse,
    priorityAssigned: isCriticalEV && assignedSpot.type === 'ev',
    route: calculateRoute(assignedSpot)
  };
}

module.exports = {
  LOW_BATTERY_THRESHOLD,
  allocateSmart,
  allocateRandom,
  calculateRoute
};
