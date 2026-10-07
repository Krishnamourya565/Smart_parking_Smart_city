# Slide Deck Presentation Notes — Organized Urban Systems: Software-Driven Smart Parking & Priority EV Allocation

**IDEA Lab Evaluation Presentation**  
**Department of Computer Engineering**  

---

## Slide 1: Title Slide & Lab Identity
* **Header:** Organized Urban Systems: Software-Driven Smart Parking & Priority EV Allocation
* **Theme:** Software-Based Urban Resource Optimization
* **Course:** Innovation Design Engineering and Apply (IDEA Lab)
* **Presenters:** `[Student Name]` (Roll No: `[Roll Number]`)
* **Supervisor:** `[Supervisor / Faculty Name]`
* **Key Visuals:** Neon Electric Blue & Emerald glowing lot architecture schematic with entrance coordinate `(0, 0)`.

---

## Slide 2: Urban Spatial Challenge & Decentralized Failure
* **Core Problem:** Why do urban parking environments experience massive congestion when physical spots are still free?
* **Urban Systemic Insight:** Cruising for parking accounts for up to 30% of downtown traffic congestion in major metropolitan centers.
* **Failure Modes:**
  * **Information Asymmetry:** Drivers search blindly without global state knowledge.
  * **Resource Misuse:** ICE vehicles block 50kW EV fast chargers, starving low-battery EVs.
  * **Emissions Escalation:** Every minute of searching wastes fuel and elevates carbon output.

---

## Slide 3: Three-Layer Pure Software Architecture
* **Layer 1 (Simulation Engine):** In-memory event stream generating Poisson vehicle inflows, battery states (5%–100%), and dwell durations.
* **Layer 2 (Central Controller):** Real-time spatial allocator enforcing 25% battery EV priority constraints and dynamic chaos fault rerouting.
* **Layer 3 (Guidance UI & Map):** High-fidelity React dashboard displaying 30-spot spatial grid (24 Regular, 6 EV) and vector wayfinding route overlays.

---

## Slide 4: Centralized Allocation Algorithm & Priority Rules
* **Priority Rule 1 (Critical EV, $\le 25\%$ Battery):**
  * Assigned nearest free EV Charging Bay (`EV01`–`EV06`).
  * Fallback to nearest regular bay ONLY IF all EV bays are saturated.
* **Priority Rule 2 (Non-Critical EV, $> 25\%$ Battery):**
  * Assigned nearest free regular spot (`R01`–`R24`) to preserve fast chargers for critical demand.
* **Priority Rule 3 (Non-EV / ICE Vehicle):**
  * Assigned nearest free regular spot ONLY (Strict zero-misuse policy).

---

## Slide 5: Interactive Visual Map & UI Design
* **Spatial Layout:** 30 spots configured across 3 structured rows with main transit aisles.
* **Symbolic & Color Encoding:**
  * **Regular Bays `[ P ]`:** Free = Glowing Green (`#10B981`), Occupied = Dimmed Slate/Gray (`#64748B`).
  * **EV Fast Chargers `[ ⚡ ]`:** Free = Neon Electric Blue (`#06B6D4`), Occupied = Crimson Red (`#EF4444`), Reserved = Amber (`#F59E0B`).
* **Vector Wayfinding Overlay:** Point-to-point dynamic path rendering from Entrance Gate `(0, 0)` straight to target coordinates.

---

## Slide 6: Standard 150-Vehicle Benchmark Evaluation
* **Batch Size:** 150 Vehicles (~36% EV Share, 18 Critical EV profiles).

| Metric | Unorganized Baseline | Organized Smart Controller | Systemic Gain |
| :--- | :--- | :--- | :--- |
| **Avg. Search Distance** | 11.74 units | 5.13 units | **−56% Cruising Reduction** |
| **Spots Checked / Car** | 1.95 spots | 1.00 spot | **Optimal Direct Guidance** |
| **Charger Misuse Events** | 26 incidents | 0 incidents | **100% Misuse Elimination** |
| **Critical EV Charger Access** | 7 / 54 EVs | 13 / 54 EVs | **+86% Charger Utilization** |
| **CO₂ Emissions Reduction** | Baseline Cruising | Optimized Route | **~50% Emissions Saved** |

---

## Slide 7: Environmental & Carbon Decarbonization Impact
* **Emissions Reduction:** Cruising distance reduced from 1,761 units to 769 units across 150 vehicles.
* **Direct Carbon Savings:** 1,983 grams of CO₂ saved per 150 cars.
* **Macro Urban Scalability:** In an active 500-bay municipal lot servicing 4,000 cars daily, centralized software coordination eliminates **18.2 metric tons of CO₂ emissions annually**.

---

## Slide 8: Chaos Engineering & Fault Resilience
* **Simulated Hardware Failure:** Broken charging station or sensor blackout triggered via Admin Chaos Mode.
* **Dynamic Algorithmic Rerouting:** System automatically recalculates vector paths for incoming vehicles, bypassing faulted stalls with zero downtime.
* **Admin Manual Override:** Capability to reserve VIP/emergency stalls with instant UI synchronization.

---

## Slide 9: Tech Stack & Implementation Quality
* **Frontend:** React 18, Tailwind CSS, Lucide Icons, Recharts Analytics Suite.
* **Backend:** Node.js, Express.js REST API with in-memory session tracking.
* **Validation Engine:** Python 3 deterministic batch simulation script.
* **Verification:** Automated builds, zero compilation errors, and complete state persistence.

---

## Slide 10: Conclusion & Key Insights
* **1. Software Beats Concrete:** Urban efficiency problems do not require expensive multi-million dollar concrete expansions—centralized software coordination achieves immediate 56% gains.
* **2. Equity & Sustainability:** Strict priority algorithms prevent EV charger blocking and guarantee infrastructure access for low-battery vehicles.
* **3. Production Readiness:** Fully functional interactive web application, REST API, and Python validation scripts delivered.
