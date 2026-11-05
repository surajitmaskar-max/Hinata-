import React, { useState, useEffect } from 'react';
import { SecurityPermission, JarvisLanguage } from '../types/jarvis';
import { soundEngine } from '../utils/audio';
import { speechManager, VoicePreset, VoiceEmotion, VoiceOption } from '../utils/speech';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  Lock,
  Volume2,
  VolumeX,
  Moon,
  Sun,
  Globe,
  Download,
  AlertTriangle,
  Sparkles,
  Sliders,
  Smile,
  Heart,
  CheckCircle2,
  Square,
  Play,
  RotateCcw,
  User,
  Users,
  LogIn,
  KeyRound,
} from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
  permissions: SecurityPermission[];
  onTogglePermission: (id: string) => void;
  requireCallConfirmation: boolean;
  onToggleRequireCallConfirmation: () => void;
  requireSmsConfirmation: boolean;
  onToggleRequireSmsConfirmation: () => void;
  currentLanguage: JarvisLanguage;
  onChangeLanguage: (lang: JarvisLanguage) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
  onOpenExporter: () => void;
  onOpenAuthModal?: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  permissions,
  onTogglePermission,
  requireCallConfirmation,
  onToggleRequireCallConfirmation,
  requireSmsConfirmation,
  onToggleRequireSmsConfirmation,
  currentLanguage,
  onChangeLanguage,
  isMuted,
  onToggleMute,
  isDarkTheme,
  onToggleTheme,
  onOpenExporter,
  onOpenAuthModal,
}) => {
  const { currentUser, userProfile, getPersonalizedGreeting, logout } = useAuth();

  // Voice Personality State
  const [voiceSettings, setVoiceSettings] = useState(speechManager.getSettings());
  const [availableVoices, setAvailableVoices] = useState<VoiceOption[]>([]);
  const [isSpeakingPreview, setIsSpeakingPreview] = useState(false);
  const [activeEmotionPreview, setActiveEmotionPreview] = useState<VoiceEmotion | null>(null);

  useEffect(() => {
    const voices = speechManager.getAvailableVoices(currentLanguage);
    setAvailableVoices(voices);
  }, [currentLanguage]);

  const handleSelectPreset = (preset: VoicePreset) => {
    speechManager.setPreset(preset);
    setVoiceSettings(speechManager.getSettings());
    soundEngine.playSuccess();
    handlePreview('greeting', preset);
  };

  const handlePitchChange = (pitch: number) => {
    speechManager.setCustomPitch(pitch);
    setVoiceSettings(speechManager.getSettings());
  };

  const handleRateChange = (rate: number) => {
    speechManager.setCustomRate(rate);
    setVoiceSettings(speechManager.getSettings());
  };

  const handleVoiceChange = (voiceURI: string) => {
    speechManager.setPreferredVoice(currentLanguage, voiceURI);
    setVoiceSettings(speechManager.getSettings());
    handlePreview('greeting');
  };

  const handlePreview = (emotion: VoiceEmotion, presetOverride?: VoicePreset) => {
    if (presetOverride) {
      speechManager.setPreset(presetOverride);
    }
    setIsSpeakingPreview(true);
    setActiveEmotionPreview(emotion);

    let sampleText = speechManager.greetings[currentLanguage];
    if (emotion === 'success') {
      sampleText = speechManager.successPhrases[currentLanguage];
    } else if (emotion === 'caring') {
      sampleText = speechManager.caringPhrases[currentLanguage];
    } else if (emotion === 'explaining') {
      sampleText =
        currentLanguage === 'bn'
          ? 'আমি আপনার ডিভাইসের সব সেটিংস নিখুঁতভাবে সমন্বয় করেছি।'
          : currentLanguage === 'hi'
          ? 'मैंने आपके डिवाइस की सभी सेटिंग्स को बिल्कुल ठीक से समायोजित कर दिया है।'
          : 'I have calibrated your device settings and verified all system connections.';
    }

    speechManager.speak(
      sampleText,
      currentLanguage,
      () => setIsSpeakingPreview(true),
      () => {
        setIsSpeakingPreview(false);
        setActiveEmotionPreview(null);
      },
      emotion
    );
  };

  const handleStopPreview = () => {
    speechManager.stopSpeaking();
    setIsSpeakingPreview(false);
    setActiveEmotionPreview(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 pb-24 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-violet-500/20 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-violet-500/30 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white font-display flex items-center gap-2">
              <Shield className="w-5 h-5 text-violet-400" />
              <span>HINATA AI System Settings</span>
            </h1>
            <p className="text-xs text-slate-400">
              Anime voice personality engine, Android permissions, and runtime security
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenExporter}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-violet-600/30"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Android Studio Code</span>
        </button>
      </div>

      {/* MULTI-USER PERSONALIZATION & FIREBASE SECURITY */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-500/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-base shadow-md">
              {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : <User className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white font-display">
                  {userProfile?.displayName || (currentUser ? 'Authenticated User' : 'Guest Account')}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-900/50 text-purple-300 border border-purple-500/30">
                  Firebase UID: {currentUser ? `${currentUser.uid.slice(0, 10)}...` : 'Not Signed In'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {currentUser?.email || 'Sign in to sync personal memories, private chats & custom routines'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition-all shadow-md shadow-purple-600/30 cursor-pointer flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>{currentUser ? 'Switch / Security Lab' : 'Sign In / Register'}</span>
            </button>
            {currentUser && (
              <button
                type="button"
                onClick={logout}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                title="Sign out"
              >
                <LogIn className="w-4 h-4 rotate-180" />
              </button>
            )}
          </div>
        </div>

        {/* Personalized Greeting Card */}
        <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[11px] font-semibold text-purple-300 flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              Hinata's Personalized Greeting for this User:
            </span>
            <p className="text-slate-200 italic font-medium">"{getPersonalizedGreeting()}"</p>
          </div>
          <button
            type="button"
            onClick={() => speechManager.speakHinata(getPersonalizedGreeting(), 'greeting')}
            className="px-3 py-1.5 rounded-xl bg-purple-900/50 hover:bg-purple-800 border border-purple-500/40 text-purple-200 flex items-center gap-1.5 shrink-0 cursor-pointer transition-all"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Hear Greeting</span>
          </button>
        </div>
      </div>

      {/* ANIME VOICE PERSONALITY ENGINE (Requirement Focus) */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-violet-950/40 via-slate-900 to-slate-950 border border-violet-500/30 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-violet-500/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/40 flex items-center justify-center text-violet-300">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white font-display flex items-center gap-2">
                Anime Voice Personality Engine
              </h2>
              <p className="text-[11px] text-slate-400">
                Cute, sweet, and expressive neural speech calibrated for Hinata
              </p>
            </div>
          </div>

          {/* Active Speaking Status Indicator */}
          {isSpeakingPreview && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-xs text-violet-300 font-mono animate-pulse">
              <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Speaking: {activeEmotionPreview?.toUpperCase()}</span>
              <button
                type="button"
                onClick={handleStopPreview}
                className="ml-1 p-0.5 hover:text-white cursor-pointer"
                title="Stop Audio"
              >
                <Square className="w-3 h-3 fill-current" />
              </button>
            </div>
          )}
        </div>

        {/* 1. Voice Personality Presets */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
            <span>Voice Personality Preset</span>
            <span className="text-[10px] text-violet-400 font-mono">
              Pitch: {voiceSettings.pitchMultiplier.toFixed(2)}x &bull; Speed: {voiceSettings.rateMultiplier.toFixed(2)}x
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {[
              {
                id: 'hinata_sweet' as VoicePreset,
                title: 'Hinata Sweet Anime',
                tag: 'Recommended',
                desc: 'Soft, sweet, friendly anime heroine tone with warm expressive rhythm',
                pitch: '1.28x',
                rate: '1.06x',
                icon: Heart,
                color: 'border-pink-500/40 bg-pink-500/10 text-pink-300',
              },
              {
                id: 'hinata_idol' as VoicePreset,
                title: 'Energetic Idol',
                tag: 'Lively',
                desc: 'High-energy, cheery anime idol delivery with excited cadence',
                pitch: '1.36x',
                rate: '1.14x',
                icon: Sparkles,
                color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
              },
              {
                id: 'hinata_gentle' as VoicePreset,
                title: 'Gentle Companion',
                tag: 'Comforting',
                desc: 'Calm, soothing, empathetic older-sister anime character',
                pitch: '1.18x',
                rate: '0.98x',
                icon: Smile,
                color: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
              },
              {
                id: 'hinata_kuudere' as VoicePreset,
                title: 'Cyber Kuudere',
                tag: 'Composed',
                desc: 'Articulate, cool, polite android cadence with sharp clarity',
                pitch: '1.12x',
                rate: '1.04x',
                icon: Sliders,
                color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
              },
            ].map((preset) => {
              const Icon = preset.icon;
              const isSelected = voiceSettings.preset === preset.id;

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-violet-950/60 border-violet-400 shadow-lg shadow-violet-950/50 scale-[1.02]'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 font-semibold text-xs text-white">
                        <Icon className="w-3.5 h-3.5 text-violet-400" />
                        <span>{preset.title}</span>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full border ${preset.color}`}
                      >
                        {preset.tag}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-relaxed">{preset.desc}</p>
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Pitch: {preset.pitch}</span>
                    <span>Rate: {preset.rate}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Sliders for Fine-Tuned Pitch & Speech Speed */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
          {/* Pitch Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Voice Pitch (Sweetness & Frequency)</span>
              <span className="font-mono text-violet-400 font-bold">
                {voiceSettings.pitchMultiplier.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.65"
              step="0.02"
              value={voiceSettings.pitchMultiplier}
              onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
              className="w-full accent-violet-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.75x (Deeper)</span>
              <span>1.28x (Anime Default)</span>
              <span>1.65x (High Sweet)</span>
            </div>
          </div>

          {/* Rate Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Speaking Speed (Conversational Rhythm)</span>
              <span className="font-mono text-cyan-400 font-bold">
                {voiceSettings.rateMultiplier.toFixed(2)}x
              </span>
            </div>
            <input
              type="range"
              min="0.75"
              max="1.45"
              step="0.02"
              value={voiceSettings.rateMultiplier}
              onChange={(e) => handleRateChange(parseFloat(e.target.value))}
              className="w-full accent-cyan-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.75x (Relaxed)</span>
              <span>1.06x (Natural)</span>
              <span>1.45x (Spirited)</span>
            </div>
          </div>
        </div>

        {/* 3. Underlying OS Voice Engine Replacement */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-violet-400" />
              Underlying OS Voice Provider ({currentLanguage.toUpperCase()})
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {availableVoices.length} Voices Detected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={voiceSettings.preferredVoices[currentLanguage] || ''}
              onChange={(e) => handleVoiceChange(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="">Auto-Detect Highest Quality Female Voice</option>
              {availableVoices.map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>
                  {v.name} ({v.lang}) {v.isRecommended ? '★ Recommended' : ''}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => handlePreview('greeting')}
              disabled={isSpeakingPreview}
              className="px-3.5 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-violet-600/30"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Test Voice</span>
            </button>
          </div>
        </div>

        {/* 4. Live Anime Emotion Voice Previews */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-300 block">
            Expressive Vocal Delivery Previews (Bengali, Hindi &amp; English)
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => handlePreview('greeting')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                activeEmotionPreview === 'greeting'
                  ? 'bg-pink-500/20 border-pink-400 text-pink-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white hover:border-violet-500/30'
              }`}
            >
              <span className="font-semibold text-xs flex items-center gap-1">
                <span>🌸</span>
                <span>Gentle Greeting</span>
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1 italic">
                "{speechManager.greetings[currentLanguage]}"
              </span>
            </button>

            <button
              type="button"
              onClick={() => handlePreview('success')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                activeEmotionPreview === 'success'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white hover:border-violet-500/30'
              }`}
            >
              <span className="font-semibold text-xs flex items-center gap-1">
                <span>🎉</span>
                <span>Excited Success</span>
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1 italic">
                "{speechManager.successPhrases[currentLanguage]}"
              </span>
            </button>

            <button
              type="button"
              onClick={() => handlePreview('explaining')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                activeEmotionPreview === 'explaining'
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white hover:border-violet-500/30'
              }`}
            >
              <span className="font-semibold text-xs flex items-center gap-1">
                <span>📖</span>
                <span>Calm Explaining</span>
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1 italic">
                {currentLanguage === 'bn'
                  ? 'ডিভাইস সেটিংস নিখুঁতভাবে সমন্বয় করা হয়েছে...'
                  : currentLanguage === 'hi'
                  ? 'डिवाइस सेटिंग्स को समायोजित कर दिया गया है...'
                  : 'Calibrated system connections...'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handlePreview('caring')}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1 ${
                activeEmotionPreview === 'caring'
                  ? 'bg-violet-500/20 border-violet-400 text-violet-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:text-white hover:border-violet-500/30'
              }`}
            >
              <span className="font-semibold text-xs flex items-center gap-1">
                <span>💖</span>
                <span>Caring Tone</span>
              </span>
              <span className="text-[10px] text-slate-400 line-clamp-1 italic">
                "{speechManager.caringPhrases[currentLanguage]}"
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Security Protocol Confirmation Card */}
      <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-semibold text-xs">
          <AlertTriangle className="w-4 h-4" />
          <span>SECURITY PROTOCOL: SENSITIVE ACTION CONFIRMATION</span>
        </div>
        <p className="text-xs text-amber-200/80 leading-relaxed">
          HINATA enforces confirmation prompts for operations that initiate phone calls or send text messages. Zero silent background execution.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-medium text-slate-200 block">Phone Calls Confirmation</span>
              <span className="text-[11px] text-slate-400">Prompts before opening dialer</span>
            </div>
            <button
              type="button"
              onClick={onToggleRequireCallConfirmation}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                requireCallConfirmation ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  requireCallConfirmation ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
            <div>
              <span className="font-medium text-slate-200 block">SMS Messages Confirmation</span>
              <span className="text-[11px] text-slate-400">Verifies recipient and payload</span>
            </div>
            <button
              type="button"
              onClick={onToggleRequireSmsConfirmation}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                requireSmsConfirmation ? 'bg-amber-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                  requireSmsConfirmation ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Android System Permissions Matrix */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white font-display flex items-center gap-2">
            <Lock className="w-4 h-4 text-violet-400" />
            Android Manifest &amp; Runtime Permissions
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            {permissions.filter((p) => p.granted).length} / {permissions.length} Authorized
          </span>
        </div>

        <div className="space-y-2.5">
          {permissions.map((perm) => (
            <div
              key={perm.id}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5 pr-4">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{perm.name}</span>
                  <span className="text-[10px] font-mono text-cyan-400">
                    {perm.androidName}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  {perm.description}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onTogglePermission(perm.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                  perm.granted
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:text-white'
                }`}
              >
                {perm.granted ? 'AUTHORIZED' : 'GRANT'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Voice Language & UI Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Language Preference */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span>Default Assistant Language</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Select the primary language for voice recognition and spoken responses.
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => onChangeLanguage('en')}
              className={`p-2 rounded-xl text-center font-medium transition-colors cursor-pointer ${
                currentLanguage === 'en'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onChangeLanguage('bn')}
              className={`p-2 rounded-xl text-center font-medium transition-colors cursor-pointer ${
                currentLanguage === 'bn'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              বাংলা
            </button>
            <button
              type="button"
              onClick={() => onChangeLanguage('hi')}
              className={`p-2 rounded-xl text-center font-medium transition-colors cursor-pointer ${
                currentLanguage === 'hi'
                  ? 'bg-violet-600 text-white shadow-md'
                  : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
              }`}
            >
              हिन्दी
            </button>
          </div>
        </div>

        {/* Sound & Theme Controls */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs">
          <div className="flex items-center gap-2 text-slate-200 font-semibold">
            <Volume2 className="w-4 h-4 text-violet-400" />
            <span>Audio &amp; Display Environment</span>
          </div>

          <div className="space-y-2 pt-1">
            {/* Audio cues */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Acoustic Sound Effects</span>
              <button
                type="button"
                onClick={onToggleMute}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-violet-400 cursor-pointer"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Theme mode */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Interface Theme</span>
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 cursor-pointer flex items-center gap-1.5"
              >
                {isDarkTheme ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                <span className="text-[11px] text-slate-300 font-medium">
                  {isDarkTheme ? 'Dark Mode' : 'Light Mode'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
