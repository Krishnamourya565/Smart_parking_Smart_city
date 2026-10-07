import React, { useState, useEffect } from 'react';
import { 
  History, 
  X, 
  Zap, 
  Car, 
  Clock, 
  CheckCircle2, 
  Search, 
  FileText, 
  Calendar, 
  DollarSign,
  ChevronRight,
  ShieldCheck,
  Download
} from 'lucide-react';
import { PRICING, formatINR } from '../utils/constants';

export default function SessionHistoryModal({
  isOpen,
  onClose,
  currentUser,
  isAdmin = false
}) {
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const url = isAdmin 
        ? '/api/parking-sessions/history?role=admin'
        : `/api/parking-sessions/history?role=customer&customerId=${currentUser?.id || currentUser?.email}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
        if (data.sessions?.length > 0 && !selectedSession) {
          setSelectedSession(data.sessions[0]);
        }
      }
    } catch (e) {
      console.error('Error fetching session history:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
    }
  }, [isOpen, currentUser, isAdmin]);

  if (!isOpen) return null;

  const filteredSessions = sessions.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      (s.id && s.id.toLowerCase().includes(q)) ||
      (s.spotId && s.spotId.toLowerCase().includes(q)) ||
      (s.vehiclePlate && s.vehiclePlate.toLowerCase().includes(q)) ||
      (s.customerName && s.customerName.toLowerCase().includes(q))
    );
  });

  const formatTimestamp = (iso) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0B1120] border border-cyan-500/40 rounded-3xl max-w-4xl w-full p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] relative overflow-hidden flex flex-col max-h-[88vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-blue-600 text-white rounded-2xl shadow-md">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 font-mono">
                {isAdmin ? 'ADMIN AUDIT LOG' : 'DRIVER PORTAL'}
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">
                Parking & Charging Session History
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4 relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by session #, bay ID, vehicle plate, or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Content Area: Left List + Right Detail Drawer */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 overflow-hidden">
          
          {/* Left Session List */}
          <div className="md:col-span-5 space-y-2 overflow-y-auto pr-1">
            {isLoading ? (
              <div className="p-8 text-center text-slate-500 text-xs">Loading sessions...</div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/80 text-slate-500 text-xs">
                No completed parking sessions found.
              </div>
            ) : (
              filteredSessions.map((sess) => {
                const isEV = sess.spotType === 'ev' || sess.vehicleType === 'EV';
                const isSelected = selectedSession?.id === sess.id;
                return (
                  <button
                    key={sess.id}
                    type="button"
                    onClick={() => setSelectedSession(sess)}
                    className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-lg shadow-cyan-500/10'
                        : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                        isEV ? 'bg-cyan-950 text-cyan-400 border border-cyan-700' : 'bg-emerald-950 text-emerald-400 border border-emerald-700'
                      }`}>
                        {isEV ? <Zap className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-xs">{sess.spotId}</span>
                          <span className="text-[10px] font-mono text-cyan-400">{sess.id}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {formatTimestamp(sess.entryTime)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono font-black text-emerald-400">
                        {formatINR(sess.totalAmount)}
                      </div>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700">
                        PAID
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Selected Session Receipt Drawer */}
          <div className="md:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 overflow-y-auto space-y-4">
            {selectedSession ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase">Official Parking Receipt</span>
                    <h4 className="text-lg font-black text-white">Session #{selectedSession.id}</h4>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> COMPLETED
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                    <div className="text-slate-400 text-[10px]">Customer Name</div>
                    <div className="font-bold text-white mt-0.5">{selectedSession.customerName || 'Driver'}</div>
                  </div>
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                    <div className="text-slate-400 text-[10px]">Vehicle Plate</div>
                    <div className="font-bold font-mono text-cyan-300 mt-0.5">{selectedSession.vehiclePlate || 'N/A'}</div>
                  </div>
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                    <div className="text-slate-400 text-[10px]">Parking Spot</div>
                    <div className="font-bold text-white mt-0.5">Bay {selectedSession.spotId} ({selectedSession.spotType?.toUpperCase()})</div>
                  </div>
                  <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl">
                    <div className="text-slate-400 text-[10px]">Total Parking Time</div>
                    <div className="font-bold font-mono text-emerald-400 mt-0.5">{selectedSession.parkingDurationMinutes || 90} mins</div>
                  </div>
                </div>

                {/* Detailed Timeline */}
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Session Milestones
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Entry Gate Pass:</span>
                    <span className="font-mono text-slate-200">{formatTimestamp(selectedSession.entryTime)}</span>
                  </div>

                  {selectedSession.spotType === 'ev' && (
                    <>
                      <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Charging Started:</span>
                        <span className="font-mono text-cyan-300">{formatTimestamp(selectedSession.chargingStartTime || selectedSession.entryTime)}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Charging Completed (100%):</span>
                        <span className="font-mono text-cyan-300">{formatTimestamp(selectedSession.chargingCompleteTime)}</span>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Checkout Requested:</span>
                    <span className="font-mono text-slate-200">{formatTimestamp(selectedSession.checkoutRequestedTime)}</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-slate-400">Exit Gate Verified:</span>
                    <span className="font-mono text-emerald-300">{formatTimestamp(selectedSession.exitVerifiedTime)}</span>
                  </div>
                </div>

                {/* Itemized Cost Breakdown */}
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <div className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                    Itemized Billing
                  </div>

                  {selectedSession.spotType === 'ev' && (
                    <>
                      <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Energy Used (50 kW Fast):</span>
                        <span className="font-mono font-bold text-cyan-300">{selectedSession.energyUsedKwh || 24.6} kWh</span>
                      </div>
                      <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-400">Charging Cost (@ {formatINR(PRICING.evChargingPerKwh)}/kWh):</span>
                        <span className="font-mono font-bold text-cyan-300">{formatINR(selectedSession.chargingCost)}</span>
                      </div>
                    </>
                  )}

                  <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Base Parking Fee:</span>
                    <span className="font-mono font-bold text-slate-200">{formatINR(selectedSession.parkingCost)}</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-sm font-bold">
                    <span className="text-white">Total Paid:</span>
                    <span className="font-mono text-emerald-400 text-base">{formatINR(selectedSession.totalAmount)}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-12 text-center text-slate-500 text-xs">
                Select a session from the list to view its complete receipt breakdown.
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
