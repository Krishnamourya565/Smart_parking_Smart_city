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
  FileWarning,
  Activity,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { PRICING, formatINR, calculateChargingEstimate, calculateSessionBill } from '../utils/constants';
import ParkingMap from './ParkingMap';
import { supabase } from '../supabase';

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

  // -------------------------------------------------------------
  // USER PORTAL STATE: LOCATIONS, SESSIONS, STATUS & EVENTS
  // -------------------------------------------------------------
  const [locations, setLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [activeSession, setActiveSession] = useState(parkingSession || null);
  // Status transitions: 'idle' -> 'en_route' -> 'parked' -> 'exiting' -> 'completed'
  const [portalStatus, setPortalStatus] = useState('idle');
  const [transitionError, setTransitionError] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fallback allotted bay if allocationData is present or default
  const allottedBay = activeSession?.spot_id || activeSession?.bay_id || allocationData?.assignedSpot?.id || 'EV01';

  // 1. HEARTBEAT TO user_presence EVERY 30s
  useEffect(() => {
    if (!currentUser?.id && !currentUser?.email) return;

    const sendHeartbeat = async () => {
      try {
        if (supabase) {
          const userId = currentUser.id || currentUser.email;
          await supabase.from('user_presence').upsert({
            user_id: userId,
            email: currentUser.email || '',
            name: currentUser.name || '',
            vehicle_plate: currentUser.vehiclePlate || currentUser.vehicle_plate || '',
            last_seen: new Date().toISOString()
          }, { onConflict: 'user_id' });
        }
      } catch (err) {
        console.warn('user_presence heartbeat notice:', err);
      }
    };

    sendHeartbeat();
    const heartbeatInterval = setInterval(sendHeartbeat, 30000); // 30s heartbeat
    return () => clearInterval(heartbeatInterval);
  }, [currentUser]);

  // 2. FETCH PARKING LOCATIONS FROM parking_locations TABLE
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        if (supabase) {
          const { data, error } = await supabase
            .from('parking_locations')
            .select('*')
            .order('name', { ascending: true });

          if (!error && data && data.length > 0) {
            setLocations(data);
            setSelectedLocationId(data[0].id);
            return;
          }
        }
      } catch (e) {
        console.warn('Locations fetch error:', e);
      }

      // Default facilities fallback
      const defaultLocs = [
        { id: 'loc-tech-central', name: 'Central Urban Facility (Sector 4)', address: 'Cyber Gateway 01, Pune' },
        { id: 'loc-metro-hub', name: 'Metro West Fast Charging Hub', address: 'Transit Corridor North' },
        { id: 'loc-downtown-express', name: 'Downtown Smart Express Deck', address: 'Commercial Ave, South' }
      ];
      setLocations(defaultLocs);
      setSelectedLocationId(defaultLocs[0].id);
    };

    fetchLocations();
  }, []);

  // 3. FETCH OR SYNC ACTIVE PARKING SESSION
  useEffect(() => {
    if (parkingSession) {
      setActiveSession(parkingSession);
      const st = (parkingSession.status || '').toLowerCase();
      if (['en_route', 'parked', 'exiting', 'completed'].includes(st)) {
        setPortalStatus(st);
      }
    } else if (currentUser && supabase) {
      const loadUserSession = async () => {
        try {
          const userId = currentUser.id || currentUser.email;
          const { data, error } = await supabase
            .from('parking_sessions')
            .select('*')
            .or(`user_id.eq.${userId},customer_id.eq.${userId}`)
            .neq('status', 'completed')
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          if (!error && data) {
            setActiveSession(data);
            const st = (data.status || '').toLowerCase();
            if (['en_route', 'parked', 'exiting', 'completed'].includes(st)) {
              setPortalStatus(st);
            }
          }
        } catch (e) {
          console.warn('Session load notice:', e);
        }
      };
      loadUserSession();
    }
  }, [parkingSession, currentUser]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // 4. IN-ORDER STATUS TRANSITIONS HANDLER
  // Strict Order: 'idle'/'completed' -> 'en_route' -> 'parked' -> 'exiting' -> 'completed'
  const handleTransition = async (targetStatus) => {
    setTransitionError('');
    setIsUpdatingStatus(true);

    try {
      // Transition Validation Guards
      if (targetStatus === 'en_route') {
        if (portalStatus === 'parked' || portalStatus === 'exiting') {
          throw new Error('Invalid order: Vehicle is already parked or exiting.');
        }
      } else if (targetStatus === 'parked') {
        if (portalStatus !== 'en_route') {
          throw new Error('Invalid order: You must select "Coming to parking" (en_route) before marking "Parked".');
        }
      } else if (targetStatus === 'exiting') {
        if (portalStatus !== 'parked') {
          throw new Error('Invalid order: You can only exit after being in "Parked" status.');
        }
      }

      const timestamp = new Date().toISOString();
      let sessionId = activeSession?.id;

      // If starting en_route without existing session, initialize one
      if (targetStatus === 'en_route' && !sessionId) {
        sessionId = `sess_${Date.now()}`;
        const newSessionRecord = {
          id: sessionId,
          user_id: currentUser?.id || null,
          bay_id: allottedBay,
          status: 'en_route',
          kwh: 0.00,
          fee: 0.00,
          created_at: timestamp
        };

        if (supabase) {
          try {
            await supabase.from('parking_sessions').insert(newSessionRecord);
          } catch (insertErr) {
            console.warn('Supabase session insert notice:', insertErr);
          }
        }
        setActiveSession(newSessionRecord);
      } else if (sessionId && supabase) {
        // Update parking_sessions status
        try {
          await supabase
            .from('parking_sessions')
            .update({ 
              status: targetStatus,
              ...(targetStatus === 'completed' ? { completed_at: timestamp } : {})
            })
            .eq('id', sessionId);
        } catch (updateErr) {
          console.warn('Supabase session update notice:', updateErr);
        }
      }

      // Record event in session_events table
      if (supabase && sessionId) {
        try {
          await supabase.from('session_events').insert({
            session_id: sessionId,
            status: targetStatus,
            created_at: timestamp
          });
        } catch (evErr) {
          console.warn('session_events insert notice:', evErr);
        }
      }

      // If targetStatus is exiting: complete the session and free the bay
      if (targetStatus === 'exiting') {
        setPortalStatus('exiting');
        
        // Finalize to completed & free the bay
        setTimeout(async () => {
          if (supabase && sessionId) {
            try {
              await supabase
                .from('parking_sessions')
                .update({ status: 'completed', completed_at: new Date().toISOString() })
                .eq('id', sessionId);

              await supabase.from('session_events').insert({
                session_id: sessionId,
                status: 'completed',
                created_at: new Date().toISOString()
              });

              // Free the bay in parking_bays & spots tables
              await supabase
                .from('parking_bays')
                .update({ status: 'free' })
                .eq('id', allottedBay);

              await supabase
                .from('spots')
                .update({ status: 'free', occupied_by: null })
                .eq('id', allottedBay);
            } catch (freeErr) {
              console.warn('Spot free error:', freeErr);
            }
          }
          setPortalStatus('completed');
          if (onParkVehicle) onParkVehicle();
        }, 1200);
      } else {
        setPortalStatus(targetStatus);
        if (targetStatus === 'parked' && onParkVehicle) {
          onParkVehicle();
        }
      }

    } catch (err) {
      setTransitionError(err.message || 'Status transition error.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const assignedSpot = allocationData?.assignedSpot || {
    id: allottedBay,
    name: `Bay ${allottedBay}`,
    type: allottedBay.startsWith('EV') ? 'ev' : 'regular',
    row: 1,
    col: 1
  };

  const distanceTraveled = allocationData?.distanceTraveled || '5.13';
  const isEV = assignedSpot.type === 'ev' || currentUser?.vehicleType === 'EV';
  const sessionStatus = portalStatus !== 'idle' ? portalStatus.toUpperCase() : (parkingSession?.status || 'EN_ROUTE');
  const isChargingComplete = portalStatus === 'parked' || sessionStatus === 'CHARGING_COMPLETE';
  const isCheckoutRequested = portalStatus === 'exiting';
  const isExitVerified = portalStatus === 'completed';

  const bill = calculateSessionBill(parkingSession || {
    spotId: assignedSpot.id,
    spotType: assignedSpot.type,
    vehicleType: isEV ? 'EV' : 'Non-EV',
    batteryLevel: 100,
    initialBatteryLevel: 18,
    entryTime: new Date(Date.now() - 1000 * 60 * 72).toISOString()
  });

  const batteryLevel = isChargingComplete ? 100 : (parkingSession?.batteryLevel || allocationData?.batteryLevel || (isEV ? 18 : null));
  const estimate = calculateChargingEstimate(batteryLevel || 20, 80);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* ------------------------------------------------------------- */}
      {/* 0. USER PORTAL CONTROL: LOCATION PICKER, ALLOTTED BAY & 3 BUTTONS */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#0B1120] border border-cyan-500/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-400 mb-1">
              <Activity className="w-3.5 h-3.5 animate-pulse" />
              <span>Real-Time Driver Parking Portal</span>
            </div>
            <h2 className="text-xl font-black text-white">
              Location Dispatch & Bay Allocation Control
            </h2>
          </div>

          {/* Location Picker (from parking_locations) */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <select
              value={selectedLocationId}
              onChange={(e) => setSelectedLocationId(e.target.value)}
              className="w-full sm:w-auto min-h-[44px] bg-slate-900 border border-slate-700 text-white text-base sm:text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-cyan-400 font-semibold"
            >
              {locations.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Allotted Bay Indicator & Status Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Allotted Parking Bay</span>
            <div className="text-2xl font-black font-mono text-cyan-300 mt-1 flex items-center gap-2">
              <span>{allottedBay}</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-cyan-950 text-cyan-300 border border-cyan-700 uppercase font-sans font-bold">
                {isEV ? '50kW EV Fast' : 'Standard'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">Assigned via Central Algorithm</div>
          </div>

          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Current Session Status</span>
            <div className="mt-1 flex items-center gap-2">
              <span className={`text-sm font-bold font-mono px-3 py-1 rounded-lg uppercase ${
                portalStatus === 'en_route'
                  ? 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse'
                  : portalStatus === 'parked'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                    : portalStatus === 'exiting'
                      ? 'bg-purple-950 text-purple-300 border border-purple-500'
                      : portalStatus === 'completed'
                        ? 'bg-slate-800 text-slate-400 border border-slate-700'
                        : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
              }`}>
                {portalStatus === 'idle' ? 'Ready for Arrival' : portalStatus.replace('_', ' ')}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">Presence heartbeat active (30s)</div>
          </div>

          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Registered Vehicle</span>
            <div className="text-sm font-bold text-white mt-1 font-mono">
              {currentUser?.vehiclePlate || currentUser?.vehicle_plate || 'MH12-EV-2026'}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {currentUser?.name || 'Driver'} â€¢ {currentUser?.vehicleType || 'EV'}
            </div>
          </div>
        </div>

        {/* Transition Error Alert */}
        {transitionError && (
          <div className="p-3 bg-rose-950/80 border border-rose-500 text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{transitionError}</span>
          </div>
        )}

        {/* 3 SEQUENTIAL IN-ORDER TRANSITION BUTTONS */}
        <div className="space-y-2">
          <div className="text-xs font-semibold text-slate-300">
            Sequential Parking State Transitions (In-Order Enforced):
          </div>

          <div className="flex flex-col gap-3 w-full">
            
            {/* Button 1: "Coming to parking" -> en_route */}
            <button
              type="button"
              disabled={isUpdatingStatus || portalStatus === 'parked' || portalStatus === 'exiting'}
              onClick={() => handleTransition('en_route')}
              className={`p-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                portalStatus === 'en_route'
                  ? 'bg-amber-600 text-white ring-2 ring-amber-400 shadow-lg shadow-amber-500/25'
                  : portalStatus === 'parked' || portalStatus === 'exiting'
                    ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-600/20 cursor-pointer'
              }`}
            >
              <Navigation className="w-4 h-4" />
              <span>1. Coming to parking</span>
              {portalStatus === 'en_route' && <CheckCircle2 className="w-4 h-4 text-white" />}
            </button>

            {/* Button 2: "Parked / Charging" -> parked */}
            <button
              type="button"
              disabled={isUpdatingStatus || portalStatus !== 'en_route'}
              onClick={() => handleTransition('parked')}
              className={`p-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                portalStatus === 'parked'
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-lg shadow-emerald-500/25'
                  : portalStatus !== 'en_route'
                    ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 cursor-pointer animate-pulse'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>2. Parked / Charging</span>
              {portalStatus === 'parked' && <CheckCircle2 className="w-4 h-4 text-white" />}
            </button>

            {/* Button 3: "Exiting" -> exiting then completed (free the bay) */}
            <button
              type="button"
              disabled={isUpdatingStatus || portalStatus !== 'parked'}
              onClick={() => handleTransition('exiting')}
              className={`p-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                portalStatus === 'exiting' || portalStatus === 'completed'
                  ? 'bg-purple-600 text-white shadow-lg'
                  : portalStatus !== 'parked'
                    ? 'bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/20 cursor-pointer'
              }`}
            >
              <LogOut className="w-4 h-4" />
              <span>3. Exiting (Free Bay)</span>
            </button>

          </div>
        </div>
      </div>

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
                Target Bay: Row {assignedSpot.row}, Bay {assignedSpot.col} â€¢ Search Distance: <strong className="text-emerald-400 font-mono">{distanceTraveled} units</strong>
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
                <span className="hidden sm:inline">Map Only</span>
              </button>
            </div>

            <div className="px-3.5 py-1.5 bg-cyan-950/90 border border-cyan-500/80 rounded-xl text-center shadow-lg">
              <div className="text-[9px] font-mono uppercase tracking-wider text-cyan-300">Slot Hold</div>
              <div className="text-sm font-black font-mono text-white">{formatTime(countdown)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. SPATIAL MAP & TURN-BY-TURN HUD */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
              Turn-by-Turn Wayfinding Routing
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Target Bay: <strong className="text-cyan-300 font-bold">{allottedBay}</strong>
          </span>
        </div>

        <div className="relative w-full h-[60dvh] md:h-[400px] bg-slate-950 rounded-xl overflow-hidden border border-slate-800">
          <ParkingMap
            spots={spots}
            activeRoute={{
              assignedSpotId: allottedBay,
              distance: distanceTraveled
            }}
            assignedSpotId={allottedBay}
            currentUser={currentUser}
            isAdmin={false}
          />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 3. CHARGING TELEMETRY (IF EV) */}
      {/* ------------------------------------------------------------- */}
      {isEV && (
        <div className="bg-[#0B1120] border border-cyan-500/30 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                50kW DC Fast Charging Telemetry
              </h3>
            </div>
            <span className="text-xs font-mono text-emerald-400 font-bold">
              {portalStatus === 'parked' ? 'Charging Session Active' : 'Pre-Activated'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Power Delivery</span>
              <div className="text-xl font-bold font-mono text-cyan-300 mt-1">50.0 kW</div>
              <span className="text-[10px] text-slate-500">Dual CCS Pedestal</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Battery State</span>
              <div className="text-xl font-bold font-mono text-emerald-300 mt-1">{batteryLevel}%</div>
              <span className="text-[10px] text-slate-500">Target: 80% Fast</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Estimated Time</span>
              <div className="text-xl font-bold font-mono text-amber-300 mt-1">{estimate.mins} mins</div>
              <span className="text-[10px] text-slate-500">to 80% Capacity</span>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-mono">Charging Fee</span>
              <div className="text-xl font-bold font-mono text-white mt-1">{formatINR(estimate.cost)}</div>
              <span className="text-[10px] text-slate-500">₹18.00 / kWh</span>
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
      </div>

    </div>
  );
}
