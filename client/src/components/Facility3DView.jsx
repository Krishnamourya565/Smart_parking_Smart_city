import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { 
  RotateCcw, 
  Eye, 
  Zap, 
  Compass, 
  Car as CarIcon, 
  ShieldAlert, 
  AlertTriangle,
  Play,
  Layers,
  MapPin
} from 'lucide-react';
import { CarModel, AnimatedSplineCar } from './Car';
import { STATUS_COLORS, CAR_SHADES } from '../utils/constants';

// CAMERA PRESETS (Framing the whole facility with generous margins and no clipping)
const CAMERA_PRESETS = {
  overview: { position: [22, 28, 34], target: [0, 0, 0] },
  evZone: { position: [-8, 16, 18], target: [-5.5, 0, -4.5] },
  topDown: { position: [0, 52, 0.1], target: [0, 0, 0] }
};

/**
 * High-Tech Architectural Gantry Arch & Automated Heavy Barrier Gate
 * - Dual steel vertical pylons with cross truss spanning the roadway
 * - High-resolution digital LED signboard:
 *   * INGRESS: "▶ INGRESS 01 • SMART ALPR ACTIVE • 10 KM/H" (Vibrant Emerald #00D98B)
 *   * EGRESS: "◀ EGRESS 01 • AUTOMATED CHECKOUT • SAFE TRAVELS" (Vibrant Cyan #38BDF8)
 * - Dual ALPR optical camera scanners mounted on overhead truss with laser flash lenses
 * - 3-Aspect Traffic Signal Column (Red / Amber / Green LEDs with real glow)
 * - Motorized boom barrier with red & white reflective hazard stripes
 * - Yellow diagonal hatched "KEEP CLEAR / DO NOT BLOCK" safety grid on road surface
 * - Single crisp white-on-black HUD pill badge
 */
function HighTechGateGantry({ position, rotation = [0, 0, 0], label, sublabel, isOpen = false, isExit = false }) {
  const armRef = useRef();

  useFrame((_, delta) => {
    if (!armRef.current) return;
    const targetAngle = isOpen ? -Math.PI / 2.3 : 0;
    armRef.current.rotation.z = THREE.MathUtils.damp(armRef.current.rotation.z, targetAngle, 4.5, delta);
  });

  const accentColor = isExit ? '#EF4444' : '#00D98B';

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Yellow Diagonally Hatched "KEEP CLEAR" Box Junction on Asphalt */}
      <group position={[0, 0.02, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[3.8, 3.2]} />
          <meshBasicMaterial color="#0B132B" transparent opacity={0.65} />
        </mesh>
        {/* Perimeter Border */}
        <mesh position={[0, 0.005, -1.55]}>
          <planeGeometry args={[3.8, 0.09]} />
          <meshBasicMaterial color="#FACC15" toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.005, 1.55]}>
          <planeGeometry args={[3.8, 0.09]} />
          <meshBasicMaterial color="#FACC15" toneMapped={false} />
        </mesh>
        <mesh position={[-1.85, 0.005, 0]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[3.2, 0.09]} />
          <meshBasicMaterial color="#FACC15" toneMapped={false} />
        </mesh>
        <mesh position={[1.85, 0.005, 0]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[3.2, 0.09]} />
          <meshBasicMaterial color="#FACC15" toneMapped={false} />
        </mesh>
        {/* Diagonal Cross-Hatching Stripes */}
        {[-1.0, -0.4, 0.2, 0.8].map((ox, i) => (
          <mesh key={i} position={[ox, 0.005, 0]} rotation={[0, 0, Math.PI / 4]}>
            <planeGeometry args={[2.8, 0.07]} />
            <meshBasicMaterial color="#FACC15" transparent opacity={0.85} toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* 2. Left & Right Architectural Support Pylons (Span across 3.6m Road) */}
      {[-1.9, 1.9].map((px, idx) => (
        <group key={idx} position={[px, 0, 0]}>
          {/* Concrete Footing */}
          <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.65, 0.5, 0.65]} />
            <meshStandardMaterial color="#1E293B" roughness={0.8} />
          </mesh>
          {/* Structural Steel Column */}
          <mesh position={[0, 2.3, 0]} castShadow>
            <boxGeometry args={[0.26, 3.8, 0.26]} />
            <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.85} />
          </mesh>
          {/* Neon Corner Accent Line */}
          <mesh position={[px > 0 ? -0.135 : 0.135, 2.3, 0.135]}>
            <boxGeometry args={[0.02, 3.6, 0.02]} />
            <meshBasicMaterial color={accentColor} toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* 3. Overhead Gantry Cross-Beam Arch */}
      <mesh position={[0, 4.15, 0]} castShadow>
        <boxGeometry args={[4.1, 0.42, 0.42]} />
        <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.85} />
      </mesh>
      {/* Lower Gantry Truss Rod */}
      <mesh position={[0, 3.85, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 3.8, 8]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#334155" metalness={0.9} />
      </mesh>

      {/* 4. Overhead Digital LED Matrix Signboard */}
      <mesh position={[0, 4.15, 0.23]}>
        <boxGeometry args={[3.2, 0.32, 0.04]} />
        <meshStandardMaterial color="#000000" roughness={0.2} metalness={0.9} />
      </mesh>
      {/* Glowing Signface text/glyphs */}
      <Html position={[0, 4.15, 0.27]} center transform distanceFactor={20}>
        <div className="pl-4 pr-3 py-1 rounded bg-black/90 border border-white/20 text-center select-none pointer-events-none max-w-xs">
          <div className="text-xs sm:text-sm font-mono font-black tracking-widest flex items-center gap-1.5" style={{ color: accentColor }}>
            <span>{isExit ? '◀ EGRESS 01' : '▶ INGRESS 01'}</span>
            <span className="text-white/60">///</span>
            <span>{isExit ? 'AUTOMATED CHECKOUT CLEAR' : 'SMART ALPR ACTIVE'}</span>
          </div>
        </div>
      </Html>

      {/* 5. Dual Optical ALPR Scanners with Infrared Flash Lenses */}
      {[-0.8, 0.8].map((camX, idx) => (
        <group key={idx} position={[camX, 3.75, 0.28]} rotation={[0.22, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.22, 0.14, 0.32]} />
            <meshStandardMaterial color="#1E293B" metalness={0.7} />
          </mesh>
          {/* Optical Glass Lens */}
          <mesh position={[0, 0, 0.165]}>
            <cylinderGeometry args={[0.05, 0.05, 0.02, 12]} rotation={[Math.PI / 2, 0, 0]} />
            <meshBasicMaterial color="#38BDF8" toneMapped={false} />
          </mesh>
          {/* Status Red/Green LED Pin */}
          <mesh position={[0.07, 0.04, 0.165]}>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshBasicMaterial color="#00D98B" toneMapped={false} />
          </mesh>
        </group>
      ))}

      {/* 6. 3-Aspect Traffic Signal Column (Mounted on Ingress Pillar) */}
      <group position={[-2.2, 2.5, 0.35]}>
        <mesh castShadow>
          <boxGeometry args={[0.22, 0.65, 0.16]} />
          <meshStandardMaterial color="#09090B" roughness={0.4} />
        </mesh>
        {/* Red Light */}
        <mesh position={[0, 0.2, 0.085]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 12]} rotation={[Math.PI / 2, 0, 0]} />
          <meshBasicMaterial color={isOpen ? '#450A0A' : '#EF4444'} toneMapped={false} />
        </mesh>
        {/* Amber Light */}
        <mesh position={[0, 0, 0.085]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 12]} rotation={[Math.PI / 2, 0, 0]} />
          <meshBasicMaterial color="#78350F" toneMapped={false} />
        </mesh>
        {/* Green Light */}
        <mesh position={[0, -0.2, 0.085]}>
          <cylinderGeometry args={[0.05, 0.05, 0.02, 12]} rotation={[Math.PI / 2, 0, 0]} />
          <meshBasicMaterial color={isOpen ? '#00D98B' : '#064E3B'} toneMapped={false} />
        </mesh>
      </group>

      {/* 7. Heavy-Duty Automated Barrier Gate Assembly */}
      <group position={[-1.55, 0, 0.3]}>
        {/* Motor Cabinet Housing */}
        <mesh position={[0, 0.68, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.48, 1.35, 0.48]} />
          <meshStandardMaterial color="#1E293B" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Top Warning Flasher Beacon */}
        <mesh position={[0, 1.42, 0]}>
          <cylinderGeometry args={[0.09, 0.11, 0.12, 12]} />
          <meshBasicMaterial color={isOpen ? '#00D98B' : '#EF4444'} toneMapped={false} />
        </mesh>
        <pointLight position={[0, 1.5, 0]} color={isOpen ? '#00D98B' : '#EF4444'} intensity={1.1} distance={5} />

        {/* Rotating Motorized Boom Arm */}
        <group position={[0.24, 1.05, 0.15]} ref={armRef}>
          <mesh position={[1.5, 0, 0]} castShadow>
            <boxGeometry args={[3.1, 0.10, 0.05]} />
            <meshStandardMaterial color="#FFFFFF" roughness={0.3} />
          </mesh>
          {/* Reflective Red Hazard Stripes on Boom Arm */}
          {[-0.9, -0.2, 0.5, 1.2].map((sx, i) => (
            <mesh key={i} position={[1.5 + sx, 0, 0.005]}>
              <boxGeometry args={[0.3, 0.105, 0.055]} />
              <meshBasicMaterial color="#EF4444" toneMapped={false} />
            </mesh>
          ))}
          {/* Tip LED Warning Light */}
          <mesh position={[3.06, 0, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#EF4444" toneMapped={false} />
          </mesh>
        </group>
      </group>

      {/* 8. Single Crisp HUD Label */}
      <Html position={[0, 5.2, 0]} center distanceFactor={28}>
        <div className="pointer-events-none select-none flex flex-col items-center pl-6 max-w-xs">
          <div className="px-4 py-1.5 rounded-full bg-black/95 border border-white/25 text-white font-mono text-xs sm:text-sm font-black tracking-wider shadow-[0_0_20px_rgba(0,0,0,0.9)] backdrop-blur-xl whitespace-nowrap flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full inline-block animate-ping shrink-0" style={{ backgroundColor: accentColor }} />
            <span>{label}</span>
          </div>
          {sublabel && (
            <div className="text-[10px] text-zinc-300 font-mono mt-1 font-bold tracking-tight whitespace-nowrap bg-black/80 px-2 py-0.5 rounded border border-white/10">
              {sublabel}
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

/**
 * Modern Architectural Solar Canopy over EV Zone (Bays EV01–EV06)
 * - Structural steel support pillars and cantilevered trusses
 * - Dark semi-translucent photovoltaic solar glass roof panels
 * - Neon cyan perimeter edge illumination
 * - Warm downlight spots illuminating the EV charging stalls
 * - Illuminated LED Fascia Signboard: "⚡ 50kW HIGH-SPEED DC FAST CHARGING HUB"
 */
function EVSolarCanopy() {
  return (
    <group position={[-4.75, 0, -5.9]}>
      {/* Structural Steel Support Columns */}
      {[-5.8, 0, 5.8].map((cx, i) => (
        <group key={i} position={[cx, 0, -2.7]}>
          <mesh position={[0, 1.8, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.16, 3.6, 12]} />
            <meshStandardMaterial color="#1E293B" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Angled Cantilever Roof Arm */}
          <mesh position={[0, 3.75, 1.2]} rotation={[0.18, 0, 0]} castShadow>
            <boxGeometry args={[0.16, 0.16, 3.2]} />
            <meshStandardMaterial color="#0F172A" metalness={0.85} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Main Solar Canopy Roof Slab (Spanning across 6 EV stalls: 14.8m wide x 4.2m deep) */}
      <group position={[0, 3.9, -0.4]} rotation={[0.18, 0, 0]}>
        {/* Photovoltaic Solar Glass Panel */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[14.8, 0.12, 4.2]} />
          <meshStandardMaterial
            color="#080D1A"
            roughness={0.12}
            metalness={0.92}
          />
        </mesh>

        {/* Photovoltaic Grid Cell Lines */}
        <mesh position={[0, 0.065, 0]}>
          <planeGeometry args={[14.6, 4.0]} />
          <meshStandardMaterial color="#0F172A" roughness={0.2} metalness={0.8} />
        </mesh>

        {/* Cyan Neon Edge Light Strips along Canopy Perimeter */}
        <mesh position={[0, 0, 2.11]}>
          <boxGeometry args={[14.8, 0.04, 0.03]} />
          <meshBasicMaterial color="#06B6D4" toneMapped={false} />
        </mesh>
        <mesh position={[-7.41, 0, 0]}>
          <boxGeometry args={[0.03, 0.04, 4.2]} />
          <meshBasicMaterial color="#06B6D4" toneMapped={false} />
        </mesh>
        <mesh position={[7.41, 0, 0]}>
          <boxGeometry args={[0.03, 0.04, 4.2]} />
          <meshBasicMaterial color="#06B6D4" toneMapped={false} />
        </mesh>

        {/* Downlight Spotlights Illuminating EV Charging Bays */}
        {[-5.0, -2.5, 0, 2.5, 5.0].map((lx, idx) => (
          <group key={idx} position={[lx, -0.08, 0]}>
            <mesh>
              <cylinderGeometry args={[0.1, 0.1, 0.04, 12]} />
              <meshBasicMaterial color="#E0F2FE" toneMapped={false} />
            </mesh>
            <pointLight color="#38BDF8" intensity={0.9} distance={7} />
          </group>
        ))}
      </group>

      {/* Overhead Glowing Hub Banner on Front Fascia */}
      <Html position={[0, 4.3, 1.8]} center distanceFactor={28}>
        <div className="px-3 py-1 rounded-full bg-black/90 border border-cyan-500/50 text-cyan-300 font-mono text-[11px] font-black tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.5)] flex items-center gap-1.5 whitespace-nowrap">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
          <span>⚡ 50kW HIGH-SPEED DC FAST CHARGING HUB</span>
        </div>
      </Html>
    </group>
  );
}

/**
 * Upgraded 50kW Dual Fast Charging Station
 * - Heavy-duty pedestal with dual CCS cables and holsters
 * - Dual touchscreen telemetry displays
 * - Pulsing status dome beacon on top
 * - Pulsing concentric ground halo under active charging stall
 */
function EVChargerPillar({ position, isCharging = false }) {
  const ringRef = useRef();
  const lightRef = useRef();
  const beaconRef = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current && isCharging) {
      const scale = 1.0 + Math.sin(t * 3.5) * 0.18;
      ringRef.current.scale.set(scale, 1, scale);
      ringRef.current.material.opacity = 0.5 + Math.sin(t * 3.5) * 0.35;
    }
    if (lightRef.current && isCharging) {
      lightRef.current.intensity = 1.2 + Math.sin(t * 4) * 0.6;
    }
    if (beaconRef.current) {
      beaconRef.current.material.opacity = 0.7 + Math.sin(t * 3) * 0.3;
    }
  });

  const statusColor = isCharging ? '#06B6D4' : '#00D98B';

  return (
    <group position={position}>
      {/* Heavy-duty Foundation Plinth */}
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <boxGeometry args={[0.75, 0.24, 0.75]} />
        <meshStandardMaterial color="#1E293B" roughness={0.7} />
      </mesh>

      {/* Main Charger Monolith Body */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[0.38, 1.7, 0.38]} />
        <meshStandardMaterial color="#0A0F1D" roughness={0.25} metalness={0.8} />
      </mesh>

      {/* Side Charging Cable Holsters */}
      {[-0.22, 0.22].map((cx, i) => (
        <group key={i} position={[cx, 0.9, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.08, 0.7, 0.14]} />
            <meshStandardMaterial color="#1E293B" metalness={0.7} />
          </mesh>
          {/* Heavy Rubber Cable Loop */}
          <mesh position={[0, -0.4, 0]}>
            <torusGeometry args={[0.16, 0.035, 8, 16, Math.PI]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#111827" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* High-Contrast Dual LCD Telemetry Displays */}
      <mesh position={[0, 1.45, 0.2]}>
        <boxGeometry args={[0.28, 0.28, 0.02]} />
        <meshBasicMaterial color="#0284C7" toneMapped={false} />
      </mesh>
      {/* Telemetry LED Status Bar */}
      <mesh position={[0, 1.15, 0.2]}>
        <boxGeometry args={[0.26, 0.08, 0.02]} />
        <meshBasicMaterial color={statusColor} toneMapped={false} />
      </mesh>

      {/* Top Warning Dome Beacon */}
      <mesh ref={beaconRef} position={[0, 1.95, 0]}>
        <cylinderGeometry args={[0.07, 0.09, 0.12, 12]} />
        <meshBasicMaterial color={statusColor} transparent opacity={0.9} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 2.05, 0]} color={statusColor} distance={4} intensity={0.9} />

      {/* Pulsing Concentric Cyan Floor Ring */}
      {isCharging && (
        <>
          <mesh ref={ringRef} position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.75, 0.95, 32]} />
            <meshBasicMaterial color="#06B6D4" transparent opacity={0.65} toneMapped={false} />
          </mesh>
          <pointLight ref={lightRef} position={[0, 1.7, 0.3]} color="#06B6D4" distance={5} intensity={1.4} />
        </>
      )}
    </group>
  );
}

/**
 * Sleek Modern Street Lamp Post with Soft Pool of Light on Road
 */
function LampPost({ position, rotation = [0, 0, 0], lightColor = '#FEF08A' }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Base & Pole */}
      <mesh position={[0, 1.8, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.1, 3.6, 12]} />
        <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Overhanging Arm */}
      <mesh position={[0.4, 3.65, 0]} rotation={[0, 0, -Math.PI / 6]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.9, 8]} />
        <meshStandardMaterial color="#1E293B" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Lamp Head */}
      <mesh position={[0.78, 3.85, 0]}>
        <boxGeometry args={[0.3, 0.08, 0.2]} />
        <meshBasicMaterial color={lightColor} toneMapped={false} />
      </mesh>
      {/* Downward Light Cone / Pool */}
      <pointLight position={[0.78, 3.7, 0]} color={lightColor} intensity={0.75} distance={10} castShadow />
    </group>
  );
}

/**
 * Planter Block with Green Foliage at Corners
 */
function CornerPlanter({ position }) {
  return (
    <group position={position}>
      {/* Concrete Planter Box */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 0.7, 1.6]} />
        <meshStandardMaterial color="#1E293B" roughness={0.8} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.71, 0]}>
        <boxGeometry args={[1.4, 0.05, 1.4]} />
        <meshStandardMaterial color="#0F172A" roughness={0.9} />
      </mesh>
      {/* Foliage / Shrub */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.65, 12, 12]} />
        <meshStandardMaterial color="#15803D" roughness={0.7} />
      </mesh>
      <mesh position={[0.2, 1.25, -0.2]} castShadow>
        <sphereGeometry args={[0.45, 10, 10]} />
        <meshStandardMaterial color="#16A34A" roughness={0.6} />
      </mesh>
    </group>
  );
}

/**
 * Solid Parking Bay Slot:
 * - "U" shaped outline (open towards driving aisle)
 *   * YELLOW lines (#FACC15) for EV bays
 *   * WHITE lines (#FFFFFF) for regular bays
 * - Raised 6-8cm wide lane strip with emissive glow
 * - Dark wheel stoppers at back of bay with reflective warning stripes
 * - Semi-transparent colored floor pad with status glow (#00D98B, #06B6D4, #EF4444, #F59E0B, #A855F7)
 * - Painted Bay ID & EV lightning icon on floor
 * - 3D Car in varied bright colors on occupied bays
 */
function SolidParkingSlot({
  spot,
  position,
  staggerDelay = 0,
  isSelected = false,
  isAssigned = false,
  facingNorth = false, // true = open towards -Z (North), false = open towards +Z (South)
  onHover,
  onLeave,
  onClick
}) {
  const groupRef = useRef();
  const padRef = useRef();
  const [hovered, setHovered] = useState(false);
  const targetY = useRef(-2.5);

  const isEV = spot.type === 'ev';
  const statusKey = spot.isFaulty ? 'faulty' : (spot.status || 'free');
  const baseStatusColor = STATUS_COLORS[statusKey] || STATUS_COLORS.free;
  const isOccupied = spot.status === 'occupied' || spot.status === 'charging';
  const isCharging = spot.status === 'charging';
  const isFaulty = spot.isFaulty || spot.status === 'faulty' || spot.status === 'fault';

  // Painted line color: YELLOW for EV bays, WHITE for regular bays
  const lineColor = isEV ? '#FACC15' : '#FFFFFF';

  // Staggered rise on load + lift on hover
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    if (state.clock.elapsedTime > staggerDelay) {
      targetY.current = hovered ? 0.16 : 0;
    }
    groupRef.current.position.y = THREE.MathUtils.damp(groupRef.current.position.y, targetY.current, 5, delta);

    if (isFaulty && padRef.current) {
      const blink = Math.sin(state.clock.elapsedTime * 4.5) > 0 ? 0.95 : 0.25;
      padRef.current.material.opacity = blink;
    }
  });

  // Calculate back and front Z coordinates
  const slotLength = 3.8;
  const slotWidth = 2.0;
  const backZ = facingNorth ? slotLength / 2 : -slotLength / 2;
  const frontZ = facingNorth ? -slotLength / 2 : slotLength / 2;
  const curbZ = facingNorth ? backZ - 0.4 : backZ + 0.4;
  const labelZ = facingNorth ? backZ - 1.2 : backZ + 1.2;

  // Car color assignment based on spot ID index
  const carColorIdx = parseInt((spot.id.replace(/\D/g, '') || '1'), 10) % CAR_SHADES.length;

  return (
    <group position={[position[0], -2.0, position[2]]} ref={groupRef}>
      
      {/* 1. Semi-Transparent Emissive Status Floor Pad */}
      <mesh
        ref={padRef}
        position={[0, 0.03, 0]}
        receiveShadow
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          onHover(spot, e);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false);
          onLeave();
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(spot);
        }}
      >
        <boxGeometry args={[slotWidth - 0.16, 0.05, slotLength - 0.16]} />
        <meshStandardMaterial
          color={baseStatusColor}
          emissive={baseStatusColor}
          emissiveIntensity={hovered ? 0.65 : 0.3}
          transparent
          opacity={hovered ? 0.85 : 0.55}
          roughness={0.3}
          metalness={0.2}
        />
      </mesh>

      {/* 2. Painted Lane Lines: Closed "U" Outline (Thin raised strips ~7cm wide) */}
      {/* Back Boundary Line */}
      <mesh position={[0, 0.065, backZ]} receiveShadow>
        <boxGeometry args={[slotWidth, 0.02, 0.08]} />
        <meshBasicMaterial color={lineColor} toneMapped={false} />
      </mesh>
      {/* Left Boundary Line */}
      <mesh position={[-slotWidth / 2, 0.065, 0]} receiveShadow>
        <boxGeometry args={[0.08, 0.02, slotLength]} />
        <meshBasicMaterial color={lineColor} toneMapped={false} />
      </mesh>
      {/* Right Boundary Line */}
      <mesh position={[slotWidth / 2, 0.065, 0]} receiveShadow>
        <boxGeometry args={[0.08, 0.02, slotLength]} />
        <meshBasicMaterial color={lineColor} toneMapped={false} />
      </mesh>
      {/* (Front side is OPEN towards the driving aisle) */}

      {/* 3. Wheel Stopper (Curbed back block with reflective warning stripes) */}
      <group position={[0, 0.06, curbZ]}>
        <mesh castShadow receiveShadow position={[0, 0.06, 0]}>
          <boxGeometry args={[1.3, 0.12, 0.16]} />
          <meshStandardMaterial color="#18181B" roughness={0.8} />
        </mesh>
        {/* Yellow Warning Stripes on Stopper */}
        {[-0.35, 0.35].map((sx, i) => (
          <mesh key={i} position={[sx, 0.06, facingNorth ? -0.085 : 0.085]}>
            <boxGeometry args={[0.22, 0.122, 0.01]} />
            <meshBasicMaterial color="#FACC15" toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* 4. Painted Bay Identifier in Crisp White on Asphalt Floor */}
      <Html position={[0, 0.07, labelZ]} center transform rotation={[-Math.PI / 2, 0, facingNorth ? Math.PI : 0]} distanceFactor={20}>
        <div className="select-none pointer-events-none flex flex-col items-center">
          <span className="font-mono text-[10px] font-black text-white tracking-widest drop-shadow-md">
            {spot.id}
          </span>
          {isEV && (
            <span className="text-[8px] font-mono font-black text-[#FACC15] tracking-tight">
              ⚡ 50kW
            </span>
          )}
        </div>
      </Html>

      {/* 5. 3D Car in Varied Vibrant Colors if Bay is Occupied */}
      {isOccupied && (
        <group position={[0, 0.06, 0]} rotation={[0, facingNorth ? 0 : Math.PI, 0]}>
          <CarModel
            colorIndex={carColorIdx}
            isEV={isEV}
          />
        </group>
      )}

      {/* Assigned Target Wayfinding Beacon */}
      {isAssigned && (
        <Html position={[0, 1.6, 0]} center>
          <div className="flex flex-col items-center animate-bounce pointer-events-none z-30">
            <div className="px-3 py-1 rounded-full bg-[#00D98B] text-black font-mono text-xs font-black shadow-[0_0_20px_rgba(0,217,139,0.9)] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 fill-black" />
              <span>YOUR BAY ({spot.id})</span>
            </div>
          </div>
        </Html>
      )}

    </group>
  );
}

/**
 * Real Road Network with Dark Asphalt, Markings, Direction Arrows & Zebra Crossing
 */
function RoadNetwork() {
  return (
    <group position={[0, 0, 0]}>
      {/* 1. Main Asphalt Surface Plate */}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[36, 0.12, 24]} />
        <meshStandardMaterial
          color="#111827"
          roughness={0.7}
          metalness={0.15}
        />
      </mesh>

      {/* Low Concrete Perimeter Curbs Framing the Lot */}
      {/* North Curb */}
      <mesh position={[0, 0.08, -10.5]} castShadow receiveShadow>
        <boxGeometry args={[35.6, 0.16, 0.35]} />
        <meshStandardMaterial color="#1F2937" roughness={0.8} />
      </mesh>
      {/* South Curb */}
      <mesh position={[0, 0.08, 10.5]} castShadow receiveShadow>
        <boxGeometry args={[35.6, 0.16, 0.35]} />
        <meshStandardMaterial color="#1F2937" roughness={0.8} />
      </mesh>
      {/* West Curb (with openings for Ingress & Egress Roads) */}
      <mesh position={[-17.6, 0.08, -6.6]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 0.16, 7.5]} />
        <meshStandardMaterial color="#1F2937" roughness={0.8} />
      </mesh>
      <mesh position={[-17.6, 0.08, 0.5]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 0.16, 4.0]} />
        <meshStandardMaterial color="#1F2937" roughness={0.8} />
      </mesh>
      <mesh position={[-17.6, 0.08, 7.5]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 0.16, 6.0]} />
        <meshStandardMaterial color="#1F2937" roughness={0.8} />
      </mesh>
      {/* East Curb */}
      <mesh position={[17.6, 0.08, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.35, 0.16, 21.0]} />
        <meshStandardMaterial color="#1F2937" roughness={0.8} />
      </mesh>

      {/* 2. Painted Road Markings */}
      {/* Entry Road from Ingress Gate to Main Aisle 1 */}
      {/* White Edge Lines along Entry Road */}
      <mesh position={[-14.5, 0.015, -4.3]}>
        <planeGeometry args={[5.0, 0.08]} />
        <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
      </mesh>
      <mesh position={[-14.5, 0.015, -1.3]}>
        <planeGeometry args={[5.0, 0.08]} />
        <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
      </mesh>

      {/* Main Aisle 1 Dashed Center Line (West to East) */}
      <group position={[0, 0.015, -2.8]}>
        {Array.from({ length: 11 }).map((_, i) => (
          <mesh key={i} position={[-11 + i * 2.4, 0, 0]}>
            <planeGeometry args={[1.2, 0.08]} />
            <meshBasicMaterial color="#FACC15" toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* Main Aisle 2 Dashed Center Line (East to West) */}
      <group position={[0, 0.015, 3.8]}>
        {Array.from({ length: 11 }).map((_, i) => (
          <mesh key={i} position={[-11 + i * 2.4, 0, 0]}>
            <planeGeometry args={[1.2, 0.08]} />
            <meshBasicMaterial color="#FACC15" toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* East Loop Road connecting Aisle 1 and Aisle 2 */}
      <mesh position={[14.2, 0.015, 0.5]} rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[6.6, 0.08]} />
        <meshBasicMaterial color="#FACC15" toneMapped={false} />
      </mesh>

      {/* 3. Large Painted Direction Arrows & Road Text */}
      {/* GREEN Direction Arrow on Entry Road (Pointing East into Facility) */}
      <group position={[-14.5, 0.02, -2.8]}>
        {/* Shaft */}
        <mesh position={[-0.4, 0, 0]}>
          <planeGeometry args={[0.9, 0.35]} />
          <meshBasicMaterial color="#00D98B" toneMapped={false} />
        </mesh>
        {/* Arrowhead */}
        <mesh position={[0.3, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.5, 0.7, 3]} />
          <meshBasicMaterial color="#00D98B" toneMapped={false} />
        </mesh>
      </group>

      {/* Painted "ENTRY" Text on Road */}
      <Html position={[-12.2, 0.02, -2.8]} center transform rotation={[-Math.PI / 2, 0, -Math.PI / 2]} distanceFactor={20}>
        <span className="font-mono text-sm font-black text-[#00D98B] tracking-widest bg-black/40 px-2 py-0.5 rounded border border-[#00D98B]/40">
          ▶ ENTRY
        </span>
      </Html>

      {/* RED Direction Arrow on Exit Road (Pointing West to Egress Gate) */}
      <group position={[-14.5, 0.02, 3.8]}>
        {/* Shaft */}
        <mesh position={[0.4, 0, 0]}>
          <planeGeometry args={[0.9, 0.35]} />
          <meshBasicMaterial color="#EF4444" toneMapped={false} />
        </mesh>
        {/* Arrowhead */}
        <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.5, 0.7, 3]} />
          <meshBasicMaterial color="#EF4444" toneMapped={false} />
        </mesh>
      </group>

      {/* Painted "EXIT" Text on Road */}
      <Html position={[-12.2, 0.02, 3.8]} center transform rotation={[-Math.PI / 2, 0, -Math.PI / 2]} distanceFactor={20}>
        <span className="font-mono text-sm font-black text-[#EF4444] tracking-widest bg-black/40 px-2 py-0.5 rounded border border-[#EF4444]/40">
          ◀ EXIT
        </span>
      </Html>

      {/* Zebra Crossings near Entry & Exit Gates */}
      {/* Entry Zebra Crossing */}
      <group position={[-10.5, 0.02, -2.8]}>
        {[-1.1, -0.65, -0.2, 0.25, 0.7, 1.15].map((zy, i) => (
          <mesh key={i} position={[0, 0, zy]}>
            <planeGeometry args={[0.65, 0.3]} />
            <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* Exit Zebra Crossing */}
      <group position={[-10.5, 0.02, 3.8]}>
        {[-1.1, -0.65, -0.2, 0.25, 0.7, 1.15].map((zy, i) => (
          <mesh key={i} position={[0, 0, zy]}>
            <planeGeometry args={[0.65, 0.3]} />
            <meshBasicMaterial color="#FFFFFF" toneMapped={false} />
          </mesh>
        ))}
      </group>

      {/* EV Zone Distinct Yellow Outer Perimeter Border on Asphalt */}
      <group position={[-5.8, 0.02, -5.9]}>
        <mesh position={[0, 0, -2.1]}>
          <planeGeometry args={[14.2, 0.1]} />
          <meshBasicMaterial color="#FACC15" toneMapped={false} />
        </mesh>
        <mesh position={[-7.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[4.2, 0.1]} />
          <meshBasicMaterial color="#FACC15" toneMapped={false} />
        </mesh>
        <mesh position={[7.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <planeGeometry args={[4.2, 0.1]} />
          <meshBasicMaterial color="#FACC15" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Camera Motion Tween Controller
 */
function SmoothCameraController({ targetPreset, controlsRef }) {
  const { camera } = useThree();
  const tweenRef = useRef({
    active: false,
    startTime: 0,
    duration: 1.0,
    fromPos: new THREE.Vector3(),
    toPos: new THREE.Vector3(),
    fromTarget: new THREE.Vector3(),
    toTarget: new THREE.Vector3()
  });

  useEffect(() => {
    if (!targetPreset || !CAMERA_PRESETS[targetPreset]) return;
    const preset = CAMERA_PRESETS[targetPreset];
    const t = tweenRef.current;
    t.active = true;
    t.startTime = performance.now();
    t.fromPos.copy(camera.position);
    t.toPos.set(...preset.position);
    if (controlsRef.current) {
      t.fromTarget.copy(controlsRef.current.target);
    }
    t.toTarget.set(...preset.target);
  }, [targetPreset, camera, controlsRef]);

  useFrame(() => {
    const t = tweenRef.current;
    if (!t.active) return;

    const elapsed = (performance.now() - t.startTime) / 1000;
    const p = Math.min(1, elapsed / t.duration);
    const ease = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

    camera.position.lerpVectors(t.fromPos, t.toPos, ease);
    if (controlsRef.current) {
      controlsRef.current.target.lerpVectors(t.fromTarget, t.toTarget, ease);
      controlsRef.current.update();
    }

    if (p >= 1) {
      t.active = false;
    }
  });

  return null;
}

/**
 * Master 3D Facility Scene
 */
export default function Facility3DView({
  spots = [],
  assignedSpotId = null,
  activeRoute = null,
  onSpotSelect = () => {},
  className = ''
}) {
  const controlsRef = useRef();
  const [activePreset, setActivePreset] = useState('overview');
  const [hoveredSpot, setHoveredSpot] = useState(null);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [cameraResetTrigger, setCameraResetTrigger] = useState(0);
  const [dispatchCarActive, setDispatchCarActive] = useState(true);

  // Compute 30-Bay Coordinates:
  // Row 1 (z = -5.9): 6 EV (cols 1-6) + 4 Regular (cols 7-10) -> open towards +Z (Aisle 1)
  // Row 2 (z = 0.5): 10 Regular (cols 1-10) -> open towards -Z (Aisle 1)
  // Row 3 (z = 7.0): 10 Regular (cols 1-10) -> open towards -Z (Aisle 2)
  const spotPositions = useMemo(() => {
    const map = {};
    const colSpacing = 2.3;
    const startX = -((10 - 1) * colSpacing) / 2;

    spots.forEach((spot) => {
      const colIdx = (spot.col || 1) - 1;
      const x = startX + colIdx * colSpacing;
      let z = 0;
      let facingNorth = false;
      if (spot.row === 1) {
        z = -5.9;
        facingNorth = false; // opens south to Aisle 1
      } else if (spot.row === 2) {
        z = 0.5;
        facingNorth = true;  // opens north to Aisle 1
      } else if (spot.row === 3) {
        z = 7.0;
        facingNorth = true;  // opens north to Aisle 2
      }
      map[spot.id] = { pos: [x, 0, z], facingNorth };
    });
    return map;
  }, [spots]);

  const assignedData = assignedSpotId ? spotPositions[assignedSpotId] : spotPositions['EV01'];

  const handleReset = () => {
    setActivePreset('overview');
    setCameraResetTrigger(prev => prev + 1);
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

  const handleBayClick = useCallback((spot) => {
    setSelectedSpot(spot);
    onSpotSelect(spot);
  }, [onSpotSelect]);

  return (
    <div className={`relative w-full h-[540px] bg-black rounded-2xl overflow-hidden pb-16 border border-white/15 shadow-2xl ${className}`}>
      
      {/* 1. LAYER 0: 2D Clear Web Networking Background Image for the Parking Station */}
      <div 
        className="absolute inset-0 bg-cover bg-center pointer-events-none select-none z-0"
        style={{
          backgroundImage: "url('/facility-bg.jpg')",
          opacity: 0.90,
          filter: 'contrast(1.15) brightness(0.95)'
        }}
      />
      {/* Soft gradient vignette to smoothly blend the horizon */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none z-0" />

      {/* 2. LAYER 1: 3D WebGL Canvas Scene (Renders 3D Facility over the 2D Background) */}
      <Canvas
        key={cameraResetTrigger}
        dpr={[1, Math.min(window.devicePixelRatio || 1, 2)]}
        camera={{ position: [22, 28, 34], fov: 44, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        className="relative z-10"
      >
        {/* Soft Background Fog blending the outer perimeter into deep black */}
        <fog attach="fog" args={['#000000', 48, 130]} />

        {/* Warm Key Light with Crisp Soft Shadows */}
        <ambientLight intensity={0.55} />
        <directionalLight
          position={[18, 28, 16]}
          intensity={1.3}
          color="#FFF7ED"
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        {/* Cool Blue Fill Light */}
        <directionalLight position={[-20, 16, -14]} intensity={0.5} color="#38BDF8" />

        {/* Solid Opaque Facility Foundation Base (Ensures parking slots & road stay 100% solid) */}
        <mesh position={[0, -0.22, 0]} receiveShadow>
          <boxGeometry args={[44, 0.32, 28]} />
          <meshStandardMaterial color="#0B0F19" roughness={0.92} />
        </mesh>

        {/* Real Dark Asphalt Road Network & Markings */}
        <RoadNetwork />

        {/* Architectural Solar Canopy over 6 Dedicated EV Bays */}
        <EVSolarCanopy />

        {/* Corner Planters with Green Foliage */}
        <CornerPlanter position={[-16.0, 0, -9.2]} />
        <CornerPlanter position={[16.0, 0, -9.2]} />
        <CornerPlanter position={[-16.0, 0, 9.2]} />
        <CornerPlanter position={[16.0, 0, 9.2]} />

        {/* Street Lamp Posts with Soft Warm Pools of Light on Road */}
        <LampPost position={[-12.0, 0, -1.2]} rotation={[0, Math.PI / 2, 0]} />
        <LampPost position={[0.0, 0, -1.2]} rotation={[0, Math.PI / 2, 0]} />
        <LampPost position={[12.0, 0, -1.2]} rotation={[0, Math.PI / 2, 0]} />
        <LampPost position={[-12.0, 0, 5.4]} rotation={[0, -Math.PI / 2, 0]} />
        <LampPost position={[0.0, 0, 5.4]} rotation={[0, -Math.PI / 2, 0]} />
        <LampPost position={[12.0, 0, 5.4]} rotation={[0, -Math.PI / 2, 0]} />

        {/* High-Tech Architectural INGRESS GATE Gantry (0, 0) */}
        <HighTechGateGantry
          position={[-16.5, 0, -2.8]}
          rotation={[0, 0, 0]}
          label="INGRESS GATE (0, 0)"
          sublabel="Optical ALPR & Radar Speed Telemetry"
          isOpen={true}
          isExit={false}
        />

        {/* High-Tech Architectural EGRESS GATE Gantry (120m) */}
        <HighTechGateGantry
          position={[-16.5, 0, 3.8]}
          rotation={[0, 0, 0]}
          label="EGRESS GATE (120m)"
          sublabel="Automated Checkout Clearance"
          isOpen={false}
          isExit={true}
        />

        {/* Animated Spline Dispatch Car */}
        <AnimatedSplineCar
          startPos={[-16.5, 0, -2.8]}
          targetBayPos={assignedData?.pos || [-9.6, 0, -5.9]}
          exitPos={[-16.5, 0, 3.8]}
          isEV={true}
          colorIndex={1}
          active={dispatchCarActive}
        />

        {/* 30 Solid Raised Bays with "U" Lane Lines, Colors, Curbs & 3D Cars */}
        {spots.map((spot, index) => {
          const slotInfo = spotPositions[spot.id] || { pos: [0, 0, 0], facingNorth: false };
          const isEV = spot.type === 'ev';
          const isSelected = selectedSpot?.id === spot.id;
          const isAssigned = assignedSpotId === spot.id;
          const stagger = 0.03 * index;

          return (
            <React.Fragment key={spot.id}>
              <SolidParkingSlot
                spot={spot}
                position={slotInfo.pos}
                facingNorth={slotInfo.facingNorth}
                staggerDelay={stagger}
                isSelected={isSelected}
                isAssigned={isAssigned}
                onHover={(s) => setHoveredSpot(s)}
                onLeave={() => setHoveredSpot(null)}
                onClick={handleBayClick}
              />

              {/* 50kW Charger Pillar for 6 Dedicated EV Bays */}
              {isEV && (
                <EVChargerPillar
                  position={[slotInfo.pos[0] + 0.95, slotInfo.pos[1], slotInfo.pos[2] - 1.5]}
                  isCharging={spot.status === 'charging'}
                />
              )}
            </React.Fragment>
          );
        })}

        {/* Smooth OrbitControls (Sensible Limits: No Going Under Floor) */}
        <OrbitControls
          ref={controlsRef}
          enableDamping={true}
          dampingFactor={0.06}
          minDistance={12}
          maxDistance={85}
          maxPolarAngle={Math.PI / 2.08}
          autoRotate={activePreset === 'overview'}
          autoRotateSpeed={0.2}
        />

        {/* Camera Tween Controller */}
        <SmoothCameraController targetPreset={activePreset} controlsRef={controlsRef} />
      </Canvas>

      {/* 3. LAYER 2: Monochrome Glass Header Toolbar & Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        
        {/* Title Badge & Vehicle Dispatch Trigger */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 bg-black/80 border border-white/20 px-3 py-1.5 rounded-xl backdrop-blur-md text-xs font-mono text-white shadow-2xl">
            <Layers className="w-3.5 h-3.5 text-zinc-300" />
            <span className="font-extrabold tracking-wider">SMART FACILITY 3D</span>
            <span className="text-[10px] text-zinc-400 border-l border-white/20 pl-2">30 BAYS</span>
          </div>

          <button
            onClick={() => setDispatchCarActive(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border backdrop-blur-md transition-all flex items-center gap-1.5 shadow-xl ${
              dispatchCarActive
                ? 'bg-[#00D98B] border-[#00D98B] text-black shadow-[0_0_15px_rgba(0,217,139,0.4)]'
                : 'bg-black/80 border-white/20 text-zinc-300 hover:text-white'
            }`}
            title="Toggle Real-Time Vehicle Dispatch along Road Network"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{dispatchCarActive ? 'Dispatch Active' : 'Dispatch Car'}</span>
          </button>
        </div>

        {/* Camera Preset Toolbar (Monochrome Glass) */}
        <div className="flex items-center gap-1.5 bg-black/80 border border-white/20 p-1 rounded-xl backdrop-blur-md pointer-events-auto shadow-2xl text-xs font-semibold">
          <button
            onClick={() => setActivePreset('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activePreset === 'overview'
                ? 'bg-white text-black font-bold shadow-md'
                : 'text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
            title="Overview Isometric View"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Overview</span>
          </button>

          <button
            onClick={() => setActivePreset('evZone')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activePreset === 'evZone'
                ? 'bg-white text-black font-bold shadow-md'
                : 'text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
            title="Focus on EV 50kW Fast Charging Zone"
          >
            <Zap className="w-3.5 h-3.5 text-[#FACC15]" />
            <span className="hidden sm:inline">EV Zone</span>
          </button>

          <button
            onClick={() => setActivePreset('topDown')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activePreset === 'topDown'
                ? 'bg-white text-black font-bold shadow-md'
                : 'text-zinc-300 hover:text-white hover:bg-white/10'
            }`}
            title="Top-Down Orthographic Perspective"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Top-Down</span>
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg text-zinc-300 hover:text-white hover:bg-white/10 transition-all flex items-center gap-1.5 border-l border-white/20 ml-1"
            title="Reset Camera Orientation"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* 4. LAYER 3: Hover Tooltip Card */}
      {hoveredSpot && (
        <div className="absolute top-16 right-4 z-20 pointer-events-none bg-black/90 border border-white/20 p-3.5 rounded-2xl backdrop-blur-xl max-w-xs shadow-2xl text-xs space-y-2 animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-mono font-bold text-white text-sm flex items-center gap-1.5">
              {hoveredSpot.type === 'ev' ? <Zap className="w-4 h-4 text-[#FACC15]" /> : <CarIcon className="w-4 h-4 text-emerald-400" />}
              <span>Bay {hoveredSpot.id}</span>
            </span>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-mono font-black uppercase"
              style={{
                backgroundColor: `${STATUS_COLORS[hoveredSpot.isFaulty ? 'faulty' : (hoveredSpot.status || 'free')]}25`,
                color: STATUS_COLORS[hoveredSpot.isFaulty ? 'faulty' : (hoveredSpot.status || 'free')],
                border: `1px solid ${STATUS_COLORS[hoveredSpot.isFaulty ? 'faulty' : (hoveredSpot.status || 'free')]}80`
              }}
            >
              {hoveredSpot.isFaulty ? 'Faulty' : hoveredSpot.status}
            </span>
          </div>

          <div className="space-y-1 text-zinc-300 text-[11px]">
            <div>Powertrain: <strong className="text-white">{hoveredSpot.type === 'ev' ? '50kW Fast EV Charger' : 'Standard Regular Bay'}</strong></div>
            <div>Distance from Gate: <strong className="text-white font-mono">{hoveredSpot.distanceFromGate} units</strong></div>
            {hoveredSpot.occupiedBy && (
              <div className="text-zinc-200 font-mono pt-1 border-t border-white/10">
                Vehicle: <strong>{hoveredSpot.occupiedBy.vehicleId || hoveredSpot.occupiedBy.plate || 'OCCUPIED'}</strong>
                {hoveredSpot.occupiedBy.batteryLevel ? ` (${hoveredSpot.occupiedBy.batteryLevel}% SoC)` : ''}
              </div>
            )}
            {hoveredSpot.occupiedBy?.dwell && (
              <div className="text-zinc-400 font-mono text-[10px]">
                Dwell Duration: {hoveredSpot.occupiedBy.dwell}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. LAYER 4: Big Readable Status Legend (Matching Exact Colors) */}
      <div className="absolute bottom-3 left-3 right-3 max-w-full overflow-hidden flex flex-col items-center justify-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-black/85 border border-white/20 backdrop-blur-md font-mono text-zinc-300 pointer-events-auto z-10 shadow-2xl">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.free }} />
            <span className="text-white font-bold">Free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.charging }} />
            <span className="text-white font-bold">EV Charging</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.occupied }} />
            <span className="text-white font-bold">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.reserved }} />
            <span className="text-white font-bold">Reserved</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: STATUS_COLORS.faulty }} />
            <span className="text-white font-bold">Faulty</span>
          </div>
        </div>

        <div className="text-[11px] text-zinc-400 hidden sm:block font-bold text-center">
          Click Bay to Inspect • Drag to Orbit • Scroll to Zoom
        </div>
      </div>

    </div>
  );
}
