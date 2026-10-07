import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Car, 
  Shield, 
  Clock, 
  DollarSign, 
  BatteryMedium, 
  Users, 
  ChevronRight, 
  Activity, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  User,
  Mail,
  Phone,
  UserPlus,
  LogIn,
  KeyRound,
  Sparkles,
  X
} from 'lucide-react';
import { calculateChargingEstimate } from '../utils/constants';

export default function LoginModal({ 
  isOpen, 
  onClose, 
  initialAuthMode = 'customer_login',
  activeUsers, 
  onCustomerLogin,
  onCustomerRegister,
  onAdminLogin,
  onGuestDriverLogin 
}) {
  const [authMode, setAuthMode] = useState(initialAuthMode); // 'customer_login' | 'customer_register' | 'admin_login'

  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialAuthMode || 'customer_login');
      setErrorMessage('');
    }
  }, [isOpen, initialAuthMode]);
  
  // Customer Login Form State
  const [customerIdentifier, setCustomerIdentifier] = useState('alex.johnson@example.com');
  const [customerPassword, setCustomerPassword] = useState('password123');

  // Customer Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPlate, setRegPlate] = useState('');
  const [regType, setRegType] = useState('EV');
  const [regBattery, setRegBattery] = useState(18);
  const [regPassword, setRegPassword] = useState('password123');

  // Admin Form State
  const [adminPasscode, setAdminPasscode] = useState('admin123');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Preset demo accounts for quick evaluation
  const demoAccounts = [
    { label: 'Alex (Critical EV 18%)', identifier: 'alex.johnson@example.com', type: 'EV', plate: 'EV-702-NX', battery: 18 },
    { label: 'Sarah (Standard ICE)', identifier: 'sarah.c@example.com', type: 'Non-EV', plate: 'ICE-441-SC', battery: null },
    { label: 'Priya (Normal EV 65%)', identifier: 'priya.sharma@example.com', type: 'EV', plate: 'EV-319-PS', battery: 65 },
    { label: 'David (Standard ICE)', identifier: 'david.kim@example.com', type: 'Non-EV', plate: 'ICE-884-DK', battery: null }
  ];

  const handleDemoSelect = (acc) => {
    setCustomerIdentifier(acc.identifier);
    setCustomerPassword('password123');
    setErrorMessage('');
  };

  const handleCustomerLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: customerIdentifier,
          password: customerPassword,
          role: 'customer'
        })
      });
      const data = await res.json();
      if (data.success) {
        onCustomerLogin(data.user, data.session);
      } else {
        setErrorMessage(data.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setErrorMessage('Failed to connect to authentication service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCustomerRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          phone: regPhone,
          vehiclePlate: regPlate,
          vehicleType: regType,
          batteryLevel: regType === 'EV' ? regBattery : null,
          password: regPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        onCustomerRegister(data.user, data.session);
      } else {
        setErrorMessage(data.message || 'Registration failed.');
      }
    } catch (err) {
      setErrorMessage('Failed to connect to registration service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: 'admin',
          password: adminPasscode,
          role: 'admin'
        })
      });
      const data = await res.json();
      if (data.success) {
        onAdminLogin(data.user, data.session);
      } else {
        setErrorMessage(data.message || 'Invalid admin passcode.');
      }
    } catch (err) {
      setErrorMessage('Failed to authenticate admin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md transition-all animate-fade-in"
      onClick={onClose}
    >
      {/* Animated SVG Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1E293B" strokeWidth="1" />
              <circle cx="30" cy="30" r="1.5" fill="#06B6D4" opacity="0.6" />
              <circle cx="15" cy="45" r="1" fill="#10B981" opacity="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        </svg>
      </div>

      {/* Main Modal Card */}
      <div 
        className="relative w-full max-w-xl bg-[#0B1120] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Glowing Header Accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-emerald-500 to-cyan-500 animate-pulse" />

        <div className="p-6 md:p-8">
          
          {/* Header Title & Close / Cancel Button */}
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-cyan-400 mb-1">
                <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                IDEA Lab Smart Urban System
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Urban Resource Access Portal
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-700/60 rounded-full text-xs text-slate-300">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>{activeUsers?.totalLoggedIn || 3} Active</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all shadow-sm group"
                title="Cancel and return to Landing Page"
                aria-label="Close"
              >
                <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
              </button>
            </div>
          </div>

          {/* Three-Way Mode Navigation Bar */}
          <div className="grid grid-cols-3 p-1 bg-slate-900/90 border border-slate-800 rounded-xl mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => { setAuthMode('customer_login'); setErrorMessage(''); }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all ${
                authMode === 'customer_login'
                  ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 text-white shadow-md shadow-cyan-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Driver Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('customer_register'); setErrorMessage(''); }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all ${
                authMode === 'customer_register'
                  ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('admin_login'); setErrorMessage(''); }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg transition-all ${
                authMode === 'admin_login'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Console</span>
            </button>
          </div>

          {/* Error Message Alert */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-950/70 border border-rose-600/80 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 1: DRIVER / CUSTOMER SIGN IN */}
          {/* ------------------------------------------------------------- */}
          {authMode === 'customer_login' && (
            <form onSubmit={handleCustomerLoginSubmit} className="space-y-4">
              
              {/* Quick 1-Click Demo Profiles */}
              <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase font-semibold">
                  <span className="flex items-center gap-1 text-cyan-400">
                    <Sparkles className="w-3 h-3" /> Quick Demo Login Profiles
                  </span>
                  <span>Click to Autofill</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {demoAccounts.map((acc, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleDemoSelect(acc)}
                      className={`text-left p-2 rounded-lg border text-xs transition-all ${
                        customerIdentifier === acc.identifier
                          ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="truncate font-semibold">{acc.label}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{acc.plate}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Email / Plate / ID Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Customer Email or Vehicle Plate
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={customerIdentifier}
                    onChange={(e) => setCustomerIdentifier(e.target.value)}
                    placeholder="e.g. alex.johnson@example.com or EV-702-NX"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-sans"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={customerPassword}
                    onChange={(e) => setCustomerPassword(e.target.value)}
                    placeholder="Enter password (default: password123)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Default Demo Password: <code className="text-cyan-400 bg-slate-900 px-1 py-0.5 rounded">password123</code>
                </div>
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-3 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold rounded-xl transition-all text-xs text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] text-xs sm:text-sm"
                >
                  <span>Sign In</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 2: DRIVER / CUSTOMER SIGN UP */}
          {/* ------------------------------------------------------------- */}
          {authMode === 'customer_register' && (
            <form onSubmit={handleCustomerRegisterSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Jordan Vance"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="jordan@example.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1 (555) 019-2834"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Vehicle License Plate</label>
                  <input
                    type="text"
                    required
                    value={regPlate}
                    onChange={(e) => setRegPlate(e.target.value)}
                    placeholder="e.g. EV-889-JV"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono uppercase focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Vehicle Powertrain</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRegType('EV')}
                      className={`p-2 rounded-lg border text-center font-semibold transition-all ${
                        regType === 'EV'
                          ? 'border-cyan-500 bg-cyan-950/60 text-cyan-300'
                          : 'border-slate-800 bg-slate-900 text-slate-400'
                      }`}
                    >
                      ⚡ EV
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegType('Non-EV')}
                      className={`p-2 rounded-lg border text-center font-semibold transition-all ${
                        regType === 'Non-EV'
                          ? 'border-emerald-500 bg-emerald-950/60 text-emerald-300'
                          : 'border-slate-800 bg-slate-900 text-slate-400'
                      }`}
                    >
                      🚗 ICE
                    </button>
                  </div>
                </div>
              </div>

              {regType === 'EV' && (
                <div className="p-3 bg-slate-900/60 border border-cyan-950 rounded-xl">
                  <div className="flex justify-between font-semibold mb-1">
                    <span className="text-slate-400">Current Battery State</span>
                    <span className="text-cyan-400 font-mono font-bold">{regBattery}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={regBattery}
                    onChange={(e) => setRegBattery(Number(e.target.value))}
                    className="w-full accent-cyan-400"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-3 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold rounded-xl transition-all text-xs text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-3 px-4 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all text-xs"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </button>
              </div>
            </form>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TAB 3: ADMIN CONSOLE SIGN IN */}
          {/* ------------------------------------------------------------- */}
          {authMode === 'admin_login' && (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              
              <div className="grid grid-cols-3 gap-2.5 p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl text-center text-xs">
                <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Total Logged In</div>
                  <div className="text-lg font-bold text-white font-mono">{activeUsers?.totalLoggedIn || 3}</div>
                </div>
                <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Active Drivers</div>
                  <div className="text-lg font-bold text-cyan-400 font-mono">{activeUsers?.activeDriversSeeking || 2}</div>
                </div>
                <div className="p-2 bg-slate-950/60 rounded-lg border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Admin Sessions</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">{activeUsers?.adminSessions || 1}</div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Admin Passcode Verification
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    placeholder="Enter admin passcode (default: admin123)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Default Demo Passcode: <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">admin123</code>
                </p>
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-3 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-semibold rounded-xl transition-all text-xs text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-2/3 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all text-xs sm:text-sm"
                >
                  <Shield className="w-4 h-4" />
                  <span>Access Controller</span>
                </button>
              </div>
            </form>
          )}

          {/* Modal Footer */}
          <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
            <span>Course: IDEA Lab • Dept. of Computer Engineering</span>
            <button
              type="button"
              onClick={onClose}
              className="text-cyan-400 hover:text-cyan-300 font-semibold hover:underline flex items-center gap-1 transition-colors"
            >
              <span>Explore Landing Page as Guest</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
