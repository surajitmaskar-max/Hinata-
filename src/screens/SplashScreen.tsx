import React, { useEffect, useState } from 'react';
import { soundEngine } from '../utils/audio';
import { HinataOrb } from '../components/HinataOrb';
import { Cpu, Shield, Sparkles, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [bootStep, setBootStep] = useState(0);

  const bootMessages = [
    'INITIALIZING HINATA NEURAL CORE',
    'CALIBRATING 3D WebGL / SCENEVIEW RENDERER',
    'LOADING MULTILINGUAL VOICE ENGINES (BN / HI / EN)',
    'VERIFYING ANDROID ACCESSIBILITY & INTENTS',
    'SYSTEM CALIBRATED. WELCOME TO YOUR INTELLIGENT WORLD.',
  ];

  useEffect(() => {
    soundEngine.playStartup();

    const interval = setInterval(() => {
      setBootStep((prev) => {
        if (prev < bootMessages.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        return prev;
      });
    }, 550);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-between p-6 sm:p-12 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-sky-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top status */}
      <div className="w-full flex items-center justify-between text-xs text-slate-400 font-mono tracking-wider max-w-2xl">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-violet-400" />
          <span>KOTLIN 2.0 / JETPACK COMPOSE / 3D CORE</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>SECURITY ENFORCED</span>
        </div>
      </div>

      {/* Center glowing Hinata Orb & title */}
      <div className="flex flex-col items-center text-center max-w-xl my-auto">
        <div className="mb-6">
          <HinataOrb
            size={180}
            state={bootStep < bootMessages.length - 1 ? 'thinking' : 'speaking'}
          />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-xs font-medium text-violet-300">
            <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-spin-slow" />
            <span>AI ASSISTANT PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-wider font-display bg-gradient-to-r from-violet-200 via-sky-200 to-fuchsia-300 bg-clip-text text-transparent">
            HINATA AI
          </h1>

          <p className="text-sm sm:text-base text-slate-400 font-light tracking-widest uppercase">
            Your Intelligent World.
          </p>
        </div>

        {/* Boot diagnostic terminal */}
        <div className="mt-8 w-full max-w-md p-3.5 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-violet-500/20 shadow-2xl font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span>DIAGNOSTIC SEQUENCE</span>
            <span className="text-violet-400">{Math.round(((bootStep + 1) / bootMessages.length) * 100)}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mb-3">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-sky-400 transition-all duration-300 ease-out"
              style={{ width: `${((bootStep + 1) / bootMessages.length) * 100}%` }}
            />
          </div>

          <p className="text-slate-300 font-medium tracking-wide min-h-[1.5rem] flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping" />
            {bootMessages[bootStep]}
          </p>
        </div>
      </div>

      {/* Bottom Continue Action */}
      <div className="w-full max-w-md flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => {
            soundEngine.playSuccess();
            onComplete();
          }}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-sky-500 hover:from-violet-500 hover:to-sky-400 text-white font-medium text-sm transition-all shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 cursor-pointer group"
        >
          <span>Enter HINATA AI</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <span className="text-[11px] text-slate-500 font-mono">
          GOOGLE GEMINI 3.8 FLASH &bull; NATIVE ANDROID
        </span>
      </div>
    </div>
  );
};
