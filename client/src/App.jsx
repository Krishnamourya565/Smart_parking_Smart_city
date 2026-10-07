import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Car, 
  Shield, 
  Layers, 
  Activity, 
  Sparkles, 
  Presentation, 
  RotateCcw, 
  Users, 
  Compass, 
  Radio, 
  AlertCircle,
  LogIn,
  LogOut,
  Sliders,
  CheckCircle2,
  Cpu,
  User,
  FileText,
  HelpCircle,
  Lock,
  ChevronRight,
  Home,
  MapPin,
  Map as MapIcon,
  History
} from 'lucide-react';

import LandingPage from './components/LandingPage';
import LoginModal from './components/LoginModal';
import ParkingGridMap from './components/ParkingGridMap';
import ParkingMap from './components/ParkingMap';
import AnalyticsPanel from './components/AnalyticsPanel';
import SimulationControl from './components/SimulationControl';
import LiveArrivalFeed from './components/LiveArrivalFeed';
import DriverGuidanceView from './components/DriverGuidanceView';
import CustomerDirectoryPanel from './components/CustomerDirectoryPanel';
import ReportsPanel from './components/ReportsPanel';
import PresentationModal from './components/PresentationModal';
import CheckoutModal from './components/CheckoutModal';
import SessionHistoryModal from './components/SessionHistoryModal';
import { BENCHMARK_METRICS } from './utils/constants';

export default function App() {
  const [spots, setSpots] = useState([]);
  const [reports, setReports] = useState([]);
  const [parkingSessions, setParkingSessions] = useState([]);
  const [activeUsers, setActiveUsers] = useState({ totalLoggedIn: 3, activeDriversSeeking: 2, adminSessions: 1 });
  const [arrivals, setArrivals] = useState([]);
  const [currentMode, setCurrentMode] = useState('smart'); // 'smart' | 'random'
  const [chaosActive, setChaosActive] = useState(false);
  const [assignedSpotId, setAssignedSpotId] = useState(null);
  const [activeRoute, setActiveRoute] = useState(null);
  const [activeDriverAllocation, setActiveDriverAllocation] = useState(null);
  
  // Navigation & View Mode
  // 'landing' | 'app'
  const [viewMode, setViewMode] = useState('landing'); 
  
  // User Authentication State
  const [currentUser, setCurrentUser] = useState(null); 
  const [currentSession, setCurrentSession] = useState(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [initialAuthMode, setInitialAuthMode] = useState('customer_login');
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSessionHistoryOpen, setIsSessionHistoryOpen] = useState(false);
  const [checkoutTargetSession, setCheckoutTargetSession] = useState(null);

  // Active View Tab inside the System Dashboard
  // For Admin: 'map' | 'customers' | 'analytics' | 'reports'
  // For Customer: 'guidance' | 'map' | 'reports'
  const [activeTab, setActiveTab] = useState('map');

  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Initial Data Fetching
  const fetchState = async () => {
    try {
      const [spotsRes, usersRes, reportsRes, sessionsRes] = await Promise.all([
        fetch('/api/spots'),
        fetch('/api/users/active'),
        fetch('/api/reports?role=admin'),
        fetch('/api/parking-sessions/active?role=admin')
      ]);

      if (spotsRes.ok) {
        const spotsData = await spotsRes.json();
        setSpots(spotsData.spots || []);
      }
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setActiveUsers(usersData.data || {});
      }
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData.reports || []);
      }
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json();
        setParkingSessions(sessionsData.sessions || []);
      }
    } catch (err) {
      console.warn('Backend connection note:', err);
    }
  };

  useEffect(() => {
    fetchState();
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, []);

  // Open Checkout Modal
  const handleOpenCheckout = (session = null) => {
    const target = session || userActiveSession || parkingSessions[0];
    setCheckoutTargetSession(target);
    setIsCheckoutModalOpen(true);
  };

  // Confirm Checkout Handler
  const handleConfirmCheckout = async (sessionId) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/parking-sessions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      const data = await res.json();
      if (data.success) {
        setIsCheckoutModalOpen(false);
        await fetchState();
        showNotification(`🚗 Checkout Confirmed for Session #${sessionId}! Please proceed to North Exit Gate (120m).`);
      } else {
        showNotification(data.message || 'Error processing checkout.', 'error');
      }
    } catch (err) {
      showNotification('Error contacting checkout server.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Admin Simulate Vehicle Exit
  const handleAdminSimulateExit = async (sessionId) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/parking-sessions/${sessionId}/verify-exit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data.success) {
        await fetchState();
        showNotification(`✓ Exit Verified! Spot ${data.session.spotId} is now AVAILABLE. Live occupancy updated.`);
      } else {
        showNotification(data.message || 'Error verifying exit.', 'error');
      }
    } catch (err) {
      showNotification('Error contacting exit verification server.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Admin Simulate 100% Charging Complete
  const handleAdminSimulateChargingComplete = async (sessionId = 'PARK-1024') => {
    try {
      const res = await fetch(`/api/parking-sessions/${sessionId}/update-charging`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chargerStatus: 'CHARGING_COMPLETE', batteryLevel: 100 })
      });
      const data = await res.json();
      if (data.success) {
        await fetchState();
        showNotification(`⚡ Spot ${data.session.spotId} Charger set to CHARGING_COMPLETE (100%). Spot remains occupied.`);
      }
    } catch (err) {
      showNotification('Error updating charging status.', 'error');
    }
  };

  // 2. Customer Login Handler
  const handleCustomerLogin = async (user, session) => {
    setCurrentUser({ ...user, role: 'customer' });
    setCurrentSession(session);
    setIsLoginOpen(false);
    setViewMode('app');
    setActiveTab('guidance');
    showNotification(`Welcome, ${user.name}! Account authenticated.`);
    
    // Automatically evaluate spot allocation for customer
    handleRequestCustomerAllocation(user, session);
  };

  // 3. Customer Register Handler
  const handleCustomerRegister = async (user, session) => {
    setCurrentUser({ ...user, role: 'customer' });
    setCurrentSession(session);
    setIsLoginOpen(false);
    setViewMode('app');
    setActiveTab('guidance');
    showNotification(`Account created successfully! Welcome, ${user.name}.`);
    
    // Automatically evaluate spot allocation
    handleRequestCustomerAllocation(user, session);
  };

  // 4. Admin Login Handler
  const handleAdminLogin = async (user, session) => {
    setCurrentUser({ ...user, role: 'admin' });
    setCurrentSession(session);
    setIsLoginOpen(false);
    setViewMode('app');
    setActiveTab('map');
    showNotification('System Administrator authenticated. Full Controller & Reports unlocked.');
  };

  // 5. Logout Handler
  const handleLogout = async () => {
    if (currentSession?.id) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId: currentSession.id })
        });
      } catch (e) {}
    }
    setCurrentUser(null);
    setCurrentSession(null);
    setActiveDriverAllocation(null);
    setAssignedSpotId(null);
    setActiveRoute(null);
    setViewMode('landing');
    fetchState();
    showNotification('You have been logged out.');
  };

  // 6. Request Allocation for Customer
  const handleRequestCustomerAllocation = async (user = currentUser, session = currentSession) => {
    if (!user) return;
    setIsLoading(true);
    try {
      const isEV = user.vehicleType === 'EV';
      const arriveRes = await fetch('/api/vehicles/arrive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: user.vehiclePlate || 'EV-DEMO',
          customerId: user.id,
          isEV,
          batteryLevel: isEV ? (user.batteryLevel || 20) : null,
          mode: currentMode,
          reserveSpot: true,
          sessionId: session?.id
        })
      });

      const arriveData = await arriveRes.json();

      if (arriveData.success && arriveData.allocation) {
        const spot = arriveData.allocation.assignedSpot;
        setAssignedSpotId(spot.id);
        setActiveRoute(arriveData.allocation.route);
        setActiveDriverAllocation({
          ...arriveData.allocation,
          batteryLevel: user.batteryLevel,
          vehicleId: user.vehiclePlate,
          isEV
        });
        setSpots(arriveData.spots || []);
        setActiveUsers(arriveData.activeUsers || activeUsers);
        setActiveTab('guidance');
        showNotification(`Spot ${spot.id} assigned directly! Distance from Gate: ${spot.distanceFromGate} units.`);
      } else {
        showNotification(arriveData.message || 'Allocation failed.', 'error');
      }
    } catch (err) {
      showNotification('Error communicating with allocation engine.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 7. Admin-Only Simulation & Vehicle Dispatch
  const handleSimulateArrival = async (vehicleParams) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/vehicles/arrive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...vehicleParams,
          mode: currentMode
        })
      });
      const data = await res.json();
      if (data.success) {
        setSpots(data.spots);
        setActiveUsers(data.activeUsers);
        setAssignedSpotId(data.allocation.assignedSpot.id);
        setActiveRoute(data.allocation.route);
        
        setArrivals(prev => [{
          id: `arr_${Date.now()}`,
          timestamp: new Date().toISOString(),
          vehicleId: vehicleParams.vehicleId,
          isEV: vehicleParams.isEV,
          batteryLevel: vehicleParams.batteryLevel,
          assignedSpotId: data.allocation.assignedSpot.id,
          assignedSpotType: data.allocation.assignedSpot.type,
          mode: currentMode,
          distanceTraveled: data.allocation.distanceTraveled,
          spotsChecked: data.allocation.spotsChecked,
          misuseOccurred: data.allocation.misuseOccurred,
          priorityAssigned: data.allocation.priorityAssigned,
          status: 'Parked'
        }, ...prev.slice(0, 30)]);

        showNotification(`Vehicle ${vehicleParams.vehicleId} allocated to ${data.allocation.assignedSpot.id}`);
      } else {
        showNotification(data.message || 'Arrival allocation failed.', 'error');
      }
    } catch (err) {
      showNotification('Error communicating with allocation engine.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 8. Admin-Only 150-Vehicle Batch Simulation
  const handleRunBatchSimulation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchSize: 150 })
      });
      const data = await res.json();
      if (data.success) {
        const sampleFeed = data.data.results.organized.liveSample.map((item, idx) => ({
          id: `batch_${idx}`,
          timestamp: new Date().toISOString(),
          vehicleId: item.vehicleId,
          isEV: item.isEV,
          batteryLevel: item.batteryLevel,
          assignedSpotId: item.assignedSpotId,
          assignedSpotType: item.assignedSpotType,
          mode: currentMode,
          distanceTraveled: item.distanceTraveled,
          spotsChecked: item.spotsChecked,
          misuseOccurred: item.misuseOccurred,
          priorityAssigned: item.isEV && item.batteryLevel <= 25,
          status: 'Batch Processed'
        }));
        setArrivals(sampleFeed);
        await fetchState();
        showNotification('150-Vehicle Batch Benchmark Run Complete! Benchmark data updated.');
      }
    } catch (err) {
      showNotification('Error running batch simulation.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // 9. Admin-Only Chaos Mode
  const handleChaosToggle = async (active) => {
    setChaosActive(active);
    try {
      await Promise.all([
        fetch('/api/spots/EV02/fault', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isFaulty: active })
        }),
        fetch('/api/spots/EV04/fault', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isFaulty: active })
        })
      ]);
      await fetchState();
      showNotification(
        active 
          ? 'Chaos Mode Triggered: Charger faults simulated on EV02 & EV04. Central Controller rerouting traffic.'
          : 'Chaos Mode Cleared: Charger hardware restored to operational status.'
      );
    } catch (err) {
      showNotification('Error toggling chaos mode.', 'error');
    }
  };

  // 10. Admin-Only Manual Spot Override
  const handleManualOverride = async (spotId, newStatus) => {
    try {
      const res = await fetch(`/api/spots/${spotId}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setSpots(data.spots);
        showNotification(`Spot ${spotId} set to status: ${newStatus}`);
      }
    } catch (err) {
      showNotification('Error updating spot override.', 'error');
    }
  };

  // 11. Admin-Only Reset Lot
  const handleResetLot = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setSpots(data.spots);
        setActiveUsers(data.activeUsers);
        setArrivals([]);
        setAssignedSpotId(null);
        setActiveRoute(null);
        setActiveDriverAllocation(null);
        setChaosActive(false);
        showNotification('System reset: 30 spots cleared, active counters reset.');
      }
    } catch (err) {
      showNotification('Error resetting lot state.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  const userActiveSession = parkingSessions.find(s => 
    (currentUser?.id && s.customerId === currentUser.id) ||
    (currentUser?.vehiclePlate && s.vehiclePlate === currentUser.vehiclePlate)
  ) || (currentUser?.role === 'customer' ? parkingSessions.find(s => s.status !== 'COMPLETED') : null);

  // -------------------------------------------------------------
  // VIEW MODE 1: LANDING PAGE
  // -------------------------------------------------------------
  if (viewMode === 'landing') {
    return (
      <>
        {/* Toast Notification Alert */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce ${
            notification.type === 'error'
              ? 'bg-rose-950 border-rose-600 text-rose-200'
              : 'bg-emerald-950 border-emerald-500 text-emerald-200'
          }`}>
            {notification.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
            <span>{notification.message}</span>
          </div>
        )}

        <LandingPage
          onEnterApp={() => {
            if (currentUser) {
              setViewMode('app');
            } else {
              setInitialAuthMode('customer_login');
              setIsLoginOpen(true);
            }
          }}
          onOpenLogin={() => {
            setInitialAuthMode('customer_login');
            setIsLoginOpen(true);
          }}
          onOpenAdmin={() => {
            setInitialAuthMode('admin_login');
            setIsLoginOpen(true);
          }}
        />

        {/* Login Modal */}
        <LoginModal
          isOpen={isLoginOpen}
          initialAuthMode={initialAuthMode}
          onClose={() => setIsLoginOpen(false)}
          activeUsers={activeUsers}
          onCustomerLogin={handleCustomerLogin}
          onCustomerRegister={handleCustomerRegister}
          onAdminLogin={handleAdminLogin}
        />

        {/* Presentation Slide Deck Modal */}
        <PresentationModal
          isOpen={isPresentationOpen}
          onClose={() => setIsPresentationOpen(false)}
        />
      </>
    );
  }

  // -------------------------------------------------------------
  // VIEW MODE 2: SYSTEM DASHBOARD (APP VIEW)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Toast Notification Alert */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl border shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce ${
          notification.type === 'error'
            ? 'bg-rose-950 border-rose-600 text-rose-200'
            : 'bg-emerald-950 border-emerald-500 text-emerald-200'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Main Navigation Bar */}
      <header className="bg-[#0B1120]/95 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md px-4 lg:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Logo & Switch back to Landing */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('landing')}
              className="p-2 bg-gradient-to-tr from-cyan-600 to-emerald-500 rounded-xl shadow-lg shadow-cyan-500/20 text-white hover:scale-105 transition-transform"
              title="Return to Landing Page"
            >
              <Zap className="w-5 h-5 fill-white" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm md:text-base font-bold text-white tracking-tight">
                  Organized Urban Systems
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {isAdmin ? 'ADMIN CONTROL' : 'CUSTOMER PORTAL'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Department of Computer Engineering • IDEA Lab 2026
              </p>
            </div>
          </div>

          {/* Role-Specific Navigation Tabs & Profile Controls */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Landing Page Button */}
            <button
              onClick={() => setViewMode('landing')}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
            >
              <Home className="w-3.5 h-3.5 text-cyan-400" />
              <span>Landing Page</span>
            </button>

            {/* Active Sessions Counter Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-300">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-mono font-bold text-white">{activeUsers?.totalLoggedIn || 3}</span>
              <span className="text-slate-400">Online</span>
            </div>

            {/* ADMIN NAVIGATION TABS */}
            {isAdmin ? (
              <div className="p-1 bg-slate-900 border border-slate-800 rounded-xl flex items-center text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('map')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'map' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Spatial Grid
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('gps_map')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    activeTab === 'gps_map' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Live GPS Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('analytics')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'analytics' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Benchmark Suite
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('customers')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    activeTab === 'customers' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Customers</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reports')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                    activeTab === 'reports' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Reports</span>
                </button>
              </div>
            ) : (
              /* CUSTOMER NAVIGATION TABS */
              <div className="p-1 bg-slate-900 border border-slate-800 rounded-xl flex items-center text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('guidance')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'guidance' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>My Guidance</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('gps_map')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'gps_map' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Live GPS Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('map')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    activeTab === 'map' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Lot Grid
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('reports')}
                  className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                    activeTab === 'reports' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Submit Report</span>
                </button>
              </div>
            )}

            {/* Session History Modal Button */}
            <button
              type="button"
              onClick={() => setIsSessionHistoryOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-cyan-400" />
              <span>Session History</span>
            </button>

            {/* Slide Deck Presentation Modal Button */}
            <button
              type="button"
              onClick={() => setIsPresentationOpen(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Slide Deck</span>
            </button>

            {/* User Profile Pill & Log Out */}
            {currentUser && (
              <div className="flex items-center gap-2 pl-1">
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-700/80 rounded-xl text-xs">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    isAdmin ? 'bg-emerald-950 text-emerald-300 border border-emerald-500' : 'bg-cyan-950 text-cyan-300 border border-cyan-500'
                  }`}>
                    {isAdmin ? '🛡️' : (currentUser.name ? currentUser.name[0] : 'U')}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="font-bold text-white truncate max-w-[110px]">{currentUser.name || 'User'}</div>
                    <div className="text-[10px] text-cyan-400 font-mono">
                      {isAdmin ? 'Administrator' : `${currentUser.vehiclePlate || 'EV'}`}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="p-2 bg-slate-900 hover:bg-rose-950 border border-slate-800 hover:border-rose-800 text-slate-400 hover:text-rose-400 rounded-xl transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

          </div>
        </div>
      </header>

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 space-y-6">
        
        {/* TAB: REPORTS SECTION (CUSTOMER SUBMIT + ADMIN REVIEW) */}
        {activeTab === 'reports' && (
          <ReportsPanel
            currentUser={currentUser}
            isAdmin={isAdmin}
          />
        )}

        {/* TAB: ADMIN-ONLY CUSTOMER DIRECTORY & LOGIN AUDIT */}
        {isAdmin && activeTab === 'customers' && (
          <CustomerDirectoryPanel
            onSelectCustomerForParking={(cust) => {
              handleRequestCustomerAllocation(cust);
            }}
          />
        )}

        {/* TAB: ADMIN-ONLY BENCHMARK EVALUATION SUITE */}
        {isAdmin && activeTab === 'analytics' && (
          <div className="space-y-6">
            <AnalyticsPanel />
          </div>
        )}

        {/* TAB: CUSTOMER-ONLY DRIVER GUIDANCE COCKPIT */}
        {!isAdmin && activeTab === 'guidance' && (
          <div className="space-y-6">
            {currentUser && (
              <div className="p-4 bg-gradient-to-r from-cyan-950/70 via-slate-900 to-cyan-950/70 border border-cyan-500/70 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-cyan-500 text-slate-950 rounded-xl font-bold">
                    {currentUser.vehicleType === 'EV' ? <Zap className="w-6 h-6 fill-slate-950" /> : <Car className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">Driver Portal Profile</div>
                    <h3 className="text-base font-bold text-white">
                      {currentUser.name} • <span className="font-mono text-cyan-300">{currentUser.vehiclePlate}</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Powertrain: <strong>{currentUser.vehicleType === 'EV' ? `Electric Vehicle (${currentUser.batteryLevel}% Battery)` : 'Standard ICE'}</strong>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenCheckout(userActiveSession)}
                    className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 text-slate-950 font-black rounded-xl text-xs shadow-lg shadow-cyan-500/25 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <span>🚗 Check Out</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRequestCustomerAllocation(currentUser)}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Compass className="w-4 h-4 text-cyan-400" />
                    <span>Re-Route Spot</span>
                  </button>
                </div>
              </div>
            )}

            <DriverGuidanceView
              allocationData={activeDriverAllocation || (userActiveSession ? {
                assignedSpot: spots.find(s => s.id === userActiveSession.spotId) || { id: userActiveSession.spotId, name: `Bay ${userActiveSession.spotId}`, type: userActiveSession.spotType, row: 1, col: 2 },
                distanceTraveled: 3.5,
                isEV: userActiveSession.spotType === 'ev',
                batteryLevel: userActiveSession.batteryLevel
              } : null)}
              parkingSession={userActiveSession}
              spots={spots}
              reports={reports}
              currentUser={currentUser}
              onParkVehicle={() => {
                showNotification('Vehicle confirmed parked in assigned bay!');
                setActiveTab('gps_map');
              }}
              onOpenCheckoutModal={() => handleOpenCheckout(userActiveSession)}
              onContinueParking={() => {
                showNotification('Parking duration extended. Standard dwell rate applies.');
              }}
              onOpenReportGateFault={() => {
                setActiveTab('reports');
                showNotification('Switched to Reports Hub to report Gate Issue.');
              }}
              onViewSessionHistory={() => setIsSessionHistoryOpen(true)}
              onBackToDashboard={() => setActiveTab('gps_map')}
            />
          </div>
        )}

        {/* TAB: INTERACTIVE GPS MAP (LEAFLET + OPENSTREETMAP) */}
        {activeTab === 'gps_map' && (
          <div className="space-y-6">
            <ParkingMap
              spots={spots}
              assignedSpotId={assignedSpotId}
              activeRoute={activeRoute}
              reports={reports}
              currentUser={currentUser}
              isAdmin={isAdmin}
              onReserveSpot={(spot) => {
                if (currentUser) {
                  handleRequestCustomerAllocation(currentUser);
                } else {
                  setInitialAuthMode('customer_login');
                  setIsLoginOpen(true);
                }
              }}
              onToggleFault={(spotId, isFaulty) => {
                if (isAdmin) {
                  fetch(`/api/spots/${spotId}/fault`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isFaulty })
                  }).then(() => fetchState());
                }
              }}
            />
          </div>
        )}

        {/* TAB: SPATIAL GRID MAP (ADMIN & CUSTOMER) */}
        {activeTab === 'map' && (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: 30-Spot Spatial Parking Map */}
              <div className="xl:col-span-2">
                <ParkingGridMap
                  spots={spots}
                  activeRoute={activeRoute}
                  assignedSpotId={assignedSpotId}
                  onToggleFault={(spotId, isFaulty) => {
                    if (isAdmin) {
                      fetch(`/api/spots/${spotId}/fault`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ isFaulty })
                      }).then(() => fetchState());
                    }
                  }}
                  onManualOverride={isAdmin ? handleManualOverride : null}
                  isAdmin={isAdmin}
                />
              </div>

              {/* Right Col: Live Arrival Feed */}
              <div className="flex flex-col h-full">
                <LiveArrivalFeed arrivals={arrivals} />
              </div>
            </div>

            {/* Admin-ONLY Central Controller & Simulation Testing Lab */}
            {isAdmin && (
              <div className="space-y-6 pt-2">
                <SimulationControl
                  currentMode={currentMode}
                  onModeToggle={(mode) => {
                    setCurrentMode(mode);
                    showNotification(`Engine switched to: ${mode === 'smart' ? 'Smart Organized Allocation' : 'Random Baseline (Unorganized)'}`);
                  }}
                  onRunBatchSimulation={handleRunBatchSimulation}
                  onResetLot={handleResetLot}
                  onSimulateArrival={handleSimulateArrival}
                  onChaosToggle={handleChaosToggle}
                  chaosActive={chaosActive}
                  activeCheckoutSessions={parkingSessions.filter(s => s.status === 'CHECKOUT_REQUESTED' || s.status === 'APPROACHING_EXIT')}
                  onSimulateExit={handleAdminSimulateExit}
                  onSimulateChargingComplete={handleAdminSimulateChargingComplete}
                  isLoading={isLoading}
                />

                {/* Benchmark Suite Charts on Map Page for Admin */}
                <AnalyticsPanel />
              </div>
            )}
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-[#0B1120] border-t border-slate-800/80 py-5 px-4 text-xs text-slate-500 text-center">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Organized Urban Systems: Software-Driven Smart Parking & Priority EV Allocation</span>
          <span>IDEA Lab • Dept. of Computer Engineering • Benchmark: 150 Vehicles</span>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        isOpen={isLoginOpen}
        initialAuthMode={initialAuthMode}
        onClose={() => setIsLoginOpen(false)}
        activeUsers={activeUsers}
        onCustomerLogin={handleCustomerLogin}
        onCustomerRegister={handleCustomerRegister}
        onAdminLogin={handleAdminLogin}
      />

      <PresentationModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
      />

      {/* Checkout Invoice Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        session={checkoutTargetSession || userActiveSession || parkingSessions[0]}
        onClose={() => setIsCheckoutModalOpen(false)}
        onConfirmCheckout={handleConfirmCheckout}
        isLoading={isLoading}
      />

      {/* Session History Modal */}
      <SessionHistoryModal
        isOpen={isSessionHistoryOpen}
        onClose={() => setIsSessionHistoryOpen(false)}
        currentUser={currentUser}
        isAdmin={isAdmin}
      />

    </div>
  );
}
