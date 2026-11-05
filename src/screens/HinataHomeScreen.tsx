import React, { useState, useEffect } from 'react';
import { AppScreen, DeviceState, TaskRecord, JarvisLanguage } from '../types/jarvis';
import { HinataOrb, OrbState } from '../components/HinataOrb';
import { soundEngine } from '../utils/audio';
import { speechManager } from '../utils/speech';
import { useAuth } from '../context/AuthContext';
import {
  Menu,
  Crown,
  Phone,
  MessageSquare,
  Grid,
  Settings,
  Zap,
  ChevronRight,
  X,
  Volume2,
  CheckCircle,
  Radio,
  Download,
  Brain,
  ShieldCheck,
  Flashlight,
  Sparkles,
} from 'lucide-react';

interface HinataHomeScreenProps {
  onNavigate: (screen: AppScreen) => void;
  deviceState: DeviceState;
  onToggleFlashlight: () => void;
  recentTasks: TaskRecord[];
  onQuickCommand: (command: string) => Promise<string | undefined> | void;
  currentLanguage: JarvisLanguage;
  onChangeLanguage: (lang: JarvisLanguage) => void;
  onOpenSettings?: () => void;
  isBackgroundServiceRunning?: boolean;
}

export const HinataHomeScreen: React.FC<HinataHomeScreenProps> = ({
  onNavigate,
  deviceState,
  onToggleFlashlight,
  recentTasks,
  onQuickCommand,
  currentLanguage,
  onChangeLanguage,
  onOpenSettings,
  isBackgroundServiceRunning = true,
}) => {
  const { currentUser, userProfile, getPersonalizedGreeting } = useAuth();

  // Assistant & Orb States
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>('Tap to speak');

  // Modals & Drawer
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Dynamic user name
  const userName = userProfile?.displayName || 'Surajit';

  // Synchronize audio level and status message
  useEffect(() => {
    if (isListening) {
      setOrbState('listening');
      setStatusMessage('Listening...');
      setAudioLevel(0.65);
    } else if (isThinking) {
      setOrbState('thinking');
      setStatusMessage('Thinking...');
      setAudioLevel(0.3);
    } else if (isSpeaking) {
      setOrbState('speaking');
      setStatusMessage('Hinata is speaking...');
      setAudioLevel(0.85);
    } else {
      setOrbState('idle');
      setStatusMessage('Tap to speak');
      setAudioLevel(0);
    }
  }, [isListening, isThinking, isSpeaking]);

  // Voice Interaction Handler
  const handleToggleVoice = () => {
    if (isListening) {
      speechManager.stopListening();
      setIsListening(false);
    } else {
      soundEngine.playListenStart();
      setIsListening(true);

      const success = speechManager.startListening(
        (recognizedText, isFinal) => {
          if (isFinal && recognizedText.trim()) {
            handleExecuteVoice(recognizedText.trim());
          }
        },
        () => setIsListening(false),
        () => setIsListening(false)
      );

      if (!success) {
        setIsListening(false);
      }
    }
  };

  const handleExecuteVoice = async (command: string) => {
    setIsListening(false);
    setIsThinking(true);

    try {
      const response = await onQuickCommand(command);
      setIsThinking(false);

      if (response) {
        setIsSpeaking(true);
        speechManager.speakHinata(
          response,
          'success',
          currentLanguage,
          undefined,
          () => {
            setIsSpeaking(false);
          }
        );
      }
    } catch {
      setIsThinking(false);
      setOrbState('error');
      setStatusMessage('Could not process command');
      setTimeout(() => setOrbState('idle'), 2500);
    }
  };

  const handleHearGreeting = () => {
    const greetingText = getPersonalizedGreeting();
    setIsSpeaking(true);
    speechManager.speakHinata(
      greetingText,
      'greeting',
      currentLanguage,
      undefined,
      () => {
        setIsSpeaking(false);
      }
    );
  };

  return (
    <div className="relative min-h-screen bg-black text-white font-sans overflow-x-hidden pb-24 pt-2 px-5 selection:bg-purple-600 selection:text-white">
      {/* Background Soft Purple Glow */}
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-900/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-md mx-auto space-y-6 relative z-10">
        {/* 1. TOP HEADER (Matching Reference Image) */}
        <header className="flex items-center justify-between pt-2">
          {/* Hamburger Menu on Left */}
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="p-1.5 -ml-1 text-white hover:text-purple-300 transition-colors cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-7 h-7" />
          </button>

          {/* Center HINATA & AI Assistant Title */}
          <div className="text-center">
            <h1 className="text-lg font-extrabold tracking-wider text-white">HINATA</h1>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide -mt-0.5">AI Assistant</p>
          </div>

          {/* Right Premium Button with Crown Icon */}
          <button
            type="button"
            onClick={() => setIsPremiumModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-950/80 to-purple-900/70 border border-purple-500/50 hover:border-purple-400 text-xs font-semibold text-purple-200 flex items-center gap-1.5 shadow-[0_0_15px_rgba(168,85,247,0.3)] cursor-pointer transition-all hover:scale-105 active:scale-95"
          >
            <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-[12px] font-bold text-purple-200">Premium</span>
          </button>
        </header>

        {/* 2. WELCOME SECTION (Matching Reference Image) */}
        <section className="text-center pt-2 space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Hello,{' '}
            <span
              onClick={handleHearGreeting}
              className="bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-300 bg-clip-text text-transparent cursor-pointer hover:opacity-90"
              title="Click to hear Hinata speak"
            >
              {userName}!
            </span>
          </h2>
          <p className="text-sm text-slate-400 font-normal">How can I help you today?</p>
        </section>

        {/* 3. MAIN ANIMATED HOLOGRAPHIC ORB */}
        <section className="relative flex flex-col items-center justify-center -my-3">
          <HinataOrb
            state={orbState}
            size={275}
            audioIntensity={audioLevel}
            onClick={handleToggleVoice}
            className="cursor-pointer hover:scale-105 transition-transform"
          />

          {/* 4. VOICE STATUS PILL (Matching Reference Image) */}
          <button
            type="button"
            onClick={handleToggleVoice}
            className="relative -mt-3 px-5 py-2 rounded-full bg-gradient-to-r from-purple-950/60 via-purple-900/40 to-purple-950/60 border border-purple-500/50 hover:border-purple-400 text-xs font-semibold text-purple-200 flex items-center gap-2.5 shadow-[0_0_20px_rgba(168,85,247,0.3)] cursor-pointer transition-all hover:scale-105 active:scale-95 z-20"
          >
            {/* Live Audio Waveform Bars */}
            <div className="flex items-center gap-1 h-3.5">
              {[6, 12, 16, 10, 4].map((h, i) => (
                <span
                  key={i}
                  style={{
                    height: isListening || isSpeaking ? `${Math.max(4, h + Math.sin(Date.now() / 150 + i) * 6)}px` : `${h * 0.7}px`,
                  }}
                  className="w-0.5 rounded-full bg-purple-300 shadow-[0_0_6px_#d946ef] transition-all duration-100"
                />
              ))}
            </div>
            <span className="text-[12px] font-medium text-purple-100">{statusMessage}</span>
          </button>
        </section>

        {/* 5. 4 CIRCULAR QUICK ACTIONS (Matching Reference Image) */}
        <section className="pt-2">
          <div className="grid grid-cols-4 gap-3 text-center">
            {/* 1. Call */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('devices')}
                className="w-14 h-14 rounded-full bg-gradient-to-b from-purple-950/50 to-black border border-purple-500/40 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)] flex items-center justify-center text-purple-300 hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer"
                title="Phone Call"
              >
                <Phone className="w-5 h-5 fill-current" />
              </button>
              <span className="text-xs text-slate-300 font-medium">Call</span>
            </div>

            {/* 2. Message */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('chat')}
                className="w-14 h-14 rounded-full bg-gradient-to-b from-purple-950/50 to-black border border-purple-500/40 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)] flex items-center justify-center text-purple-300 hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer"
                title="Message / AI Chat"
              >
                <MessageSquare className="w-5 h-5 fill-current" />
              </button>
              <span className="text-xs text-slate-300 font-medium">Message</span>
            </div>

            {/* 3. Open App */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('automation')}
                className="w-14 h-14 rounded-full bg-gradient-to-b from-purple-950/50 to-black border border-purple-500/40 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)] flex items-center justify-center text-purple-300 hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer"
                title="Open App & Routines"
              >
                <Grid className="w-5 h-5" />
              </button>
              <span className="text-xs text-slate-300 font-medium">Open App</span>
            </div>

            {/* 4. Settings */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={onOpenSettings}
                className="w-14 h-14 rounded-full bg-gradient-to-b from-purple-950/50 to-black border border-purple-500/40 hover:border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)] flex items-center justify-center text-purple-300 hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
              <span className="text-xs text-slate-300 font-medium">Settings</span>
            </div>
          </div>
        </section>

        {/* 6. PREMIUM UPGRADE CARD (Matching Reference Image) */}
        <section className="pt-2">
          <div
            onClick={() => setIsPremiumModalOpen(true)}
            className="p-4 rounded-3xl bg-gradient-to-r from-purple-950/60 via-purple-900/40 to-black/80 border border-purple-500/40 hover:border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.25)] flex items-center justify-between gap-3 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.99] group"
          >
            <div className="flex items-center gap-3.5">
              {/* Lightning Icon Badge */}
              <div className="w-11 h-11 rounded-2xl bg-purple-900/50 border border-purple-500/50 flex items-center justify-center text-fuchsia-300 shadow-[0_0_12px_rgba(217,70,239,0.4)] group-hover:scale-110 transition-transform">
                <Zap className="w-5 h-5 fill-current text-fuchsia-300" />
              </div>

              <div>
                <h3 className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors">
                  Upgrade to Premium
                </h3>
                <p className="text-xs text-purple-300/80 mt-0.5">Unlock more amazing features!</p>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-purple-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
        </section>
      </div>

      {/* 7. PREMIUM MODAL */}
      {isPremiumModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-slate-950 border border-purple-500/50 p-6 shadow-2xl shadow-purple-900/40 text-slate-200 overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="text-base font-bold text-white font-display">HINATA AI Premium</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPremiumModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-2 text-purple-200">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Unlimited Gemini 3.8 Flash Neural Pipeline</span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-2 text-purple-200">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Photorealistic Holographic AI Orb Visualizer</span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-2 text-purple-200">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero-Latency On-Device Wake-Word Engine</span>
              </div>
              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-2 text-purple-200">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Isolated Cloud Firestore Vault Storage</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsPremiumModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              Active on Your Account (PRO)
            </button>
          </div>
        </div>
      )}

      {/* 8. SIDE DRAWER MENU (Triggered by Hamburger ☰) */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="relative w-72 max-w-[80vw] h-full bg-slate-950 border-r border-purple-500/40 p-5 flex flex-col justify-between shadow-2xl">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-purple-900/60 border border-purple-500/50 flex items-center justify-center text-purple-300">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-white text-sm">HINATA AI</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Profile summary */}
              <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 text-xs space-y-1">
                <span className="text-[10px] text-slate-400 block font-mono">Current User:</span>
                <p className="font-bold text-white text-sm truncate">{userName}</p>
                <p className="text-[10px] text-purple-300 font-mono truncate">{currentUser?.email || 'Logged in'}</p>
              </div>

              {/* Nav links */}
              <div className="space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onNavigate('memory');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-purple-900/40 text-left text-slate-200 hover:text-white flex items-center gap-2.5 cursor-pointer"
                >
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span>Personal AI Memory Vault</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onNavigate('background_service');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-purple-900/40 text-left text-slate-200 hover:text-white flex items-center gap-2.5 cursor-pointer"
                >
                  <Radio className="w-4 h-4 text-emerald-400" />
                  <span>Always-On Wake-Word Service</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onNavigate('code_exporter');
                  }}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-purple-900/40 text-left text-slate-200 hover:text-white flex items-center gap-2.5 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-sky-400" />
                  <span>Android Studio ZIP Export</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onToggleFlashlight();
                  }}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-purple-900/40 text-left text-slate-200 hover:text-white flex items-center gap-2.5 cursor-pointer"
                >
                  <Flashlight className="w-4 h-4 text-amber-400" />
                  <span>Flashlight: {deviceState.flashlight ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenSettings && onOpenSettings();
                  }}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-purple-900/40 text-left text-slate-200 hover:text-white flex items-center gap-2.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Security &amp; Isolation Probe</span>
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono text-center">
              HINATA AI v3.8 • Android Jetpack
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
