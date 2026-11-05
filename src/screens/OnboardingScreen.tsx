import React, { useState } from 'react';
import { Mic, ShieldCheck, Zap, Layers, ArrowRight, Check, Sparkles, Box } from 'lucide-react';

interface OnboardingScreenProps {
  onComplete: () => void;
  onOpenExporter: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({
  onComplete,
  onOpenExporter,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: 'Dual Visual AI Intelligence',
      subtitle: '3D Cybernetic Character & Interactive Glowing Orb',
      description:
        'HINATA AI unites a responsive 3D female AI avatar rendered at 60 FPS with an audio-reactive glowing orb displaying 6 dynamic states (Idle, Listening, Thinking, Speaking, Executing, Error).',
      icon: Box,
      color: 'text-violet-400 bg-violet-500/10 border-violet-500/30',
      bullets: [
        'Real-time WebGL 3D character with blinking, gaze tracking & lip sync',
        'Multi-state animated glowing orb with silky spectral ribbons',
        'Expressive character poses: greeting, attentive, thinking, and joyful',
      ],
    },
    {
      title: 'Trilingual Voice Engine',
      subtitle: 'Bengali (বাংলা), Hindi (हिन्दी) & English',
      description:
        'Communicate naturally in your mother tongue. Hinata understands nuances across Bengali, Hindi, and English using Google Gemini 3.8 Flash, local wake-word detection, and native Speech-to-Text.',
      icon: Mic,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
      bullets: [
        'Real-time live voice waveform and audio-reactive lip synchronization',
        'Expressive multilingual TTS with authentic regional phrasing',
        'Local wake-word engine ("Hey Hinata", "হ্যালো হিনাতা", "हे हिनाता")',
      ],
    },
    {
      title: 'Deep Android Phone Automation',
      subtitle: 'Accessibility Service & Native Android Intents',
      description:
        'Hinata interacts with your smartphone directly: launches apps, navigates screens, adjusts brightness/volume, controls flashlight, and executes complex multi-step routines.',
      icon: Zap,
      color: 'text-fuchsia-400 bg-fuchsia-500/10 border-fuchsia-500/30',
      bullets: [
        'Android Accessibility Service performs authorized UI clicks & navigation',
        'Hardware controls for Camera2 LED flashlight, volume, and screen brightness',
        'Direct Intent dispatch for WhatsApp, YouTube, Maps, Spotify, and more',
      ],
    },
    {
      title: 'Security & Verification Invariants',
      subtitle: 'Explicit confirmation for sensitive actions & Room DB audit',
      description:
        'Safety is prioritized. Sensitive operations like phone calls and SMS messages require explicit user confirmation. Hinata verifies every action through real Android checks.',
      icon: ShieldCheck,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
      bullets: [
        'Zero fake simulations—actions are verified via Android APIs',
        'Confirmation modals for calling and texting to prevent accidental dispatch',
        'Local Room Database logs every audited step with cryptographic integrity',
      ],
    },
    {
      title: 'Production Android Studio Project',
      subtitle: 'Complete Kotlin + Jetpack Compose source ready to build',
      description:
        'Download the complete Android Studio project with SceneView 3D character integration, Room Database, Gemini 3.8 Flash SDK, and Foreground Service to build the APK directly.',
      icon: Layers,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
      bullets: [
        'Ready-to-open Gradle project with Kotlin 2.0 & Jetpack Compose',
        'Android Background Service with persistent notification channel',
        'Inspect all source code or download as a complete ZIP archive',
      ],
    },
  ];

  const current = slides[currentSlide];
  const IconComponent = current.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Brand and Step Indicators */}
      <div className="w-full max-w-3xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-mono tracking-wider text-slate-300 font-bold">
            HINATA AI ONBOARDING
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-6 bg-gradient-to-r from-violet-500 to-sky-400'
                  : 'w-1.5 bg-slate-800'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Center Slide Content */}
      <div className="w-full max-w-2xl mx-auto my-auto py-8">
        <div className="space-y-6">
          <div
            className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${current.color} shadow-lg`}
          >
            <IconComponent className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white">
              {current.title}
            </h2>
            <p className="text-sm font-medium text-violet-400">{current.subtitle}</p>
            <p className="text-sm text-slate-300 leading-relaxed pt-1">{current.description}</p>
          </div>

          <div className="space-y-2.5 pt-2">
            {current.bullets.map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3" />
                </div>
                <span className="text-xs sm:text-sm text-slate-200">{bullet}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Nav Buttons */}
      <div className="w-full max-w-2xl mx-auto flex items-center justify-between gap-4 pt-6 border-t border-slate-900">
        <button
          type="button"
          onClick={onComplete}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-mono cursor-pointer"
        >
          SKIP TO HOME
        </button>

        <div className="flex items-center gap-3">
          {currentSlide === slides.length - 1 && (
            <button
              type="button"
              onClick={onOpenExporter}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-violet-500/30 transition-all cursor-pointer"
            >
              Inspect Android Code
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (currentSlide < slides.length - 1) {
                setCurrentSlide((prev) => prev + 1);
              } else {
                onComplete();
              }
            }}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white font-medium text-xs shadow-lg shadow-violet-600/30 flex items-center gap-2 transition-all cursor-pointer group"
          >
            <span>{currentSlide === slides.length - 1 ? 'Launch Hinata AI' : 'Continue'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
