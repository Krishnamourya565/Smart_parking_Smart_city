import React from 'react';
import { 
  Zap, 
  Car, 
  MapPin, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Compass, 
  Activity,
  Radio,
  ArrowDown
} from 'lucide-react';

export default function LiveArrivalFeed({ arrivals = [] }) {
  return (
    <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col h-full min-h-[500px]">
      {/* Feed Header */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-bold text-white tracking-tight">
            Live Vehicle Inflow & Arrival Feed
          </h3>
        </div>
        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono bg-slate-900 border border-slate-800 text-slate-300">
          <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
          Live Stream ({arrivals.length})
        </span>
      </div>

      {/* Feed List Container */}
      <div className="flex-1 overflow-y-auto max-h-[560px] space-y-2.5 pr-1.5 pb-2">
        {arrivals.length === 0 ? (
          <div className="text-center py-16 text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <Clock className="w-8 h-8 text-slate-600" />
            <span>No recent arrivals. Dispatch vehicles or run batch simulation.</span>
          </div>
        ) : (
          arrivals.map((arr) => {
            const isCritical = arr.isEV && arr.batteryLevel <= 25;
            return (
              <div
                key={arr.id}
                className="p-3.5 bg-slate-900/90 border border-slate-800/80 hover:border-slate-700 rounded-xl flex items-center justify-between gap-3 text-xs transition-colors shadow-sm"
              >
                {/* Left: Vehicle Badge & Details */}
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg border ${
                    arr.isEV 
                      ? isCritical 
                        ? 'bg-amber-950/60 border-amber-500/80 text-amber-300' 
                        : 'bg-cyan-950/60 border-cyan-500/80 text-cyan-300' 
                      : 'bg-emerald-950/60 border-emerald-500/80 text-emerald-300'
                  }`}>
                    {arr.isEV ? <Zap className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-xs">{arr.vehicleId}</span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                        arr.isEV 
                          ? isCritical 
                            ? 'bg-amber-950 text-amber-400 border-amber-700' 
                            : 'bg-cyan-950 text-cyan-400 border-cyan-700' 
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {arr.isEV ? `EV (${arr.batteryLevel}%)` : 'ICE'}
                      </span>
                      {isCritical && (
                        <span className="text-[10px] bg-red-950/80 text-red-300 px-1.5 py-0.5 rounded border border-red-700 animate-pulse font-bold">
                          Critical
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                      <span>Mode: <strong className="capitalize text-slate-300">{arr.mode || 'smart'}</strong></span>
                      <span>•</span>
                      <span>Dist: <strong className="text-cyan-400 font-mono">{arr.distanceTraveled}u</strong></span>
                      <span>•</span>
                      <span>Checks: <strong className="text-emerald-400 font-mono">{arr.spotsChecked}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Right: Assigned Bay & Status */}
                <div className="text-right shrink-0">
                  <div className="flex items-center justify-end gap-1.5 font-mono font-bold text-white">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{arr.assignedSpotId}</span>
                  </div>
                  {arr.misuseOccurred ? (
                    <div className="text-[10px] text-red-400 font-semibold flex items-center justify-end gap-1 mt-0.5">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Misuse Event</span>
                    </div>
                  ) : arr.priorityAssigned ? (
                    <div className="text-[10px] text-cyan-300 font-semibold flex items-center justify-end gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                      <span>Priority Allocated</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-emerald-400 font-semibold mt-0.5">
                      <span>{arr.status || 'Allocated'}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer helper note if multiple items */}
      {arrivals.length > 5 && (
        <div className="pt-2 border-t border-slate-800/60 text-center text-[10px] text-slate-500 flex items-center justify-center gap-1 shrink-0">
          <ArrowDown className="w-3 h-3 text-slate-600 animate-bounce" />
          <span>Scroll to view all {arrivals.length} arrival logs</span>
        </div>
      )}
    </div>
  );
}
