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
  X,
  Eye,
  EyeOff
} from 'lucide-react';
import { supabase } from '../supabase';

export default function LoginModal({ 
  isOpen, 
  onClose, 
  initialAuthMode = 'login',
  activeUsers, 
  onCustomerLogin,
  onCustomerRegister,
  onAdminLogin
}) {
  // Mode: 'login' (Sign In for both User and Admin) or 'register' (Sign Up for Users only)
  const [authMode, setAuthMode] = useState('login');

  useEffect(() => {
    if (isOpen) {
      setAuthMode(initialAuthMode === 'customer_register' ? 'register' : 'login');
      setErrorMessage('');
    }
  }, [isOpen, initialAuthMode]);
  
  // Sign In Form State (User and Admin)
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Sign Up Form State (Drivers)
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPlate, setRegPlate] = useState('');
  const [regType, setRegType] = useState('EV');
  const [regBattery, setRegBattery] = useState(25);
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Sign Up Form State (Administrators)
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPhone, setAdminPhone] = useState('');
  const [adminDept, setAdminDept] = useState('Central Traffic Control');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Unified Sign In: Validates with Supabase Auth, determines role from profiles.role
  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const email = loginEmail.trim();
      const password = loginPassword;

      // 1. Supabase Auth Sign In
      let authUser = null;
      let authSession = null;
      let userRole = 'user';
      let userProfile = null;

      if (supabase) {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (!authError && authData?.user) {
          authUser = authData.user;
          authSession = authData.session;

          // Query role from profiles table
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authUser.id)
              .maybeSingle();

            if (profile) {
              userProfile = profile;
              userRole = profile.role || 'user';
            } else {
              // Fallback lookup by email
              const { data: emailProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('email', email)
                .maybeSingle();
              if (emailProfile) {
                userProfile = emailProfile;
                userRole = emailProfile.role || 'user';
              }
            }
          } catch (pErr) {
            console.warn('Profile fetch error, defaulting role:', pErr);
          }
        } else if (authError) {
          // If Supabase direct fails, try backend auth fallback
          const fallbackRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ identifier: email, password })
          });
          const fallbackData = await fallbackRes.json();
          if (fallbackData.success) {
            authUser = fallbackData.user;
            authSession = fallbackData.session;
            userRole = fallbackData.user?.role || 'user';
          } else {
            throw new Error(authError.message || fallbackData.message || 'Invalid email or password.');
          }
        }
      } else {
        // Direct fallback
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: email, password })
        });
        const data = await res.json();
        if (data.success) {
          authUser = data.user;
          authSession = data.session;
          userRole = data.user?.role || 'user';
        } else {
          throw new Error(data.message || 'Login failed.');
        }
      }

      if (!authUser) {
        throw new Error('Authentication failed. Check your email and password.');
      }

      const mergedUser = {
        id: authUser.id,
        email: authUser.email || email,
        name: userProfile?.name || authUser.user_metadata?.name || email.split('@')[0],
        vehiclePlate: userProfile?.vehicle_plate || authUser.user_metadata?.vehicle_plate || 'MH12-EV-2026',
        vehicleType: userProfile?.vehicle_type || authUser.user_metadata?.vehicle_type || 'EV',
        batteryLevel: userProfile?.battery_level || 75,
        role: userRole
      };

      if (supabase && authUser.id && authUser.id.length === 36) {
        try {
          await supabase.from('user_presence').upsert({
            user_id: authUser.id,
            last_seen: new Date().toISOString()
          });
        } catch (presErr) {
          console.warn('user_presence on login notice:', presErr);
        }
      }

      if (userRole === 'admin') {
        onAdminLogin(mergedUser, authSession);
      } else {
        onCustomerLogin(mergedUser, authSession);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign Up Submit: Standard User Only (No Admin Option)
  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPhoneDigits = regPhone.replace(/\D/g, '');
    if (cleanPhoneDigits.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const email = regEmail.trim();
      const password = regPassword;
      const name = regName.trim();
      const vehiclePlate = regPlate.trim().toUpperCase();

      let createdUser = null;
      let createdSession = null;

      if (supabase) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              vehicle_plate: vehiclePlate,
              vehicle_type: regType,
              phone: `+91 ${cleanPhoneDigits}`
            }
          }
        });

        if (authError) {
          // Fallback to backend registration
          const fallbackRes = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              email,
              phone: `+91 ${cleanPhoneDigits}`,
              vehiclePlate,
              vehicleType: regType,
              batteryLevel: regType === 'EV' ? regBattery : null,
              password
            })
          });
          const fallbackData = await fallbackRes.json();
          if (fallbackData.success) {
            createdUser = fallbackData.user;
            createdSession = fallbackData.session;
          } else {
            throw new Error(authError.message || fallbackData.message || 'Registration failed.');
          }
        } else if (authData?.user) {
          createdUser = authData.user;
          createdSession = authData.session;

          // Insert or update profiles with strict role 'user' and vehicles
          try {
            await supabase.from('profiles').upsert({
              id: authData.user.id,
              full_name: name,
              phone: `+91 ${cleanPhoneDigits}`,
              role: 'user',
              updated_at: new Date().toISOString()
            });

            await supabase.from('vehicles').insert({
              owner_id: authData.user.id,
              plate: vehiclePlate,
              type: regType === 'EV' ? 'EV' : 'ICE'
            });
          } catch (profErr) {
            console.warn('Profile & vehicle creation log:', profErr);
          }
        }
      }

      if (!createdUser) {
        throw new Error('Registration failed. Please try again.');
      }

      const mergedUser = {
        id: createdUser.id,
        email,
        name,
        vehiclePlate,
        vehicleType: regType,
        batteryLevel: regType === 'EV' ? regBattery : null,
        role: 'user'
      };

      onCustomerRegister(mergedUser, createdSession);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sign Up Submit: Administrator Registration
  const handleAdminSignUpSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanPhoneDigits = adminPhone.replace(/\D/g, '');
    if (cleanPhoneDigits.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      const email = adminEmail.trim();
      const password = adminPassword;
      const name = adminName.trim();

      let createdUser = null;
      let createdSession = null;

      if (supabase) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              full_name: name,
              role: 'admin',
              phone: `+91 ${cleanPhoneDigits}`,
              department: adminDept
            }
          }
        });

        if (authError) {
          // Fallback to backend registration
          const fallbackRes = await fetch('/api/admin/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name,
              email,
              phone: `+91 ${cleanPhoneDigits}`,
              department: adminDept,
              password
            })
          });
          const fallbackData = await fallbackRes.json();
          if (fallbackData.success) {
            createdUser = fallbackData.user;
            createdSession = fallbackData.session;
          } else {
            throw new Error(authError.message || fallbackData.message || 'Admin registration failed.');
          }
        } else if (authData?.user) {
          createdUser = authData.user;
          createdSession = authData.session;

          try {
            await supabase.from('profiles').upsert({
              id: authData.user.id,
              full_name: name,
              phone: `+91 ${cleanPhoneDigits}`,
              role: 'admin',
              updated_at: new Date().toISOString()
            });

            await supabase.from('admin_allowlist').upsert({
              email: email
            });
          } catch (profErr) {
            console.warn('Admin profile upsert:', profErr);
          }
        }
      }

      if (!createdUser) {
        createdUser = {
          id: `ADMIN-${Date.now().toString().slice(-4)}`,
          name,
          email,
          phone: `+91 ${cleanPhoneDigits}`,
          role: 'admin'
        };
      }

      const mergedAdmin = {
        id: createdUser.id,
        name: name,
        email: email,
        phone: `+91 ${cleanPhoneDigits}`,
        role: 'admin',
        department: adminDept
      };

      onAdminLogin(mergedAdmin, createdSession);
      onClose();
    } catch (err) {
      setErrorMessage(err.message || 'Admin registration failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto min-h-dvh">
      <div className="relative w-full max-w-lg min-h-dvh sm:min-h-0 bg-[#070B14] sm:border sm:border-cyan-500/40 sm:rounded-3xl p-5 sm:p-8 shadow-2xl overflow-y-auto flex flex-col justify-center my-auto">
        
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-cyan-500 to-teal-400 text-slate-950 shadow-lg shadow-cyan-500/25">
            <Zap className="w-6 h-6 fill-slate-950" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">
              Smart City Mobility
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Smart Parking & Priority EV Allocation
            </p>
          </div>
        </div>

        {/* Auth Mode Toggle Tabs (Sign In vs Driver Sign Up vs Admin Sign Up) */}
        <div className="grid grid-cols-3 p-1 mb-6 bg-slate-900/90 border border-slate-800 rounded-xl text-xs font-semibold gap-1">
          <button
            type="button"
            onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
            className={`min-h-[44px] py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm ${
              authMode === 'login' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
            className={`min-h-[44px] py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm ${
              authMode === 'register' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Driver Sign Up</span>
          </button>

          <button
            type="button"
            onClick={() => { setAuthMode('admin_register'); setErrorMessage(''); }}
            className={`min-h-[44px] py-2 px-1 rounded-lg transition-all flex items-center justify-center gap-1.5 text-xs sm:text-sm ${
              authMode === 'admin_register' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Sign Up</span>
          </button>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-500/80 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. SIGN IN FORM (User and Admin) */}
        {authMode === 'login' && (
          <form onSubmit={handleSignInSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="driver@example.com or admin@urban.gov"
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full min-h-[44px] pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <p className="text-[11px] text-slate-400">
              Your access role (Administrator or Driver) is loaded directly from your Supabase profile upon sign in.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[44px] mt-2 py-3 bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-base rounded-xl shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 2. SIGN UP FORM (Standard User Only - No Admin Option) */}
        {authMode === 'register' && (
          <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Aditya Sharma"
                    className="w-full min-h-[44px] pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="aditya@example.com"
                    className="w-full min-h-[44px] pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mobile (+91)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full min-h-[44px] pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  License Plate
                </label>
                <div className="relative">
                  <Car className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={regPlate}
                    onChange={(e) => setRegPlate(e.target.value.toUpperCase())}
                    placeholder="MH12-EV-7788"
                    className="w-full min-h-[44px] pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base text-white uppercase placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Vehicle Powertrain
                </label>
                <select
                  value={regType}
                  onChange={(e) => setRegType(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="EV">Electric Vehicle (EV)</option>
                  <option value="Non-EV">Standard Fuel (Non-EV)</option>
                </select>
              </div>

              {regType === 'EV' ? (
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1">
                    <span>Battery SoC</span>
                    <span className="text-cyan-400 font-mono">{regBattery}%</span>
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
              ) : (
                <div className="flex items-center text-xs text-slate-500 italic pt-6">
                  Standard bay allocation
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Create secure password"
                  className="w-full min-h-[44px] pl-9 pr-9 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[44px] mt-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 text-white font-bold text-base rounded-xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span>{isSubmitting ? 'Registering Account...' : 'Create Driver Profile'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* 3. SIGN UP FORM (Administrator Registration) */}
        {authMode === 'admin_register' && (
          <form onSubmit={handleAdminSignUpSubmit} className="space-y-3.5">
            <div className="p-3 rounded-xl bg-purple-950/50 border border-purple-500/60 text-purple-200 text-xs flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Register as a Municipal Mobility Administrator with full telemetry, simulation, and manual bay control.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="Officer Vikram Rao"
                    className="w-full min-h-[44px] pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Official Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@urban.gov"
                    className="w-full min-h-[44px] pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mobile (+91)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full min-h-[44px] pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Department / Authority
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={adminDept}
                    onChange={(e) => setAdminDept(e.target.value)}
                    placeholder="Central Traffic Authority"
                    className="w-full min-h-[44px] pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Create secure admin password"
                  className="w-full min-h-[44px] pl-9 pr-9 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full min-h-[44px] mt-2 py-3 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 text-white font-bold text-base rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>{isSubmitting ? 'Creating Administrator...' : 'Create Admin Profile'}</span>
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
