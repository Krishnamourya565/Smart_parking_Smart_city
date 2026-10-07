import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Legend 
} from 'recharts';
import { 
  TrendingDown, 
  ShieldCheck, 
  Zap, 
  Leaf, 
  Compass, 
  BarChart3, 
  CheckCircle2, 
  Activity,
  Flame,
  Award
} from 'lucide-react';
import { BENCHMARK_METRICS } from '../utils/constants';

export default function AnalyticsPanel({ simulationData = null }) {
  // Chart data comparing the 150-Vehicle Benchmark
  const comparisonData = [
    {
      metric: 'Avg Search Dist (units)',
      Unorganized: BENCHMARK_METRICS.unorganized.avgDistance,
      Organized: BENCHMARK_METRICS.organized.avgDistance,
    },
    {
      metric: 'Spots Checked / Arrival',
      Unorganized: BENCHMARK_METRICS.unorganized.avgSpotsChecked,
      Organized: BENCHMARK_METRICS.organized.avgSpotsChecked,
    },
    {
      metric: 'Charger Misuse Events',
      Unorganized: BENCHMARK_METRICS.unorganized.misuseIncidents,
      Organized: BENCHMARK_METRICS.organized.misuseIncidents,
    },
    {
      metric: 'High-Priority EV Access',
      Unorganized: 7,
      Organized: 13,
    }
  ];

  // Predictive Peak Hourly Occupancy Flow
  const hourlyOccupancyData = [
    { hour: '08:00', totalVehicles: 8, evDemand: 2, smartCapacity: 27, randomCongestion: 18 },
    { hour: '10:00', totalVehicles: 24, evDemand: 8, smartCapacity: 80, randomCongestion: 92 },
    { hour: '12:00', totalVehicles: 29, evDemand: 10, smartCapacity: 97, randomCongestion: 100 },
    { hour: '14:00', totalVehicles: 27, evDemand: 9, smartCapacity: 90, randomCongestion: 96 },
    { hour: '16:00', totalVehicles: 22, evDemand: 7, smartCapacity: 73, randomCongestion: 85 },
    { hour: '18:00', totalVehicles: 15, evDemand: 4, smartCapacity: 50, randomCongestion: 62 },
    { hour: '20:00', totalVehicles: 6, evDemand: 1, smartCapacity: 20, randomCongestion: 28 },
  ];

  return (
    <div className="space-y-6">
      {/* 5 Core Benchmark KPI Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* KPI 1: Search Distance Reduction */}
        <div className="bg-[#0B1120] border border-cyan-900/60 rounded-xl p-4 shadow-lg relative overflow-hidden group hover:border-cyan-500/80 transition-all">
          <div className="absolute top-0 left-0 w-full h-1 bg-cyan-500" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Search Distance</span>
            <Compass className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-white">5.13u</span>
            <span className="text-xs text-slate-500 line-through">11.74u</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>-56% Cruising Reduction</span>
          </div>
        </div>

        {/* KPI 2: Direct Guidance Efficiency */}
        <div className="bg-[#0B1120] border border-emerald-900/60 rounded-xl p-4 shadow-lg relative overflow-hidden group hover:border-emerald-500/80 transition-all">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Spots Checked</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-300">1.00</span>
            <span className="text-xs text-slate-500 line-through">1.95 spots</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>Zero Blind Circling</span>
          </div>
        </div>

        {/* KPI 3: Charger Misuse Elimination */}
        <div className="bg-[#0B1120] border border-cyan-900/60 rounded-xl p-4 shadow-lg relative overflow-hidden group hover:border-cyan-500/80 transition-all">
          <div className="absolute top-0 left-0 w-full h-1 bg-cyan-400" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Charger Misuse</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-cyan-300">0</span>
            <span className="text-xs text-red-400 line-through">26 incidents</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-cyan-300 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Misuse Elimination</span>
          </div>
        </div>

        {/* KPI 4: Priority EV Charger Access */}
        <div className="bg-[#0B1120] border border-amber-900/60 rounded-xl p-4 shadow-lg relative overflow-hidden group hover:border-amber-500/80 transition-all">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Critical EV Access</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-300">13 / 54</span>
            <span className="text-xs text-slate-500 line-through">7 / 54</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>+86% Charger Utilization</span>
          </div>
        </div>

        {/* KPI 5: CO2 & Emissions Saved */}
        <div className="bg-[#0B1120] border border-teal-900/60 rounded-xl p-4 shadow-lg relative overflow-hidden group hover:border-teal-500/80 transition-all">
          <div className="absolute top-0 left-0 w-full h-1 bg-teal-500" />
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">CO₂ & Fuel Saved</span>
            <Leaf className="w-4 h-4 text-teal-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-teal-300">~50%</span>
            <span className="text-xs text-slate-400">1.98 kg CO₂</span>
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-teal-400 font-semibold">
            <Flame className="w-3.5 h-3.5" />
            <span>0.85 L Fuel / Batch Saved</span>
          </div>
        </div>

      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Side-by-Side Benchmark Performance Comparison */}
        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                150-Vehicle Standard Benchmark Comparison
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Unorganized Baseline vs Organized Smart Allocation Controller
              </p>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-cyan-300 border border-slate-700">
              IDEA Lab Benchmark
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="metric" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Unorganized" fill="#EF4444" radius={[4, 4, 0, 0]} name="Unorganized (Random Baseline)" />
                <Bar dataKey="Organized" fill="#06B6D4" radius={[4, 4, 0, 0]} name="Organized (Smart Controller)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Predictive Peak Occupancy & Congestion Flow */}
        <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Predictive Peak Occupancy & Urban Flow (%)
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Capacity utilization under coordinated central guidance vs unorganized searching
              </p>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] font-mono text-emerald-300 border border-slate-700">
              30 Spot Lot
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyOccupancyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="smartGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="randGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="hour" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748B" fontSize={11} tickLine={false} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B1120', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="randomCongestion" stroke="#EF4444" fillOpacity={1} fill="url(#randGrad)" name="Unorganized Congestion Index (%)" />
                <Area type="monotone" dataKey="smartCapacity" stroke="#10B981" fillOpacity={1} fill="url(#smartGrad)" name="Smart System Utilization (%)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Official Benchmark Results Table */}
      <div className="bg-[#0B1120] border border-slate-800 rounded-2xl p-5 shadow-xl">
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" />
          Standardized Benchmark Evaluation Table (150-Vehicle Batch Verification)
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase bg-slate-950/60">
                <th className="py-2.5 px-3">Performance Metric</th>
                <th className="py-2.5 px-3">Unorganized (Random Baseline)</th>
                <th className="py-2.5 px-3">Organized (Smart Controller)</th>
                <th className="py-2.5 px-3 text-emerald-400 font-bold">Gain / Reduction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="py-2.5 px-3 font-sans font-medium text-white">Avg. Distance Traveled to Park</td>
                <td className="py-2.5 px-3 text-slate-300">11.74 units</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">5.13 units</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">−56% Search Reduction</td>
              </tr>
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="py-2.5 px-3 font-sans font-medium text-white">Avg. Spots Checked per Arrival</td>
                <td className="py-2.5 px-3 text-slate-300">1.95 spots</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">1.00 spot</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">Optimal Direct Guidance</td>
              </tr>
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="py-2.5 px-3 font-sans font-medium text-white">Charging-Spot Misuse Incidents</td>
                <td className="py-2.5 px-3 text-red-400">26 incidents</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">0 incidents</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">100% Misuse Elimination</td>
              </tr>
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="py-2.5 px-3 font-sans font-medium text-white">High-Priority EV Charger Access</td>
                <td className="py-2.5 px-3 text-slate-300">7 / 54 EVs</td>
                <td className="py-2.5 px-3 text-amber-300 font-bold">13 / 54 EVs</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">+86% Charger Utilization</td>
              </tr>
              <tr className="hover:bg-slate-900/40 transition-colors">
                <td className="py-2.5 px-3 font-sans font-medium text-white">CO₂ Emissions Reduction</td>
                <td className="py-2.5 px-3 text-slate-300">Baseline Cruising</td>
                <td className="py-2.5 px-3 text-teal-300 font-bold">Optimized Route</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">~50% Emissions Saved</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
