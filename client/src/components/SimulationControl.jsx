import React, { useState } from 'react';
import { 
  Play, 
  RotateCcw, 
  Wrench, 
  Sparkles, 
  Shuffle, 
  AlertTriangle, 
  Zap, 
  Cpu, 
  CheckCircle2, 
  Radio, 
  Car,
  Flame,
  ShieldCheck,
  LogOut,
  Navigation,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { formatINR } from '../utils/constants';

export default function SimulationControl({
  currentMode = 'smart',
  onModeToggle,
  onRunBatchSimulation,
  onResetLot,
  onSimulateArrival,
  onChaosToggle,
  chaosActive = false,
  activeCheckoutSessions = [],
  onSimulateExit,
  onSimulateChargingComplete,
  isLoading = false
}) {
  const [singleVehicleType, setSingleVehicleType] = useState('EV');
  const [singleBattery, setSingleBattery] = useState(15); // Critical by default for quick test

  return (
    <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <h3 className="text-base font-bold text-white tracking-tight">
            Central Controller & Simulation Testing Lab
          </h3>
        </div>
        <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
          <Radio className="w-3 h-3 animate-pulse text-cyan-400" />
          Engine: Active (Admin Mode)
        </span>
      </div>

      {/* Mode Selection Toggle: Smart Organized vs Random Baseline */}
      <div>
        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Allocation Engine Protocol
        </label>
        <div className="grid grid-cols-2 gap-3">
          {/* Smart Organized Option */}
          <button
            type="button"
            onClick={() => onModeToggle('smart')}
            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
              currentMode === 'smart'
                ? 'bg-cyan-950/60 border-cyan-500 text-white ring-1 ring-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold flex items-center gap-1.5 text-cyan-300">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Smart Organized (Target)
              </span>
              {currentMode === 'smart' && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#06B6D4]" />
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Direct guidance, 25% battery EV priority constraint, 0 misuse policy.
            </p>
          </button>

          {/* Random Baseline Option */}
          <button
            type="button"
            onClick={() => onModeToggle('random')}
            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
              currentMode === 'random'
                ? 'bg-red-950/50 border-red-500 text-white ring-1 ring-red-500 shadow-[0_0_15px_rgba(239,68,68,0.25)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold flex items-center gap-1.5 text-red-400">
                <Shuffle className="w-3.5 h-3.5" />
                Random Baseline (Unorganized)
              </span>
              {currentMode === 'random' && (
                <span className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_6px_#EF4444]" />
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              Cruising random search, blind spot occupation, high misuse rate.
            </p>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ADMIN-ONLY VEHICLE EXIT SIMULATION LAB */}
      {/* ------------------------------------------------------------- */}
      <div className="p-4 bg-gradient-to-r from-[#0F172A] to-slate-900 border-2 border-amber-500/40 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-amber-500 text-slate-950 rounded-lg font-bold">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">
                Vehicle Exit Simulation Lab (Admin Only)
              </h4>
              <p className="text-[10px] text-slate-400">
                Simulate hardware gate sensor / ANPR camera release for pending vehicles
              </p>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-600">
            {activeCheckoutSessions.length} Pending
          </span>
        </div>

        {activeCheckoutSessions.length === 0 ? (
          <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 text-center space-y-2">
            <p className="text-xs text-slate-400">
              No vehicles currently requesting exit. Active bays remain occupied while vehicles are parked.
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onSimulateChargingComplete && onSimulateChargingComplete('PARK-1024')}
                className="px-3 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-700 text-cyan-300 text-[11px] font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Simulate EV02 100% Charging Complete</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {activeCheckoutSessions.map((sess) => (
              <div
                key={sess.id}
                className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-950 text-amber-300 border border-amber-600 flex items-center justify-center font-bold text-xs">
                    {sess.spotId}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{sess.vehiclePlate}</span>
                      <span className="text-[10px] font-mono text-cyan-400">#{sess.id}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-950 text-amber-300 border border-amber-700">
                        {sess.status}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Driver: {sess.customerName} • Total Bill: <strong className="text-emerald-400">{formatINR(sess.totalAmount)}</strong>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSimulateExit && onSimulateExit(sess.id)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-xl shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Simulate Exit (Release Bay {sess.spotId})</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Single Vehicle Injection Form */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span>Inject Single Test Vehicle</span>
          <span className="text-cyan-400 font-mono">Live Gate Flow</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Type */}
          <select
            value={singleVehicleType}
            onChange={(e) => setSingleVehicleType(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
          >
            <option value="EV">Electric Vehicle (EV)</option>
            <option value="Non-EV">Standard ICE (Non-EV)</option>
          </select>

          {/* Battery */}
          {singleVehicleType === 'EV' ? (
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5">
              <span className="text-[11px] text-slate-400">Bat:</span>
              <input
                type="number"
                min="5"
                max="100"
                value={singleBattery}
                onChange={(e) => setSingleBattery(Number(e.target.value))}
                className="w-12 bg-transparent text-xs text-white font-mono font-bold focus:outline-none"
              />
              <span className="text-[11px] text-cyan-400 font-mono">%</span>
              {singleBattery <= 25 && (
                <span className="text-[10px] text-amber-400 font-bold ml-auto animate-pulse">Critical</span>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-[11px] text-slate-500">
              N/A (Standard Fuel)
            </div>
          )}

          {/* Trigger Dispatch */}
          <button
            type="button"
            onClick={() => onSimulateArrival({
              vehicleId: `${singleVehicleType === 'EV' ? 'EV' : 'ICE'}-${Math.floor(100 + Math.random() * 900)}`,
              isEV: singleVehicleType === 'EV',
              batteryLevel: singleVehicleType === 'EV' ? singleBattery : null,
              mode: currentMode
            })}
            disabled={isLoading}
            className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold px-3 py-2 rounded-lg flex items-center justify-center gap-1.5 shadow-md shadow-cyan-600/20 transition-all active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Dispatch to Gate</span>
          </button>
        </div>
      </div>

      {/* Chaos Simulator & System-Wide Batch Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Chaos Mode / Failure Simulator Toggle */}
        <button
          type="button"
          onClick={() => onChaosToggle(!chaosActive)}
          className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            chaosActive
              ? 'bg-rose-950 border-rose-500 text-rose-200 ring-1 ring-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <Wrench className={`w-4 h-4 ${chaosActive ? 'text-rose-400 animate-spin' : 'text-slate-400'}`} />
          <span>{chaosActive ? 'Chaos Active: EV Faults' : 'Trigger Chaos Faults'}</span>
        </button>

        {/* 150-Vehicle Batch Simulation Run */}
        <button
          type="button"
          onClick={onRunBatchSimulation}
          disabled={isLoading}
          className="p-3 rounded-xl border border-emerald-600/80 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-200 text-xs font-bold flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.2)] transition-all active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Run 150-Vehicle Benchmark</span>
        </button>

        {/* Reset System State */}
        <button
          type="button"
          onClick={onResetLot}
          disabled={isLoading}
          className="p-3 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>Reset Lot & Counters</span>
        </button>
      </div>
    </div>
  );
}
