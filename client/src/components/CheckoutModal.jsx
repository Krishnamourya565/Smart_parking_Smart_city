import React, { useState } from 'react';
import { 
  CreditCard, 
  Clock, 
  Zap, 
  Car, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight,
  ShieldCheck,
  Receipt,
  Sparkles
} from 'lucide-react';
import { PRICING, formatINR, calculateSessionBill } from '../utils/constants';

export default function CheckoutModal({
  isOpen,
  session,
  onClose,
  onConfirmCheckout,
  isLoading = false
}) {
  if (!isOpen || !session) return null;

  const bill = calculateSessionBill(session);
  const isEV = session.spotType === 'ev' || session.vehicleType === 'EV';

  const formatTimeString = (isoString) => {
    if (!isoString) return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (mins) => {
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    if (hours === 0) return `${m}m`;
    return `${hours}h ${m}m`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0B1120] border border-cyan-500/40 rounded-3xl max-w-md w-full p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] relative overflow-hidden space-y-5">
        
        {/* Ambient Top Glow */}
        <div className="absolute -top-16 -left-16 w-36 h-36 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 relative">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-gradient-to-tr from-cyan-600 to-emerald-500 text-slate-950 rounded-2xl shadow-md">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-widest text-cyan-400 font-mono">
                FINAL INVOICE
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Parking & Charging Checkout
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Spot & Session Summary Header Badge */}
        <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black ${
              isEV ? 'bg-cyan-950 text-cyan-300 border border-cyan-500' : 'bg-emerald-950 text-emerald-300 border border-emerald-500'
            }`}>
              {isEV ? <Zap className="w-4 h-4" /> : <Car className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-bold text-white text-sm">
                Bay {session.spotId || 'EV02'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {session.vehiclePlate || 'EV-702-NX'} • Session #{session.id || 'PARK-1024'}
              </div>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold font-mono bg-amber-950 text-amber-300 border border-amber-700">
            PENDING EXIT
          </span>
        </div>

        {/* Detailed Timeline Table */}
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Entry Time
            </span>
            <span className="font-mono font-bold text-slate-200">
              {formatTimeString(session.entryTime)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> Exit Time
            </span>
            <span className="font-mono font-bold text-slate-200">
              {formatTimeString(null)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60 text-slate-400">
            <span>Parking Duration</span>
            <span className="font-mono font-bold text-emerald-400">
              {formatDuration(bill.durationMinutes)}
            </span>
          </div>

          {/* EV Charging Info (if EV) */}
          {isEV && (
            <>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60 text-slate-400">
                <span className="flex items-center gap-1.5 text-cyan-300">
                  <Zap className="w-3.5 h-3.5 text-cyan-400" /> Energy Used (50 kW Fast)
                </span>
                <span className="font-mono font-bold text-cyan-300">
                  {bill.energyUsedKwh} kWh
                </span>
              </div>

              <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60 text-slate-400">
                <span>Charging Cost (@ {formatINR(PRICING.evChargingPerKwh)}/kWh)</span>
                <span className="font-mono font-bold text-cyan-300">
                  {formatINR(bill.chargingCost)}
                </span>
              </div>
            </>
          )}

          <div className="flex items-center justify-between py-1.5 border-b border-slate-800/60 text-slate-400">
            <span>Parking Dwell Fee (@ {formatINR(PRICING.parkingPerHour)}/hr)</span>
            <span className="font-mono font-bold text-slate-200">
              {formatINR(bill.parkingCost)}
            </span>
          </div>
        </div>

        {/* Total Price Card */}
        <div className="p-4 bg-gradient-to-r from-slate-900 to-[#0F172A] border-2 border-cyan-500/60 rounded-2xl flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Total Amount Due
            </div>
            <div className="text-2xl font-black font-mono text-white tracking-tight flex items-baseline gap-1">
              <span>{formatINR(bill.totalAmount)}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-700 px-2 py-0.5 rounded-md font-semibold">
              <ShieldCheck className="w-3 h-3" /> Secure Gateway
            </span>
          </div>
        </div>

        {/* Important notice */}
        <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
          💡 After confirming checkout, your session status changes to <strong className="text-cyan-300 font-mono">CHECKOUT_REQUESTED</strong>. Follow the exit route to North Exit where the gate sensor / admin will verify your departure.
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="py-3 px-4 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold transition-all"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => onConfirmCheckout(session.id)}
            disabled={isLoading}
            className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span>Processing...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-slate-950" />
                <span>Confirm Checkout</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
