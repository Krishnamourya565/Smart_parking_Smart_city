# Organized Urban Systems: Software-Driven Smart Parking & Priority EV Allocation

> **Theme:** Software-Based Urban Resource Optimization  
> **Course:** Innovation Design Engineering and Apply (IDEA Lab), Department of Computer Engineering  

---

## 📌 Executive Overview

This repository contains the complete software demonstration for **Organized Urban Systems: Software-Driven Smart Parking & Priority EV Allocation**. 

Urban resource allocation frequently fails due to uncoordinated, local decision-making where drivers search randomly, multiplying cruising emissions and misusing scarce high-voltage EV fast chargers. This project implements a **centralized spatial coordination software stack** proving that intelligent algorithmic guidance dramatically eliminates urban congestion and infrastructure misuse.

---

## 📊 Standard Benchmark Results (150-Vehicle Batch Verification)

| Performance Metric | Unorganized (Random Baseline) | Organized (Smart Controller) | Gain / Reduction |
| :--- | :--- | :--- | :--- |
| **Avg. Distance Traveled to Park** | 11.74 units | 5.13 units | **−56% Search Reduction** |
| **Avg. Spots Checked per Arrival** | 1.95 spots | 1.00 spot | **Optimal Direct Guidance** |
| **Charging-Spot Misuse Incidents** | 26 incidents | 0 incidents | **100% Misuse Elimination** |
| **High-Priority EV Charger Access** | 7 / 54 EVs | 13 / 54 EVs | **+86% Charger Utilization** |
| **CO₂ Emissions Reduction** | Baseline Cruising | Optimized Route | **~50% Emissions Saved** |

---

## 🏗️ Three-Layer Software Stack

```
1. Frontend UI (React + Tailwind + Lucide Icons + Recharts)
   └── Spatial 30-Spot Grid Map (EV ⚡ Electric Blue/Red, Regular P Green/Slate)
   └── Turn-by-Turn Wayfinding Route Vector from Gate (0,0) to Bay
   └── Dual-Role Access: Driver Portal vs Admin Central Controller
   └── Real-time Analytics & Peak Congestion Heatmaps

2. Central Controller API (Node.js + Express.js)
   └── Strict 25% Battery Priority Allocation Engine
   └── Active Session Concurrency Manager & Live Inflow Feed
   └── Chaos Engineering / Hardware Fault Simulator

3. Validation & Simulation Layer (Python 3)
   └── Standalone deterministic 150-vehicle batch simulation script
```

---

## 🚀 Quickstart Guide

### Prerequisites
* **Node.js**: v18+ (tested on v24)
* **npm**: v9+ (tested on v11)
* **Python**: 3.8+ (tested on v3.14)

---

### Step 1: Install Dependencies

From the project root:

```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

---

### Step 2: Start the Application

#### Terminal 1 — Start Express Backend API:
```bash
cd server
npm start
# Server runs on http://localhost:5000
```

#### Terminal 2 — Start React Frontend Web Application:
```bash
cd client
npm run dev
# Vite dev server runs on http://localhost:3000
```

Open **http://localhost:3000** in your browser.

---

### Step 3: Run the Python Batch Simulation Script

To verify the benchmark metrics directly in your terminal:

```bash
python simulation/smart_parking_simulation.py
```

---

## 🔑 Application User Experience & Roles

### 1. Driver Portal
* **Vehicle Type Selection:** Electric Vehicle (EV) vs Standard ICE.
* **Battery State Slider:** Configurable from 5% to 100% with live calculation of:
  * Estimated Charging Duration (mins to 80%)
  * Energy Requirement (kWh)
  * Estimated Cost (\$0.25/kWh)
* **Pre-Booking Hold:** 15-minute reservation timer.
* **Driver Guidance View:** Turn-by-turn routing instructions from Gate `(0, 0)` to assigned bay.

### 2. Admin & Analyst Dashboard
* **Default Passcode:** `admin123` (or `admin`)
* **30-Spot Spatial Map:**
  * **Regular Spots `[ P ]`:** Free = Glowing Green (`#10B981`), Occupied = Dimmed Slate/Gray (`#64748B`).
  * **EV Fast Chargers `[ ⚡ ]`:** Free = Neon Electric Blue (`#06B6D4`), Occupied = Crimson Red (`#EF4444`), Reserved = Amber (`#F59E0B`), Faulty = Purple/Warning.
* **Chaos Mode / Failure Simulator:** Toggle broken chargers (simulates `EV02` & `EV04` faults) to observe real-time algorithmic traffic rerouting.
* **Batch Trigger:** 1-click execution of the 150-vehicle benchmark.
* **Manual Override:** Directly alter individual spot statuses (Free, Occupied, Fault, Reserved).

---

## 📁 Repository Directory Structure

```
krishan_m/
├── package.json                         # Root orchestration scripts
├── README.md                            # Comprehensive project manual
│
├── server/                              # Backend Express Microservice
│   ├── index.js                         # REST API endpoints & route handlers
│   ├── allocationEngine.js              # Strict priority controller & random baseline
│   ├── simulationEngine.js              # 150-vehicle benchmark engine
│   ├── state.js                         # In-memory spatial state & session tracker
│   └── package.json
│
├── client/                              # Modern React Web Application
│   ├── index.html                       # HTML entry point with dark theme fonts
│   ├── vite.config.js                   # Vite bundler & API proxy configuration
│   ├── tailwind.config.js               # Custom EV/Urban color palette tokens
│   ├── package.json
│   └── src/
│       ├── main.jsx                     # React root mount
│       ├── App.jsx                      # Master controller component
│       ├── index.css                    # Glowing neon indicators & base styling
│       ├── components/
│       │   ├── LoginModal.jsx           # Dual-role login modal & live calculators
│       │   ├── ParkingGridMap.jsx       # 30-spot spatial map & route overlay
│       │   ├── AnalyticsPanel.jsx       # Recharts KPI cards & occupancy heatmaps
│       │   ├── SimulationControl.jsx    # Smart/Random toggle, Chaos & Batch triggers
│       │   ├── LiveArrivalFeed.jsx      # Rolling vehicle arrival telemetry log
│       │   ├── DriverGuidanceView.jsx   # Turn-by-turn driver cockpit & charger stats
│       │   └── PresentationModal.jsx    # In-app interactive slide deck viewer
│       └── utils/
│           └── constants.js             # Benchmark numbers & charging formulas
│
├── simulation/                          # Python Validation Script
│   └── smart_parking_simulation.py      # Standalone batch validation script
│
└── docs/                                # Academic Deliverables
    ├── PROJECT_REPORT.md                # Formal IDEA Lab academic report
    ├── PRESENTATION_DECK.md             # Slide deck talking points and notes
    └── slides.html                      # Standalone interactive HTML presentation
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/spots` | Retrieve all 30 spots with coordinates and status |
| `GET` | `/api/users/active` | Get active session counts (Drivers seeking vs Admins) |
| `POST` | `/api/auth/driver` | Register active driver vehicle parameters |
| `POST` | `/api/auth/admin` | Authenticate admin session (`admin123`) |
| `POST` | `/api/vehicles/arrive` | Allocate spot for vehicle (`isEV`, `batteryLevel`, `mode`) |
| `POST` | `/api/simulate` | Execute 150-vehicle batch simulation |
| `POST` | `/api/spots/:id/fault` | Toggle hardware fault on specific spot (Chaos Mode) |
| `POST` | `/api/spots/:id/override` | Manually set spot status (Free, Occupied, Reserved) |
| `GET` | `/api/benchmark` | Retrieve standard benchmark metrics |
| `POST` | `/api/reset` | Reset entire lot state and active counters |

---

## 📜 Presentation Slides

Open `docs/slides.html` directly in any web browser to present the 10-slide deck with arrow key navigation, or click the **"Slide Deck"** button inside the running React web interface.
