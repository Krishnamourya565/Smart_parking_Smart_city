import React, { useState, useEffect } from 'react';
import { 
  Navigation, 
  MapPin, 
  Clock, 
  Zap, 
  Car, 
  CheckCircle2, 
  ArrowRight, 
  RotateCcw, 
  ShieldCheck, 
  DollarSign, 
  BatteryMedium,
  Compass,
  Layers,
  Map as MapIcon,
  List,
  AlertTriangle,
  History,
  HelpCircle,
  Sparkles,
  Radio,
  FileWarning
} from 'lucide-react';
import { PRICING, formatINR, calculateChargingEstimate, calculateSessionBill } from '../utils/constants';
import ParkingMap from './ParkingMap';

export default function DriverGuidanceView({ 
  allocationData = null, 
  parkingSession = null,
  spots = [],
  reports = [],
  currentUser = null,
  onParkVehicle, 
  onOpenCheckoutModal,
  onContinueParking,
  onOpenReportGateFault,
  onViewSessionHistory,
  onBackToDashboard 
}) {
  const [countdown, setCountdown] = useState(15 * 60); // 15 minutes in seconds
  const [viewFormat, setViewFormat] = useState('both'); // 'both' | 'map' | 'cards'
  const [hasContinuedParking, setHasContinuedParking] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!allocationData || !allocationData.assignedSpot) {
    return (
      <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-8 text-center text-slate-400 max-w-xl mx-auto">
        <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-white mb-2">No Active Driver Allocation</h3>
        <p className="text-xs mb-4">Please submit your vehicle information via the Driver Login portal.</p>
        <button
          type="button"
          onClick={onBackToDashboard}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl cursor-pointer"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { assignedSpot, spotsChecked, distanceTraveled, priorityAssigned } = allocationData;
  const isEV = assignedSpot.type === 'ev' || allocationData.isEV;
  const sessionStatus = parkingSession?.status || (isEV ? 'CHARGING_COMPLETE' : 'PARKED');
  const isChargingComplete = sessionStatus === 'CHARGING_COMPLETE' || parkingSession?.chargerStatus === 'CHARGING_COMPLETE';
  const isCheckoutRequested = sessionStatus === 'CHECKOUT_REQUESTED' || sessionStatus === 'APPROACHING_EXIT';
  const isExitVerified = sessionStatus === 'EXIT_VERIFIED' || sessionStatus === 'COMPLETED';

  const bill = calculateSessionBill(parkingSession || {
    spotId: assignedSpot.id,
    spotType: assignedSpot.type,
    vehicleType: isEV ? 'EV' : 'Non-EV',
    batteryLevel: 100,
    initialBatteryLevel: 18,
    entryTime: new Date(Date.now() - 1000 * 60 * 72).toISOString()
  });

  const batteryLevel = isChargingComplete ? 100 : (parkingSession?.batteryLevel || allocationData.batteryLevel || (isEV ? 18 : null));
  const estimate = calculateChargingEstimate(batteryLevel || 20, 80);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. TOP BANNER & ALLOCATION STATE */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-gradient-to-r from-cyan-950/80 via-slate-900 to-cyan-950/80 border border-cyan-500/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-cyan-500 text-slate-950 rounded-2xl shadow-lg shadow-cyan-500/30">
              <Navigation className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
                <span>Centralized Spatial Guidance Active</span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Assigned Spot: {assignedSpot.name} ({assignedSpot.id})
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Bay: Row {assignedSpot.row}, Bay {assignedSpot.col} • Search Distance: <strong className="text-emerald-400 font-mono">{distanceTraveled} units</strong>
              </p>
            </div>
          </div>

          {/* Format Switcher & Reservation Timer */}
          <div className="flex items-center gap-3">
            <div className="p-1 bg-slate-950/90 border border-slate-800 rounded-xl flex items-center text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewFormat('both')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  viewFormat === 'both' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Split View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewFormat('map')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  viewFormat === 'map' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Map</span>
              </button>
              <button
                type="button"
                onClick={() => setViewFormat('cards')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                  viewFormat === 'cards' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Steps</span>
              </button>
            </div>

            <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center gap-3">
              <Clock className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-[10px] text-slate-400">Reservation Hold</div>
                <div className="text-base font-bold font-mono text-amber-400">{formatTime(countdown)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. PROMINENT "MY CURRENT PARKING SESSION" CARD */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#0B1120] border-2 border-cyan-500/50 rounded-3xl p-6 shadow-[0_0_35px_rgba(6,182,212,0.15)] relative overflow-hidden">
        
        {/* Glow accent */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-cyan-600 to-emerald-500 text-slate-950 rounded-2xl shadow-lg">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-extrabold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>LIVE OCCUPANCY & VEHICLE SESSION</span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">
                My Current Parking Session
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-slate-900 border border-slate-700 text-slate-300">
              Session #{parkingSession?.id || 'PARK-1024'}
            </span>
            <span className={`px-3 py-1 rounded-xl text-xs font-mono font-bold border ${
              isExitVerified
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                : isCheckoutRequested
                ? 'bg-amber-950 text-amber-300 border-amber-600 animate-pulse'
                : isChargingComplete
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500'
                : 'bg-blue-950 text-blue-300 border-blue-600'
            }`}>
              {isExitVerified ? 'EXIT COMPLETED' : isCheckoutRequested ? 'CHECKOUT REQUESTED' : isChargingComplete ? 'CHARGING COMPLETE' : 'PARKED / ACTIVE'}
            </span>
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
            <div className="text-[10px] uppercase font-bold text-slate-400">Assigned Spot</div>
            <div className="text-xl font-black font-mono text-white mt-0.5 flex items-center gap-1.5">
              <span>{assignedSpot.id}</span>
              <span className="text-xs text-cyan-400 font-sans font-semibold">({isEV ? 'EV Fast' : 'Regular'})</span>
            </div>
          </div>

          {isEV ? (
            <>
              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
                <div className="text-[10px] uppercase font-bold text-slate-400">Battery & Charger</div>
                <div className="text-xl font-black font-mono text-cyan-300 mt-0.5 flex items-center gap-1">
                  <span>{batteryLevel}%</span>
                  <span className="text-xs text-slate-400 font-sans font-normal">• 50 kW</span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
                <div className="text-[10px] uppercase font-bold text-slate-400">Charging Cost</div>
                <div className="text-xl font-black font-mono text-cyan-300 mt-0.5">
                  {formatINR(bill.chargingCost)}
                </div>
              </div>
            </>
          ) : (
            <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <div className="text-[10px] uppercase font-bold text-slate-400">Vehicle Type</div>
              <div className="text-xl font-black text-white mt-0.5">
                Standard ICE
              </div>
            </div>
          )}

          <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-2xl">
            <div className="text-[10px] uppercase font-bold text-slate-400">Parking Dwell Fee</div>
            <div className="text-xl font-black font-mono text-emerald-300 mt-0.5">
              {formatINR(bill.parkingCost)}
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* CHARGING COMPLETE NOTIFICATION BANNER (IF 100% EV) */}
        {/* ------------------------------------------------------------- */}
        {isEV && isChargingComplete && !isCheckoutRequested && !isExitVerified && (
          <div className="mb-5 p-4 bg-gradient-to-r from-cyan-950/90 to-blue-950/90 border-2 border-cyan-400 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.3)] space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-cyan-400 text-slate-950 rounded-xl shadow font-black shrink-0">
                ⚡
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>Charging Complete — Your vehicle is fully charged (100%)</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-900 text-cyan-200 border border-cyan-600">
                    Spot: {assignedSpot.id}
                  </span>
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your battery has reached 100%. The vehicle remains safely parked in bay <strong className="text-cyan-300 font-mono">{assignedSpot.id}</strong>. You can choose to continue parking or check out when you are ready to depart.
                </p>
                <p className="text-[11px] text-cyan-200/80 italic">
                  💡 Overstay Policy: Dwell parking rate ({formatINR(PRICING.parkingPerHour)}/hr) continues to apply while your vehicle occupies the bay.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setHasContinuedParking(true);
                  if (onContinueParking) onContinueParking();
                }}
                className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                  hasContinuedParking 
                    ? 'bg-slate-800 border-cyan-500 text-cyan-300' 
                    : 'bg-slate-900/90 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {hasContinuedParking ? '✓ Parking Extended' : 'Continue Parking'}
              </button>

              <button
                type="button"
                onClick={onOpenCheckoutModal}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/30 flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <span>🚗 Check Out</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* ACTION BUTTONS (IF NORMAL PARKING OR BEFORE CHECKOUT) */}
        {/* ------------------------------------------------------------- */}
        {!isCheckoutRequested && !isExitVerified && (!isEV || !isChargingComplete) && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <div className="text-xs text-slate-400">
              Vehicle is actively parked in bay <strong className="text-white font-mono">{assignedSpot.id}</strong>.
            </div>

            <button
              type="button"
              onClick={onOpenCheckoutModal}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
            >
              <span>🚗 Check Out</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 3. EXIT GATE WAYFINDING & VERIFICATION CARD */}
        {/* ------------------------------------------------------------- */}
        {isCheckoutRequested && !isExitVerified && (
          <div className="p-5 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border-2 border-amber-500/80 rounded-2xl space-y-4 animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500 text-slate-950 rounded-xl font-black shadow-lg shadow-amber-500/30">
                  <Navigation className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-extrabold">
                    CHECKOUT CONFIRMED • PROCEED TO EXIT
                  </div>
                  <h4 className="text-lg font-black text-white">
                    Navigate to North Exit Gate (120 m)
                  </h4>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-600 flex items-center gap-1.5 animate-pulse">
                <Radio className="w-3.5 h-3.5" /> Exit Verification Pending
              </span>
            </div>

            <div className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-300 font-bold">{assignedSpot.id}</span>
                <span>&rarr;</span>
                <span className="text-slate-400">Transit Lane</span>
                <span>&rarr;</span>
                <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-emerald-300 font-bold">North Exit</span>
                <span>&rarr;</span>
                <span className="text-amber-400 font-bold">EXIT</span>
              </div>
              <span className="text-slate-400">Est: 1 min</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div className="text-[11px] text-slate-400">
                Please follow marked wayfinding arrows. Spot <strong className="text-white font-mono">{assignedSpot.id}</strong> will be released upon barrier scan.
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenReportGateFault}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-rose-300 border border-rose-800/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <FileWarning className="w-3.5 h-3.5" />
                  <span>Report Gate Problem</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* 4. EXIT COMPLETED CELEBRATORY CARD */}
        {/* ------------------------------------------------------------- */}
        {isExitVerified && (
          <div className="p-5 bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/50 border-2 border-emerald-500 rounded-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500 text-slate-950 rounded-xl font-black shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-extrabold">
                    TRANSACTION COMPLETE
                  </div>
                  <h4 className="text-lg font-black text-white">
                    ✓ EXIT COMPLETED — Spot {assignedSpot.id} Released
                  </h4>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-600">
                TOTAL PAID: {formatINR(bill.totalAmount)}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Thank you for using the Smart EV Parking & Incident Management System! Your session <strong className="text-white font-mono">{parkingSession?.id || 'PARK-1024'}</strong> has been closed and added to your permanent session history. Have a safe journey! 🚗⚡
            </p>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onViewSessionHistory}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <History className="w-4 h-4 text-cyan-400" />
                <span>View Session History</span>
              </button>

              <button
                type="button"
                onClick={onBackToDashboard}
                className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        )}

      </div>

      {/* ------------------------------------------------------------- */}
      {/* 5. INTERACTIVE MAP & ROUTE VIEW */}
      {/* ------------------------------------------------------------- */}
      {(viewFormat === 'both' || viewFormat === 'map') && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1 font-semibold">
            <span className="flex items-center gap-1.5 text-cyan-400 font-mono">
              <Compass className="w-4 h-4 animate-spin" /> Live Route Polyline: {isCheckoutRequested ? `Bay ${assignedSpot.id} \u2192 North Exit Gate` : `Entrance Gate (0,0) \u2192 Bay ${assignedSpot.id}`}
            </span>
            <span>Real-Time Vehicle Vector Animated</span>
          </div>

          <ParkingMap
            spots={spots.length > 0 ? spots : [assignedSpot]}
            assignedSpotId={assignedSpot.id}
            reports={reports}
            currentUser={allocationData}
            isAdmin={false}
          />
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. TURN-BY-TURN WAYFINDING STEPS */}
      {/* ------------------------------------------------------------- */}
      {(viewFormat === 'both' || viewFormat === 'cards') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold flex items-center justify-center text-xs shrink-0">
              1
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase">{isCheckoutRequested ? `Depart Bay ${assignedSpot.id}` : 'Entrance Gate (0, 0)'}</h4>
              <p className="text-xs text-slate-400 mt-1">
                {isCheckoutRequested ? 'Unplug vehicle cable and pull forward into the transit lane.' : 'Pass RFID barrier. Central Controller automatically assigns coordinates.'}
              </p>
            </div>
          </div>

          <div className="bg-[#0B1120] border border-slate-800 rounded-xl p-4 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold flex items-center justify-center text-xs shrink-0">
              2
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase">{isCheckoutRequested ? 'Follow North Exit Corridor' : `Drive to Row ${assignedSpot.row}`}</h4>
              <p className="text-xs text-slate-400 mt-1">
                {isCheckoutRequested ? 'Drive north along main lane towards Exit Gate barrier.' : `Proceed straight down main transit lane to Row ${assignedSpot.row} junction.`}
              </p>
            </div>
          </div>

          <div className="bg-[#0B1120] border border-emerald-950 rounded-xl p-4 flex items-start gap-3 border-emerald-500/80 bg-emerald-950/20">
            <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-300 font-bold flex items-center justify-center text-xs shrink-0">
              3
            </div>
            <div>
              <h4 className="text-xs font-bold text-emerald-300 uppercase">{isCheckoutRequested ? 'North Exit Gate (Barrier 01)' : `Park at Bay ${assignedSpot.id}`}</h4>
              <p className="text-xs text-slate-300 mt-1">
                {isCheckoutRequested ? 'Camera ANPR / RFID scans clearance and opens exit gate barrier.' : `Turn right into Column ${assignedSpot.col}. Spot illuminated in ${isEV ? 'Electric Blue' : 'Green'}.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Return to Dashboard bottom button */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Return to Central Map Overview</span>
        </button>

        {!isCheckoutRequested && !isExitVerified && (
          <button
            type="button"
            onClick={onParkVehicle}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Confirm Vehicle Parked in Bay {assignedSpot.id}</span>
          </button>
        )}
      </div>

    </div>
  );
}
