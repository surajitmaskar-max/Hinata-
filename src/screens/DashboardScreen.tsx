import React, { useState } from 'react';
import { AppScreen, DeviceState, TaskRecord, JarvisLanguage } from '../types/jarvis';
import { GlowingOrb } from '../components/GlowingOrb';
import {
  Mic,
  MessageSquare,
  Zap,
  Sliders,
  History,
  Brain,
  Shield,
  Download,
  Flashlight,
  Volume2,
  Sun,
  Wifi,
  BatteryCharging,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Cpu,
} from 'lucide-react';

interface DashboardScreenProps {
  onNavigate: (screen: AppScreen) => void;
  deviceState: DeviceState;
  onToggleFlashlight: () => void;
  recentTasks: TaskRecord[];
  onQuickCommand: (command: string) => void;
  currentLanguage: JarvisLanguage;
  onChangeLanguage: (lang: JarvisLanguage) => void;
  isBackgroundServiceRunning?: boolean;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigate,
  deviceState,
  onToggleFlashlight,
  recentTasks,
  onQuickCommand,
  currentLanguage,
  onChangeLanguage,
}) => {
  const [inputText, setInputText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onQuickCommand(inputText.trim());
    setInputText('');
  };

  const quickPrompts = [
    { label: 'Turn on flashlight', command: 'Turn on the flashlight' },
    { label: 'Morning Briefing', command: 'Run morning briefing automation' },
    { label: 'বাংলায় সম্ভাষণ', command: 'আমার নাম ও আজকের দিন বলুন', lang: 'bn' as JarvisLanguage },
    { label: 'सुबह का अलार्म', command: 'कल सुबह 6 बजे का अलार्म लगाओ', lang: 'hi' as JarvisLanguage },
    { label: 'Set Volume 80%', command: 'Set system volume to 80%' },
    { label: 'Open Google Maps', command: 'Launch Google Maps navigation' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Hero Holographic Banner */}
      <div className="relative rounded-2xl p-6 sm:p-8 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-800 shadow-xl overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-xs text-sky-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>JARVIS SYSTEM ACTIVE &bull; GOOGLE GEMINI 3.8 FLASH</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
              Good day, Sir. How may I assist your Android device?
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              All accessibility services, hardware controllers, and voice engines are calibrated. Speak or type your request below.
            </p>

            {/* Language Switcher */}
            <div className="pt-2 flex items-center justify-center lg:justify-start gap-2">
              <span className="text-xs text-slate-400 mr-1">Voice Language:</span>
              <button
                type="button"
                onClick={() => onChangeLanguage('en')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                  currentLanguage === 'en'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => onChangeLanguage('bn')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                  currentLanguage === 'bn'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                বাংলা (Bengali)
              </button>
              <button
                type="button"
                onClick={() => onChangeLanguage('hi')}
                className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors cursor-pointer ${
                  currentLanguage === 'hi'
                    ? 'bg-sky-500 text-white shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                हिन्दी (Hindi)
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center">
            <GlowingOrb
              size={140}
              onClick={() => onNavigate('voice')}
            />
            <span className="text-xs text-slate-400 mt-2 hover:text-sky-400 cursor-pointer" onClick={() => onNavigate('voice')}>
              Click to launch Voice Assistant
            </span>
          </div>
        </div>

        {/* Live Command Bar */}
        <form onSubmit={handleSubmit} className="mt-6 pt-6 border-t border-slate-800/80 flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                currentLanguage === 'bn'
                  ? 'JARVIS-কে আদেশ দিন (যেমন: "টর্চ চালু করো", "ভলিউম বাড়াও", "ইউটিউব খোলো")...'
                  : currentLanguage === 'hi'
                  ? 'JARVIS को निर्देश दें (उदा: "फ्लैशलाइट चालू करो", "वॉल्यूम 80% करो")...'
                  : 'Instruct JARVIS (e.g. "Toggle flashlight", "Set volume 80%", "Open Maps")...'
              }
              className="w-full px-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700/80 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all font-sans"
            />
          </div>

          <button
            type="button"
            onClick={() => onNavigate('voice')}
            className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition-colors cursor-pointer"
            title="Open Voice Assistant"
          >
            <Mic className="w-5 h-5" />
          </button>

          <button
            type="submit"
            className="px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-sm font-semibold transition-all shadow-md shadow-sky-600/30 flex items-center gap-2 cursor-pointer"
          >
            <span>Execute</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Quick prompt suggestions */}
        <div className="mt-3 flex flex-wrap gap-2">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (p.lang) onChangeLanguage(p.lang);
                onQuickCommand(p.command);
              }}
              className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-sky-400" />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Real-time Android Hardware Telemetry Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Flashlight status */}
        <button
          type="button"
          onClick={onToggleFlashlight}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-24 ${
            deviceState.flashlight
              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Camera Torch</span>
            <Flashlight className={`w-4 h-4 ${deviceState.flashlight ? 'text-amber-400' : 'text-slate-500'}`} />
          </div>
          <div>
            <span className="text-sm font-semibold">{deviceState.flashlight ? 'ACTIVE' : 'OFF'}</span>
            <span className="text-xs text-slate-400 block">Click to toggle</span>
          </div>
        </button>

        {/* Volume status */}
        <div
          onClick={() => onNavigate('devices')}
          className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between h-24"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Media Volume</span>
            <Volume2 className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <span className="text-sm font-semibold tabular-nums">{deviceState.volume}%</span>
            <span className="text-xs text-slate-400 block">Audio Stream</span>
          </div>
        </div>

        {/* Brightness status */}
        <div
          onClick={() => onNavigate('devices')}
          className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700 transition-all cursor-pointer flex flex-col justify-between h-24"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Display Brightness</span>
            <Sun className="w-4 h-4 text-yellow-400" />
          </div>
          <div>
            <span className="text-sm font-semibold tabular-nums">{deviceState.brightness}%</span>
            <span className="text-xs text-slate-400 block">Hardware Backlight</span>
          </div>
        </div>

        {/* Connectivity */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 flex flex-col justify-between h-24">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Network State</span>
            <Wifi className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-sm font-semibold">ONLINE</span>
            <span className="text-xs text-slate-400 block">Low Latency</span>
          </div>
        </div>

        {/* Battery */}
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-300 flex flex-col justify-between h-24">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Power Level</span>
            <BatteryCharging className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <span className="text-sm font-semibold tabular-nums">{deviceState.batteryLevel}%</span>
            <span className="text-xs text-slate-400 block">Charging Optimally</span>
          </div>
        </div>

        {/* Accessibility Service status */}
        <div
          onClick={() => onNavigate('settings')}
          className="p-3.5 rounded-xl border border-sky-500/30 bg-sky-500/10 text-sky-300 hover:border-sky-500/50 transition-all cursor-pointer flex flex-col justify-between h-24"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-sky-400">Accessibility</span>
            <Shield className="w-4 h-4 text-sky-400" />
          </div>
          <div>
            <span className="text-sm font-semibold">BOUND</span>
            <span className="text-xs text-sky-400/80 block">UI Node Control</span>
          </div>
        </div>
      </div>

      {/* Grid of Main Modules */}
      <div>
        <h2 className="text-base font-semibold text-slate-100 mb-3 font-display">
          Core Operating System Modules
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Module 1: Voice Assistant */}
          <button
            type="button"
            onClick={() => onNavigate('voice')}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/60 text-left transition-all cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
                AI Voice Assistant
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Real-time conversations in Bengali, Hindi &amp; English with glowing audio visualizer.
              </p>
            </div>
          </button>

          {/* Module 2: AI Chat */}
          <button
            type="button"
            onClick={() => onNavigate('chat')}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/60 text-left transition-all cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">
                Multi-Turn AI Chat
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Deep context reasoning powered by Gemini 3.8 Flash with tool execution cards.
              </p>
            </div>
          </button>

          {/* Module 3: Automation Center */}
          <button
            type="button"
            onClick={() => onNavigate('automation')}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 hover:bg-slate-800/60 text-left transition-all cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors">
                Automation Center
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Pre-configured &amp; custom multi-step Android routines with step verification.
              </p>
            </div>
          </button>

          {/* Module 4: Device Control */}
          <button
            type="button"
            onClick={() => onNavigate('devices')}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 text-left transition-all cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                Device Control
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Camera torch, audio sliders, brightness, and direct app intent launchpad.
              </p>
            </div>
          </button>

          {/* Module 5: Task History */}
          <button
            type="button"
            onClick={() => onNavigate('history')}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/60 text-left transition-all cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
                Task History
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Audit trail of completed commands, verification checkpoints, and retry logs.
              </p>
            </div>
          </button>

          {/* Module 6: Memory Management */}
          <button
            type="button"
            onClick={() => onNavigate('memory')}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-pink-500/50 hover:bg-slate-800/60 text-left transition-all cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white group-hover:text-pink-300 transition-colors">
                Memory Management
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Personalized facts, user preferences, and custom rules stored in Room DB.
              </p>
            </div>
          </button>

          {/* Module 7: Security & Settings */}
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/60 text-left transition-all cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white group-hover:text-amber-300 transition-colors">
                Security &amp; Permissions
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Granular Android permissions, confirmation toggles, and privacy controls.
              </p>
            </div>
          </button>

          {/* Module 8: Always-On Background JARVIS Mode */}
          <button
            type="button"
            onClick={() => onNavigate('background_service')}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/60 text-left transition-all cursor-pointer group space-y-3"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">
                  Always-On Voice Mode
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Local on-device "Hey JARVIS" wake-word engine &amp; foreground service privacy controls.
              </p>
            </div>
          </button>

          {/* Module 9: Android Project Exporter */}
          <button
            type="button"
            onClick={() => onNavigate('code_exporter')}
            className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/40 hover:border-indigo-400 text-left transition-all cursor-pointer group space-y-3 shadow-lg shadow-indigo-950/40"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">
                Android Studio Project
              </h3>
              <p className="text-xs text-indigo-300/80 leading-relaxed mt-1">
                View complete Kotlin source code and download the 1-click buildable ZIP bundle.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Tasks & Audit Log Section */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold text-slate-200 font-display">
              Live Task Engine Feed
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('history')}
            className="text-xs text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
          >
            View Full History &rarr;
          </button>
        </div>

        {recentTasks.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            No recent commands. Try asking JARVIS to turn on the flashlight or set an alarm above.
          </div>
        ) : (
          <div className="space-y-2">
            {recentTasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-medium text-slate-200 block">
                      {task.command}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {task.summary}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
                    VERIFIED
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5 tabular-nums">
                    {new Date(task.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
