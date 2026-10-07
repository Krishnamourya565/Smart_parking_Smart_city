import React, { useState } from 'react';
import { 
  Zap, 
  Car, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Navigation, 
  Wrench, 
  ShieldAlert,
  Info,
  Layers,
  Sparkles
} from 'lucide-react';

export default function ParkingGridMap({ 
  spots = [], 
  activeRoute = null, 
  assignedSpotId = null,
  onSpotClick = null,
  onToggleFault = null,
  onManualOverride = null,
  isAdmin = true 
}) {
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [overrideModalOpen, setOverrideModalOpen] = useState(false);

  // Group spots by row for structured spatial rendering
  const row1Spots = spots.filter(s => s.row === 1);
  const row2Spots = spots.filter(s => s.row === 2);
  const row3Spots = spots.filter(s => s.row === 3);

  const handleSpotSelect = (spot) => {
    setSelectedSpot(spot);
    if (onSpotClick) onSpotClick(spot);
  };

  const getSpotColorClasses = (spot) => {
    const isTarget = assignedSpotId === spot.id;

    if (spot.isFaulty || spot.status === 'faulty') {
      return {
        card: 'bg-rose-950/40 border-rose-600/80 text-rose-300 ring-1 ring-rose-500/50',
        badge: 'bg-rose-900/60 text-rose-300 border-rose-700',
        icon: 'text-rose-400',
        glow: 'shadow-[0_0_15px_rgba(244,63,94,0.3)]'
      };
    }

    if (spot.type === 'ev') {
      // EV Spots Color Coding
      if (spot.status === 'free') {
        return {
          // Free EV Spot: Vibrant Neon Electric Blue (#06B6D4)
          card: 'bg-cyan-950/40 border-cyan-500 text-cyan-200 glow-ev-free hover:border-cyan-300',
          badge: 'bg-cyan-900/80 text-cyan-200 border-cyan-400',
          icon: 'text-cyan-400',
          glow: 'shadow-[0_0_18px_rgba(6,182,212,0.45)]'
        };
      } else if (spot.status === 'occupied') {
        // Occupied EV Spot: Alert Red/Crimson (#EF4444)
        return {
          card: 'bg-red-950/40 border-red-500/80 text-red-200 glow-ev-occupied',
          badge: 'bg-red-900/80 text-red-200 border-red-500',
          icon: 'text-red-400',
          glow: 'shadow-[0_0_15px_rgba(239,68,68,0.35)]'
        };
      } else if (spot.status === 'reserved') {
        // Reserved Spot: Warning Yellow/Amber (#F59E0B)
        return {
          card: 'bg-amber-950/40 border-amber-500 text-amber-200 glow-ev-reserved',
          badge: 'bg-amber-900/80 text-amber-200 border-amber-500',
          icon: 'text-amber-400',
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.35)]'
        };
      }
    } else {
      // Regular Spots Color Coding
      if (spot.status === 'free') {
        // Free Regular Spot: Glowing Green accent (#10B981)
        return {
          card: 'bg-emerald-950/30 border-emerald-500/80 text-emerald-200 glow-reg-free hover:border-emerald-400',
          badge: 'bg-emerald-900/70 text-emerald-300 border-emerald-600',
          icon: 'text-emerald-400',
          glow: 'shadow-[0_0_12px_rgba(16,185,129,0.3)]'
        };
      } else if (spot.status === 'occupied') {
        // Occupied Regular Spot: Dimmed Slate/Gray (#64748B)
        return {
          card: 'bg-slate-900/60 border-slate-700/60 text-slate-400 glow-reg-occupied',
          badge: 'bg-slate-800 text-slate-400 border-slate-700',
          icon: 'text-slate-500',
          glow: ''
        };
      } else if (spot.status === 'reserved') {
        return {
          card: 'bg-amber-950/30 border-amber-600/70 text-amber-300 glow-ev-reserved',
          badge: 'bg-amber-900/60 text-amber-300 border-amber-700',
          icon: 'text-amber-400',
          glow: 'shadow-[0_0_12px_rgba(245,158,11,0.25)]'
        };
      }
    }

    return {
      card: 'bg-slate-900 border-slate-800 text-slate-400',
      badge: 'bg-slate-800 text-slate-400 border-slate-700',
      icon: 'text-slate-500',
      glow: ''
    };
  };

  // Find coordinates for route line rendering in SVG overlay
  const assignedSpot = spots.find(s => s.id === assignedSpotId);

  return (
    <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-4 md:p-6 relative overflow-hidden shadow-xl">
      {/* Map Header and Legend */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Spatial Parking Lot Map & Smart Grid View
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950 text-cyan-400 border border-cyan-800">
              30 Total Spots
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time visual state coordination, EV priority bays, and entrance wayfinding overlay
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs">
          {/* EV Free */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/60 border border-cyan-500 text-cyan-300">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>EV Free [⚡]</span>
          </div>
          {/* EV Occupied */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-950/60 border border-red-500 text-red-300">
            <Zap className="w-3.5 h-3.5 text-red-400" />
            <span>EV Occupied</span>
          </div>
          {/* Regular Free */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500 text-emerald-300">
            <Car className="w-3.5 h-3.5 text-emerald-400" />
            <span>Regular Free [P]</span>
          </div>
          {/* Regular Occupied */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700 text-slate-400">
            <Car className="w-3.5 h-3.5 text-slate-500" />
            <span>Occupied [P]</span>
          </div>
          {/* Reserved */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-950/60 border border-amber-500 text-amber-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Reserved (15m)</span>
          </div>
        </div>
      </div>

      {/* Main Spatial Map Area with Entrance Wayfinding */}
      <div className="relative bg-[#070B14] border border-slate-800/80 rounded-xl p-4 md:p-6">
        
        {/* Entrance Gate Indicator */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-dashed border-slate-800">
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/80 text-cyan-300 font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              <Navigation className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              ENTRANCE GATE (0, 0)
            </div>
            <span className="text-xs text-slate-500 hidden sm:inline">
              Vehicle Inflow & Central Controller Sensor Array
            </span>
          </div>
          {assignedSpot && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-950 border border-emerald-500/70 text-emerald-300 text-xs font-semibold animate-pulse">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Target Assigned: <strong>{assignedSpot.id} ({assignedSpot.name})</strong></span>
            </div>
          )}
        </div>

        {/* Dynamic Route Wayfinding Banner */}
        {assignedSpot && (
          <div className="mb-4 p-3 bg-gradient-to-r from-cyan-950/60 via-slate-900 to-cyan-950/60 border border-cyan-800/60 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-cyan-300">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Direct Routing Active: <strong>Gate (0,0) → Row {assignedSpot.row} → Bay {assignedSpot.col}</strong></span>
            </div>
            <span className="font-mono text-slate-400">
              Search Distance: <strong className="text-emerald-400">{assignedSpot.distanceFromGate} units</strong> (0 extra circling)
            </span>
          </div>
        )}

        {/* Structured 3-Row Spatial Grid */}
        <div className="space-y-6">
          {/* ROW 1: Dedicated EV Charging Bays (EV01-EV06) + Regular Spots (R01-R04) */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Zap className="w-3.5 h-3.5" />
                <span>Row 1: Priority EV Fast Charging Hub (EV01–EV06) & Express Regular (R01–R04)</span>
              </div>
              <span className="text-[11px] text-slate-500">y = 1.5 units</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
              {row1Spots.map((spot) => {
                const styles = getSpotColorClasses(spot);
                const isAssigned = assignedSpotId === spot.id;
                return (
                  <button
                    key={spot.id}
                    onClick={() => handleSpotSelect(spot)}
                    className={`relative p-2.5 rounded-xl border flex flex-col items-center justify-between min-h-[96px] transition-all transform hover:scale-[1.03] active:scale-[0.98] ${styles.card} ${styles.glow} ${
                      isAssigned ? 'ring-2 ring-white scale-[1.05] z-10' : ''
                    }`}
                  >
                    {/* Top Spot ID & Badge */}
                    <div className="w-full flex items-center justify-between">
                      <span className="font-mono text-xs font-bold">{spot.id}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${styles.badge}`}>
                        {spot.type === 'ev' ? '⚡ EV' : 'P'}
                      </span>
                    </div>

                    {/* Center Icon Symbol */}
                    <div className="my-1 flex flex-col items-center">
                      {spot.isFaulty ? (
                        <Wrench className="w-6 h-6 text-rose-400 animate-bounce" />
                      ) : spot.type === 'ev' ? (
                        <Zap className={`w-6 h-6 ${styles.icon} ${spot.status === 'free' ? 'animate-pulse' : ''}`} />
                      ) : (
                        <Car className={`w-6 h-6 ${styles.icon}`} />
                      )}
                      <span className="text-[10px] font-medium uppercase mt-1">
                        {spot.isFaulty ? 'FAULT' : spot.status}
                      </span>
                    </div>

                    {/* Bottom Distance / Plate Info */}
                    <div className="w-full text-center text-[10px] font-mono opacity-80 truncate">
                      {spot.occupiedBy ? (
                        <span className="text-white font-bold">{spot.occupiedBy.vehicleId || 'OCCUPIED'}</span>
                      ) : (
                        <span>{spot.distanceFromGate}u</span>
                      )}
                    </div>

                    {/* Target Route Marker Indicator */}
                    {isAssigned && (
                      <div className="absolute -top-2 -right-2 bg-white text-slate-900 rounded-full p-0.5 shadow-lg animate-bounce">
                        <MapPin className="w-3.5 h-3.5 fill-cyan-500 text-cyan-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Central Aisle / Driving Lane Visual Marker */}
          <div className="h-6 border-y border-dashed border-slate-800/80 bg-slate-950/40 flex items-center justify-center text-[10px] text-slate-600 font-mono tracking-widest uppercase">
            ◄── MAIN AISLE 1 (TRANSIT LANE) ──►
          </div>

          {/* ROW 2: Regular Spots (R05 to R14) */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Car className="w-3.5 h-3.5" />
                <span>Row 2: Regular Capacity Bays (R05–R14)</span>
              </div>
              <span className="text-[11px] text-slate-500">y = 3.5 units</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
              {row2Spots.map((spot) => {
                const styles = getSpotColorClasses(spot);
                const isAssigned = assignedSpotId === spot.id;
                return (
                  <button
                    key={spot.id}
                    onClick={() => handleSpotSelect(spot)}
                    className={`relative p-2.5 rounded-xl border flex flex-col items-center justify-between min-h-[96px] transition-all transform hover:scale-[1.03] active:scale-[0.98] ${styles.card} ${styles.glow} ${
                      isAssigned ? 'ring-2 ring-white scale-[1.05] z-10' : ''
                    }`}
                  >
                    <div className="w-full flex items-center justify-between">
                      <span className="font-mono text-xs font-bold">{spot.id}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${styles.badge}`}>
                        P
                      </span>
                    </div>

                    <div className="my-1 flex flex-col items-center">
                      {spot.isFaulty ? (
                        <Wrench className="w-6 h-6 text-rose-400" />
                      ) : (
                        <Car className={`w-6 h-6 ${styles.icon}`} />
                      )}
                      <span className="text-[10px] font-medium uppercase mt-1">
                        {spot.isFaulty ? 'FAULT' : spot.status}
                      </span>
                    </div>

                    <div className="w-full text-center text-[10px] font-mono opacity-80 truncate">
                      {spot.occupiedBy ? (
                        <span className="text-white font-bold">{spot.occupiedBy.vehicleId || 'OCCUPIED'}</span>
                      ) : (
                        <span>{spot.distanceFromGate}u</span>
                      )}
                    </div>

                    {isAssigned && (
                      <div className="absolute -top-2 -right-2 bg-white text-slate-900 rounded-full p-0.5 shadow-lg animate-bounce">
                        <MapPin className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Central Aisle / Driving Lane Visual Marker */}
          <div className="h-6 border-y border-dashed border-slate-800/80 bg-slate-950/40 flex items-center justify-center text-[10px] text-slate-600 font-mono tracking-widest uppercase">
            ◄── MAIN AISLE 2 (TRANSIT LANE) ──►
          </div>

          {/* ROW 3: Regular Spots (R15 to R24) */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Car className="w-3.5 h-3.5 text-slate-400" />
                <span>Row 3: Perimeter Regular Bays (R15–R24)</span>
              </div>
              <span className="text-[11px] text-slate-500">y = 5.5 units</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2.5">
              {row3Spots.map((spot) => {
                const styles = getSpotColorClasses(spot);
                const isAssigned = assignedSpotId === spot.id;
                return (
                  <button
                    key={spot.id}
                    onClick={() => handleSpotSelect(spot)}
                    className={`relative p-2.5 rounded-xl border flex flex-col items-center justify-between min-h-[96px] transition-all transform hover:scale-[1.03] active:scale-[0.98] ${styles.card} ${styles.glow} ${
                      isAssigned ? 'ring-2 ring-white scale-[1.05] z-10' : ''
                    }`}
                  >
                    <div className="w-full flex items-center justify-between">
                      <span className="font-mono text-xs font-bold">{spot.id}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${styles.badge}`}>
                        P
                      </span>
                    </div>

                    <div className="my-1 flex flex-col items-center">
                      {spot.isFaulty ? (
                        <Wrench className="w-6 h-6 text-rose-400" />
                      ) : (
                        <Car className={`w-6 h-6 ${styles.icon}`} />
                      )}
                      <span className="text-[10px] font-medium uppercase mt-1">
                        {spot.isFaulty ? 'FAULT' : spot.status}
                      </span>
                    </div>

                    <div className="w-full text-center text-[10px] font-mono opacity-80 truncate">
                      {spot.occupiedBy ? (
                        <span className="text-white font-bold">{spot.occupiedBy.vehicleId || 'OCCUPIED'}</span>
                      ) : (
                        <span>{spot.distanceFromGate}u</span>
                      )}
                    </div>

                    {isAssigned && (
                      <div className="absolute -top-2 -right-2 bg-white text-slate-900 rounded-full p-0.5 shadow-lg animate-bounce">
                        <MapPin className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Spot Inspector & Admin Override Drawer */}
      {selectedSpot && (
        <div className="mt-4 p-4 bg-slate-900/90 border border-slate-700/80 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl border ${
              selectedSpot.type === 'ev' 
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300' 
                : 'bg-emerald-950 border-emerald-500 text-emerald-300'
            }`}>
              {selectedSpot.type === 'ev' ? <Zap className="w-6 h-6" /> : <Car className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white">{selectedSpot.name} ({selectedSpot.id})</h4>
                <span className={`text-xs px-2 py-0.5 rounded font-mono font-semibold uppercase ${
                  selectedSpot.status === 'free' ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' :
                  selectedSpot.status === 'occupied' ? 'bg-red-950 text-red-400 border border-red-700' :
                  selectedSpot.status === 'reserved' ? 'bg-amber-950 text-amber-400 border border-amber-700' :
                  'bg-rose-950 text-rose-400 border border-rose-700'
                }`}>
                  {selectedSpot.isFaulty ? 'Hardware Fault' : selectedSpot.status}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Type: <strong>{selectedSpot.type === 'ev' ? '50kW DC Fast Charger' : 'Standard Bay'}</strong> • Grid: Row {selectedSpot.row}, Col {selectedSpot.col} (x={selectedSpot.x}, y={selectedSpot.y}) • Distance: {selectedSpot.distanceFromGate} units
              </p>
              {selectedSpot.occupiedBy && (
                <div className="text-xs text-cyan-300 mt-1">
                  Occupant: <strong>{selectedSpot.occupiedBy.vehicleId}</strong> ({selectedSpot.occupiedBy.isEV ? 'EV' : 'ICE'} {selectedSpot.occupiedBy.batteryLevel ? `• ${selectedSpot.occupiedBy.batteryLevel}% Battery` : ''})
                </div>
              )}
            </div>
          </div>

          {/* Admin Manual Controls */}
          {isAdmin && (
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={() => onToggleFault && onToggleFault(selectedSpot.id, !selectedSpot.isFaulty)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedSpot.isFaulty
                    ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                    : 'bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-700'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>{selectedSpot.isFaulty ? 'Clear Fault' : 'Simulate Fault (Chaos)'}</span>
              </button>

              <button
                type="button"
                onClick={() => onManualOverride && onManualOverride(selectedSpot.id, selectedSpot.status === 'free' ? 'occupied' : 'free')}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Toggle Status ({selectedSpot.status === 'free' ? 'Set Occupied' : 'Set Free'})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSpot(null)}
                className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
