import React, { useEffect, useRef } from 'react';

interface GlowingOrbProps {
  isListening?: boolean;
  isSpeaking?: boolean;
  isThinking?: boolean;
  size?: number;
  onClick?: () => void;
}

export const GlowingOrb: React.FC<GlowingOrbProps> = ({
  isListening = false,
  isSpeaking = false,
  isThinking = false,
  size = 220,
  onClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = size * 0.28;

      angle += isSpeaking ? 0.05 : isListening ? 0.04 : isThinking ? 0.08 : 0.02;

      // Outer glow
      const outerGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.5,
        centerX,
        centerY,
        baseRadius * 2.2
      );

      if (isListening) {
        outerGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
        outerGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.25)');
        outerGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else if (isSpeaking) {
        outerGrad.addColorStop(0, 'rgba(14, 165, 233, 0.55)');
        outerGrad.addColorStop(0.5, 'rgba(99, 102, 241, 0.35)');
        outerGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else if (isThinking) {
        outerGrad.addColorStop(0, 'rgba(192, 132, 252, 0.6)');
        outerGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.3)');
        outerGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      } else {
        outerGrad.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
        outerGrad.addColorStop(0.6, 'rgba(139, 92, 246, 0.15)');
        outerGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      }

      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Holographic concentric energy rings
      const numRings = 3;
      for (let r = 0; r < numRings; r++) {
        const ringRadius = baseRadius * (1.1 + r * 0.32);
        const wobble = Math.sin(angle * 2 + r * 1.5) * 4;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = isListening
          ? `rgba(56, 189, 248, ${0.4 - r * 0.1})`
          : isThinking
          ? `rgba(192, 132, 252, ${0.45 - r * 0.1})`
          : `rgba(99, 102, 241, ${0.35 - r * 0.1})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8 + r * 4, 6]);
        ctx.arc(centerX, centerY, ringRadius + wobble, angle * (r % 2 === 0 ? 1 : -1), angle * (r % 2 === 0 ? 1 : -1) + Math.PI * 1.8);
        ctx.stroke();
        ctx.restore();
      }

      // Orbital frequency points
      const points = 8;
      for (let i = 0; i < points; i++) {
        const pointAngle = angle + (i * (Math.PI * 2)) / points;
        const currentDist = baseRadius * (1.25 + Math.sin(angle * 3 + i) * 0.15);
        const px = centerX + Math.cos(pointAngle) * currentDist;
        const py = centerY + Math.sin(pointAngle) * currentDist;

        ctx.beginPath();
        ctx.fillStyle = isListening ? '#38bdf8' : isThinking ? '#c084fc' : '#818cf8';
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Inner dense glowing core
      const coreGrad = ctx.createRadialGradient(
        centerX - baseRadius * 0.2,
        centerY - baseRadius * 0.2,
        baseRadius * 0.1,
        centerX,
        centerY,
        baseRadius
      );
      coreGrad.addColorStop(0, '#ffffff');
      coreGrad.addColorStop(0.2, '#38bdf8');
      coreGrad.addColorStop(0.6, '#6366f1');
      coreGrad.addColorStop(0.95, '#0f172a');
      coreGrad.addColorStop(1, 'rgba(15, 23, 42, 0.2)');

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, baseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Shimmer reflection arc
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 2;
      ctx.arc(centerX, centerY, baseRadius * 0.78, -Math.PI * 0.8, -Math.PI * 0.35);
      ctx.stroke();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isListening, isSpeaking, isThinking, size]);

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`relative inline-flex items-center justify-center cursor-pointer select-none transition-transform duration-300 ${
        onClick ? 'hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 rounded-full' : ''
      }`}
      style={{ width: size, height: size }}
      aria-label="JARVIS Core Reactor"
    >
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="pointer-events-none"
      />
    </div>
  );
};
