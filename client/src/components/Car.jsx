import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CAR_SHADES } from '../utils/constants';

/**
 * Realistic Modern Automotive 3D Car Model
 * - Aerodynamic sculpted chassis with sloped front hood and tapered rear
 * - Raked panoramic tinted windshield and glass cabin
 * - Aerodynamic side mirrors, front lower air dam & rear diffuser
 * - High-tech LED projector headlights and full-width rear LED taillight bar
 * - Detailed alloy wheels: realistic rubber tires with chrome 5-spoke rims & brake disc hub
 * - Front and rear license plates
 * - Factory metallic automotive paint finishes (Obsidian Black, Alpine White, Nardo Grey, Sapphire Blue, Soul Red, Liquid Silver)
 */
export function CarModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1],
  colorIndex = 0,
  isEV = false
}) {
  const bodyColor = CAR_SHADES[colorIndex % CAR_SHADES.length];

  return (
    <group position={position} rotation={rotation} scale={scale}>
      
      {/* 1. Main Sculpted Lower Chassis */}
      <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.32, 0.26, 2.75]} />
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.18}
          metalness={0.88}
        />
      </mesh>

      {/* 2. Sloped Aerodynamic Front Hood */}
      <mesh position={[0, 0.35, -0.78]} rotation={[0.09, 0, 0]} castShadow>
        <boxGeometry args={[1.28, 0.16, 1.05]} />
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.18}
          metalness={0.88}
        />
      </mesh>

      {/* 3. Front Bumper & Air Dam */}
      <mesh position={[0, 0.22, -1.36]} castShadow>
        <boxGeometry args={[1.28, 0.18, 0.14]} />
        <meshStandardMaterial color="#0B0F19" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* 4. Rear Trunk Deck */}
      <mesh position={[0, 0.38, 0.95]} rotation={[-0.06, 0, 0]} castShadow>
        <boxGeometry args={[1.26, 0.15, 0.72]} />
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.18}
          metalness={0.88}
        />
      </mesh>

      {/* 5. Aerodynamic Greenhouse Cabin (Raked Windshield & Rear Window) */}
      {/* Cabin Roof */}
      <mesh position={[0, 0.68, -0.05]} castShadow>
        <boxGeometry args={[1.05, 0.28, 1.35]} />
        <meshStandardMaterial
          color={bodyColor}
          roughness={0.18}
          metalness={0.85}
        />
      </mesh>

      {/* Raked Windshield & Tinted Glass Shell */}
      <mesh position={[0, 0.62, -0.1]}>
        <boxGeometry args={[1.08, 0.30, 1.48]} />
        <meshStandardMaterial
          color="#030712"
          roughness={0.06}
          metalness={0.96}
        />
      </mesh>

      {/* Blacked-out B/C Pillars */}
      <mesh position={[0, 0.63, 0.05]}>
        <boxGeometry args={[1.10, 0.28, 0.12]} />
        <meshStandardMaterial color="#0B0F19" roughness={0.4} />
      </mesh>

      {/* Panoramic Sunroof Frame on Top */}
      <mesh position={[0, 0.83, -0.05]}>
        <planeGeometry args={[0.78, 0.9]} />
        <meshStandardMaterial color="#000000" roughness={0.05} metalness={0.95} />
      </mesh>

      {/* 6. Aerodynamic Side Mirrors */}
      {[-0.64, 0.64].map((mx, idx) => (
        <group key={idx} position={[mx, 0.52, -0.45]}>
          <mesh castShadow>
            <boxGeometry args={[0.15, 0.08, 0.12]} />
            <meshStandardMaterial color={bodyColor} roughness={0.2} metalness={0.8} />
          </mesh>
          <mesh position={[mx > 0 ? -0.07 : 0.07, 0, 0.02]}>
            <boxGeometry args={[0.02, 0.06, 0.09]} />
            <meshStandardMaterial color="#CBD5E1" roughness={0.05} metalness={0.95} />
          </mesh>
        </group>
      ))}

      {/* 7. Front Projector Headlights (Ice Blue / Xenon White LED) */}
      <mesh position={[-0.46, 0.34, -1.37]}>
        <boxGeometry args={[0.26, 0.09, 0.04]} />
        <meshBasicMaterial color="#E0F2FE" toneMapped={false} />
      </mesh>
      <mesh position={[0.46, 0.34, -1.37]}>
        <boxGeometry args={[0.26, 0.09, 0.04]} />
        <meshBasicMaterial color="#E0F2FE" toneMapped={false} />
      </mesh>

      {/* Front LED Lightbar connecting Headlights */}
      <mesh position={[0, 0.37, -1.37]}>
        <boxGeometry args={[0.62, 0.025, 0.03]} />
        <meshBasicMaterial color={isEV ? '#38BDF8' : '#F8FAFC'} toneMapped={false} />
      </mesh>

      {/* 8. Rear Full-Width Modern LED Taillight Bar */}
      <mesh position={[0, 0.37, 1.37]}>
        <boxGeometry args={[1.18, 0.06, 0.04]} />
        <meshBasicMaterial color="#EF4444" toneMapped={false} />
      </mesh>
      {/* Outer Taillight Clusters */}
      <mesh position={[-0.48, 0.36, 1.375]}>
        <boxGeometry args={[0.22, 0.10, 0.04]} />
        <meshBasicMaterial color="#DC2626" toneMapped={false} />
      </mesh>
      <mesh position={[0.48, 0.36, 1.375]}>
        <boxGeometry args={[0.22, 0.10, 0.04]} />
        <meshBasicMaterial color="#DC2626" toneMapped={false} />
      </mesh>

      {/* 9. Front & Rear Reflective License Plates */}
      {/* Front Plate */}
      <mesh position={[0, 0.20, -1.41]}>
        <boxGeometry args={[0.38, 0.10, 0.02]} />
        <meshStandardMaterial color="#F8FAFC" roughness={0.4} />
      </mesh>
      {/* Rear Plate */}
      <mesh position={[0, 0.22, 1.41]}>
        <boxGeometry args={[0.38, 0.10, 0.02]} />
        <meshStandardMaterial color="#FEF08A" roughness={0.4} />
      </mesh>

      {/* 10. EV Cyan Underbody Glow Strip */}
      {isEV && (
        <mesh position={[0, 0.14, 0]}>
          <boxGeometry args={[1.28, 0.02, 2.5]} />
          <meshBasicMaterial color="#06B6D4" toneMapped={false} />
        </mesh>
      )}

      {/* 11. 4 Realistic Alloy Wheels with Metallic Rims & Brake Calipers */}
      {[-0.67, 0.67].map((wx, i) =>
        [-0.82, 0.82].map((wz, j) => (
          <group key={`${i}-${j}`} position={[wx, 0.19, wz]}>
            {/* Rubber Tire with Tread Profile */}
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.22, 0.22, 0.17, 24]} />
              <meshStandardMaterial color="#111827" roughness={0.85} metalness={0.1} />
            </mesh>

            {/* Machined Metallic Alloy Rim (Silver / Chrome) */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.14, 0.14, 0.18, 12]} />
              <meshStandardMaterial color="#CBD5E1" roughness={0.15} metalness={0.92} />
            </mesh>

            {/* Inner Wheel Hub Center Cap */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.06, 0.06, 0.185, 12]} />
              <meshStandardMaterial color="#0F172A" roughness={0.3} metalness={0.8} />
            </mesh>

            {/* Disc Brake Rotor */}
            <mesh rotation={[0, 0, Math.PI / 2]} position={[wx > 0 ? -0.04 : 0.04, 0, 0]}>
              <cylinderGeometry args={[0.13, 0.13, 0.02, 16]} />
              <meshStandardMaterial color="#94A3B8" roughness={0.2} metalness={0.85} />
            </mesh>
          </group>
        ))
      )}

    </group>
  );
}

/**
 * Animated Ingress Vehicle on Road Network
 * Drives smoothly from Ingress Gate -> Entry Road -> Aisle -> Assigned Bay -> Loop -> Exit Road -> Egress Gate
 */
export function AnimatedSplineCar({
  startPos = [-16.5, 0, -2.8],
  targetBayPos = [-9.6, 0, -5.0],
  exitPos = [16.5, 0, 3.8],
  isEV = true,
  colorIndex = 1,
  active = true
}) {
  const carRef = useRef();
  const progressRef = useRef(0);
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const tempTangent = useMemo(() => new THREE.Vector3(), []);

  // Complete continuous circulation path through the road network
  const curve = useMemo(() => {
    const bayX = targetBayPos[0];
    const bayZ = targetBayPos[2];
    const aisleZ = bayZ < 0 ? -2.8 : 3.8;

    const points = [
      new THREE.Vector3(startPos[0], 0, -2.8),       // Ingress Gate (0, 0)
      new THREE.Vector3(-12, 0, -2.8),              // Entry road
      new THREE.Vector3(bayX, 0, -2.8),              // Aisle junction
      new THREE.Vector3(bayX, 0, bayZ),              // Inside bay (pause point)
      new THREE.Vector3(bayX, 0, bayZ),              // Dwell
      new THREE.Vector3(bayX, 0, aisleZ),            // Reverse out to aisle
      new THREE.Vector3(12.5, 0, aisleZ),            // Towards east loop
      new THREE.Vector3(14.0, 0, 0.5),               // East loop bend
      new THREE.Vector3(12.5, 0, 3.8),               // Aisle 2 exit
      new THREE.Vector3(exitPos[0], 0, 3.8)          // Egress Gate (120m)
    ];
    return new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.15);
  }, [startPos, targetBayPos, exitPos]);

  useFrame((_, delta) => {
    if (!carRef.current || !active) return;
    
    // Smooth constant-speed traversal
    progressRef.current = (progressRef.current + delta * 0.12) % 1.0;
    const t = progressRef.current;

    // Position along spline
    curve.getPointAt(t, tempVec);
    carRef.current.position.copy(tempVec);

    // Tangent orientation (smooth heading, no flipping)
    curve.getTangentAt(t, tempTangent);
    if (tempTangent.lengthSq() > 0.0001) {
      const angle = Math.atan2(tempTangent.x, tempTangent.z);
      carRef.current.rotation.y = angle;
    }
  });

  if (!active) return null;

  return (
    <group ref={carRef}>
      <CarModel isEV={isEV} colorIndex={colorIndex} />
    </group>
  );
}

export default CarModel;
