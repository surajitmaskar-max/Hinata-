import React, { useEffect, useRef } from 'react';
import { speechManager } from '../utils/speech';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'executing' | 'error';

interface HinataOrbProps {
  state?: OrbState;
  size?: number;
  onClick?: () => void;
  className?: string;
  audioIntensity?: number;
}

export const HinataOrb: React.FC<HinataOrbProps> = ({
  state = 'idle',
  size = 280,
  onClick,
  className = '',
  audioIntensity = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const lipSyncRef = useRef<number>(0);

  // Subscribe to speech phoneme lip-sync
  useEffect(() => {
    const unsub = speechManager.onLipSync((intensity) => {
      lipSyncRef.current = intensity;
    });
    return unsub;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;
    let time = 0;

    // Stardust floating particles
    const particleCount = 20;
    const particles = Array.from({ length: particleCount }).map((_, i) => ({
      angle: (i / particleCount) * Math.PI * 2,
      distRatio: 0.65 + (i % 5) * 0.22,
      speed: (i % 2 === 0 ? 1 : -1) * (0.005 + (i % 3) * 0.004),
      size: 1.5 + (i % 4) * 0.8,
      alpha: 0.35 + (i % 3) * 0.25,
      yOffset: (Math.sin(i) - 0.5) * 40,
    }));

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      const cx = w / 2;
      const cy = h / 2 - 10;
      const baseRadius = (size * 0.28);

      time += 0.03;
      const rotSpeed =
        state === 'thinking' ? 0.08 : state === 'executing' ? 0.09 : state === 'listening' ? 0.05 : 0.02;
      angle += rotSpeed;

      const audioBounce = Math.max(audioIntensity, lipSyncRef.current);
      const sphereRadius = baseRadius + (state === 'speaking' || state === 'listening' ? audioBounce * 8 : Math.sin(time * 1.5) * 2);

      // Color scheme according to state
      let primaryColor = '168, 85, 247'; // purple
      let glowColor = '217, 70, 239'; // fuchsia
      let ringColor = '192, 132, 252'; // violet
      let coreColor = '126, 34, 206';

      if (state === 'listening') {
        primaryColor = '139, 92, 246';
        glowColor = '96, 165, 250'; // blue-purple
        ringColor = '167, 139, 250';
        coreColor = '79, 70, 229';
      } else if (state === 'thinking') {
        primaryColor = '168, 85, 247';
        glowColor = '192, 132, 252';
        ringColor = '232, 121, 249';
        coreColor = '147, 51, 234';
      } else if (state === 'executing') {
        primaryColor = '56, 189, 248';
        glowColor = '168, 85, 247';
        ringColor = '125, 211, 252';
        coreColor = '6, 182, 212';
      } else if (state === 'error') {
        primaryColor = '239, 68, 68';
        glowColor = '244, 63, 94';
        ringColor = '252, 165, 165';
        coreColor = '185, 28, 28';
      }

      // 1. Faint Concentric Background Orbital Guide Rings
      ctx.save();
      const faintRings = [1.35, 1.75, 2.15];
      faintRings.forEach((ratio, idx) => {
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius * ratio, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${primaryColor}, ${0.08 - idx * 0.02})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      });
      ctx.restore();

      // 2. Wide Soft Elliptical Ground Underglow (matching reference image)
      ctx.save();
      const groundY = cy + sphereRadius * 1.18;
      const groundGrad = ctx.createRadialGradient(
        cx,
        groundY,
        5,
        cx,
        groundY,
        sphereRadius * 1.35
      );
      groundGrad.addColorStop(0, `rgba(${primaryColor}, 0.65)`);
      groundGrad.addColorStop(0.4, `rgba(${glowColor}, 0.25)`);
      groundGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.ellipse(cx, groundY, sphereRadius * 1.25, sphereRadius * 0.28, 0, 0, Math.PI * 2);
      ctx.fillStyle = groundGrad;
      ctx.fill();
      ctx.restore();

      // 3. Floating Stardust Particles
      ctx.save();
      particles.forEach((p, i) => {
        p.angle += p.speed;
        const dist = baseRadius * p.distRatio;
        const px = cx + Math.cos(p.angle) * dist;
        const py = cy + Math.sin(p.angle) * (dist * 0.45) + p.yOffset * 0.2;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ringColor}, ${p.alpha})`;
        ctx.shadowColor = `rgba(${glowColor}, 0.8)`;
        ctx.shadowBlur = 8;
        ctx.fill();
      });
      ctx.restore();

      // 4. Back portion of the Saturn-like Orbital Ring (behind the sphere)
      ctx.save();
      const ringRadiusX = sphereRadius * 1.95;
      const ringRadiusY = sphereRadius * 0.58;
      const tiltAngle = -0.32; // Slight tilt

      ctx.translate(cx, cy);
      ctx.rotate(tiltAngle);

      // Back arc (from PI to 2PI)
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadiusX, ringRadiusY, 0, Math.PI, Math.PI * 2);
      ctx.strokeStyle = `rgba(${ringColor}, 0.75)`;
      ctx.lineWidth = 2.4;
      ctx.shadowColor = `rgba(${glowColor}, 1.0)`;
      ctx.shadowBlur = 15;
      ctx.stroke();

      // Secondary back accent ring line
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadiusX * 0.96, ringRadiusY * 0.96, 0, Math.PI, Math.PI * 2);
      ctx.strokeStyle = `rgba(${primaryColor}, 0.35)`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.restore();

      // 5. Main Glass Sphere Core
      ctx.save();

      // Ambient outer sphere glow
      const sphereGlow = ctx.createRadialGradient(
        cx,
        cy,
        sphereRadius * 0.2,
        cx,
        cy,
        sphereRadius * 1.35
      );
      sphereGlow.addColorStop(0, `rgba(${coreColor}, 0.3)`);
      sphereGlow.addColorStop(0.7, `rgba(${primaryColor}, 0.5)`);
      sphereGlow.addColorStop(0.95, `rgba(${glowColor}, 0.85)`);
      sphereGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(cx, cy, sphereRadius * 1.25, 0, Math.PI * 2);
      ctx.fillStyle = sphereGlow;
      ctx.fill();

      // Base Translucent Dark Glass Sphere
      ctx.beginPath();
      ctx.arc(cx, cy, sphereRadius, 0, Math.PI * 2);
      const glassGrad = ctx.createRadialGradient(
        cx - sphereRadius * 0.25,
        cy - sphereRadius * 0.25,
        sphereRadius * 0.1,
        cx,
        cy,
        sphereRadius
      );
      glassGrad.addColorStop(0, 'rgba(38, 12, 60, 0.92)');
      glassGrad.addColorStop(0.5, 'rgba(18, 4, 30, 0.96)');
      glassGrad.addColorStop(0.85, `rgba(${coreColor}, 0.98)`);
      glassGrad.addColorStop(1, `rgba(${glowColor}, 0.95)`);

      ctx.fillStyle = glassGrad;
      ctx.shadowColor = `rgba(${glowColor}, 0.8)`;
      ctx.shadowBlur = 20;
      ctx.fill();

      // Clip inside sphere for internal fluid energy wave ribbons
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, sphereRadius - 1.5, 0, Math.PI * 2);
      ctx.clip();

      // Internal fluid wave ribbon (matching the sweeping ribbon in reference)
      ctx.beginPath();
      const waveOffset = Math.sin(time * 1.2) * 8;
      ctx.moveTo(cx - sphereRadius, cy + 12 + waveOffset);

      ctx.bezierCurveTo(
        cx - sphereRadius * 0.5,
        cy + 45 + waveOffset + Math.cos(time * 2) * 10,
        cx + sphereRadius * 0.2,
        cy - 35 + waveOffset + Math.sin(time * 2) * 12,
        cx + sphereRadius,
        cy - 10 + waveOffset
      );
      ctx.bezierCurveTo(
        cx + sphereRadius * 0.4,
        cy + 15 + waveOffset,
        cx - sphereRadius * 0.3,
        cy - 10 + waveOffset,
        cx - sphereRadius,
        cy + 12 + waveOffset
      );

      const ribbonGrad = ctx.createLinearGradient(
        cx - sphereRadius,
        cy,
        cx + sphereRadius,
        cy
      );
      ribbonGrad.addColorStop(0, `rgba(${ringColor}, 0.2)`);
      ribbonGrad.addColorStop(0.4, `rgba(255, 255, 255, 0.75)`);
      ribbonGrad.addColorStop(0.7, `rgba(${glowColor}, 0.8)`);
      ribbonGrad.addColorStop(1, `rgba(${primaryColor}, 0.3)`);

      ctx.fillStyle = ribbonGrad;
      ctx.shadowColor = `rgba(${glowColor}, 0.9)`;
      ctx.shadowBlur = 18;
      ctx.fill();

      // Second counter-swirling fluid wave
      ctx.beginPath();
      ctx.moveTo(cx - sphereRadius, cy - 20);
      ctx.bezierCurveTo(
        cx - sphereRadius * 0.3,
        cy - 40 + Math.sin(time * 1.5) * 8,
        cx + sphereRadius * 0.5,
        cy + 25 + Math.cos(time * 1.5) * 8,
        cx + sphereRadius,
        cy + 20
      );
      ctx.strokeStyle = `rgba(${ringColor}, 0.35)`;
      ctx.lineWidth = 14;
      ctx.stroke();

      // Internal luminous energy core
      const coreGrad = ctx.createRadialGradient(
        cx,
        cy + sphereRadius * 0.35,
        5,
        cx,
        cy,
        sphereRadius * 0.8
      );
      coreGrad.addColorStop(0, `rgba(${ringColor}, 0.7)`);
      coreGrad.addColorStop(0.6, `rgba(${coreColor}, 0.3)`);
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreGrad;
      ctx.fillRect(cx - sphereRadius, cy - sphereRadius, sphereRadius * 2, sphereRadius * 2);

      ctx.restore(); // end clip

      // Top-Left Glass Specular Crescent Highlight
      ctx.beginPath();
      ctx.arc(cx, cy, sphereRadius - 3, -Math.PI * 0.75, -Math.PI * 0.25);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 3.5;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
      ctx.stroke();

      // Outer Rim Glow Ring
      ctx.beginPath();
      ctx.arc(cx, cy, sphereRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${glowColor}, 0.85)`;
      ctx.lineWidth = 2.2;
      ctx.shadowColor = `rgba(${glowColor}, 1.0)`;
      ctx.shadowBlur = 14;
      ctx.stroke();

      ctx.restore();

      // 6. Front portion of the Saturn-like Orbital Ring (in front of the sphere!)
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(tiltAngle);

      // Front arc (from 0 to PI)
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadiusX, ringRadiusY, 0, 0, Math.PI);
      ctx.strokeStyle = `rgba(${ringColor}, 0.95)`;
      ctx.lineWidth = 2.8;
      ctx.shadowColor = `rgba(${glowColor}, 1.0)`;
      ctx.shadowBlur = 18;
      ctx.stroke();

      // Bright specular focal point on front ring edge
      const frontPointX = Math.cos(time * 0.6) * ringRadiusX * 0.75;
      const frontPointY = Math.sin(time * 0.6) * ringRadiusY * 0.75;
      ctx.beginPath();
      ctx.arc(frontPointX, frontPointY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;
      ctx.fill();

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [state, size, audioIntensity]);

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center cursor-pointer select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <canvas
        ref={canvasRef}
        width={size * 1.4}
        height={size * 1.4}
        style={{ width: size * 1.4, height: size * 1.4 }}
        className="pointer-events-none"
      />
    </div>
  );
};
