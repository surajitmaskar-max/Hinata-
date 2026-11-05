import React, { useState } from 'react';
import { JarvisLanguage } from '../types/jarvis';
import { GlowingOrb } from './GlowingOrb';
import { AudioWaveform } from './AudioWaveform';
import { Mic, X, Send, CheckCircle2 } from 'lucide-react';

interface FloatingAssistantOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  triggerKeyword?: string;
  currentLanguage: JarvisLanguage;
  onExecuteCommand: (text: string, lang: JarvisLanguage) => Promise<string | undefined>;
}

export const FloatingAssistantOverlay: React.FC<FloatingAssistantOverlayProps> = ({
  isOpen,
  onClose,
  triggerKeyword = 'Hey HINATA',
  currentLanguage,
  onExecuteCommand,
}) => {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseOutput, setResponseOutput] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    const cmd = inputText.trim();
    setInputText('');
    setIsProcessing(true);
    setResponseOutput(null);

    try {
      const resp = await onExecuteCommand(cmd, currentLanguage);
      setResponseOutput(resp || 'Task executed successfully.');
    } finally {
      setIsProcessing(false);
    }
  };

  const greeting =
    currentLanguage === 'bn'
      ? 'হ্যাঁ স্যার, আমি শুনছি। কী আদেশ বলুন?'
      : currentLanguage === 'hi'
      ? 'जी सर, मैं सुन रहा हूँ। आदेश दीजिए।'
      : 'Yes, sir? Wake-word detected. How may I assist?';

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm p-4 rounded-3xl bg-slate-900/95 border border-sky-500/40 shadow-2xl shadow-sky-950/80 backdrop-blur-xl text-slate-100 animate-slide-up">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200 font-display">
            HINATA Overlay Assistant
          </span>
          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-400">
            {triggerKeyword}
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Floating Mini Orb & Waveform */}
      <div className="py-4 flex flex-col items-center text-center">
        <div className="mb-2">
          <GlowingOrb size={90} isThinking={isProcessing} isSpeaking={!!responseOutput} isListening={!isProcessing && !responseOutput} />
        </div>

        <p className="text-xs text-sky-300 font-medium px-4 mb-2">
          {greeting}
        </p>

        <div className="w-48 my-1">
          <AudioWaveform isActive={!isProcessing && !responseOutput} height={24} />
        </div>

        {/* Live response bubble if available */}
        {responseOutput && (
          <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-left text-xs text-slate-200 w-full">
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 mb-1">
              <CheckCircle2 className="w-3 h-3" />
              DIRECTIVE VERIFIED
            </span>
            <p className="leading-relaxed font-sans">{responseOutput}</p>
          </div>
        )}
      </div>

      {/* Floating Input bar */}
      <form onSubmit={handleSubmit} className="pt-2 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            currentLanguage === 'bn'
              ? 'বলুন বা লিখুন...'
              : currentLanguage === 'hi'
              ? 'बोलें या लिखें...'
              : 'Speak or type command...'
          }
          className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          autoFocus
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isProcessing}
          className="p-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-50 transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
