import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Zap, 
  Car, 
  Shield, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  UserPlus, 
  Activity, 
  Lock, 
  Phone, 
  Mail, 
  FileText, 
  MoreVertical, 
  RefreshCw,
  Eye,
  Trash2,
  Check,
  X,
  AlertTriangle
} from 'lucide-react';
import { formatINR } from '../utils/constants';

export default function CustomerDirectoryPanel({ onSelectCustomerForParking = null }) {
  const [customers, setCustomers] = useState([]);
  const [summary, setSummary] = useState({
    totalRegistered: 0,
    totalEVs: 0,
    totalICE: 0,
    activeCount: 0,
    suspendedCount: 0,
    totalRevenueInr: 0,
    totalRevenue: 0
  });
  const [loginLogs, setLoginLogs] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'EV' | 'Non-EV' | 'active' | 'suspended'
  const [activeTab, setActiveTab] = useState('customers'); // 'customers' | 'logins'
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Customer Form State
  const [newCust, setNewCust] = useState({
    name: '',
    email: '',
    phone: '',
    vehiclePlate: '',
    vehicleType: 'EV',
    batteryLevel: 45
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [custRes, logRes] = await Promise.all([
        fetch('/api/admin/customers'),
        fetch('/api/admin/logins')
      ]);

      if (custRes.ok) {
        const cData = await custRes.json();
        setCustomers(cData.data.customers || []);
        setSummary(cData.data.summary || {});
      }
      if (logRes.ok) {
        const lData = await logRes.json();
        setLoginLogs(lData.logs || []);
        setActiveSessions(lData.activeSessions || []);
      }
    } catch (err) {
      console.error('Error fetching admin customer directory:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleStatus = async (id) => {
    try {
      const res = await fetch(`/api/admin/customers/${id}/toggle-status`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer record?')) {
      try {
        const res = await fetch(`/api/admin/customers/${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (data.success) {
          setCustomers(data.customers);
          if (selectedCustomer?.id === id) setSelectedCustomer(null);
        }
      } catch (err) {
        console.error('Error deleting customer:', err);
      }
    }
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCust)
      });
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers);
        setShowAddModal(false);
        setNewCust({ name: '', email: '', phone: '', vehiclePlate: '', vehicleType: 'EV', batteryLevel: 45 });
      } else {
        alert(data.message || 'Error creating customer.');
      }
    } catch (err) {
      alert('Failed to connect to backend.');
    }
  };

  // Filter and Search Customers
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterType === 'EV') return c.vehicleType === 'EV';
    if (filterType === 'Non-EV') return c.vehicleType === 'Non-EV';
    if (filterType === 'active') return c.status === 'active';
    if (filterType === 'suspended') return c.status === 'suspended';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Statistics KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-[#0B1120] border border-cyan-900/60 rounded-xl p-3.5 shadow-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold flex items-center justify-between">
            <span>Total Customers</span>
            <Users className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white mt-1">{summary.totalRegistered || customers.length}</div>
          <div className="text-[10px] text-cyan-400 mt-0.5">Registered Drivers</div>
        </div>

        <div className="bg-[#0B1120] border border-cyan-900/60 rounded-xl p-3.5 shadow-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold flex items-center justify-between">
            <span>EV Owners</span>
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300 mt-1">{summary.totalEVs}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Priority Fast Charge Ready</div>
        </div>

        <div className="bg-[#0B1120] border border-emerald-900/60 rounded-xl p-3.5 shadow-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold flex items-center justify-between">
            <span>Standard ICE</span>
            <Car className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-300 mt-1">{summary.totalICE}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Regular Bay Fleet</div>
        </div>

        <div className="bg-[#0B1120] border border-emerald-900/60 rounded-xl p-3.5 shadow-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold flex items-center justify-between">
            <span>Active Status</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-300 mt-1">{summary.activeCount}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Verified Accounts</div>
        </div>

        <div className="bg-[#0B1120] border border-amber-900/60 rounded-xl p-3.5 shadow-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold flex items-center justify-between">
            <span>Active Sessions</span>
            <Activity className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300 mt-1">{activeSessions.length}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Logged In Today</div>
        </div>

        <div className="bg-[#0B1120] border border-teal-900/60 rounded-xl p-3.5 shadow-lg">
          <div className="text-[11px] text-slate-400 uppercase font-semibold flex items-center justify-between">
            <span>Total Revenue</span>
            <Shield className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="text-xl font-bold font-mono text-teal-300 mt-1">
            {formatINR(summary.totalRevenueInr ?? summary.totalRevenue ?? summary.totalRevenueUsd ?? 18450)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Charging & Parking</div>
        </div>
      </div>

      {/* Main Panel Card */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        
        {/* Sub-Header Tabs and Controls */}
        <div className="p-4 md:p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-emerald-500 rounded-xl text-white shadow-md">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Customer Directory & User Access Management</span>
              </h3>
              <p className="text-xs text-slate-400">
                Live monitoring of customer profiles, vehicle registrations, login audit trails, and booking histories.
              </p>
            </div>
          </div>

          {/* Action Buttons & Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {/* View Tab Buttons */}
            <div className="p-1 bg-slate-900 border border-slate-800 rounded-xl flex items-center text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('customers')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'customers' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Customer Registry ({customers.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('logins')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeTab === 'logins' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Login Audit Trail ({loginLogs.length})
              </button>
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              onClick={fetchData}
              disabled={isLoading}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 text-xs"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            {/* Add New Customer Button */}
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-cyan-600/20"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register New Driver</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Customer Registry */}
        {activeTab === 'customers' && (
          <div className="p-4 md:p-6 space-y-4">
            
            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Name, Email, Plate, ID..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-slate-500 mr-1 flex items-center gap-1">
                  <Filter className="w-3 h-3" /> Filter:
                </span>
                {['all', 'EV', 'Non-EV', 'active', 'suspended'].map((ft) => (
                  <button
                    key={ft}
                    type="button"
                    onClick={() => setFilterType(ft)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                      filterType === ft
                        ? 'bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {ft === 'all' ? 'All Drivers' : ft === 'EV' ? '⚡ EV Fleet' : ft === 'Non-EV' ? 'Standard ICE' : ft.charAt(0).toUpperCase() + ft.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Customers Data Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-[#070B14]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono uppercase">
                    <th className="py-3 px-4">Customer ID & Name</th>
                    <th className="py-3 px-4">Contact Info</th>
                    <th className="py-3 px-4">Vehicle Details</th>
                    <th className="py-3 px-4">Live Status</th>
                    <th className="py-3 px-4">Bookings / Spend</th>
                    <th className="py-3 px-4 text-center">Account</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredCustomers.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-10 text-slate-500">
                        No customers match the current filter or search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredCustomers.map((cust) => {
                      const isEV = cust.vehicleType === 'EV';
                      const isCritical = isEV && cust.batteryLevel <= 25;
                      return (
                        <tr key={cust.id} className="hover:bg-slate-900/40 transition-colors">
                          
                          {/* ID & Name */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-900 to-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-300 text-xs">
                                {cust.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="font-bold text-white">{cust.name}</div>
                                <div className="font-mono text-[10px] text-cyan-400">{cust.id}</div>
                              </div>
                            </div>
                          </td>

                          {/* Contact Info */}
                          <td className="py-3 px-4">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1 text-slate-300">
                                <Mail className="w-3 h-3 text-slate-500" />
                                <span>{cust.email}</span>
                              </div>
                              <div className="flex items-center gap-1 text-slate-400 text-[11px]">
                                <Phone className="w-3 h-3 text-slate-500" />
                                <span>{cust.phone}</span>
                              </div>
                            </div>
                          </td>

                          {/* Vehicle Details */}
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                                  {cust.vehiclePlate}
                                </span>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                                  isEV 
                                    ? 'bg-cyan-950 text-cyan-300 border-cyan-700' 
                                    : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                }`}>
                                  {isEV ? '⚡ EV' : 'P ICE'}
                                </span>
                              </div>
                              {isEV && (
                                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <span>Battery: <strong>{cust.batteryLevel || 20}%</strong></span>
                                  {isCritical && <span className="text-amber-400 font-bold">(Critical ≤25%)</span>}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Live Status */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full ${
                                cust.currentStatus?.includes('Parked') ? 'bg-emerald-400 shadow-[0_0_6px_#10B981]' :
                                cust.currentStatus?.includes('Seeking') ? 'bg-cyan-400 animate-pulse' :
                                cust.currentStatus === 'Suspended' ? 'bg-rose-500' :
                                'bg-slate-600'
                              }`} />
                              <span className="font-medium text-slate-300 text-xs">
                                {cust.currentStatus || 'Offline'}
                              </span>
                            </div>
                          </td>

                          {/* Bookings & Spent */}
                          <td className="py-3 px-4 font-mono">
                            <div className="text-slate-200">{cust.totalBookings || 0} visits</div>
                            <div className="text-[10px] text-teal-400 font-semibold">{formatINR(cust.totalSpent)}</div>
                          </td>

                          {/* Account Status Badge */}
                          <td className="py-3 px-4 text-center">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                              cust.status === 'active'
                                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                                : 'bg-rose-950/80 text-rose-300 border-rose-700'
                            }`}>
                              {cust.status === 'active' ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                              {cust.status}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick Details View */}
                              <button
                                type="button"
                                onClick={() => setSelectedCustomer(cust)}
                                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 rounded-lg border border-slate-800"
                                title="View Customer Details"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              {/* Toggle Status (Active/Suspended) */}
                              <button
                                type="button"
                                onClick={() => handleToggleStatus(cust.id)}
                                className={`p-1.5 rounded-lg border text-xs ${
                                  cust.status === 'active'
                                    ? 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-800 text-rose-400'
                                    : 'bg-emerald-950/40 hover:bg-emerald-900/60 border-emerald-800 text-emerald-400'
                                }`}
                                title={cust.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                              >
                                {cust.status === 'active' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                              </button>

                              {/* Delete Customer */}
                              <button
                                type="button"
                                onClick={() => handleDeleteCustomer(cust.id)}
                                className="p-1.5 bg-slate-900 hover:bg-rose-950 border border-slate-800 hover:border-rose-800 text-slate-500 hover:text-rose-400 rounded-lg"
                                title="Delete Customer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Login Audit Trail & Active Sessions */}
        {activeTab === 'logins' && (
          <div className="p-4 md:p-6 space-y-4">
            
            {/* Active Sessions Live Row */}
            <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <Activity className="w-4 h-4" /> Live Active Concurrency ({activeSessions.length} Sessions Connected)
                </span>
                <span className="text-[11px] font-mono text-emerald-400">Real-Time State Stream</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 pt-1">
                {activeSessions.map((sess) => (
                  <div key={sess.id} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        {sess.role === 'admin' ? <Shield className="w-3.5 h-3.5 text-emerald-400" /> : <Car className="w-3.5 h-3.5 text-cyan-400" />}
                        {sess.userName || sess.role}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {sess.vehiclePlate || 'Admin Console'} • Logged in: {new Date(sess.loginTime).toLocaleTimeString()}
                      </div>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                ))}
              </div>
            </div>

            {/* Login History Stream Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-[#070B14]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/80 text-slate-400 font-mono uppercase">
                    <th className="py-2.5 px-4">Log ID</th>
                    <th className="py-2.5 px-4">Timestamp</th>
                    <th className="py-2.5 px-4">User / Customer</th>
                    <th className="py-2.5 px-4">Role / Vehicle</th>
                    <th className="py-2.5 px-4">IP Address</th>
                    <th className="py-2.5 px-4">Action Event</th>
                    <th className="py-2.5 px-4 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {loginLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-2.5 px-4 text-cyan-400">{log.id}</td>
                      <td className="py-2.5 px-4 text-slate-300">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="py-2.5 px-4 font-sans font-medium text-white">{log.userName}</td>
                      <td className="py-2.5 px-4">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          log.role === 'admin' ? 'bg-emerald-950 text-emerald-400 border-emerald-700' : 'bg-cyan-950 text-cyan-300 border-cyan-800'
                        }`}>
                          {log.role === 'admin' ? '🛡️ Admin' : `🚗 ${log.vehiclePlate || 'Driver'}`}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-500">{log.ipAddress || '192.168.1.1'}</td>
                      <td className="py-2.5 px-4 text-slate-300 font-sans">{log.action}</td>
                      <td className="py-2.5 px-4 text-right">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          log.status.includes('Success') 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-700' 
                            : 'bg-rose-950 text-rose-400 border border-rose-700'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

      </div>

      {/* Customer Profile Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0B1120] border border-slate-700 rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold flex items-center justify-center text-sm">
                  {selectedCustomer.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">{selectedCustomer.name}</h4>
                  <div className="font-mono text-xs text-cyan-400">{selectedCustomer.id}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-slate-400">Email Address</div>
                <div className="font-semibold text-white mt-0.5">{selectedCustomer.email}</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-slate-400">Phone Number</div>
                <div className="font-semibold text-white mt-0.5">{selectedCustomer.phone}</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-slate-400">Registered Vehicle Plate</div>
                <div className="font-mono font-bold text-cyan-300 mt-0.5">{selectedCustomer.vehiclePlate}</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-slate-400">Powertrain / Type</div>
                <div className="font-semibold text-white mt-0.5">
                  {selectedCustomer.vehicleType === 'EV' ? `⚡ EV (${selectedCustomer.batteryLevel}% Battery)` : 'Standard ICE'}
                </div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-slate-400">Total Visits / Bookings</div>
                <div className="font-bold text-emerald-400 mt-0.5">{selectedCustomer.totalBookings || 0} Completed Sessions</div>
              </div>
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                <div className="text-slate-400">Lifetime Spent</div>
                <div className="font-bold text-teal-400 mt-0.5">{formatINR(selectedCustomer.totalSpent)}</div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-xs flex items-center justify-between">
              <span className="text-slate-400">Registered Since:</span>
              <span className="text-slate-200 font-mono">{new Date(selectedCustomer.registeredAt).toLocaleDateString()}</span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Register New Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0B1120] border border-slate-700 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-white font-bold">
                <UserPlus className="w-5 h-5 text-cyan-400" />
                <span>Register Customer Profile</span>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Full Customer Name</label>
                <input
                  type="text"
                  required
                  value={newCust.name}
                  onChange={(e) => setNewCust({ ...newCust, name: e.target.value })}
                  placeholder="e.g. Jordan Miller"
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={newCust.email}
                    onChange={(e) => setNewCust({ ...newCust, email: e.target.value })}
                    placeholder="jordan@example.com"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={newCust.phone}
                    onChange={(e) => setNewCust({ ...newCust, phone: e.target.value })}
                    placeholder="+1 (555) 012-3456"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Vehicle Plate</label>
                  <input
                    type="text"
                    required
                    value={newCust.vehiclePlate}
                    onChange={(e) => setNewCust({ ...newCust, vehiclePlate: e.target.value })}
                    placeholder="e.g. EV-551-JM"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-mono uppercase focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Powertrain</label>
                  <select
                    value={newCust.vehicleType}
                    onChange={(e) => setNewCust({ ...newCust, vehicleType: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="EV">Electric Vehicle (EV)</option>
                    <option value="Non-EV">Standard ICE</option>
                  </select>
                </div>
              </div>

              {newCust.vehicleType === 'EV' && (
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Default Battery State: {newCust.batteryLevel}%</label>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={newCust.batteryLevel}
                    onChange={(e) => setNewCust({ ...newCust, batteryLevel: Number(e.target.value) })}
                    className="w-full accent-cyan-400"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20"
                >
                  Save Customer Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
