import React from 'react';
import { BackgroundServiceState } from '../types/jarvis';
import { Mic, ShieldCheck, X, Sparkles, Sliders } from 'lucide-react';

interface ForegroundNotificationPillProps {
  state: BackgroundServiceState;
  onStopService: () => void;
  onOpenPrivacyDashboard: () => void;
  onSimulateWakeWord: () => void;
}

export const ForegroundNotificationPill: React.FC<ForegroundNotificationPillProps> = ({
  state,
  onStopService,
  onOpenPrivacyDashboard,
  onSimulateWakeWord,
}) => {
  if (!state.isRunning) return null;

  return (
    <div className="w-full bg-slate-900/95 border-b border-sky-500/30 px-4 py-2 text-xs text-slate-200 shadow-md backdrop-blur-md sticky top-14 z-30 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left: Android Notification Style Identity */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-7 h-7 rounded-lg bg-sky-500/20 border border-sky-500/40 text-sky-400 flex items-center justify-center">
              <Mic className="w-3.5 h-3.5" />
            </div>
            {state.isWakeWordEnabled && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border border-slate-900 animate-pulse" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100 font-display">
                JARVIS Always-On Voice Active
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                FOREGROUND SERVICE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <span>
                {state.isWakeWordEnabled
                  ? "Listening for 'Hey JARVIS' locally"
                  : 'Foreground standby active'}
              </span>
              <span>&bull;</span>
              <span className="text-emerald-400 font-mono">0 KB uploaded</span>
              <span>&bull;</span>
              <span className="text-sky-400">On-Device Keyword Engine</span>
            </p>
          </div>
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2">
          {state.isWakeWordEnabled && (
            <button
              type="button"
              onClick={onSimulateWakeWord}
              className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/40 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
              title="Test Wake-Word Detection"
            >
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>Say "Hey JARVIS"</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenPrivacyDashboard}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Privacy Dashboard</span>
          </button>

          <button
            type="button"
            onClick={onStopService}
            className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
            title="Stop Foreground Microphone Service"
          >
            <X className="w-3 h-3" />
            <span>Stop Service</span>
          </button>
        </div>
      </div>
    </div>
  );
};
