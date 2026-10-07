import React, { useState } from 'react';
import { 
  Presentation, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Layers, 
  Zap, 
  ShieldCheck, 
  Award, 
  TrendingDown, 
  Cpu, 
  CheckCircle2,
  Users,
  Compass,
  Sparkles
} from 'lucide-react';
import { BENCHMARK_METRICS } from '../utils/constants';

export default function PresentationModal({ isOpen, onClose }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!isOpen) return null;

  const slides = [
    {
      title: "Organized Urban Systems: Software-Driven Smart Parking & Priority EV Allocation",
      subtitle: "Software-Based Urban Resource Optimization • IDEA Lab Presentation",
      category: "Title Slide",
      content: (
        <div className="space-y-6 text-center py-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/80 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            IDEA Lab — Department of Computer Engineering
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight max-w-2xl mx-auto">
            Organized Urban Systems: Software-Driven Smart Parking & Priority EV Allocation
          </h1>
          <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto">
            Proving that centralized spatial coordination dramatically reduces urban congestion and resource misuse compared to unorganized greedy decision-making.
          </p>
          <div className="pt-4 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto text-xs">
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-slate-400 font-medium">Student</div>
              <div className="font-bold text-white mt-0.5">[Student Name]</div>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-slate-400 font-medium">Roll Number</div>
              <div className="font-bold text-white mt-0.5">[Roll Number]</div>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-slate-400 font-medium">Department</div>
              <div className="font-bold text-white mt-0.5">Computer Engineering</div>
            </div>
            <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
              <div className="text-slate-400 font-medium">Lab Context</div>
              <div className="font-bold text-cyan-400 mt-0.5">IDEA Lab 2026</div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Problem Statement & Urban Resource Inefficiency",
      subtitle: "Why Local Greedy Decision-Making Fails in Urban Environments",
      category: "Problem Analysis",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="bg-red-950/30 border border-red-900/60 rounded-xl p-5 space-y-3">
            <div className="text-xs font-bold uppercase text-red-400 flex items-center gap-1.5">
              <span>Unorganized Baseline (Random Search)</span>
            </div>
            <h3 className="text-base font-bold text-white">Systemic Failure Modes:</h3>
            <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
              <li><strong>Cruising Congestion:</strong> Drivers execute random-search patterns across lot rows, increasing travel distance by +129%.</li>
              <li><strong>EV Charger Misuse:</strong> Standard ICE vehicles and high-battery EVs block scarce 50kW fast chargers (26 incidents / 150 batch).</li>
              <li><strong>Critical EV Depletion:</strong> Stranded EVs with &le;25% battery unable to access charging infrastructure.</li>
            </ul>
          </div>

          <div className="bg-cyan-950/30 border border-cyan-900/60 rounded-xl p-5 space-y-3">
            <div className="text-xs font-bold uppercase text-cyan-400 flex items-center gap-1.5">
              <span>Organized Central Controller Solution</span>
            </div>
            <h3 className="text-base font-bold text-white">Software Coordination Insight:</h3>
            <ul className="space-y-2 text-xs text-slate-300 list-disc list-inside">
              <li><strong>Direct Point-to-Point Wayfinding:</strong> Instant spatial assignment from Gate (0,0) with 1.00 checks per car.</li>
              <li><strong>Strict EV Priority Protocol:</strong> Critical EVs (&le;25% battery) guaranteed fast chargers; standard ICE vehicles restricted to regular bays.</li>
              <li><strong>100% Misuse Elimination:</strong> Zero charger blocking events, maximizing high-priority access.</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Three-Layer Pure Software Architecture",
      subtitle: "Modular Architecture for Real-Time State Coordination",
      category: "System Architecture",
      content: (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-500 text-cyan-300 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h4 className="text-sm font-bold text-white">Simulation Layer (Backend Engine)</h4>
            <p className="text-xs text-slate-400">
              In-memory event stream generating realistic vehicle arrival rates, stay durations (turnover), battery levels, and vehicle types.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500 text-emerald-300 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h4 className="text-sm font-bold text-white">Central Controller (Algorithmic Core)</h4>
            <p className="text-xs text-slate-400">
              Evaluates incoming states, enforces 25% battery EV priority constraints, detects faults, and assigns exact spatial coordinates.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="w-8 h-8 rounded-lg bg-teal-950 border border-teal-500 text-teal-300 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h4 className="text-sm font-bold text-white">Guidance & Dashboard Layer (React UI)</h4>
            <p className="text-xs text-slate-400">
              Renders live spatial map grid states, driver assignment paths, active user counts, route lines, and real-time analytical comparisons.
            </p>
          </div>
        </div>
      )
    },
    {
      title: "Core Allocation Logic & Priority Protocol",
      subtitle: "Deterministic Rules for Zero-Misuse Resource Allocation",
      category: "Algorithmic Design",
      content: (
        <div className="space-y-4 py-3">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-cyan-300">
            <div className="text-slate-500 mb-1">// Strict Centralized Protocol</div>
            <div className="text-emerald-400 font-bold">LOW_BATTERY_THRESHOLD = 25%</div>
            <br />
            <div><strong>IF</strong> vehicle is EV AND battery &le; 25%:</div>
            <div className="pl-4 text-cyan-300">&rarr; Assign nearest FREE EV Charging Spot</div>
            <div className="pl-4 text-slate-400">&rarr; Fallback to nearest FREE Regular Spot ONLY IF all EV spots are occupied</div>
            <div><strong>ELSE IF</strong> vehicle is EV AND battery &gt; 25%:</div>
            <div className="pl-4 text-cyan-300">&rarr; Assign nearest FREE Regular Spot (reserving chargers for critical demand)</div>
            <div><strong>ELSE</strong> (non-EV vehicle):</div>
            <div className="pl-4 text-cyan-300">&rarr; Assign nearest FREE Regular Spot ONLY (Strict zero-misuse policy)</div>
          </div>
          <p className="text-xs text-slate-400">
            The algorithm guarantees that standard vehicles never occupy scarce charging bays, preserving charging throughput for depleted electric vehicles.
          </p>
        </div>
      )
    },
    {
      title: "150-Vehicle Standard Benchmark Evaluation",
      subtitle: "Verified Experimental Results: Unorganized Baseline vs Organized Controller",
      category: "Experimental Evaluation",
      content: (
        <div className="py-2 space-y-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase bg-slate-950">
                <th className="py-2.5 px-3">Performance Metric</th>
                <th className="py-2.5 px-3">Unorganized (Random Baseline)</th>
                <th className="py-2.5 px-3">Organized (Smart Controller)</th>
                <th className="py-2.5 px-3 text-emerald-400 font-bold">Gain / Reduction</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-white">Avg. Distance Traveled to Park</td>
                <td className="py-2.5 px-3 text-slate-300">11.74 units</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">5.13 units</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">−56% Search Reduction</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-white">Avg. Spots Checked per Arrival</td>
                <td className="py-2.5 px-3 text-slate-300">1.95 spots</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">1.00 spot</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">Optimal Direct Guidance</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-white">Charging-Spot Misuse Incidents</td>
                <td className="py-2.5 px-3 text-red-400">26 incidents</td>
                <td className="py-2.5 px-3 text-cyan-300 font-bold">0 incidents</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">100% Misuse Elimination</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-white">High-Priority EV Charger Access</td>
                <td className="py-2.5 px-3 text-slate-300">7 / 54 EVs</td>
                <td className="py-2.5 px-3 text-amber-300 font-bold">13 / 54 EVs</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">+86% Charger Utilization</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-sans font-medium text-white">CO₂ Emissions Reduction</td>
                <td className="py-2.5 px-3 text-slate-300">Baseline Cruising</td>
                <td className="py-2.5 px-3 text-teal-300 font-bold">Optimized Route</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">~50% Emissions Saved</td>
              </tr>
            </tbody>
          </table>
        </div>
      )
    },
    {
      title: "Key Takeaways & Urban Impact",
      subtitle: "Conclusions for Modern Urban Infrastructure Design",
      category: "Conclusion",
      content: (
        <div className="space-y-4 py-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                Software Beats Concrete
              </h4>
              <p className="text-slate-300">
                Urban parking problems do not require building more asphalt capacity; centralized coordination unlocks massive efficiency with existing infrastructure.
              </p>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
              <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-emerald-400" />
                Immediate Decarbonization
              </h4>
              <p className="text-slate-300">
                Eliminating random cruising cuts ~50% of local parking-lot emissions and saves substantial fuel per operational year.
              </p>
            </div>
          </div>
          <div className="p-4 bg-cyan-950/40 border border-cyan-800/80 rounded-xl text-center text-slate-300">
            <strong>Demonstration Status:</strong> Fully implemented in React + Express with real-time wayfinding, chaos injection testing, and batch simulation validation.
          </div>
        </div>
      )
    }
  ];

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl bg-[#0B1120] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Top Header */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <Presentation className="w-5 h-5 text-cyan-400" />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {slide.category} • Slide {currentSlide + 1} of {slides.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Body */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          <div className="mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">{slide.title}</h2>
            <p className="text-xs md:text-sm text-cyan-400 font-medium mt-1">{slide.subtitle}</p>
          </div>
          {slide.content}
        </div>

        {/* Modal Bottom Footer Navigation */}
        <div className="p-4 px-6 border-t border-slate-800 flex items-center justify-between bg-slate-950/60 text-xs">
          <button
            type="button"
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide(prev => Math.max(0, prev - 1))}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 font-semibold flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-1.5">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentSlide === idx ? 'bg-cyan-400 w-6' : 'bg-slate-700 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            disabled={currentSlide === slides.length - 1}
            onClick={() => setCurrentSlide(prev => Math.min(slides.length - 1, prev + 1))}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-600/20"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
