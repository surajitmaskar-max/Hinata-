import React, { useState, useEffect } from 'react';
import { JarvisLanguage, TaskRecord } from '../types/jarvis';
import { HinataOrb, OrbState } from '../components/HinataOrb';
import { AudioWaveform } from '../components/AudioWaveform';
import { soundEngine } from '../utils/audio';
import { speechManager } from '../utils/speech';
import { useAuth } from '../context/AuthContext';
import {
  Mic,
  MicOff,
  Volume2,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  X,
  Languages,
} from 'lucide-react';

interface VoiceAssistantScreenProps {
  onBack: () => void;
  onExecuteVoiceCommand: (text: string, lang: JarvisLanguage) => Promise<string | undefined>;
  currentLanguage: JarvisLanguage;
  onChangeLanguage: (lang: JarvisLanguage) => void;
  latestTask?: TaskRecord;
}

export const VoiceAssistantScreen: React.FC<VoiceAssistantScreenProps> = ({
  onBack,
  onExecuteVoiceCommand,
  currentLanguage,
  onChangeLanguage,
}) => {
  const { currentUser, userProfile, getPersonalizedGreeting } = useAuth();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [orbState, setOrbState] = useState<OrbState>('idle');

  const getGreeting = () => {
    if (userProfile?.displayName || currentUser) {
      return getPersonalizedGreeting();
    }
    return currentLanguage === 'bn'
      ? 'হাই! আমি হিনাটা। বলো, আজ তোমার জন্য কী করতে পারি?'
      : currentLanguage === 'hi'
      ? 'हाय! मैं हिनाटा हूँ। बताओ, आज मैं तुम्हारी क्या मदद करूँ?'
      : "Hello! I'm Hinata. How can I help you today?";
  };

  const [lastResponse, setLastResponse] = useState<string>(getGreeting());

  useEffect(() => {
    speechManager.setLanguage(currentLanguage);
    setLastResponse(getGreeting());
  }, [currentLanguage, userProfile]);

  // Sync orb state with voice activities
  useEffect(() => {
    if (isListening) {
      setOrbState('listening');
    } else if (isProcessing) {
      setOrbState('thinking');
    } else if (isSpeaking) {
      setOrbState('speaking');
    } else {
      setOrbState('idle');
    }
  }, [isListening, isProcessing, isSpeaking]);

  const handleToggleListening = () => {
    if (isListening) {
      speechManager.stopListening();
      setIsListening(false);
      soundEngine.playSuccess();
    } else {
      soundEngine.playListenStart();
      setTranscript('');
      setIsListening(true);

      const success = speechManager.startListening(
        (recognizedText, isFinal) => {
          setTranscript(recognizedText);
          if (isFinal && recognizedText.trim()) {
            handleProcessCommand(recognizedText.trim());
          }
        },
        (error) => {
          console.warn('Speech recognition warning:', error);
          setIsListening(false);
        },
        () => {
          setIsListening(false);
        }
      );

      if (!success) {
        setIsListening(false);
      }
    }
  };

  const handleCancel = () => {
    speechManager.stopListening();
    speechManager.stopSpeaking();
    setIsListening(false);
    setIsProcessing(false);
    setIsSpeaking(false);
    setOrbState('idle');
    onBack();
  };

  const handleProcessCommand = async (commandText: string) => {
    setIsListening(false);
    setIsProcessing(true);
    setOrbState('thinking');

    try {
      const responseText = await onExecuteVoiceCommand(commandText, currentLanguage);
      if (responseText) {
        setLastResponse(responseText);
        setIsSpeaking(true);
        setOrbState('speaking');
        speechManager.speakHinata(
          responseText,
          'success',
          currentLanguage,
          () => {
            setIsSpeaking(true);
            setOrbState('speaking');
          },
          () => {
            setIsSpeaking(false);
            setOrbState('idle');
          }
        );
      }
    } catch {
      setLastResponse(
        currentLanguage === 'bn'
          ? 'দুঃখিত, এই নির্দেশটি কার্যকর করতে সমস্যা হয়েছে।'
          : currentLanguage === 'hi'
          ? 'माफ़ कीजिए, इस निर्देश को पूरा करने में समस्या आई।'
          : 'I encountered an issue executing that command.'
      );
      setOrbState('error');
      setTimeout(() => setOrbState('idle'), 2500);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReplaySpeech = () => {
    if (!lastResponse) return;
    setIsSpeaking(true);
    setOrbState('speaking');
    speechManager.speakHinata(
      lastResponse,
      'greeting',
      currentLanguage,
      () => {
        setIsSpeaking(true);
        setOrbState('speaking');
      },
      () => {
        setIsSpeaking(false);
        setOrbState('idle');
      }
    );
  };

  const samplePrompts = {
    en: [
      'Turn on the flashlight',
      'Open YouTube and search tech news',
      'Navigate to nearest airport',
      'Set an alarm for 6:30 AM',
    ],
    bn: [
      'টর্চলাইট চালু করো',
      'ইউটিউব খোলো ও খবর দেখাও',
      'নিকটবর্তী হাসপাতাল দেখাও',
      'সকাল ৬:৩০ এ অ্যালার্ম দাও',
    ],
    hi: [
      'टॉर्च चालू करो',
      'यूट्यूब पर गाने चलाओ',
      'पास का अस्पताल दिखाओ',
      'सुबह 6:30 का अलार्म लगाओ',
    ],
  };

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] pb-24 bg-black text-slate-100 flex flex-col justify-between overflow-x-hidden">
      {/* Background radial atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-purple-600/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 pt-4 flex-1 flex flex-col justify-between">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-900/40">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>

          {/* Central Title */}
          <div className="text-center">
            <h1 className="text-sm font-bold tracking-wider text-white">
              HINATA
            </h1>
            <p className="text-[10px] text-purple-400 font-mono tracking-wide">
              AI Voice Engine
            </p>
          </div>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-full border border-purple-900/40">
            <Languages className="w-3.5 h-3.5 text-purple-400 ml-1.5 mr-0.5" />
            {(['en', 'bn', 'hi'] as JarvisLanguage[]).map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={() => onChangeLanguage(lang)}
                className={`px-2.5 py-0.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  currentLanguage === lang
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {lang === 'en' ? 'EN' : lang === 'bn' ? 'বাং' : 'हिं'}
              </button>
            ))}
          </div>
        </div>

        {/* Central Visualizer: Holographic Purple Orb */}
        <div className="relative my-4 w-full flex-1 min-h-[320px] flex flex-col items-center justify-center">
          <div className="relative flex items-center justify-center">
            <HinataOrb
              state={orbState}
              size={290}
              onClick={handleToggleListening}
              className="cursor-pointer hover:scale-[1.02] transition-transform"
            />
          </div>

          {/* Orb Status Pill below orb */}
          <button
            type="button"
            onClick={handleToggleListening}
            className={`mt-4 px-5 py-2 rounded-full border transition-all cursor-pointer flex items-center gap-2 text-xs font-medium ${
              isListening
                ? 'bg-purple-950/80 border-purple-400/80 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]'
                : isProcessing
                ? 'bg-purple-950/70 border-purple-500/60 text-purple-200'
                : isSpeaking
                ? 'bg-purple-950/70 border-purple-400/80 text-purple-100 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                : 'bg-zinc-900/80 border-purple-900/50 text-zinc-300 hover:border-purple-600'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isListening
                  ? 'bg-rose-400 animate-ping'
                  : isProcessing
                  ? 'bg-amber-400 animate-spin'
                  : isSpeaking
                  ? 'bg-purple-400 animate-pulse'
                  : 'bg-purple-500'
              }`}
            />
            <span>
              {isListening
                ? 'Listening...'
                : isProcessing
                ? 'Thinking...'
                : isSpeaking
                ? 'Hinata is speaking...'
                : 'Tap to speak'}
            </span>
          </button>
        </div>

        {/* Voice Waveform Visualizer */}
        <div className="w-full max-w-md mx-auto py-2">
          <AudioWaveform
            isActive={isListening || isSpeaking}
            barCount={36}
            className="h-9 text-purple-400"
          />
        </div>

        {/* Transcription and Dialogue Box */}
        <div className="w-full max-w-xl mx-auto space-y-2">
          {/* User Live Transcription */}
          {transcript && (
            <div className="p-3 rounded-2xl bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200 flex items-center gap-2 animate-in fade-in">
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-purple-800/40 text-purple-200 font-semibold">
                You
              </span>
              <p className="line-clamp-2 italic">"{transcript}"</p>
            </div>
          )}

          {/* Hinata AI Response Box */}
          <div className="p-4 rounded-3xl bg-zinc-950/90 backdrop-blur-xl border border-purple-900/40 shadow-xl relative">
            <div className="flex items-center justify-between text-xs font-semibold text-purple-300 mb-1.5">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                HINATA
              </span>
              {lastResponse && (
                <button
                  type="button"
                  onClick={handleReplaySpeech}
                  disabled={isSpeaking}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-purple-300 disabled:opacity-40 transition-colors cursor-pointer"
                  title="Replay Voice Response"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Replay</span>
                </button>
              )}
            </div>

            <p className="text-sm text-zinc-100 leading-relaxed min-h-[2.5rem]">
              {lastResponse}
            </p>
          </div>
        </div>

        {/* Bottom Interactive Controls */}
        <div className="pt-4 pb-2 w-full max-w-md mx-auto flex items-center justify-center gap-6">
          {/* Cancel button */}
          <button
            type="button"
            onClick={handleCancel}
            className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-lg"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Primary Big Mic Activation Button */}
          <button
            type="button"
            onClick={handleToggleListening}
            className={`w-18 h-18 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-2xl relative ${
              isListening
                ? 'bg-purple-600 text-white shadow-[0_0_35px_rgba(168,85,247,0.8)] scale-105'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_30px_rgba(147,51,234,0.6)]'
            }`}
            aria-label="Toggle Microphone"
          >
            {isListening ? (
              <MicOff className="w-7 h-7 animate-pulse" />
            ) : (
              <Mic className="w-7 h-7" />
            )}
          </button>

          {/* Replay voice button */}
          <button
            type="button"
            onClick={handleReplaySpeech}
            disabled={!lastResponse || isSpeaking}
            className="w-12 h-12 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-white disabled:opacity-40 flex items-center justify-center transition-all cursor-pointer shadow-lg"
            title="Replay Speech"
          >
            <Volume2 className="w-5 h-5 text-purple-400" />
          </button>
        </div>

        {/* Quick Sample Prompts Carousel */}
        <div className="pt-2 pb-1 overflow-x-auto">
          <div className="flex items-center justify-center gap-2 min-w-max">
            {samplePrompts[currentLanguage].map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleProcessCommand(prompt)}
                className="px-3 py-1 rounded-full bg-zinc-900/80 hover:bg-purple-950/60 border border-purple-950/60 hover:border-purple-600/40 text-[11px] text-zinc-300 hover:text-white transition-all cursor-pointer"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
