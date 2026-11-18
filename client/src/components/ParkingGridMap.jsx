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
  Layers, 
  Sparkles,
  Eye,
  Box
} from 'lucide-react';
import Facility3DView from './Facility3DView';
import { STATUS_COLORS } from '../utils/constants';

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
  const [viewMode, setViewMode] = useState('3d'); // '3d' | '2d'

  // Group spots by row for structured 2D spatial rendering
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
        card: 'bg-purple-950/40 border-purple-500 text-purple-300 ring-1 ring-purple-500/50',
        badge: 'bg-purple-900/60 text-purple-200 border-purple-700',
        icon: 'text-purple-400',
        glow: 'shadow-[0_0_15px_rgba(168,85,247,0.35)]'
      };
    }

    if (spot.type === 'ev') {
      if (spot.status === 'free') {
        return {
          card: 'bg-emerald-950/40 border-[#00D98B] text-emerald-200 glow-ev-free hover:border-emerald-300',
          badge: 'bg-emerald-900/80 text-emerald-200 border-[#00D98B]',
          icon: 'text-[#00D98B]',
          glow: 'shadow-[0_0_18px_rgba(0,217,139,0.45)]'
        };
      } else if (spot.status === 'charging') {
        return {
          card: 'bg-cyan-950/40 border-cyan-500 text-cyan-200 glow-ev-free',
          badge: 'bg-cyan-900/80 text-cyan-200 border-cyan-400',
          icon: 'text-cyan-400',
          glow: 'shadow-[0_0_18px_rgba(6,182,212,0.45)]'
        };
      } else if (spot.status === 'occupied') {
        return {
          card: 'bg-red-950/40 border-red-500/80 text-red-200 glow-ev-occupied',
          badge: 'bg-red-900/80 text-red-200 border-red-500',
          icon: 'text-red-400',
          glow: 'shadow-[0_0_15px_rgba(239,68,68,0.35)]'
        };
      } else if (spot.status === 'reserved') {
        return {
          card: 'bg-amber-950/40 border-amber-500 text-amber-200 glow-ev-reserved',
          badge: 'bg-amber-900/80 text-amber-200 border-amber-500',
          icon: 'text-amber-400',
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.35)]'
        };
      }
    } else {
      if (spot.status === 'free') {
        return {
          card: 'bg-emerald-950/30 border-[#00D98B]/80 text-emerald-200 glow-reg-free hover:border-emerald-400',
          badge: 'bg-emerald-900/70 text-emerald-300 border-[#00D98B]',
          icon: 'text-[#00D98B]',
          glow: 'shadow-[0_0_12px_rgba(0,217,139,0.3)]'
        };
      } else if (spot.status === 'occupied') {
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

  const assignedSpot = spots.find(s => s.id === assignedSpotId);

  return (
    <div className="bg-[#050811] border border-white/10 rounded-2xl p-4 md:p-6 relative overflow-hidden shadow-2xl">
      
      {/* Map Header and View Mode Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-5 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-5 h-5 text-zinc-300" />
            <h3 className="text-lg font-bold text-white tracking-tight">
              Spatial Parking Lot Map & Smart 3D Facility
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/20">
              30 Total Spots
            </span>
          </div>
          <p className="text-xs text-zinc-400">
            Real-time visual state coordination, EV priority bays, and entrance wayfinding overlay
          </p>
        </div>

        {/* View Switcher: 3D Facility View vs 2D Grid */}
        <div className="flex items-center gap-2">
          <div className="p-1 bg-black/60 border border-white/15 rounded-xl flex items-center text-xs font-semibold">
            <button
              onClick={() => setViewMode('3d')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === '3d'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Facility View</span>
            </button>
            <button
              onClick={() => setViewMode('2d')}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                viewMode === '2d'
                  ? 'bg-white text-black font-bold shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>2D Grid View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === '3d' ? (
        <div className="relative">
          <Facility3DView
            spots={spots}
            assignedSpotId={assignedSpotId}
            activeRoute={activeRoute}
            onSpotSelect={handleSpotSelect}
          />
        </div>
      ) : (
        /* 2D Schematic Grid View */
        <div className="relative bg-[#070B14] border border-slate-800/80 rounded-xl p-4 md:p-6">
          {/* Entrance Gate Indicator */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-dashed border-slate-800">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg bg-black/70 border border-white/20 text-white font-mono text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,255,255,0.15)]">
                <Navigation className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                INGRESS GATE (0, 0)
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
            <div className="mb-4 p-3 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-emerald-950/60 border border-emerald-800/60 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-300">
                <Sparkles className="w-4 h-4 text-emerald-400" />
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
                      <div className="w-full flex items-center justify-between">
                        <span className="font-mono text-xs font-bold">{spot.id}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${styles.badge}`}>
                          {spot.type === 'ev' ? '⚡ EV' : 'P'}
                        </span>
                      </div>

                      <div className="my-1 flex flex-col items-center">
                        {spot.isFaulty ? (
                          <Wrench className="w-6 h-6 text-purple-400 animate-bounce" />
                        ) : spot.type === 'ev' ? (
                          <Zap className={`w-6 h-6 ${styles.icon} ${spot.status === 'free' ? 'animate-pulse' : ''}`} />
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
                          <Wrench className="w-6 h-6 text-purple-400" />
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
                          <Wrench className="w-6 h-6 text-purple-400" />
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
      )}

      {/* Spot Inspector & Admin Override Drawer (Bottom Sheet on Mobile, Inline on Desktop) */}
      {selectedSpot && (
        <div className="fixed sm:relative inset-x-0 bottom-0 sm:bottom-auto sm:inset-x-auto z-50 sm:z-auto sm:mt-4 p-4 sm:p-5 bg-[#0B1120] sm:bg-black/80 border-t-2 sm:border border-cyan-500/60 sm:border-white/20 rounded-t-3xl sm:rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-2xl animate-fade-in shadow-[0_-10px_40px_rgba(0,0,0,0.8)] sm:shadow-2xl max-h-[80dvh] sm:max-h-none overflow-y-auto">
          {/* Mobile Bottom Sheet Handle & Close */}
          <div className="w-full flex items-center justify-between sm:hidden pb-2 border-b border-slate-800">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">Bay Inspector</span>
            <button
              type="button"
              onClick={() => setSelectedSpot(null)}
              className="min-h-[44px] min-w-[44px] text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-800"
            >
              ✕ Close
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl border ${
              selectedSpot.type === 'ev' 
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300' 
                : 'bg-emerald-950/80 border-[#00D98B] text-emerald-300'
            }`}>
              {selectedSpot.type === 'ev' ? <Zap className="w-6 h-6" /> : <Car className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-white">{selectedSpot.name} ({selectedSpot.id})</h4>
                <span className={`text-xs px-2.5 py-0.5 rounded font-mono font-semibold uppercase ${
                  selectedSpot.isFaulty ? 'bg-purple-950 text-purple-400 border border-purple-700' :
                  selectedSpot.status === 'free' ? 'bg-emerald-950 text-[#00D98B] border border-emerald-700' :
                  selectedSpot.status === 'charging' ? 'bg-cyan-950 text-cyan-400 border border-cyan-700' :
                  selectedSpot.status === 'occupied' ? 'bg-red-950 text-red-400 border border-red-700' :
                  'bg-amber-950 text-amber-400 border border-amber-700'
                }`}>
                  {selectedSpot.isFaulty ? 'Hardware Fault' : selectedSpot.status}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Type: <strong>{selectedSpot.type === 'ev' ? '50kW DC Fast Charger' : 'Standard Bay'}</strong> • Grid: Row {selectedSpot.row}, Col {selectedSpot.col} • Distance: {selectedSpot.distanceFromGate} units
              </p>
              {selectedSpot.occupiedBy && (
                <div className="text-xs text-cyan-300 mt-1 font-mono">
                  Occupant: <strong>{selectedSpot.occupiedBy.vehicleId || selectedSpot.occupiedBy.plate}</strong> ({selectedSpot.occupiedBy.isEV ? 'EV' : 'ICE'} {selectedSpot.occupiedBy.batteryLevel ? `• ${selectedSpot.occupiedBy.batteryLevel}% Battery` : ''})
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
                    : 'bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-700'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>{selectedSpot.isFaulty ? 'Clear Fault' : 'Simulate Fault (Chaos)'}</span>
              </button>

              <button
                type="button"
                onClick={() => onManualOverride && onManualOverride(selectedSpot.id, selectedSpot.status === 'free' ? 'occupied' : 'free')}
                className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-white/20 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>Toggle Status ({selectedSpot.status === 'free' ? 'Set Occupied' : 'Set Free'})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedSpot(null)}
                className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white"
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
