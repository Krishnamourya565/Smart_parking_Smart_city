/**
 * System Constants, Standard Benchmark Data & Billing Pricing Engine
 * Centralized Indian Rupee (INR ₹) Pricing and Calculations
 */

export const LOW_BATTERY_THRESHOLD = 25; // %
export const CURRENCY_SYMBOL = '₹';

export const PRICING = {
  currency: 'INR',
  currencySymbol: '₹',
  evChargingPerKwh: 15, // ₹15 per kWh
  parkingPerHour: 30,   // ₹30 per hour
  powerKw: 50,          // 50kW DC Fast Charger
  batteryCapacityKwh: 60 // 60 kWh average EV battery
};

export const EV_CHARGING_RATE_PER_KWH = 15;
export const PARKING_RATE_PER_HOUR = 30;

export const CHARGING_RATES = {
  powerKw: PRICING.powerKw,
  costPerKwh: PRICING.evChargingPerKwh,
  batteryCapacityKwh: PRICING.batteryCapacityKwh,
  baseParkingPerHour: PRICING.parkingPerHour
};

/**
 * Centralized Indian Rupee (INR) Formatter
 * Uses standard Indian numbering format (e.g. ₹1,250.00, ₹1,25,000.00)
 */
export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(amount) || 0);
}

export const BENCHMARK_METRICS = {
  unorganized: {
    title: 'Unorganized Baseline (Random Search)',
    avgDistance: 11.74,
    distanceUnit: 'units',
    avgSpotsChecked: 1.95,
    misuseIncidents: 26,
    highPriorityAccess: '7 / 54 EVs',
    co2Emissions: 'Baseline (3.52 kg)',
    fuelLitres: '1.51 L'
  },
  organized: {
    title: 'Organized Smart Allocation',
    avgDistance: 5.13,
    distanceUnit: 'units',
    avgSpotsChecked: 1.00,
    misuseIncidents: 0,
    highPriorityAccess: '13 / 54 EVs',
    co2Emissions: '~50% Saved (1.54 kg)',
    fuelLitres: '0.66 L'
  },
  gains: {
    searchReduction: '-56% Search Reduction',
    guidanceEfficiency: 'Optimal Direct Guidance',
    misuseElimination: '100% Misuse Elimination',
    chargerUtilization: '+86% Charger Utilization',
    emissionsReduction: '~50% Emissions Saved'
  }
};

export function calculateChargingEstimate(currentBatteryPercent, targetBatteryPercent = 80) {
  if (currentBatteryPercent >= targetBatteryPercent) {
    return { chargingTimeMinutes: 0, energyNeededKwh: 0, costInr: 0 };
  }
  const diffPercent = targetBatteryPercent - currentBatteryPercent;
  const energyNeededKwh = Number(((diffPercent / 100) * PRICING.batteryCapacityKwh).toFixed(1));
  const chargingHours = energyNeededKwh / PRICING.powerKw;
  const chargingTimeMinutes = Math.round(chargingHours * 60);
  const costInr = Number((energyNeededKwh * PRICING.evChargingPerKwh).toFixed(2));

  return {
    chargingTimeMinutes,
    energyNeededKwh,
    costInr
  };
}

export function calculateSessionBill(session) {
  if (!session) {
    return { 
      durationMinutes: 0, 
      durationHours: 0, 
      energyUsedKwh: 0, 
      chargingCost: 0, 
      parkingCost: 0, 
      totalAmount: 0 
    };
  }

  const entryMs = session.entryTime ? new Date(session.entryTime).getTime() : Date.now();
  const nowMs = Date.now();
  const durationMinutes = Math.max(1, Math.round((nowMs - entryMs) / (1000 * 60)));
  const durationHours = durationMinutes / 60;
  
  // Pro-rated parking fee at ₹30/hour
  const parkingCost = Number((durationHours * PRICING.parkingPerHour).toFixed(2));

  let energyUsedKwh = session.energyUsedKwh || 0;
  let chargingCost = session.chargingCost || 0;

  if (session.spotType === 'ev' || session.vehicleType === 'EV') {
    if (energyUsedKwh === 0) {
      const diff = (session.batteryLevel || 100) - (session.initialBatteryLevel || 18);
      energyUsedKwh = Number(((Math.max(10, diff) / 100) * 30).toFixed(1)) || 24.6;
    }
    chargingCost = Number((energyUsedKwh * PRICING.evChargingPerKwh).toFixed(2));
  } else {
    chargingCost = 0;
    energyUsedKwh = 0;
  }

  const totalAmount = Number((chargingCost + parkingCost).toFixed(2));

  return {
    durationMinutes,
    durationHours,
    energyUsedKwh,
    chargingCost,
    parkingCost,
    totalAmount
  };
}
