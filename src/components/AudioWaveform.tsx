import React, { useEffect, useRef } from 'react';

interface AudioWaveformProps {
  isActive: boolean;
  barCount?: number;
  height?: number;
  className?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isActive,
  barCount = 36,
  height = 54,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let step = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      step += 0.08;

      const w = canvas.width;
      const h = canvas.height;
      const barWidth = (w / barCount) * 0.55;
      const gap = (w / barCount) * 0.45;

      for (let i = 0; i < barCount; i++) {
        const x = i * (barWidth + gap) + gap / 2;
        let factor = 0.12;

        if (isActive) {
          const wave1 = Math.sin(step * 1.5 + i * 0.28);
          const wave2 = Math.cos(step * 2.2 + i * 0.18);
          factor = Math.abs(wave1 * 0.6 + wave2 * 0.4) * 0.85 + 0.15;
        } else {
          factor = 0.12 + Math.sin(step * 0.5 + i * 0.15) * 0.05;
        }

        const barHeight = Math.max(4, factor * (h * 0.9));
        const y = (h - barHeight) / 2;

        // Gradient from cyan to purple
        const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
        if (isActive) {
          grad.addColorStop(0, '#38bdf8'); // sky-400
          grad.addColorStop(0.5, '#818cf8'); // indigo-400
          grad.addColorStop(1, '#c084fc'); // purple-400
        } else {
          grad.addColorStop(0, 'rgba(148, 163, 184, 0.3)');
          grad.addColorStop(1, 'rgba(148, 163, 184, 0.15)');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isActive, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={barCount * 8}
      height={height}
      className={`w-full max-w-md ${className}`}
    />
  );
};
