import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { 
  Zap, 
  Car, 
  Compass, 
  MapPin, 
  Navigation, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Maximize2, 
  Minimize2, 
  Crosshair, 
  Search, 
  Filter, 
  X, 
  Layers, 
  Sparkles,
  Info,
  PhoneCall,
  RotateCcw,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  DollarSign,
  BatteryMedium,
  Check
} from 'lucide-react';

import { 
  PARKING_FACILITY_LOCATION, 
  DEFAULT_MAP_CENTER, 
  getTurnByTurnDirections
} from '../utils/mapConstants';
import { calculateChargingEstimate } from '../utils/constants';

export default function ParkingMap({
  spots = [],
  assignedSpotId = null,
  activeRoute = null,
  reports = [],
  currentUser = null,
  isAdmin = false,
  onReserveSpot = null,
  onToggleFault = null,
  onOpenReportModal = null,
  className = ''
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const facilityMarkerRef = useRef(null);
  const userLocationMarkerRef = useRef(null);
  const systemSectionRef = useRef(null);

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'ev' | 'regular' | 'available' | 'occupied' | 'fault'
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');

  const freeSpotsCount = spots.filter(s => s.status === 'free' && !s.isFaulty).length;
  const occupiedSpotsCount = spots.filter(s => s.status === 'occupied').length;
  const reservedSpotsCount = spots.filter(s => s.status === 'reserved').length;
  const faultySpotsCount = spots.filter(s => s.isFaulty || s.status === 'faulty').length;

  const activeDestinationId = assignedSpotId || (selectedSpot ? selectedSpot.id : null);
  const activeSpot = spots.find(s => s.id === activeDestinationId);
  const turnDirections = useMemo(() => {
    return activeDestinationId ? getTurnByTurnDirections(activeDestinationId) : [];
  }, [activeDestinationId]);

  // Group spots by row for the Parking System Section below
  const row1Spots = spots.filter(s => s.row === 1);
  const row2Spots = spots.filter(s => s.row === 2);
  const row3Spots = spots.filter(s => s.row === 3);

  // -------------------------------------------------------------
  // 1. SCROLL TO PARKING SYSTEM SECTION
  // -------------------------------------------------------------
  const scrollToParkingSystem = () => {
    if (systemSectionRef.current) {
      systemSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const scrollToMap = () => {
    if (mapContainerRef.current) {
      mapContainerRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // -------------------------------------------------------------
  // 2. LEAFLET MAP INSTANTIATION (ONLY 1 PROMINENT FACILITY MARKER)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: DEFAULT_MAP_CENTER,
          zoom: 16,
          minZoom: 13,
          maxZoom: 19,
          zoomControl: false,
          attributionControl: true
        });

        // OpenStreetMap Tile Layer with Dark CSS Styling
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
          className: 'dark-osm-tiles',
          maxNativeZoom: 19,
          maxZoom: 19
        }).addTo(map);

        // Zoom Controls in Bottom Right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Create Custom Modern DivIcon for the Single Smart Parking Facility
        const facilityIcon = L.divIcon({
          className: 'custom-facility-pin',
          html: `
            <div class="relative flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[#0B1120] border-2 border-cyan-400 text-white shadow-[0_0_25px_rgba(6,182,212,0.8)] cursor-pointer select-none transform hover:scale-105 transition-all">
              <div class="w-7 h-7 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 flex items-center justify-center font-extrabold text-sm shadow-md">
                ⚡
              </div>
              <div class="text-left leading-tight pr-1">
                <div class="text-[11px] font-extrabold text-cyan-300 font-mono tracking-tight">SMART EV PARKING</div>
                <div class="text-[9px] text-slate-400 font-sans">IDEA Lab Facility • 30 Bays</div>
              </div>
              <div class="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0B1120] animate-ping"></div>
            </div>
          `,
          iconSize: [195, 46],
          iconAnchor: [97, 23]
        });

        const facilityMarker = L.marker(DEFAULT_MAP_CENTER, { icon: facilityIcon }).addTo(map);

        facilityMarkerRef.current = facilityMarker;
        mapInstanceRef.current = map;
      }
    } catch (err) {
      console.error('Leaflet initialization error:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Facility Marker Popup with Live Free Count
  useEffect(() => {
    if (!facilityMarkerRef.current) return;

    const popupHtml = `
      <div class="p-4 space-y-3 min-w-[240px]">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <div class="flex items-center gap-2">
            <span class="text-lg">⚡</span>
            <div>
              <h4 class="font-extrabold text-white text-sm">Smart Parking Facility</h4>
              <p class="text-[10px] text-cyan-400 font-mono">${PARKING_FACILITY_LOCATION.name}</p>
            </div>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-950 text-emerald-300 border border-emerald-600">
            ACTIVE
          </span>
        </div>

        <div class="grid grid-cols-3 gap-1.5 text-center font-mono text-xs">
          <div class="p-2 bg-slate-900 rounded-lg border border-slate-800">
            <div class="text-[9px] text-slate-400">Total Bays</div>
            <div class="font-bold text-white">30</div>
          </div>
          <div class="p-2 bg-slate-900 rounded-lg border border-slate-800">
            <div class="text-[9px] text-slate-400">EV Fast</div>
            <div class="font-bold text-cyan-400">6</div>
          </div>
          <div class="p-2 bg-slate-900 rounded-lg border border-slate-800">
            <div class="text-[9px] text-slate-400">Available</div>
            <div class="font-bold text-emerald-400">${freeSpotsCount}</div>
          </div>
        </div>

        <div class="text-[10px] text-slate-400 leading-relaxed">
          Centralized spatial coordination active. Select below to inspect bays and view real-time occupancy.
        </div>

        <button 
          id="btn-view-facility-system"
          class="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
        >
          <span>View Parking System</span>
          <span>&darr;</span>
        </button>
      </div>
    `;

    facilityMarkerRef.current.bindPopup(popupHtml);

    facilityMarkerRef.current.on('popupopen', () => {
      const btn = document.getElementById('btn-view-facility-system');
      if (btn) {
        btn.onclick = () => {
          facilityMarkerRef.current.closePopup();
          scrollToParkingSystem();
        };
      }
    });

  }, [freeSpotsCount, occupiedSpotsCount, faultySpotsCount]);

  // -------------------------------------------------------------
  // 3. SEARCH BEHAVIOR (SCROLLS TO PARKING SYSTEM & HIGHLIGHTS SPOT)
  // -------------------------------------------------------------
  const handleSpotSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim().toUpperCase();
    const foundSpot = spots.find(s => s.id === query || s.name.toUpperCase().includes(query));

    if (foundSpot) {
      setSelectedSpot(foundSpot);
      setLocationStatus(`Located bay ${foundSpot.id}! Scrolling to Parking System.`);
      setTimeout(() => setLocationStatus(''), 3000);
      scrollToParkingSystem();
    } else {
      setLocationStatus(`No parking bay found matching "${searchQuery}".`);
      setTimeout(() => setLocationStatus(''), 3500);
    }
  };

  // -------------------------------------------------------------
  // 4. GEOLOCATION ("MY LOCATION")
  // -------------------------------------------------------------
  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }

    setLocationStatus('Acquiring satellite GPS fix...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocationStatus('GPS Position acquired!');
        setTimeout(() => setLocationStatus(''), 3000);

        if (mapInstanceRef.current) {
          if (!userLocationMarkerRef.current) {
            const userIcon = L.divIcon({
              className: 'custom-user-marker',
              html: `
                <div class="relative w-6 h-6 rounded-full bg-blue-500 border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.9)] flex items-center justify-center">
                  <div class="w-2 h-2 rounded-full bg-white animate-ping"></div>
                </div>
              `,
              iconSize: [24, 24],
              iconAnchor: [12, 12]
            });
            userLocationMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(mapInstanceRef.current);
            userLocationMarkerRef.current.bindPopup('<div class="p-2 text-xs font-bold text-blue-400 font-mono">📍 Your Current GPS Location</div>');
          } else {
            userLocationMarkerRef.current.setLatLng([latitude, longitude]);
          }

          mapInstanceRef.current.flyTo([latitude, longitude], 17, { duration: 1.5 });
        }
      },
      (err) => {
        setLocationStatus('Location access is unavailable. You can still use the parking map manually.');
        setTimeout(() => setLocationStatus(''), 5000);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleResetFacilityView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo(DEFAULT_MAP_CENTER, 16, { duration: 1 });
      if (facilityMarkerRef.current) {
        facilityMarkerRef.current.openPopup();
      }
    }
  };

  // Filter spots in parking system section
  const isSpotVisible = (spot) => {
    const isEV = spot.type === 'ev';
    const isFault = spot.isFaulty || spot.status === 'faulty';
    const isFree = spot.status === 'free';
    const isOcc = spot.status === 'occupied';

    if (activeFilter === 'all') return true;
    if (activeFilter === 'ev') return isEV;
    if (activeFilter === 'regular') return !isEV;
    if (activeFilter === 'available') return isFree && !isFault;
    if (activeFilter === 'occupied') return isOcc;
    if (activeFilter === 'fault') return isFault;
    return true;
  };

  return (
    <div className={`space-y-8 ${className}`}>

      {/* ============================================================= */}
      {/* 1. GEOGRAPHICAL OPENSTREETMAP SECTION (SINGLE FACILITY MARKER) */}
      {/* ============================================================= */}
      <div className={`relative bg-[#0B1120] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'w-full'
      }`}>

        {/* Map Header Controls Bar */}
        <div className="p-4 bg-[#0B1120]/95 border-b border-slate-800/90 z-20 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
          
          {/* Title & Facility Info */}
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-cyan-600 to-emerald-500 rounded-xl text-white shadow-md shadow-cyan-500/20">
              <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '14s' }} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Geographical Facility Location
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  OpenStreetMap
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                {PARKING_FACILITY_LOCATION.name} • [{PARKING_FACILITY_LOCATION.lat}, {PARKING_FACILITY_LOCATION.lng}]
              </p>
            </div>
          </div>

          {/* Search Bar (Navigates to spot below) */}
          <form onSubmit={handleSpotSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search bay (e.g. EV01, R14)..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-xs shadow-md shadow-cyan-600/20"
            >
              Search
            </button>
          </form>

          {/* Action Tools */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleLocateUser}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
              title="Locate My Position via GPS"
            >
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">My Location</span>
            </button>

            <button
              onClick={handleResetFacilityView}
              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1 transition-all"
              title="Reset View to Facility Pin"
            >
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Reset Map</span>
            </button>

            <button
              onClick={scrollToParkingSystem}
              className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/25"
            >
              <span>View Parking System</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white rounded-xl transition-all"
              title={isFullscreen ? 'Exit Fullscreen' : 'Full-Screen Map'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4 text-cyan-400" /> : <Maximize2 className="w-4 h-4 text-cyan-400" />}
            </button>
          </div>

        </div>

        {/* Toast Notification */}
        {locationStatus && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-xl bg-slate-900/95 border border-cyan-500 text-cyan-200 text-xs shadow-2xl animate-fade-in flex items-center gap-2 font-semibold">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>{locationStatus}</span>
          </div>
        )}

        {/* Leaflet Map Viewport */}
        <div className="relative w-full h-[380px] md:h-[420px]">
          <div ref={mapContainerRef} className="w-full h-full bg-[#070B14]" />
        </div>

        {/* Footer info banner */}
        <div className="px-4 py-2.5 bg-[#0B1120] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono">
          <div className="flex items-center gap-3">
            <span>📍 <strong>1 Facility Center</strong></span>
            <span>Capacity: <strong className="text-white">30 Bays (6 EV 50kW)</strong></span>
            <span>Available: <strong className="text-emerald-400">{freeSpotsCount} Free</strong></span>
          </div>
          <div>
            <span>&copy; OpenStreetMap contributors</span>
          </div>
        </div>

      </div>

      {/* ============================================================= */}
      {/* 2. SMART PARKING SYSTEM SECTION (COMPLETELY SEPARATE BELOW) */}
      {/* ============================================================= */}
      <section 
        ref={systemSectionRef}
        id="smart-parking-system-section"
        className="bg-[#0B1120] border border-slate-800 rounded-3xl p-5 md:p-8 shadow-2xl space-y-6 relative overflow-hidden animate-fade-in"
      >
        
        {/* Top Glowing Header Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500" />

        {/* Section Header with "Back to Map" and KPIs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-800/90">
          
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <button
                onClick={scrollToMap}
                className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-all group"
                title="Scroll back up to Geographical Map"
              >
                <ArrowUp className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-y-0.5 transition-transform" />
                <span>Back to Map</span>
              </button>

              <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider">
                Internal Facility Layout
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Smart Parking System
            </h2>
            <p className="text-xs text-slate-400">
              IDEA Lab Facility Center • Real-time bay occupancy, charging telemetry, and wayfinding guidance
            </p>
          </div>

          {/* Quick KPI Badges */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="px-3 py-2 bg-slate-900 rounded-xl border border-emerald-900/60 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981]" />
              <span className="text-slate-300">Available: <strong className="text-emerald-400 text-sm">{freeSpotsCount}</strong></span>
            </div>
            <div className="px-3 py-2 bg-slate-900 rounded-xl border border-red-900/60 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
              <span className="text-slate-300">Occupied: <strong className="text-red-400 text-sm">{occupiedSpotsCount}</strong></span>
            </div>
            <div className="px-3 py-2 bg-slate-900 rounded-xl border border-cyan-900/60 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06B6D4]" />
              <span className="text-slate-300">EV Fast: <strong className="text-cyan-300 text-sm">6 Bays</strong></span>
            </div>
            {faultySpotsCount > 0 && (
              <div className="px-3 py-2 bg-rose-950/80 rounded-xl border border-rose-600 flex items-center gap-2 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-rose-200">Faults: <strong className="text-rose-300 text-sm">{faultySpotsCount}</strong></span>
              </div>
            )}
          </div>

        </div>

        {/* Filter Bar (Controls Parking Bays below) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/70 border border-slate-800 rounded-2xl text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-slate-400 font-semibold flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter Bays:
            </span>
            {[
              { id: 'all', label: `All (30)` },
              { id: 'ev', label: `⚡ 50kW EV Fast (6)` },
              { id: 'regular', label: `🚗 Standard Regular (24)` },
              { id: 'available', label: `🟢 Free (${freeSpotsCount})` },
              { id: 'occupied', label: `🔴 Occupied (${occupiedSpotsCount})` },
              { id: 'fault', label: `⚠️ Faults (${faultySpotsCount})` }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl border font-semibold text-xs transition-all ${
                  activeFilter === f.id
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/20 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {activeDestinationId && (
            <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs bg-cyan-950/80 px-3 py-1 rounded-xl border border-cyan-800">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>Wayfinding: Gate (0,0) &rarr; Bay {activeDestinationId}</span>
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* PARKING FACILITY SPATIAL GRID LAYOUT (NORTH EXIT -> ROW 1 -> ROW 2 -> ROW 3 -> ENTRANCE) */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-[#070B14] border border-slate-800 rounded-2xl p-4 md:p-6 space-y-4">
          
          {/* NORTH EXIT BARRIER */}
          <div className="flex items-center justify-between pb-3 border-b border-dashed border-slate-800">
            <div className="flex items-center gap-2">
              <div className="px-3 py-1 bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5">
                <span>🚪 NORTH EXIT GATE</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                Departure Corridor • Auto-Billing Reconciliation
              </span>
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Outflow Telemetry: <strong className="text-emerald-400">Nominal</strong>
            </div>
          </div>

          {/* ROW 1: Dedicated 50kW EV Fast Charging Hub (EV01-EV06) + Express Regular (R01-R04) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
              <span className="flex items-center gap-1 font-bold">
                <Zap className="w-3.5 h-3.5" />
                Row 1: High-Speed 50kW EV Charging Bays (EV01–EV06) & Express (R01–R04)
              </span>
              <span className="text-slate-500 text-[10px]">y = 1.5 units from Gate</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
              {row1Spots.map((spot) => {
                const isEV = spot.type === 'ev';
                const isTarget = activeDestinationId === spot.id;
                const isFault = spot.isFaulty || spot.status === 'faulty';
                const isDimmed = !isSpotVisible(spot);

                return (
                  <button
                    key={spot.id}
                    onClick={() => setSelectedSpot(spot)}
                    className={`relative p-2.5 rounded-xl border-2 flex flex-col items-center justify-between min-h-[82px] text-left transition-all transform hover:scale-105 active:scale-95 ${
                      isDimmed ? 'opacity-25' : 'opacity-100'
                    } ${
                      isTarget ? 'ring-2 ring-white ring-offset-2 ring-offset-[#070B14] scale-105' : ''
                    } ${
                      isFault
                        ? 'bg-rose-950/60 border-rose-500 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.4)]'
                        : isEV
                          ? spot.status === 'free'
                            ? 'bg-cyan-950/50 border-cyan-400 text-cyan-200 glow-ev-free hover:border-cyan-300'
                            : spot.status === 'reserved'
                              ? 'bg-amber-950/50 border-amber-500 text-amber-200 glow-ev-reserved'
                              : 'bg-red-950/50 border-red-500 text-red-200 glow-ev-occupied'
                          : spot.status === 'free'
                            ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 glow-reg-free'
                            : 'bg-slate-900/80 border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="w-full flex justify-between items-center text-[10px] font-mono font-bold">
                      <span>{spot.id}</span>
                      <span>{isEV ? '⚡ 50kW' : 'P'}</span>
                    </div>

                    <div className="my-1 flex flex-col items-center">
                      {isFault ? (
                        <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                      ) : isEV ? (
                        <Zap className={`w-4 h-4 ${spot.status === 'free' ? 'text-cyan-400 animate-pulse' : 'text-red-400'}`} />
                      ) : (
                        <Car className="w-4 h-4 text-emerald-400" />
                      )}
                      <span className="text-[9px] font-bold uppercase mt-1 tracking-wider">
                        {isFault ? 'FAULT' : spot.status}
                      </span>
                    </div>

                    <div className="w-full text-center text-[9px] font-mono truncate text-slate-400">
                      {spot.occupiedBy ? spot.occupiedBy.vehiclePlate || spot.occupiedBy.vehicleId : (isEV ? 'Available' : 'Free')}
                    </div>

                    {isTarget && (
                      <div className="absolute -top-1.5 -right-1 bg-cyan-400 text-slate-950 rounded-full p-0.5 shadow-lg animate-ping">
                        <MapPin className="w-2.5 h-2.5 fill-slate-950 text-slate-950" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* TRANSIT AISLE 1 */}
          <div className="h-5 border-y border-dashed border-slate-800 bg-slate-950/60 flex items-center justify-center text-[10px] text-slate-500 font-mono tracking-widest">
            ◄── TRANSIT AISLE 1 (ROW 1 / ROW 2) ──►
          </div>

          {/* ROW 2: Regular Parking (R05 to R14) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
              <span className="flex items-center gap-1 font-bold">
                <Car className="w-3.5 h-3.5" />
                Row 2: Standard Vehicle Parking (R05–R14)
              </span>
              <span className="text-slate-500 text-[10px]">y = 3.5 units from Gate</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
              {row2Spots.map((spot) => {
                const isTarget = activeDestinationId === spot.id;
                const isDimmed = !isSpotVisible(spot);

                return (
                  <button
                    key={spot.id}
                    onClick={() => setSelectedSpot(spot)}
                    className={`relative p-2 rounded-xl border-2 flex flex-col items-center justify-between min-h-[76px] transition-all transform hover:scale-105 active:scale-95 ${
                      isDimmed ? 'opacity-25' : 'opacity-100'
                    } ${
                      isTarget ? 'ring-2 ring-white ring-offset-2 ring-offset-[#070B14] scale-105' : ''
                    } ${
                      spot.status === 'free'
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 glow-reg-free'
                        : 'bg-slate-900/80 border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="w-full flex justify-between text-[10px] font-mono font-bold">
                      <span>{spot.id}</span>
                      <span>P</span>
                    </div>
                    <Car className={`w-3.5 h-3.5 ${spot.status === 'free' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="text-[9px] font-mono uppercase">{spot.status}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* TRANSIT AISLE 2 */}
          <div className="h-5 border-y border-dashed border-slate-800 bg-slate-950/60 flex items-center justify-center text-[10px] text-slate-500 font-mono tracking-widest">
            ◄── TRANSIT AISLE 2 (ROW 2 / ROW 3) ──►
          </div>

          {/* ROW 3: Regular Parking (R15 to R24) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
              <span className="flex items-center gap-1 font-bold">
                <Car className="w-3.5 h-3.5" />
                Row 3: Standard Vehicle Parking (R15–R24)
              </span>
              <span className="text-slate-500 text-[10px]">y = 5.5 units from Gate</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
              {row3Spots.map((spot) => {
                const isTarget = activeDestinationId === spot.id;
                const isDimmed = !isSpotVisible(spot);

                return (
                  <button
                    key={spot.id}
                    onClick={() => setSelectedSpot(spot)}
                    className={`relative p-2 rounded-xl border-2 flex flex-col items-center justify-between min-h-[76px] transition-all transform hover:scale-105 active:scale-95 ${
                      isDimmed ? 'opacity-25' : 'opacity-100'
                    } ${
                      isTarget ? 'ring-2 ring-white ring-offset-2 ring-offset-[#070B14] scale-105' : ''
                    } ${
                      spot.status === 'free'
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 glow-reg-free'
                        : 'bg-slate-900/80 border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="w-full flex justify-between text-[10px] font-mono font-bold">
                      <span>{spot.id}</span>
                      <span>P</span>
                    </div>
                    <Car className={`w-3.5 h-3.5 ${spot.status === 'free' ? 'text-emerald-400' : 'text-slate-500'}`} />
                    <span className="text-[9px] font-mono uppercase">{spot.status}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SOUTH ENTRANCE GATE (0, 0) */}
          <div className="flex items-center justify-between pt-3 border-t border-dashed border-cyan-500/60">
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-1.5 rounded-lg bg-cyan-950 border-2 border-cyan-400 text-cyan-300 font-mono text-xs font-bold shadow-[0_0_12px_rgba(6,182,212,0.5)] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400 animate-spin" />
                <span>ENTRANCE GATE (0, 0)</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                Optical ALPR & Central Controller Dynamic Sensor Array
              </span>
            </div>
            <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-mono font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Central Controller Active</span>
            </div>
          </div>

        </div>

        {/* ------------------------------------------------------------- */}
        {/* INTERACTIVE SPOT INSPECTOR & WAYFINDING DRAWER */}
        {/* ------------------------------------------------------------- */}
        {selectedSpot && (
          <div className="p-5 bg-gradient-to-r from-slate-900 via-[#0B1120] to-slate-900 border-2 border-cyan-500/80 rounded-2xl shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 animate-fade-in">
            
            {/* Spot Header Details */}
            <div className="flex items-start gap-4">
              <div className={`p-3.5 rounded-2xl border-2 ${
                selectedSpot.type === 'ev'
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                  : 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
              }`}>
                {selectedSpot.type === 'ev' ? <Zap className="w-7 h-7" /> : <Car className="w-7 h-7" />}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">{selectedSpot.name} ({selectedSpot.id})</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border bg-slate-900 text-cyan-300 border-cyan-700">
                    {selectedSpot.status}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Type: <strong>{selectedSpot.type === 'ev' ? 'Dedicated 50kW High-Speed EV Charger' : 'Standard Parking Stall'}</strong> • Distance from Gate: <strong className="text-emerald-400 font-mono">{selectedSpot.distanceFromGate} units</strong>
                </p>
                {selectedSpot.occupiedBy && (
                  <div className="text-xs text-cyan-300 font-mono flex items-center gap-2 pt-0.5">
                    <span>Occupant: <strong>{selectedSpot.occupiedBy.vehiclePlate || 'EV-ACTIVE'}</strong></span>
                    {selectedSpot.occupiedBy.batteryLevel && <span>• Battery: <strong>{selectedSpot.occupiedBy.batteryLevel}% SoC</strong></span>}
                  </div>
                )}
              </div>
            </div>

            {/* Actions for Selected Spot */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
              {selectedSpot.status === 'free' && onReserveSpot && (
                <button
                  onClick={() => onReserveSpot(selectedSpot)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-1.5"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Reserve & Route to {selectedSpot.id}</span>
                </button>
              )}

              {isAdmin && onToggleFault && (
                <button
                  onClick={() => onToggleFault(selectedSpot.id, !selectedSpot.isFaulty)}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                    selectedSpot.isFaulty 
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-200 hover:bg-emerald-900'
                      : 'bg-rose-950 border-rose-600 text-rose-200 hover:bg-rose-900'
                  }`}
                >
                  {selectedSpot.isFaulty ? 'Clear Fault' : 'Simulate Fault'}
                </button>
              )}

              <button
                onClick={() => setSelectedSpot(null)}
                className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
              >
                Dismiss
              </button>
            </div>

          </div>
        )}

      </section>

    </div>
  );
}
