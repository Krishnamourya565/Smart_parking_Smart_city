import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Car, 
  Shield, 
  Compass, 
  MapPin, 
  Clock, 
  DollarSign, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingDown, 
  Layers, 
  Cpu, 
  ArrowRight, 
  Sparkles, 
  ChevronRight, 
  Play, 
  RotateCcw, 
  Radio, 
  FileText, 
  Send, 
  Users, 
  Check, 
  Sliders,
  BatteryMedium,
  Award,
  Eye,
  ChevronDown
} from 'lucide-react';
import { BENCHMARK_METRICS, calculateChargingEstimate, PRICING, formatINR } from '../utils/constants';

export default function LandingPage({ onEnterApp, onOpenLogin, onOpenAdmin }) {
  // -------------------------------------------------------------
  // HERO & FACILITY SIMULATION STATE
  // -------------------------------------------------------------
  const [cameraMode, setCameraMode] = useState('isometric'); // 'isometric' | 'ortho'
  const [activeVehicleStep, setActiveVehicleStep] = useState(0); // 0..100 animation progress
  const [simRunning, setSimRunning] = useState(true);
  const [lotDensity, setLotDensity] = useState(76); // 76% occupancy
  const [chaosSimActive, setChaosSimActive] = useState(false);

  // Selected spot in Live Parking section
  const [selectedLiveSpot, setSelectedLiveSpot] = useState(null);
  const [spotFilter, setSpotFilter] = useState('all');

  // EV Charging Simulator State
  const [chargerBattery, setChargerBattery] = useState(64);
  const [targetBattery, setTargetBattery] = useState(80);
  const [chargingActive, setChargingActive] = useState(true);

  // Incident Reports Simulator State
  const [simIncidentTitle, setSimIncidentTitle] = useState('50kW Fast Charger Display Glitch at EV02');
  const [simIncidentCategory, setSimIncidentCategory] = useState('EV Charger Fault');
  const [simIncidentSpot, setSimIncidentSpot] = useState('EV02');
  const [simIncidentStage, setSimIncidentStage] = useState(2); // 1: Submitted, 2: Under Review, 3: In Progress, 4: Resolved
  const [simIncidentSuccess, setSimIncidentSuccess] = useState(false);

  // Navigation indicator
  const [activeNavSection, setActiveNavSection] = useState('hero');

  // Vehicle transit animation in Hero
  useEffect(() => {
    let interval;
    if (simRunning) {
      interval = setInterval(() => {
        setActiveVehicleStep(prev => (prev >= 100 ? 0 : prev + 1));
      }, 70);
    }
    return () => clearInterval(interval);
  }, [simRunning]);

  // Charging time & cost calculation
  const chargingEst = calculateChargingEstimate(chargerBattery, targetBattery);

  // Pre-configured 30 spots for the Live Grid visualization
  const previewSpots = [
    // Row 1: EV01-EV06 + R01-R04
    { id: 'EV01', type: 'ev', row: 1, col: 1, status: 'free', name: 'EV Fast Bay 1', power: '50kW DC', occupant: null },
    { id: 'EV02', type: 'ev', row: 1, col: 2, status: chaosSimActive ? 'fault' : 'charging', name: 'EV Fast Bay 2', power: '50kW DC', occupant: { plate: 'EV-702-NX', soc: 78, dwell: '18m' } },
    { id: 'EV03', type: 'ev', row: 1, col: 3, status: 'occupied', name: 'EV Fast Bay 3', power: '50kW DC', occupant: { plate: 'EV-319-PS', soc: 62, dwell: '34m' } },
    { id: 'EV04', type: 'ev', row: 1, col: 4, status: 'charging', name: 'EV Fast Bay 4', power: '50kW DC', occupant: { plate: 'EV-992-ER', soc: 45, dwell: '40m' } },
    { id: 'EV05', type: 'ev', row: 1, col: 5, status: 'free', name: 'EV Fast Bay 5', power: '50kW DC', occupant: null },
    { id: 'EV06', type: 'ev', row: 1, col: 6, status: 'reserved', name: 'EV Fast Bay 6', power: '50kW DC', occupant: { plate: 'EV-889-JV', soc: 15, dwell: 'Pre-Booked' } },
    { id: 'R01', type: 'regular', row: 1, col: 7, status: 'occupied', name: 'Regular 01', occupant: { plate: 'ICE-441-SC' } },
    { id: 'R02', type: 'regular', row: 1, col: 8, status: 'free', name: 'Regular 02', occupant: null },
    { id: 'R03', type: 'regular', row: 1, col: 9, status: 'occupied', name: 'Regular 03', occupant: { plate: 'ICE-102-MV' } },
    { id: 'R04', type: 'regular', row: 1, col: 10, status: 'occupied', name: 'Regular 04', occupant: { plate: 'ICE-884-DK' } },

    // Row 2: R05-R14
    { id: 'R05', type: 'regular', row: 2, col: 1, status: 'free', name: 'Regular 05', occupant: null },
    { id: 'R06', type: 'regular', row: 2, col: 2, status: 'occupied', name: 'Regular 06', occupant: { plate: 'ICE-552-KL' } },
    { id: 'R07', type: 'regular', row: 2, col: 3, status: 'occupied', name: 'Regular 07', occupant: { plate: 'ICE-910-TR' } },
    { id: 'R08', type: 'regular', row: 2, col: 4, status: 'free', name: 'Regular 08', occupant: null },
    { id: 'R09', type: 'regular', row: 2, col: 5, status: 'occupied', name: 'Regular 09', occupant: { plate: 'ICE-331-WQ' } },
    { id: 'R10', type: 'regular', row: 2, col: 6, status: 'occupied', name: 'Regular 10', occupant: { plate: 'ICE-774-PO' } },
    { id: 'R11', type: 'regular', row: 2, col: 7, status: 'free', name: 'Regular 11', occupant: null },
    { id: 'R12', type: 'regular', row: 2, col: 8, status: 'occupied', name: 'Regular 12', occupant: { plate: 'ICE-209-BN' } },
    { id: 'R13', type: 'regular', row: 2, col: 9, status: 'occupied', name: 'Regular 13', occupant: { plate: 'ICE-618-XZ' } },
    { id: 'R14', type: 'regular', row: 2, col: 10, status: 'occupied', name: 'Regular 14', occupant: { plate: 'ICE-490-LM' } },

    // Row 3: R15-R24
    { id: 'R15', type: 'regular', row: 3, col: 1, status: 'occupied', name: 'Regular 15', occupant: { plate: 'ICE-712-AA' } },
    { id: 'R16', type: 'regular', row: 3, col: 2, status: 'free', name: 'Regular 16', occupant: null },
    { id: 'R17', type: 'regular', row: 3, col: 3, status: 'occupied', name: 'Regular 17', occupant: { plate: 'ICE-839-BB' } },
    { id: 'R18', type: 'regular', row: 3, col: 4, status: 'occupied', name: 'Regular 18', occupant: { plate: 'ICE-442-CC' } },
    { id: 'R19', type: 'regular', row: 3, col: 5, status: 'occupied', name: 'Regular 19', occupant: { plate: 'ICE-901-DD' } },
    { id: 'R20', type: 'regular', row: 3, col: 6, status: 'free', name: 'Regular 20', occupant: null },
    { id: 'R21', type: 'regular', row: 3, col: 7, status: 'occupied', name: 'Regular 21', occupant: { plate: 'ICE-318-EE' } },
    { id: 'R22', type: 'regular', row: 3, col: 8, status: 'occupied', name: 'Regular 22', occupant: { plate: 'ICE-563-FF' } },
    { id: 'R23', type: 'regular', row: 3, col: 9, status: 'occupied', name: 'Regular 23', occupant: { plate: 'ICE-112-GG' } },
    { id: 'R24', type: 'regular', row: 3, col: 10, status: 'free', name: 'Regular 24', occupant: null }
  ];

  const filteredPreviewSpots = previewSpots.filter(s => {
    if (spotFilter === 'all') return true;
    if (spotFilter === 'available') return s.status === 'free';
    if (spotFilter === 'ev') return s.type === 'ev';
    if (spotFilter === 'regular') return s.type === 'regular';
    if (spotFilter === 'occupied') return s.status === 'occupied' || s.status === 'charging';
    return true;
  });

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveNavSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-[#050811] text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* ------------------------------------------------------------- */}
      {/* 1. FLOATING GLASSMORPHISM NAVIGATION BAR */}
      {/* ------------------------------------------------------------- */}
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 glass-panel rounded-2xl px-4 lg:px-6 py-3 shadow-2xl border border-slate-800/80 transition-all">
        <div className="flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo('hero')}>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-emerald-400 shadow-lg shadow-cyan-500/25 text-slate-950">
              <Zap className="w-5 h-5 fill-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                  ORGANIZED URBAN SYSTEMS
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  SMART EV 2026
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden md:block">
                Software-Driven Smart Parking & Priority EV Allocation
              </p>
            </div>
          </div>

          {/* Center Jump Links */}
          <div className="hidden lg:flex items-center gap-1 text-xs font-semibold text-slate-300">
            <button onClick={() => scrollTo('hero')} className="px-3 py-1.5 rounded-lg hover:text-cyan-400 hover:bg-slate-900/60 transition-colors">
              Facility 3D
            </button>
            <button onClick={() => scrollTo('live-parking')} className="px-3 py-1.5 rounded-lg hover:text-cyan-400 hover:bg-slate-900/60 transition-colors">
              Live Grid
            </button>
            <button onClick={() => scrollTo('driver-guidance')} className="px-3 py-1.5 rounded-lg hover:text-cyan-400 hover:bg-slate-900/60 transition-colors">
              Wayfinding
            </button>
            <button onClick={() => scrollTo('ev-charging')} className="px-3 py-1.5 rounded-lg hover:text-cyan-400 hover:bg-slate-900/60 transition-colors">
              50kW EV Fast
            </button>
            <button onClick={() => scrollTo('incident-reports')} className="px-3 py-1.5 rounded-lg hover:text-cyan-400 hover:bg-slate-900/60 transition-colors">
              Incident Hub
            </button>
            <button onClick={() => scrollTo('urban-impact')} className="px-3 py-1.5 rounded-lg hover:text-cyan-400 hover:bg-slate-900/60 transition-colors">
              Benchmark
            </button>
          </div>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenLogin}
              className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-200 text-xs font-semibold transition-all"
            >
              Sign In
            </button>

            <button
              onClick={onEnterApp}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Enter Smart Parking</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </nav>

      {/* ------------------------------------------------------------- */}
      {/* 2. HERO SECTION — DRAMATIC FULL-SCREEN 3D PARKING FACILITY */}
      {/* ------------------------------------------------------------- */}
      <section id="hero" className="relative min-h-screen pt-28 pb-16 px-4 lg:px-8 flex flex-col justify-center items-center overflow-hidden">
        
        {/* Background Cyber Grid & Radiant Glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-cyan-600/15 via-teal-500/10 to-blue-600/10 blur-[130px] rounded-full" />
          <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full" />
          <svg className="w-full h-full opacity-15" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="hero-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#1E293B" strokeWidth="1" />
                <circle cx="25" cy="25" r="1" fill="#06B6D4" opacity="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#hero-grid)" />
          </svg>
        </div>

        {/* Hero Headline & Subheading */}
        <div className="relative z-10 max-w-4xl text-center space-y-4 mb-8">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/70 text-cyan-300 text-xs font-semibold shadow-lg shadow-cyan-500/10">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Organized Urban Resource Optimization • IDEA Lab</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1]">
            Smart Parking. <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Smarter Cities.
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Intelligent EV parking, real-time occupancy, seamless charging, and faster incident resolution — all in one connected platform.
          </p>

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={onEnterApp}
              className="px-7 py-3.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-cyan-500/30 flex items-center gap-2 transform hover:scale-[1.03] active:scale-[0.98] transition-all"
            >
              <span>Enter Smart Parking</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollTo('live-parking')}
              className="px-6 py-3.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm rounded-xl flex items-center gap-2 transition-all hover:border-cyan-500/60"
            >
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Explore the System</span>
            </button>

            <button
              onClick={onOpenAdmin}
              className="px-5 py-3.5 bg-slate-900/60 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-600 text-slate-300 text-sm font-semibold rounded-xl flex items-center gap-1.5 transition-all"
            >
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Admin Console</span>
            </button>
          </div>

        </div>

        {/* ------------------------------------------------------------- */}
        {/* FUTURISTIC 3D / ISOMETRIC FACILITY SIMULATION CANVAS */}
        {/* ------------------------------------------------------------- */}
        <div className="relative z-10 w-full max-w-5xl glass-panel-glow rounded-3xl p-5 md:p-8 shadow-2xl overflow-hidden border border-cyan-500/30">
          
          {/* Facility Canvas Header Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
              <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-wider font-mono">
                Smart Lot Facility 3D Simulation • 30 Monitored Bays
              </h3>
            </div>

            {/* View Mode Controls */}
            <div className="flex items-center gap-2">
              <div className="p-1 bg-slate-900 border border-slate-800 rounded-xl flex items-center text-xs font-semibold">
                <button
                  onClick={() => setCameraMode('isometric')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    cameraMode === 'isometric' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  3D Isometric View
                </button>
                <button
                  onClick={() => setCameraMode('ortho')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    cameraMode === 'ortho' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  2D Top-Down View
                </button>
              </div>

              <button
                onClick={() => setChaosSimActive(!chaosSimActive)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold border flex items-center gap-1 transition-all ${
                  chaosSimActive 
                    ? 'bg-rose-950 border-rose-500 text-rose-300 animate-pulse' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Simulate EV Charger Fault at EV02"
              >
                <AlertTriangle className="w-3 h-3" />
                <span>{chaosSimActive ? 'Chaos Active' : 'Simulate Fault'}</span>
              </button>
            </div>
          </div>

          {/* 3D Isometric Viewport */}
          <div className="relative w-full h-[400px] md:h-[460px] bg-[#070B14] rounded-2xl overflow-hidden border border-slate-800/90 flex items-center justify-center p-4">
            
            {/* Ambient Facility Glow Lines */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-950/20 via-transparent to-slate-950/80 pointer-events-none" />

            {/* Dynamic Animated 3D Isometric Grid Container */}
            <div className={`w-full max-w-3xl transition-transform duration-700 ${
              cameraMode === 'isometric' ? 'isometric-grid' : 'ortho-grid'
            }`}>
              
              {/* Entrance Gate Gantry */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-dashed border-cyan-500/60 mb-4 px-2">
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-lg bg-cyan-950 border border-cyan-400 text-cyan-300 font-mono text-xs font-bold shadow-[0_0_12px_rgba(6,182,212,0.4)] flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                    ENTRANCE GATE (0, 0)
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                    RFID / Optical ALPR Telemetry
                  </span>
                </div>

                <div className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-[11px] font-mono font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>Central Controller Active</span>
                </div>
              </div>

              {/* ROW 1: Dedicated 50kW EV Fast Chargers (EV01-EV06) + Express Bays */}
              <div className="mb-4">
                <div className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  <span>Row 1: High-Speed 50kW EV Charging Hub (EV01–EV06)</span>
                </div>
                <div className="grid grid-cols-10 gap-2">
                  {previewSpots.slice(0, 10).map((spot) => {
                    const isEV = spot.type === 'ev';
                    const isTarget = spot.id === 'EV01';
                    return (
                      <div
                        key={spot.id}
                        className={`relative p-2 rounded-xl border flex flex-col items-center justify-between min-h-[72px] transition-all transform hover:scale-105 ${
                          spot.status === 'fault'
                            ? 'bg-rose-950/60 border-rose-500 text-rose-300 ring-1 ring-rose-500'
                            : isEV
                              ? spot.status === 'free'
                                ? 'bg-cyan-950/50 border-cyan-500 text-cyan-200 glow-ev-free'
                                : spot.status === 'reserved'
                                  ? 'bg-amber-950/50 border-amber-500 text-amber-200 glow-ev-reserved'
                                  : 'bg-red-950/40 border-red-500 text-red-200 glow-ev-occupied'
                              : spot.status === 'free'
                                ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 glow-reg-free'
                                : 'bg-slate-900/60 border-slate-700 text-slate-400'
                        }`}
                      >
                        <div className="w-full flex justify-between text-[9px] font-mono font-bold">
                          <span>{spot.id}</span>
                          <span>{isEV ? '⚡' : 'P'}</span>
                        </div>
                        <div className="my-0.5">
                          {spot.status === 'fault' ? (
                            <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                          ) : isEV ? (
                            <Zap className={`w-4 h-4 ${spot.status === 'free' ? 'text-cyan-400 animate-pulse' : 'text-red-400'}`} />
                          ) : (
                            <Car className="w-4 h-4 text-emerald-400" />
                          )}
                        </div>
                        <span className="text-[8px] font-mono uppercase truncate">
                          {spot.status}
                        </span>

                        {/* Target Route Marker Indicator */}
                        {isTarget && (
                          <div className="absolute -top-2 -right-1 bg-white text-slate-900 rounded-full p-0.5 shadow-lg animate-bounce">
                            <MapPin className="w-3 h-3 fill-cyan-500 text-cyan-500" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transit Lane Aisle 1 */}
              <div className="h-4 border-y border-dashed border-slate-800 bg-slate-950/50 flex items-center justify-center text-[9px] text-slate-600 font-mono tracking-widest my-2">
                ◄── TRANSIT AISLE 1 ──►
              </div>

              {/* ROW 2: Regular Parking Capacity (R05-R14) */}
              <div className="mb-2">
                <div className="grid grid-cols-10 gap-2">
                  {previewSpots.slice(10, 20).map((spot) => (
                    <div
                      key={spot.id}
                      className={`relative p-2 rounded-xl border flex flex-col items-center justify-between min-h-[64px] ${
                        spot.status === 'free'
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 glow-reg-free'
                          : 'bg-slate-900/60 border-slate-700 text-slate-400'
                      }`}
                    >
                      <div className="w-full flex justify-between text-[9px] font-mono font-bold">
                        <span>{spot.id}</span>
                        <span>P</span>
                      </div>
                      <Car className={`w-3.5 h-3.5 ${spot.status === 'free' ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <span className="text-[8px] font-mono uppercase">{spot.status}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Floating Glass HUD Data Tags */}
            <div className="absolute top-4 right-4 space-y-2 pointer-events-none hidden md:block">
              <div className="glass-panel px-3 py-1.5 rounded-xl border border-cyan-500/40 text-xs text-cyan-300 font-mono animate-float-hud shadow-lg">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block mr-1.5 animate-ping" />
                EV01 — Available (50kW Fast Ready)
              </div>
              <div className="glass-panel px-3 py-1.5 rounded-xl border border-red-500/40 text-xs text-red-300 font-mono animate-float-hud shadow-lg" style={{ animationDelay: '1s' }}>
                <span className="w-2 h-2 rounded-full bg-red-400 inline-block mr-1.5" />
                EV02 — Charging (78% • 18 mins left)
              </div>
              <div className="glass-panel px-3 py-1.5 rounded-xl border border-emerald-500/40 text-xs text-emerald-300 font-mono animate-float-hud shadow-lg" style={{ animationDelay: '2s' }}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1.5" />
                R14 — Occupied (Direct Guidance 1.00)
              </div>
            </div>

            {/* Bottom Floating Telemetry Overlay */}
            <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-300 glass-panel px-4 py-2 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-cyan-400 font-bold">Live Simulation:</span>
                <span>Active Stream (Gate 0,0 &rarr; Bay EV01)</span>
              </div>
              <div className="flex items-center gap-3">
                <span>Avg Distance: <strong className="text-emerald-400">5.13u (−56%)</strong></span>
                <span>Misuse: <strong className="text-cyan-400">0 Events</strong></span>
                <span>Capacity: <strong className="text-amber-400">{lotDensity}%</strong></span>
              </div>
            </div>

          </div>

          {/* Interactive Simulation Controls Under Hero */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Simulated Vehicle Dispatch:</span>
              <button
                onClick={() => setActiveVehicleStep(0)}
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg flex items-center gap-1 shadow-md shadow-cyan-600/20"
              >
                <Play className="w-3 h-3 fill-white" />
                <span>Dispatch Vehicle to Gate</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400">Occupancy Density:</span>
              <input
                type="range"
                min="30"
                max="95"
                value={lotDensity}
                onChange={(e) => setLotDensity(Number(e.target.value))}
                className="w-24 accent-cyan-400"
              />
              <span className="font-mono text-cyan-300 font-bold">{lotDensity}%</span>
            </div>
          </div>

        </div>

        {/* Scroll Indicator */}
        <div className="mt-10 flex flex-col items-center gap-1 cursor-pointer text-slate-500 hover:text-cyan-400 transition-colors" onClick={() => scrollTo('journey')}>
          <span className="text-[11px] font-mono uppercase tracking-widest">Explore Urban Flow Journey</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>

      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. FACILITY TRANSIT JOURNEY TIMELINE */}
      {/* ------------------------------------------------------------- */}
      <section id="journey" className="py-12 px-4 lg:px-8 border-y border-slate-800/80 bg-slate-950/60">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center mb-8">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest font-mono">End-to-End Coordination</span>
            <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
              The Connected Urban Transit Pipeline
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
            
            <div className="p-4 rounded-2xl glass-panel border border-slate-800 hover:border-cyan-500/60 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500 text-cyan-300 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
                1
              </div>
              <h4 className="font-bold text-white">1. City Grid</h4>
              <p className="text-slate-400 text-[11px] mt-1">Driver navigates to parking facility perimeter without cruising downtown.</p>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-slate-800 hover:border-cyan-500/60 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-500 text-cyan-300 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
                2
              </div>
              <h4 className="font-bold text-white">2. Entrance Gate</h4>
              <p className="text-slate-400 text-[11px] mt-1">Optical ALPR & Central Controller instantly calculate vehicle powertrain & SoC.</p>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-slate-800 hover:border-cyan-500/60 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
                3
              </div>
              <h4 className="font-bold text-white">3. Spatial Grid</h4>
              <p className="text-slate-400 text-[11px] mt-1">Optimal bay designated with strict 25% battery EV priority constraint.</p>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-slate-800 hover:border-cyan-500/60 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
                4
              </div>
              <h4 className="font-bold text-white">4. Assigned Spot</h4>
              <p className="text-slate-400 text-[11px] mt-1">Point-to-point turn-by-turn guidance guides driver directly in 1.00 checks.</p>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-slate-800 hover:border-cyan-500/60 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-teal-950 border border-teal-500 text-teal-300 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
                5
              </div>
              <h4 className="font-bold text-white">5. 50kW Charger</h4>
              <p className="text-slate-400 text-[11px] mt-1">Pre-activated charging session with live telemetry and automated billing.</p>
            </div>

            <div className="p-4 rounded-2xl glass-panel border border-slate-800 hover:border-cyan-500/60 transition-all group">
              <div className="w-8 h-8 rounded-xl bg-amber-950 border border-amber-500 text-amber-300 flex items-center justify-center font-bold mb-3 group-hover:scale-110 transition-transform">
                6
              </div>
              <h4 className="font-bold text-white">6. Operations Hub</h4>
              <p className="text-slate-400 text-[11px] mt-1">Incident reporting, hardware fault recovery, and real-time operator audit logs.</p>
            </div>

          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. SECTION 2 — LIVE PARKING ("See Every Spot. In Real Time.") */}
      {/* ------------------------------------------------------------- */}
      <section id="live-parking" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Real-Time Spatial Grid</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              See Every Spot. In Real Time.
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-xl">
              Live multi-state spatial tracking across 30 dedicated bays with distinct EV lightning glyphs and zero-misuse priority enforcement.
            </p>
          </div>

          {/* Spot Category Filters */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
            {['all', 'available', 'ev', 'regular', 'occupied'].map((f) => (
              <button
                key={f}
                onClick={() => setSpotFilter(f)}
                className={`px-3 py-1.5 rounded-xl border transition-all ${
                  spotFilter === f
                    ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-md shadow-cyan-500/20 font-bold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All (30)' : f === 'available' ? 'Available (7)' : f === 'ev' ? '⚡ 50kW EV (6)' : f === 'regular' ? 'Standard Bays (24)' : 'Occupied'}
              </button>
            ))}
          </div>
        </div>

        {/* Live Status KPI Summary Panel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-2xl border border-cyan-900/60">
            <div className="text-xs text-slate-400 font-semibold uppercase">Live Occupancy</div>
            <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">76.7%</div>
            <div className="text-[11px] text-slate-500 mt-0.5">23 / 30 Bays Occupied</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-emerald-900/60">
            <div className="text-xs text-slate-400 font-semibold uppercase">Available Spots</div>
            <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">7 Free</div>
            <div className="text-[11px] text-emerald-400 mt-0.5">2 EV Fast • 5 Regular</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-amber-900/60">
            <div className="text-xs text-slate-400 font-semibold uppercase">EV Chargers Active</div>
            <div className="text-2xl font-bold font-mono text-amber-300 mt-1">4 Active</div>
            <div className="text-[11px] text-slate-400 mt-0.5">50kW DC Fast Output</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-teal-900/60">
            <div className="text-xs text-slate-400 font-semibold uppercase">Current Traffic Flow</div>
            <div className="text-2xl font-bold font-mono text-teal-300 mt-1">Optimal</div>
            <div className="text-[11px] text-teal-400 mt-0.5">1.00 Checks per Vehicle</div>
          </div>
        </div>

        {/* Interactive 30-Spot Grid */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800">
          
          <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2.5">
            {filteredPreviewSpots.map((spot) => {
              const isEV = spot.type === 'ev';
              return (
                <button
                  key={spot.id}
                  onClick={() => setSelectedLiveSpot(spot)}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-between min-h-[96px] text-left transition-all transform hover:scale-105 active:scale-95 ${
                    spot.status === 'fault'
                      ? 'bg-rose-950/40 border-rose-500 text-rose-300'
                      : isEV
                        ? spot.status === 'free'
                          ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 glow-ev-free hover:border-cyan-300'
                          : spot.status === 'reserved'
                            ? 'bg-amber-950/40 border-amber-500 text-amber-200 glow-ev-reserved'
                            : 'bg-red-950/40 border-red-500 text-red-200 glow-ev-occupied'
                        : spot.status === 'free'
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 glow-reg-free'
                          : 'bg-slate-900/60 border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="w-full flex justify-between items-center text-[10px] font-mono font-bold">
                    <span>{spot.id}</span>
                    <span className="px-1 py-0.2 rounded bg-slate-950/80 border border-slate-700">
                      {isEV ? '⚡ EV' : 'P'}
                    </span>
                  </div>

                  <div className="my-1 flex flex-col items-center">
                    {spot.status === 'fault' ? (
                      <AlertTriangle className="w-5 h-5 text-rose-400 animate-bounce" />
                    ) : isEV ? (
                      <Zap className={`w-5 h-5 ${spot.status === 'free' ? 'text-cyan-400 animate-pulse' : 'text-red-400'}`} />
                    ) : (
                      <Car className="w-5 h-5 text-emerald-400" />
                    )}
                    <span className="text-[9px] font-bold uppercase mt-1 tracking-wider">
                      {spot.status}
                    </span>
                  </div>

                  <div className="w-full text-center text-[9px] font-mono truncate text-slate-400">
                    {spot.occupant ? spot.occupant.plate : (isEV ? '50kW Ready' : 'Available')}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Spot Inspector Drawer (If spot selected) */}
          {selectedLiveSpot && (
            <div className="mt-6 p-4 bg-slate-900/90 border border-cyan-500/50 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl border ${
                  selectedLiveSpot.type === 'ev' ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-emerald-950 border-emerald-500 text-emerald-300'
                }`}>
                  {selectedLiveSpot.type === 'ev' ? <Zap className="w-6 h-6" /> : <Car className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{selectedLiveSpot.name} ({selectedLiveSpot.id})</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Type: <strong>{selectedLiveSpot.type === 'ev' ? '50kW High-Speed Fast Charger' : 'Standard Regular Bay'}</strong> • Status: <span className="uppercase text-cyan-300 font-bold">{selectedLiveSpot.status}</span>
                  </p>
                  {selectedLiveSpot.occupant && (
                    <div className="text-xs text-emerald-300 mt-1 font-mono">
                      Occupant: <strong>{selectedLiveSpot.occupant.plate}</strong> {selectedLiveSpot.occupant.soc ? `• ${selectedLiveSpot.occupant.soc}% Battery (Dwell: ${selectedLiveSpot.occupant.dwell})` : ''}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={onEnterApp}
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-xl shadow-md shadow-cyan-600/20"
                >
                  Reserve / Park in Bay {selectedLiveSpot.id}
                </button>
                <button
                  onClick={() => setSelectedLiveSpot(null)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

        </div>

      </section>

      {/* ------------------------------------------------------------- */}
      {/* 5. SECTION 3 — SMART DRIVER GUIDANCE ("From Gate to Spot") */}
      {/* ------------------------------------------------------------- */}
      <section id="driver-guidance" className="py-20 px-4 lg:px-8 border-t border-slate-800/80 bg-slate-950/40">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
              <Compass className="w-3.5 h-3.5" />
              <span>Turn-by-Turn Wayfinding</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              From Gate to Spot, Without the Guesswork.
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Eliminate cruising congestion. Centralized spatial vectors route arriving drivers straight to their reserved charging or parking stall with zero blind searching.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            
            {/* Left: Dynamic Route Visualizer */}
            <div className="glass-panel rounded-2xl p-6 border border-cyan-500/40 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                  <Compass className="w-4 h-4 animate-spin" />
                  Live Navigation Vector: Gate (0,0) &rarr; Bay EV01
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700 font-bold">
                  Distance: 2.12u (Optimal)
                </span>
              </div>

              {/* Wayfinding Route Step Cards */}
              <div className="space-y-3 text-xs">
                
                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold text-xs">
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-white">Entrance Gate Gantry (0, 0)</h5>
                    <p className="text-slate-400 mt-0.5">Optical scanner reads vehicle plate and allocates optimal bay based on 18% critical battery.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-white">Proceed down Row 1 Transit Lane</h5>
                    <p className="text-slate-400 mt-0.5">Drive straight 1.5 units down the illuminated electric-blue lane corridor.</p>
                  </div>
                </div>

                <div className="p-3.5 bg-cyan-950/40 border border-cyan-500 rounded-xl flex items-start gap-3 shadow-lg shadow-cyan-500/10">
                  <div className="w-6 h-6 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center font-bold text-xs">
                    3
                  </div>
                  <div>
                    <h5 className="font-bold text-cyan-300">Park in Bay EV01 (50kW Fast Charging)</h5>
                    <p className="text-slate-300 mt-0.5">Turn into Column 1. Charger pre-activated and pre-reserved for your vehicle session.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Right: Interactive Driver Cockpit Preview Card */}
            <div className="glass-panel-glow rounded-3xl p-6 md:p-8 space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-2xl bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/30">
                    <Compass className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-[10px] text-cyan-400 uppercase font-mono font-bold tracking-wider">Direct Wayfinding Active</div>
                    <h3 className="text-xl font-black text-white">Target Bay: EV01</h3>
                  </div>
                </div>

                {/* 15-Minute Countdown */}
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-mono">Reservation Hold</div>
                  <div className="text-lg font-bold font-mono text-amber-400">14:48</div>
                </div>
              </div>

              {/* Dynamic Live Telemetry Readout */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="text-slate-400">Distance Remaining</div>
                  <div className="text-base font-bold font-mono text-emerald-400 mt-0.5">2.12 units</div>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="text-slate-400">Est. Arrival Time</div>
                  <div className="text-base font-bold font-mono text-cyan-300 mt-0.5">~45 seconds</div>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="text-slate-400">Powertrain</div>
                  <div className="text-base font-bold text-white mt-0.5">⚡ Electric (EV)</div>
                </div>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="text-slate-400">Charger Readiness</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">Pre-Activated</div>
                </div>
              </div>

              <button
                onClick={onEnterApp}
                className="w-full py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2"
              >
                <span>Launch Driver Cockpit in Full App</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>

          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 6. SECTION 4 — EV CHARGING ("Charge Smarter.") */}
      {/* ------------------------------------------------------------- */}
      <section id="ev-charging" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
        
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>50kW Fast Charging Infrastructure</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Charge Smarter.
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Real-time energy telemetry, live battery state monitoring, predictive dwell calculations, and automated kWh cost estimation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left 2 Cols: Interactive Charging Visualization & Particle Stream */}
          <div className="lg:col-span-2 glass-panel rounded-3xl p-6 md:p-8 space-y-6 border border-cyan-500/30">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-950 border border-cyan-400 text-cyan-300 flex items-center justify-center font-bold shadow-lg shadow-cyan-500/20">
                  ⚡
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">50kW DC Fast Charger Terminal #02</h4>
                  <p className="text-xs text-slate-400 font-mono">400V DC Output • 125A Direct Current</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-950 text-emerald-300 border border-emerald-500 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Active Power Flow
              </span>
            </div>

            {/* Visual Energy Particle Stream from Charger to Vehicle */}
            <div className="relative h-32 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between p-6 overflow-hidden">
              
              {/* Charger Station Icon */}
              <div className="flex flex-col items-center z-10">
                <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-500 text-cyan-300 flex items-center justify-center font-bold text-lg shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                  ⚡
                </div>
                <span className="text-[10px] font-mono text-cyan-400 mt-1">50kW PYLON</span>
              </div>

              {/* Animated Energy Flow Stream */}
              <div className="flex-1 mx-6 relative h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-teal-400 to-cyan-500 animate-pulse" />
              </div>

              {/* Vehicle Battery Icon */}
              <div className="flex flex-col items-center z-10">
                <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-500 text-emerald-300 flex items-center justify-center font-bold text-base shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                  {chargerBattery}%
                </div>
                <span className="text-[10px] font-mono text-emerald-400 mt-1">VEHICLE BATTERY</span>
              </div>
            </div>

            {/* Interactive Battery Slider Controls */}
            <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">Simulate Current Battery State (SoC):</span>
                <span className="font-mono font-bold text-cyan-300 text-sm px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-800">
                  {chargerBattery}% {chargerBattery <= 25 ? '(Critical Priority Demand)' : ''}
                </span>
              </div>

              <input
                type="range"
                min="5"
                max="100"
                value={chargerBattery}
                onChange={(e) => setChargerBattery(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span className="text-rose-400">5% (Depleted)</span>
                <span className="text-amber-400">25% (Priority Threshold)</span>
                <span>50%</span>
                <span className="text-emerald-400">100% (Full)</span>
              </div>
            </div>

          </div>

          {/* Right Col: Live Charging Calculation Metrics */}
          <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-4 border border-cyan-900/60 flex flex-col justify-between">
            <div>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-cyan-400 mb-4">
                Telemetry Diagnostics
              </h4>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
                  <div className="text-slate-400">Energy Required to 80%</div>
                  <div className="text-xl font-bold font-mono text-cyan-300 mt-0.5">
                    {chargingEst.energyNeededKwh} kWh
                  </div>
                </div>

                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
                  <div className="text-slate-400">Estimated Dwell Duration</div>
                  <div className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                    ~{chargingEst.chargingTimeMinutes} mins
                  </div>
                </div>

                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
                  <div className="text-slate-400">Estimated Cost (@ {formatINR(PRICING.evChargingPerKwh)}/kWh)</div>
                  <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">
                    {formatINR(chargingEst.costInr)}
                  </div>
                </div>

                <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
                  <div className="text-slate-400">Charger Station Health</div>
                  <div className="text-sm font-bold text-emerald-400 mt-0.5">
                    99.8% Operational (0 Faults)
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={onEnterApp}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700"
            >
              Book 50kW Charger in App
            </button>
          </div>

        </div>

      </section>

      {/* ------------------------------------------------------------- */}
      {/* 7. SECTION 5 — INCIDENT REPORTS ("Problems Reported. Resolved.") */}
      {/* ------------------------------------------------------------- */}
      <section id="incident-reports" className="py-20 px-4 lg:px-8 border-t border-slate-800/80 bg-slate-950/60">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
              <FileText className="w-3.5 h-3.5" />
              <span>Closed-Loop Resolution Engine</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Problems Reported. Problems Resolved.
            </h2>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Rapid incident management pipeline for broken chargers, spot obstructions, wrong parking misuse, and billing queries.
            </p>
          </div>

          {/* 4-Step Resolution Pipeline Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="glass-panel p-4 rounded-2xl border border-cyan-500/40 space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">Step 1</span>
              <h5 className="font-bold text-white text-sm">Customer Reports</h5>
              <p className="text-slate-400 text-[11px]">Instant submission via mobile/web with spot ID & category tagging.</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">Step 2</span>
              <h5 className="font-bold text-white text-sm">Admin Reviews</h5>
              <p className="text-slate-400 text-[11px]">Incident triaged in Central Controller with severity priority score.</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-slate-800 space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">Step 3</span>
              <h5 className="font-bold text-white text-sm">In Progress</h5>
              <p className="text-slate-400 text-[11px]">Automatic traffic rerouting & technician / security warden dispatched.</p>
            </div>

            <div className="glass-panel p-4 rounded-2xl border border-emerald-500/40 space-y-1.5">
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase">Step 4</span>
              <h5 className="font-bold text-white text-sm">Resolved</h5>
              <p className="text-slate-400 text-[11px]">Hardware restored, customer notified, and bay status restored to free.</p>
            </div>
          </div>

          {/* Interactive Incident Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Card 1 */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-cyan-400 font-bold">REP-101</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
                  In Progress
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">Charger Cable Display Glitch at EV02</h4>
              <p className="text-xs text-slate-400">Connector latch timeout when plugging into EV fast charger bay.</p>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-emerald-300">
                <strong>Admin Dispatch:</strong> Remote relay diagnostics run; technician inspecting latch.
              </div>
            </div>

            {/* Card 2 */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition-all space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-cyan-400 font-bold">REP-102</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Resolved
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">Standard Car in EV Bay EV05</h4>
              <p className="text-xs text-slate-400">Non-EV vehicle blocked charger while arriving EV had 12% critical SoC.</p>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-emerald-300">
                <strong>Resolution:</strong> Security warden rerouted ICE car to Row 2 spot R08. EV05 clear.
              </div>
            </div>

            {/* Card 3 */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-mono text-cyan-400 font-bold">REP-103</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-950 text-amber-300 border border-amber-800">
                  Pending Review
                </span>
              </div>
              <h4 className="font-bold text-white text-sm">Automated Billing Rate Discrepancy</h4>
              <p className="text-xs text-slate-400">Requesting breakdown of energy kWh rate vs dwell fee on invoice.</p>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[11px] text-slate-400">
                <strong>Status:</strong> Queued for finance officer review.
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 8. SECTION 6 — URBAN IMPACT & BENCHMARK HIGHLIGHTS */}
      {/* ------------------------------------------------------------- */}
      <section id="urban-impact" className="py-20 px-4 lg:px-8 max-w-7xl mx-auto space-y-8">
        
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500 text-cyan-300 text-xs font-semibold">
            <Award className="w-3.5 h-3.5 text-cyan-400" />
            <span>150-Vehicle Standard Benchmark Verification</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            The Urban Efficiency Revolution
          </h2>
          <p className="text-sm sm:text-base text-slate-400">
            Comparing decentralized random-search parking against centralized algorithmic coordination across 150 simulated vehicle arrivals.
          </p>
        </div>

        {/* 5 Core Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          
          <div className="glass-panel p-4 rounded-2xl border border-cyan-900/60 shadow-lg text-left">
            <div className="text-xs text-slate-400 font-semibold uppercase">Search Distance</div>
            <div className="text-2xl font-bold font-mono text-white mt-1">5.13u</div>
            <div className="text-xs text-emerald-400 font-semibold mt-1 flex items-center gap-1">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>−56% Cruising Cut</span>
            </div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-emerald-900/60 shadow-lg text-left">
            <div className="text-xs text-slate-400 font-semibold uppercase">Spots Checked / Car</div>
            <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">1.00</div>
            <div className="text-xs text-emerald-400 font-semibold mt-1">Zero Blind Circling</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-cyan-900/60 shadow-lg text-left">
            <div className="text-xs text-slate-400 font-semibold uppercase">Charger Misuse</div>
            <div className="text-2xl font-bold font-mono text-cyan-300 mt-1">0 Events</div>
            <div className="text-xs text-cyan-400 font-semibold mt-1">100% Misuse Elimination</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-amber-900/60 shadow-lg text-left">
            <div className="text-xs text-slate-400 font-semibold uppercase">Critical EV Access</div>
            <div className="text-2xl font-bold font-mono text-amber-300 mt-1">13 / 54</div>
            <div className="text-xs text-amber-400 font-semibold mt-1">+86% Charger Throughput</div>
          </div>

          <div className="glass-panel p-4 rounded-2xl border border-teal-900/60 shadow-lg text-left">
            <div className="text-xs text-slate-400 font-semibold uppercase">CO₂ Emissions Saved</div>
            <div className="text-2xl font-bold font-mono text-teal-300 mt-1">~50%</div>
            <div className="text-xs text-teal-400 font-semibold mt-1">1.98 kg CO₂ / Batch Saved</div>
          </div>

        </div>

        {/* City Scale Projection Box */}
        <div className="glass-panel-glow rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-emerald-500/40">
          <div className="space-y-2">
            <span className="text-xs font-mono text-emerald-400 font-bold uppercase">Macro Urban Scale Extrapolation</span>
            <h3 className="text-xl md:text-2xl font-black text-white">
              18.2 Metric Tons of CO₂ Saved Annually
            </h3>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl">
              In a standard 500-spot commercial parking structure servicing 4,000 cars daily, central software coordination eliminates 18.2 tons of carbon emissions and thousands of gallons of wasted fuel without laying concrete.
            </p>
          </div>

          <button
            onClick={onEnterApp}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/25 shrink-0"
          >
            Launch System Dashboard
          </button>
        </div>

      </section>

      {/* ------------------------------------------------------------- */}
      {/* 9. CONVERSION FOOTER CTA */}
      {/* ------------------------------------------------------------- */}
      <footer className="border-t border-slate-800 bg-[#070B14] py-16 px-4 lg:px-8 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="glass-panel p-8 md:p-12 rounded-3xl text-center space-y-6 border border-cyan-500/40 shadow-2xl relative overflow-hidden">
            <div className="max-w-2xl mx-auto space-y-3">
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Ready to Experience Next-Generation Urban Parking?
              </h2>
              <p className="text-sm text-slate-300">
                Sign in to book a high-speed EV charging bay, navigate direct turn-by-turn routes, or access administrative central controls.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={onEnterApp}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 text-white font-extrabold text-sm rounded-xl shadow-xl shadow-cyan-500/25 flex items-center gap-2"
              >
                <span>Enter Smart Parking Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onOpenAdmin}
                className="px-7 py-4 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm rounded-xl flex items-center gap-2"
              >
                <Shield className="w-4 h-4 text-emerald-400" />
                <span>Admin Passcode Console</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800/80 pt-6">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white">Organized Urban Systems</span>
              <span>• IDEA Lab — Department of Computer Engineering</span>
            </div>
            <div>
              <span>Benchmark Dataset: 150 Vehicles • 30-Spot Spatial Grid</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
