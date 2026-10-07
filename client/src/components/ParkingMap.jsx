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
  Check,
  Building2
} from 'lucide-react';

import { 
  PARKING_LOCATIONS, 
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
  const locationMarkersRef = useRef({});
  const userLocationMarkerRef = useRef(null);
  const systemSectionRef = useRef(null);

  // UI State
  const [selectedLocation, setSelectedLocation] = useState(PARKING_LOCATIONS[0]);
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
  // 2. LEAFLET MAP INSTANTIATION & MULTI-LOCATION MARKERS
  // -------------------------------------------------------------
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [selectedLocation.lat, selectedLocation.lng],
          zoom: 15,
          minZoom: 11,
          maxZoom: 19,
          zoomControl: false,
          attributionControl: true
        });

        // OpenStreetMap Tile Layer with Cyber Dark CSS Styling
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
          className: 'dark-osm-tiles',
          maxNativeZoom: 19,
          maxZoom: 19
        }).addTo(map);

        // Zoom Controls in Bottom Right
        L.control.zoom({ position: 'bottomright' }).addTo(map);

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

  // Invalidate Map Size on mount and fullscreen change to prevent overflow/alignment bugs
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize();
      }, 200);
    }
  }, [isFullscreen, selectedLocation]);

  // Global handler for Leaflet Popup Button clicks
  useEffect(() => {
    window.handleSelectLocationFromMapPopup = (locationId) => {
      const loc = PARKING_LOCATIONS.find(l => l.id === locationId);
      if (loc) {
        handleSelectLocation(loc);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.closePopup();
        }
        setTimeout(() => {
          scrollToParkingSystem();
        }, 300);
      }
    };
    return () => {
      delete window.handleSelectLocationFromMapPopup;
    };
  }, []);

  // Handle Location Switching
  const handleSelectLocation = (loc) => {
    setSelectedLocation(loc);
    setSelectedSpot(null);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.lat, loc.lng], 16, {
        duration: 1.2
      });
    }
    setLocationStatus(`Switched view to ${loc.name}`);
    setTimeout(() => setLocationStatus(''), 3000);
  };

  // Render/Update Leaflet Markers for ALL Multiple Locations
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear previous markers
    Object.values(locationMarkersRef.current).forEach(marker => marker.remove());
    locationMarkersRef.current = {};

    PARKING_LOCATIONS.forEach((loc) => {
      const isSelected = loc.id === selectedLocation.id;

      // Custom HTML Pin for each Multi-Parking Facility Location
      const iconHtml = `
        <div class="relative flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-[#0B1120] border-2 ${
          isSelected
            ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.9)] scale-110'
            : 'border-slate-700 hover:border-cyan-500 opacity-90'
        } text-white cursor-pointer select-none transition-all">
          <div class="w-6 h-6 rounded-xl ${
            isSelected
              ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-slate-950 font-black'
              : 'bg-slate-800 text-cyan-400 font-bold'
          } flex items-center justify-center text-xs">
            ⚡
          </div>
          <div class="text-left leading-tight">
            <div class="text-[10px] font-extrabold ${isSelected ? 'text-cyan-300' : 'text-slate-200'} font-mono tracking-tight truncate max-w-[120px]">
              ${loc.shortName}
            </div>
            <div class="text-[8px] text-slate-400 font-sans">
              ${loc.capacity} Bays • ${loc.evFastChargers} EV Fast
            </div>
          </div>
          ${isSelected ? '<div class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0B1120] animate-ping"></div>' : ''}
        </div>
      `;

      const facilityIcon = L.divIcon({
        className: `custom-location-pin-${loc.id}`,
        html: iconHtml,
        iconSize: [175, 42],
        iconAnchor: [87, 21]
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: facilityIcon }).addTo(map);

      // Facility Popup HTML
      const popupHtml = `
        <div class="p-3.5 space-y-2.5 min-w-[240px]">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div class="flex items-center gap-2">
              <span class="text-base">⚡</span>
              <div>
                <h4 class="font-extrabold text-white text-xs leading-tight">${loc.name}</h4>
                <p class="text-[9px] text-cyan-400 font-mono">${loc.address}</p>
              </div>
            </div>
            <span class="px-1.5 py-0.5 rounded text-[9px] font-bold font-mono bg-emerald-950 text-emerald-300 border border-emerald-600">
              ${loc.badge}
            </span>
          </div>

          <div class="grid grid-cols-3 gap-1 text-center font-mono text-xs">
            <div class="p-1.5 bg-slate-900 rounded-lg border border-slate-800">
              <div class="text-[8px] text-slate-400">Capacity</div>
              <div class="font-bold text-white">${loc.capacity}</div>
            </div>
            <div class="p-1.5 bg-slate-900 rounded-lg border border-slate-800">
              <div class="text-[8px] text-slate-400">EV Speed</div>
              <div class="font-bold text-cyan-400 text-[9px]">${loc.chargerType}</div>
            </div>
            <div class="p-1.5 bg-slate-900 rounded-lg border border-slate-800">
              <div class="text-[8px] text-slate-400">Hourly Rate</div>
              <div class="font-bold text-emerald-400 text-[10px]">${loc.pricePerHour}</div>
            </div>
          </div>

          <button 
            type="button"
            onclick="window.handleSelectLocationFromMapPopup('${loc.id}')"
            class="w-full py-2.5 px-3 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 text-white font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-500/25 transition-all cursor-pointer"
          >
            <span>Select & View Lot Grid</span>
            <span>&rarr;</span>
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);

      // On Marker Click: switch location & scroll to grid
      marker.on('click', () => {
        handleSelectLocation(loc);
      });

      locationMarkersRef.current[loc.id] = marker;
    });
  }, [selectedLocation, freeSpotsCount]);

  // -------------------------------------------------------------
  // 3. SEARCH BEHAVIOR
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

    setLocationStatus('Locating your position...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([userLat, userLng], 17);

          if (userLocationMarkerRef.current) {
            userLocationMarkerRef.current.setLatLng([userLat, userLng]);
          } else {
            const userIcon = L.divIcon({
              className: 'user-geo-pin',
              html: `
                <div class="relative flex items-center justify-center w-7 h-7 rounded-full bg-cyan-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_#06B6D4] border-2 border-white animate-pulse">
                  📍
                </div>
              `,
              iconSize: [28, 28],
              iconAnchor: [14, 14]
            });

            userLocationMarkerRef.current = L.marker([userLat, userLng], { icon: userIcon })
              .addTo(mapInstanceRef.current)
              .bindPopup('<div class="p-2 text-xs font-bold text-cyan-300">Your Current Position</div>');
          }
        }

        setLocationStatus('Centered on your GPS location.');
        setTimeout(() => setLocationStatus(''), 3500);
      },
      (err) => {
        console.warn('Geo Error:', err);
        setLocationStatus('Could not retrieve GPS position. Showing facility map.');
        setTimeout(() => setLocationStatus(''), 3500);
      }
    );
  };

  const isSpotVisible = (spot) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'ev') return spot.type === 'ev';
    if (activeFilter === 'regular') return spot.type === 'regular';
    if (activeFilter === 'available') return spot.status === 'free' && !spot.isFaulty;
    if (activeFilter === 'occupied') return spot.status === 'occupied';
    if (activeFilter === 'fault') return spot.isFaulty || spot.status === 'faulty';
    return true;
  };

  return (
    <div className={`space-y-6 text-slate-100 ${className}`}>
      
      {/* ============================================================= */}
      {/* 1. MULTI-LOCATION SELECTION BAR & CITY MAP CONTAINER */}
      {/* ============================================================= */}
      <div className={`relative bg-[#070B14] border border-slate-800 rounded-3xl overflow-hidden isolate shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-4 z-50 rounded-2xl flex flex-col bg-[#070B14]' : ''
      }`}>

        {/* TOP BAR: MULTI-LOCATION HUB SELECTOR & SEARCH */}
        <div className="p-4 bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-800 space-y-3 z-10">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-400">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <span>Smart City Parking Hub Network</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-700">
                    5 Locations Active
                  </span>
                </h2>
                <p className="text-[11px] text-slate-400 font-sans">
                  Select a facility below to inspect spatial grid, EV charger availability, and live routing.
                </p>
              </div>
            </div>

            {/* Controls Right */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleLocateUser}
                className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                title="Center on My GPS Location"
              >
                <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">My Location</span>
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

          {/* MULTI-LOCATION PILL SELECTOR */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
            {PARKING_LOCATIONS.map((loc) => {
              const isSelected = loc.id === selectedLocation.id;
              return (
                <button
                  key={loc.id}
                  onClick={() => handleSelectLocation(loc)}
                  className={`px-3 py-2 rounded-xl border flex items-center gap-2 shrink-0 transition-all font-mono font-bold cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950 to-blue-950 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <span className="text-sm">⚡</span>
                  <div className="text-left">
                    <div className="text-[11px] leading-tight font-extrabold">{loc.shortName}</div>
                    <div className="text-[9px] text-slate-400 font-sans">{loc.evFastChargers} EV • {loc.pricePerHour}</div>
                  </div>
                </button>
              );
            })}
          </div>

        </div>

        {/* Toast Notification */}
        {locationStatus && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 px-4 py-2 rounded-xl bg-slate-900/95 border border-cyan-500 text-cyan-200 text-xs shadow-2xl animate-fade-in flex items-center gap-2 font-semibold">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>{locationStatus}</span>
          </div>
        )}

        {/* Leaflet Map Viewport Container with strict z-index constraints */}
        <div className={`relative w-full overflow-hidden z-0 ${isFullscreen ? 'flex-1 h-full' : 'h-[380px] md:h-[440px]'}`}>
          <div ref={mapContainerRef} className="w-full h-full bg-[#070B14]" />
        </div>

        {/* Footer Info Banner */}
        <div className="px-4 py-2.5 bg-[#0B1120] border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono z-10">
          <div className="flex items-center gap-3">
            <span>📍 Active: <strong className="text-cyan-300">{selectedLocation.name}</strong></span>
            <span>Capacity: <strong className="text-white">{selectedLocation.capacity} Bays</strong></span>
            <span>EV Speed: <strong className="text-cyan-400">{selectedLocation.chargerType}</strong></span>
          </div>
          <div>
            <span>&copy; OpenStreetMap contributors</span>
          </div>
        </div>

      </div>

      {/* ============================================================= */}
      {/* 2. SMART PARKING SYSTEM SECTION (SPATIAL GRID FOR ACTIVE HUB) */}
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
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-wider">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Spatial Bay Allocation Grid</span>
            </div>
            <h2 className="text-xl font-extrabold text-white mt-1 flex items-center gap-2">
              <span>{selectedLocation.name}</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-emerald-950 text-emerald-300 border border-emerald-600">
                Live Sensor Feed
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              3-Row Spatial Bay Layout • Gates at South Entrance (0,0) • Real-time ALPR & Battery Priority Allocation
            </p>
          </div>

          {/* Quick Stats Banner */}
          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <div className="px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="text-[9px] text-slate-400 uppercase">Available</div>
                <div className="font-extrabold text-sm">{freeSpotsCount} Bays</div>
              </div>
            </div>

            <div className="px-3.5 py-2 rounded-xl bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <div>
                <div className="text-[9px] text-slate-400 uppercase">EV Fast</div>
                <div className="font-extrabold text-sm">{selectedLocation.evFastChargers} Dedicated</div>
              </div>
            </div>

            <button
              onClick={scrollToMap}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-cyan-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <span>Map View</span>
              <span>&uarr;</span>
            </button>
          </div>
        </div>

        {/* Filter Controls & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
          
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-mono">
            {[
              { id: 'all', label: 'All Bays' },
              { id: 'ev', label: 'EV Dedicated' },
              { id: 'regular', label: 'Standard ICE' },
              { id: 'available', label: 'Available' },
              { id: 'occupied', label: 'Occupied' },
              { id: 'fault', label: 'Hardware Fault' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl border transition-all shrink-0 font-bold ${
                  activeFilter === f.id
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-md'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Spot Search Form */}
          <form onSubmit={handleSpotSearch} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-48">
              <input
                type="text"
                placeholder="Search Bay (e.g. EV02, R10)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
            <button
              type="submit"
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs shrink-0"
            >
              Search
            </button>
          </form>

        </div>

        {/* ------------------------------------------------------------- */}
        {/* SPATIAL 3-ROW GRID REPRESENTATION */}
        {/* ------------------------------------------------------------- */}
        <div className="space-y-4 pt-2">
          
          {/* ROW 1: EV Priority Fast Charging (EV01-EV06) & R01-R04 */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-mono text-cyan-400">
              <span className="flex items-center gap-1 font-bold">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Row 1: Priority EV Fast Charging & Front Stall Access (EV01–EV06, R01–R04)
              </span>
              <span className="text-slate-500 text-[10px]">y = 1.5 units from Gate</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
              {row1Spots.map((spot) => {
                const isEV = spot.type === 'ev';
                const isFault = spot.isFaulty || spot.status === 'faulty';
                const isTarget = activeDestinationId === spot.id;
                const isDimmed = !isSpotVisible(spot);

                return (
                  <button
                    key={spot.id}
                    onClick={() => setSelectedSpot(spot)}
                    className={`relative p-2.5 rounded-2xl border-2 flex flex-col justify-between min-h-[88px] transition-all transform hover:scale-105 active:scale-95 text-left ${
                      isDimmed ? 'opacity-25' : 'opacity-100'
                    } ${
                      isTarget ? 'ring-2 ring-white ring-offset-2 ring-offset-[#070B14] scale-105' : ''
                    } ${
                      isFault
                        ? 'bg-rose-950/60 border-rose-600 text-rose-300'
                        : isEV
                        ? spot.status === 'free'
                          ? 'bg-cyan-950/60 border-cyan-400 text-cyan-200 glow-ev-free'
                          : spot.status === 'reserved'
                          ? 'bg-amber-950/60 border-amber-500 text-amber-200 glow-ev-reserved'
                          : 'bg-slate-900/80 border-slate-700 text-slate-400'
                        : spot.status === 'free'
                        ? 'bg-emerald-950/50 border-emerald-500 text-emerald-200 glow-reg-free'
                        : 'bg-slate-900/80 border-slate-700 text-slate-400'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full font-mono text-[10px] font-extrabold">
                      <span>{spot.id}</span>
                      <span className={`px-1 rounded text-[8px] ${isEV ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' : 'bg-slate-800 text-slate-300'}`}>
                        {isEV ? '⚡ EV' : 'P'}
                      </span>
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
                    className={`relative p-2.5 rounded-2xl border-2 flex flex-col items-center justify-between min-h-[78px] transition-all transform hover:scale-105 active:scale-95 ${
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
                    className={`relative p-2.5 rounded-2xl border-2 flex flex-col items-center justify-between min-h-[78px] transition-all transform hover:scale-105 active:scale-95 ${
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
                  Type: <strong>{selectedSpot.type === 'ev' ? `Dedicated ${selectedLocation.chargerType} Bay` : 'Standard Parking Stall'}</strong> • Distance from Gate: <strong className="text-emerald-400 font-mono">{selectedSpot.distanceFromGate} units</strong>
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
