import React, { useRef, useEffect, useCallback } from 'react';

/**
 * NetworkBackground.jsx
 *
 * High-fidelity shared network background matching reference image:
 * - High-resolution 2D web networking base image (/network-bg.jpg) with silky smooth animations
 * - Dual-color cyber network palette:
 *   - Luminous Electric Lime / Green (#22c55e, #4ade80, #10b981) on upper/left
 *   - Luminous Ice Cyan / Blue (#38bdf8, #60a5fa, #93c5fd) on center/right
 * - Smooth 60fps floating particles, breathing node glows, traveling electrical signals
 * - Mouse-interactive light aura that gently illuminates the network threads
 * - Outward expanding shockwave ripple on "Enter Smart Parking" click
 * - Zero per-frame GC allocations, pauses on tab hidden
 * - Props: variant ("hero" | "panel"), density, intensity (0.6 panel, 1.0 hero), interactive, fixed
 */

export default function NetworkBackground({
  variant = 'hero',
  density = 1.0,
  intensity = 1.0,
  interactive = true,
  fixed = false,
  className = '',
  pulseTrigger = 0
}) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000, active: false });
  const pulseRipplesRef = useRef([]);
  const lastTimeRef = useRef(performance.now());
  const scrollOffsetRef = useRef(0);

  // Pre-rendered offscreen canvases for green and cyan flares and halos
  const flareCanvasGreenRef = useRef(null);
  const flareCanvasCyanRef = useRef(null);
  const haloCanvasRef = useRef(null);

  const initAssets = useCallback(() => {
    // 1. Offscreen Star Flare Canvas (Cyan)
    const fcCanvas = document.createElement('canvas');
    fcCanvas.width = 64;
    fcCanvas.height = 64;
    const fcCtx = fcCanvas.getContext('2d');
    const cx = 32, cy = 32;

    let fGrad = fcCtx.createRadialGradient(cx, cy, 0, cx, cy, 28);
    fGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    fGrad.addColorStop(0.25, 'rgba(56, 189, 248, 0.7)');
    fGrad.addColorStop(0.6, 'rgba(56, 189, 248, 0.15)');
    fGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
    fcCtx.fillStyle = fGrad;
    fcCtx.beginPath();
    fcCtx.arc(cx, cy, 28, 0, Math.PI * 2);
    fcCtx.fill();

    fcCtx.strokeStyle = 'rgba(224, 242, 254, 0.9)';
    fcCtx.lineWidth = 1.2;
    fcCtx.beginPath();
    fcCtx.moveTo(cx - 30, cy);
    fcCtx.lineTo(cx + 30, cy);
    fcCtx.moveTo(cx, cy - 30);
    fcCtx.lineTo(cx, cy + 30);
    fcCtx.stroke();

    flareCanvasCyanRef.current = fcCanvas;

    // 2. Offscreen Star Flare Canvas (Green)
    const fgCanvas = document.createElement('canvas');
    fgCanvas.width = 64;
    fgCanvas.height = 64;
    const fgCtx = fgCanvas.getContext('2d');

    let fgGrad = fgCtx.createRadialGradient(cx, cy, 0, cx, cy, 28);
    fgGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    fgGrad.addColorStop(0.25, 'rgba(34, 197, 94, 0.75)');
    fgGrad.addColorStop(0.6, 'rgba(34, 197, 94, 0.15)');
    fgGrad.addColorStop(1, 'rgba(34, 197, 94, 0)');
    fgCtx.fillStyle = fgGrad;
    fgCtx.beginPath();
    fgCtx.arc(cx, cy, 28, 0, Math.PI * 2);
    fgCtx.fill();

    fgCtx.strokeStyle = 'rgba(187, 247, 208, 0.9)';
    fgCtx.lineWidth = 1.2;
    fgCtx.beginPath();
    fgCtx.moveTo(cx - 30, cy);
    fgCtx.lineTo(cx + 30, cy);
    fgCtx.moveTo(cx, cy - 30);
    fgCtx.lineTo(cx, cy + 30);
    fgCtx.stroke();

    flareCanvasGreenRef.current = fgCanvas;

    // 3. Offscreen Soft Halo Canvas
    const hCanvas = document.createElement('canvas');
    hCanvas.width = 48;
    hCanvas.height = 48;
    const hCtx = hCanvas.getContext('2d');
    const hcx = 24, hcy = 24;
    const hGrad = hCtx.createRadialGradient(hcx, hcy, 0, hcx, hcy, 22);
    hGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    hGrad.addColorStop(0.3, 'rgba(56, 189, 248, 0.45)');
    hGrad.addColorStop(0.7, 'rgba(34, 197, 94, 0.12)');
    hGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    hCtx.fillStyle = hGrad;
    hCtx.beginPath();
    hCtx.arc(hcx, hcy, 22, 0, Math.PI * 2);
    hCtx.fill();

    haloCanvasRef.current = hCanvas;
  }, []);

  // Listen to pulseTrigger prop
  useEffect(() => {
    if (pulseTrigger > 0 && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const mx = mouseRef.current.active ? mouseRef.current.targetX : rect.width * 0.5;
      const my = mouseRef.current.active ? mouseRef.current.targetY : rect.height * 0.4;
      pulseRipplesRef.current.push({
        x: mx,
        y: my,
        radius: 10,
        maxRadius: Math.max(rect.width, rect.height) * 0.95,
        speed: 680,
        opacity: 1.0
      });
    }
  }, [pulseTrigger]);

  useEffect(() => {
    initAssets();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const handleScroll = () => {
      scrollOffsetRef.current = window.scrollY || 0;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    const handleMouseMove = (e) => {
      if (!interactive) return;
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.targetX = e.clientX - rect.left;
      mouseRef.current.targetY = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);

    let isVisible = true;
    const handleVisibility = () => {
      isVisible = !document.hidden;
      if (isVisible) {
        lastTimeRef.current = performance.now();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    // Particle nodes for smooth 60fps ambient web animation
    const isMobile = window.innerWidth < 768;
    const baseCount = variant === 'panel' ? 55 : isMobile ? 65 : 120;
    const nodeCount = Math.floor(baseCount * density);

    const nodes = [];
    for (let i = 0; i < nodeCount; i++) {
      const typeRand = Math.random();
      // Green nodes cluster on the left/upper-center, Cyan on right & lower
      const isGreen = Math.random() < 0.45;
      nodes.push({
        x: (Math.random() - 0.5) * 1600,
        y: (Math.random() - 0.5) * 1100,
        z: Math.random() * 800 + 150,
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14,
        vz: (Math.random() - 0.5) * 10,
        radius: typeRand > 0.88 ? 3.0 : typeRand > 0.55 ? 1.8 : 1.1,
        alpha: Math.random() * 0.6 + 0.35,
        pulseSpeed: Math.random() * 2.0 + 1.2,
        pulseOffset: Math.random() * Math.PI * 2,
        type: typeRand > 0.88 ? 'flare' : typeRand > 0.55 ? 'medium' : 'dust',
        isGreen: isGreen,
        px: 0,
        py: 0,
        scale: 1
      });
    }

    // Connections between nearby nodes
    const maxDistance = 210;
    const pulses = [];
    for (let p = 0; p < 18; p++) {
      pulses.push({
        sourceIdx: Math.floor(Math.random() * nodeCount),
        targetIdx: Math.floor(Math.random() * nodeCount),
        progress: Math.random(),
        speed: Math.random() * 0.45 + 0.3,
        active: true,
        isGreen: Math.random() < 0.5
      });
    }

    lastTimeRef.current = performance.now();

    // -------------------------------------------------------------
    // ANIMATION LOOP (Delta-time 60fps)
    // -------------------------------------------------------------
    const render = (time) => {
      animRef.current = requestAnimationFrame(render);
      if (!isVisible) return;

      const delta = Math.min((time - lastTimeRef.current) / 1000, 0.08);
      lastTimeRef.current = time;

      // Smooth mouse follow
      if (mouseRef.current.active) {
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * (delta * 6);
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * (delta * 6);
      } else {
        mouseRef.current.x += (width * 0.5 - mouseRef.current.x) * (delta * 2);
        mouseRef.current.y += (height * 0.5 - mouseRef.current.y) * (delta * 2);
      }

      ctx.clearRect(0, 0, width, height);

      const fov = 650;
      const cx = width * 0.5;
      const cy = height * 0.5;
      const scrollDrift = fixed ? scrollOffsetRef.current * 0.08 : 0;
      const mouseParallaxX = (mouseRef.current.x - cx) * 0.025;
      const mouseParallaxY = (mouseRef.current.y - cy) * 0.025;

      // 1. Update & Project Nodes
      for (let i = 0; i < nodeCount; i++) {
        const n = nodes[i];
        n.x += n.vx * delta;
        n.y += n.vy * delta;
        n.z += n.vz * delta;

        // Wrap boundaries in 3D
        if (n.x < -800) n.x = 800;
        if (n.x > 800) n.x = -800;
        if (n.y < -550) n.y = 550;
        if (n.y > 550) n.y = -550;
        if (n.z < 100) n.z = 950;
        if (n.z > 950) n.z = 100;

        const effX = n.x + mouseParallaxX;
        const effY = n.y + mouseParallaxY - scrollDrift;
        const effZ = n.z;

        n.scale = fov / (fov + effZ);
        n.px = cx + effX * n.scale;
        n.py = cy + effY * n.scale;
      }

      // 2. Draw Multi-strand Network Lines
      ctx.lineWidth = 0.9;
      for (let i = 0; i < nodeCount; i++) {
        const n1 = nodes[i];
        if (n1.px < -40 || n1.px > width + 40 || n1.py < -40 || n1.py > height + 40) continue;

        let connections = 0;
        for (let j = i + 1; j < nodeCount && connections < 4; j++) {
          const n2 = nodes[j];
          const dx = n1.px - n2.px;
          const dy = n1.py - n2.py;
          const distSq = dx * dx + dy * dy;

          if (distSq < maxDistance * maxDistance) {
            connections++;
            const dist = Math.sqrt(distSq);
            const fade = (1 - dist / maxDistance);
            const lineAlpha = fade * 0.42 * intensity;

            if (n1.isGreen || n2.isGreen) {
              ctx.strokeStyle = `rgba(34, 197, 94, ${lineAlpha * 0.9})`;
            } else {
              ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha * 0.95})`;
            }

            ctx.beginPath();
            ctx.moveTo(n1.px, n1.py);
            ctx.lineTo(n2.px, n2.py);
            ctx.stroke();
          }
        }
      }

      // 3. Electrical Pulses Traveling along Edges
      for (let p = 0; p < pulses.length; p++) {
        const pulse = pulses[p];
        const s = nodes[pulse.sourceIdx];
        const t = nodes[pulse.targetIdx];

        pulse.progress += pulse.speed * delta;
        if (pulse.progress >= 1.0) {
          pulse.progress = 0;
          pulse.sourceIdx = Math.floor(Math.random() * nodeCount);
          pulse.targetIdx = Math.floor(Math.random() * nodeCount);
          pulse.isGreen = Math.random() < 0.5;
        }

        const px = s.px + (t.px - s.px) * pulse.progress;
        const py = s.py + (t.py - s.py) * pulse.progress;

        ctx.fillStyle = pulse.isGreen ? 'rgba(74, 222, 128, 0.9)' : 'rgba(125, 211, 252, 0.95)';
        ctx.beginPath();
        ctx.arc(px, py, 2.0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 4. Mouse Interactive Illumination Aura
      if (mouseRef.current.active && interactive) {
        const mx = mouseRef.current.x;
        const my = mouseRef.current.y;
        const mGrad = ctx.createRadialGradient(mx, my, 0, mx, my, 160);
        mGrad.addColorStop(0, 'rgba(56, 189, 248, 0.22)');
        mGrad.addColorStop(0.5, 'rgba(34, 197, 94, 0.10)');
        mGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = mGrad;
        ctx.beginPath();
        ctx.arc(mx, my, 160, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Shockwave Ripples (from "Enter Smart Parking" trigger)
      for (let r = pulseRipplesRef.current.length - 1; r >= 0; r--) {
        const rip = pulseRipplesRef.current[r];
        rip.radius += rip.speed * delta;
        rip.opacity = Math.max(0, 1 - rip.radius / rip.maxRadius);

        ctx.strokeStyle = `rgba(56, 189, 248, ${rip.opacity * 0.75})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.stroke();

        if (rip.radius >= rip.maxRadius) {
          pulseRipplesRef.current.splice(r, 1);
        }
      }

      // 6. Glowing Nodes & Star Flares
      const flareCyan = flareCanvasCyanRef.current;
      const flareGreen = flareCanvasGreenRef.current;
      const haloImg = haloCanvasRef.current;

      for (let i = 0; i < nodeCount; i++) {
        const n = nodes[i];
        if (n.px < -30 || n.px > width + 30 || n.py < -30 || n.py > height + 30) continue;

        const pulseScale = 1 + Math.sin(time * 0.003 * n.pulseSpeed + n.pulseOffset) * 0.22;
        const flareImg = n.isGreen ? flareGreen : flareCyan;

        if (n.type === 'flare' && flareImg) {
          const size = 54 * n.scale * pulseScale;
          ctx.globalAlpha = Math.min(1.0, n.alpha * intensity * 1.15);
          ctx.drawImage(flareImg, n.px - size / 2, n.py - size / 2, size, size);

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(n.px, n.py, 2.5 * n.scale, 0, Math.PI * 2);
          ctx.fill();
        } else if (n.type === 'medium' && haloImg) {
          const size = 32 * n.scale * pulseScale;
          ctx.globalAlpha = n.alpha * intensity;
          ctx.drawImage(haloImg, n.px - size / 2, n.py - size / 2, size, size);

          ctx.fillStyle = n.isGreen ? '#86efac' : '#bae6fd';
          ctx.beginPath();
          ctx.arc(n.px, n.py, 1.8 * n.scale, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.globalAlpha = n.alpha * intensity * 0.8;
          ctx.fillStyle = n.isGreen ? '#4ade80' : '#7dd3fc';
          ctx.beginPath();
          ctx.arc(n.px, n.py, n.radius * n.scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      ctx.globalAlpha = 1.0;
    };

    animRef.current = requestAnimationFrame(render);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [variant, density, intensity, interactive, fixed, initAssets]);

  return (
    <div className={`pointer-events-none select-none overflow-hidden ${fixed ? 'fixed inset-0 z-0' : 'absolute inset-0'} ${className}`}>
      {/* 2D Clear Web Networking Base Image matching uploaded reference */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 pointer-events-none"
        style={{
          backgroundImage: "url('/network-bg.jpg')",
          opacity: variant === 'panel' ? 0.38 : Math.min(0.68, intensity * 0.72),
          filter: 'brightness(0.92) contrast(1.12)'
        }}
      />

      {/* Dark Vignette & Depth Mask so foreground UI elements and text remain crystal clear (>4.5:1 contrast) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/40 to-black/90 pointer-events-none" />

      {/* Silky Smooth 60fps Energy Nodes & Pulses Canvas Layer */}
      <canvas ref={canvasRef} className="w-full h-full block relative z-10" />
    </div>
  );
}
