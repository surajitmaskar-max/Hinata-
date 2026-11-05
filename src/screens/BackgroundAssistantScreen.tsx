import React, { useState } from 'react';
import { BackgroundServiceState, JarvisLanguage } from '../types/jarvis';
import { soundEngine } from '../utils/audio';
import {
  ArrowLeft,
  Mic,
  Shield,
  ShieldCheck,
  Battery,
  AlertTriangle,
  Lock,
  Sparkles,
  Cpu,
  Layers,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface BackgroundAssistantScreenProps {
  onBack: () => void;
  serviceState: BackgroundServiceState;
  onUpdateServiceState: (updates: Partial<BackgroundServiceState>) => void;
  onSimulateWakeWord: (keyword?: string) => void;
  currentLanguage: JarvisLanguage;
}

export const BackgroundAssistantScreen: React.FC<BackgroundAssistantScreenProps> = ({
  onBack,
  serviceState,
  onUpdateServiceState,
  onSimulateWakeWord,
  currentLanguage,
}) => {
  const [selectedManufacturer, setSelectedManufacturer] = useState<
    BackgroundServiceState['manufacturerPreset']
  >(serviceState.manufacturerPreset || 'samsung');

  const manufacturerGuides: Record<BackgroundServiceState['manufacturerPreset'], { title: string; steps: string[] }> = {
    samsung: {
      title: 'Samsung Galaxy (One UI 5.0 / 6.0 / 7.0)',
      steps: [
        'Open Settings > Apps > JARVIS AI.',
        'Tap Battery > Select "Unrestricted" (prevents Android from sleeping the service).',
        'Go to Settings > Battery > Background usage limits > Ensure JARVIS is in "Never sleeping apps".',
        'Allow "Appear on top" permission for the floating assistant overlay.',
      ],
    },
    xiaomi: {
      title: 'Xiaomi, Redmi & POCO (MIUI / HyperOS)',
      steps: [
        'Open Settings > Apps > Manage apps > JARVIS AI.',
        'Enable "Autostart" (mandatory for HyperOS background service survival).',
        'Set Battery Saver to "No restrictions".',
        'Grant "Display pop-up windows while running in the background".',
      ],
    },
    oneplus: {
      title: 'OnePlus & Oppo (OxygenOS / ColorOS)',
      steps: [
        'Go to Settings > Battery > More settings > Optimize battery use.',
        'Find JARVIS AI and choose "Don\'t optimize".',
        'Enable App Auto-launch under Privacy & Security.',
        'Lock JARVIS in the Recent Apps carousel (swipe down and tap the Padlock icon).',
      ],
    },
    pixel: {
      title: 'Google Pixel (Stock Android 14 / 15)',
      steps: [
        'Open Settings > Apps > JARVIS AI > App battery usage.',
        'Change mode from "Optimized" to "Unrestricted".',
        'Ensure Foreground Service Microphone permission is allowed.',
        'Lock screen display: Enable "Show on lock screen" in notifications.',
      ],
    },
    standard: {
      title: 'Standard Android Smartphone',
      steps: [
        'Open device Settings > Apps > JARVIS AI.',
        'Tap Battery and disable battery optimization.',
        'Confirm persistent notification remains visible in status bar.',
        'Verify Microphone permission is set to "Allow only while using app" or "Allow all the time".',
      ],
    },
  };

  const handleToggleService = () => {
    const nextRunning = !serviceState.isRunning;
    if (nextRunning) {
      soundEngine.playStartup();
    }
    onUpdateServiceState({
      isRunning: nextRunning,
      microphoneState: nextRunning ? 'listening_local' : 'disabled',
    });
  };

  const handleToggleWakeWord = () => {
    const nextVal = !serviceState.isWakeWordEnabled;
    onUpdateServiceState({
      isWakeWordEnabled: nextVal,
      microphoneState: nextVal ? 'listening_local' : 'idle',
    });
    if (nextVal) {
      soundEngine.playSuccess();
    }
  };

  const handleToggleBatteryExemption = () => {
    onUpdateServiceState({
      batteryOptimizationExempt: !serviceState.batteryOptimizationExempt,
    });
    soundEngine.playSuccess();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <Cpu className="w-5 h-5 text-sky-400" />
              Always-On Background JARVIS Mode
            </h1>
            <p className="text-xs text-slate-400">
              Android Foreground Service, on-device keyword spotting &amp; privacy architecture
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              serviceState.isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
            }`}
          />
          <span className="text-xs font-mono text-slate-300">
            {serviceState.isRunning ? 'SERVICE ACTIVE' : 'STOPPED'}
          </span>
        </div>
      </div>

      {/* Master Toggle Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Service Running Toggle */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">
                Authorized Foreground Service
              </h2>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-500/10 text-sky-400 border border-sky-500/20">
                TYPE_MICROPHONE
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Runs in the Android background with a mandatory persistent status notification.
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleService}
            className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer ${
              serviceState.isRunning ? 'bg-sky-500' : 'bg-slate-700'
            }`}
            aria-label="Toggle Background Service"
          >
            <span
              className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-transform ${
                serviceState.isRunning ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>

        {/* Wake-Word Toggle */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">
                On-Device Wake-Word Detection
              </h2>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                LOCAL ONLY
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-sm">
              Listens for "Hey JARVIS" locally in memory without uploading any background audio.
            </p>
          </div>

          <button
            type="button"
            onClick={handleToggleWakeWord}
            disabled={!serviceState.isRunning}
            className={`w-14 h-8 rounded-full transition-colors relative cursor-pointer disabled:opacity-40 ${
              serviceState.isWakeWordEnabled && serviceState.isRunning
                ? 'bg-emerald-500'
                : 'bg-slate-700'
            }`}
            aria-label="Toggle Wake Word Detection"
          >
            <span
              className={`w-6 h-6 rounded-full bg-white absolute top-1 transition-transform ${
                serviceState.isWakeWordEnabled && serviceState.isRunning ? 'left-7' : 'left-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Multilingual Wake-Word Triggers */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white font-display flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-400" />
            Supported Wake-Word Acoustic Patterns
          </h2>
          <span className="text-xs text-slate-400">
            Trilingual Low-Power Keyword Spotter
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* English */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-300">English (US/UK)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                16kHz PCM
              </span>
            </div>
            <p className="text-base font-bold text-white font-mono">"Hey JARVIS"</p>
            <button
              type="button"
              onClick={() => onSimulateWakeWord('Hey JARVIS')}
              className="w-full py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-medium transition-colors cursor-pointer"
            >
              Simulate Trigger
            </button>
          </div>

          {/* Bengali */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-300">বাংলা (Bengali)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                bn-IN
              </span>
            </div>
            <p className="text-base font-bold text-white font-mono">"হ্যালো জার্ভিস"</p>
            <button
              type="button"
              onClick={() => onSimulateWakeWord('হ্যালো জার্ভিস')}
              className="w-full py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-medium transition-colors cursor-pointer"
            >
              Simulate Trigger
            </button>
          </div>

          {/* Hindi */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-sky-300">हिन्दी (Hindi)</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                hi-IN
              </span>
            </div>
            <p className="text-base font-bold text-white font-mono">"हे जार्विस"</p>
            <button
              type="button"
              onClick={() => onSimulateWakeWord('हे जार्विस')}
              className="w-full py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-xs font-medium transition-colors cursor-pointer"
            >
              Simulate Trigger
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Dashboard & Zero-Upload Verification */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/30 to-slate-900 border border-emerald-500/30 space-y-4">
        <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
          <ShieldCheck className="w-5 h-5" />
          <span>Android Microphone Privacy Dashboard</span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
          In strict compliance with Android background security guidelines, JARVIS guarantees that ambient audio is processed exclusively in transient local memory. Google Gemini is invoked <strong>only after</strong> the user intentionally utters the wake-word or taps the assistant interface.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
            <span className="text-slate-400 block text-[11px]">Hardware Mic State</span>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  serviceState.microphoneState === 'listening_local'
                    ? 'bg-emerald-400 animate-pulse'
                    : serviceState.microphoneState === 'active_gemini'
                    ? 'bg-sky-400 animate-ping'
                    : 'bg-slate-500'
                }`}
              />
              <span className="font-mono font-semibold text-slate-100 uppercase">
                {serviceState.microphoneState}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
            <span className="text-slate-400 block text-[11px]">Background Audio Uploaded</span>
            <div className="font-mono font-bold text-emerald-400 text-sm">
              0 Bytes (100% On-Device)
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-1">
            <span className="text-slate-400 block text-[11px]">Gemini Model Invocations</span>
            <div className="font-mono font-bold text-sky-400 text-sm">
              Zero Passive Calls
            </div>
          </div>
        </div>

        {/* Lock screen interaction policy */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="font-semibold text-slate-200 block">
              Lock-Screen Activation Support
            </span>
            <span className="text-slate-400 text-[11px]">
              Uses Android `FLAG_SHOW_WHEN_LOCKED` &amp; `setTurnScreenOn(true)` where device security allows.
            </span>
          </div>

          <button
            type="button"
            onClick={() =>
              onUpdateServiceState({
                allowLockscreenActivation: !serviceState.allowLockscreenActivation,
              })
            }
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors cursor-pointer ${
              serviceState.allowLockscreenActivation
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {serviceState.allowLockscreenActivation ? 'ENABLED' : 'DISABLED'}
          </button>
        </div>
      </div>

      {/* Battery Optimization & OEM Killer Guide */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-100 font-display">
            <Battery className="w-4 h-4 text-amber-400" />
            <span>Battery Optimization &amp; OEM Kill-Prevention</span>
          </div>

          <button
            type="button"
            onClick={handleToggleBatteryExemption}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              serviceState.batteryOptimizationExempt
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
            }`}
          >
            {serviceState.batteryOptimizationExempt ? 'EXEMPTION GRANTED' : 'REQUEST EXEMPTION'}
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Aggressive OEM task managers (Samsung OneUI, Xiaomi MIUI/HyperOS, OnePlus/Oppo) aggressively freeze background audio services unless explicitly set to "Unrestricted". Select your device brand below for step-by-step setup:
        </p>

        {/* OEM selector buttons */}
        <div className="flex flex-wrap gap-2 text-xs">
          {(['samsung', 'xiaomi', 'oneplus', 'pixel', 'standard'] as const).map((mfg) => (
            <button
              key={mfg}
              type="button"
              onClick={() => setSelectedManufacturer(mfg)}
              className={`px-3 py-1.5 rounded-xl font-medium transition-colors capitalize cursor-pointer ${
                selectedManufacturer === mfg
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {mfg}
            </button>
          ))}
        </div>

        {/* Selected OEM guide box */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
          <h3 className="font-semibold text-slate-200">
            {manufacturerGuides[selectedManufacturer].title}
          </h3>
          <ul className="space-y-1.5 text-slate-300 list-disc list-inside">
            {manufacturerGuides[selectedManufacturer].steps.map((step, idx) => (
              <li key={idx} className="leading-relaxed">
                {step}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
