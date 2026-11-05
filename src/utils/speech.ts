import { JarvisLanguage } from '../types/jarvis';

export type VoiceEmotion = 'greeting' | 'success' | 'explaining' | 'caring' | 'playful' | 'standard';

export type VoicePreset =
  | 'hinata_sweet'    // Recommended: Soft, sweet, upbeat anime heroine
  | 'hinata_idol'     // High-energy cheerful anime idol
  | 'hinata_gentle'   // Warm, calm, soothing older-sister companion
  | 'hinata_kuudere'  // Composed, articulate cybernetic android
  | 'custom';         // User controlled sliders

export interface VoiceSettings {
  preset: VoicePreset;
  pitchMultiplier: number;
  rateMultiplier: number;
  preferredVoices: Record<JarvisLanguage, string>;
  soundEffectsEnabled: boolean;
}

export interface VoiceOption {
  name: string;
  voiceURI: string;
  lang: string;
  isFemale: boolean;
  isRecommended: boolean;
}

class HinataAnimeSpeechManager {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentLanguage: JarvisLanguage = 'en';
  private lipSyncListeners: Set<(intensity: number) => void> = new Set();
  private lipSyncInterval: any = null;

  private settings: VoiceSettings = {
    preset: 'hinata_sweet',
    pitchMultiplier: 1.28,
    rateMultiplier: 1.06,
    preferredVoices: {
      en: '',
      bn: '',
      hi: '',
    },
    soundEffectsEnabled: true,
  };

  // Canonical anime character greetings
  public readonly greetings: Record<JarvisLanguage, string> = {
    bn: 'হাই! আমি হিনাটা। বলো, আজ তোমার জন্য কী করতে পারি?',
    en: "Hello! I'm Hinata. I'm ready to help you!",
    hi: 'हाय! मैं हिनाटा हूँ। बताओ, आज मैं तुम्हारी क्या मदद करूँ?',
  };

  // Success excited affirmations
  public readonly successPhrases: Record<JarvisLanguage, string> = {
    bn: 'দারুণ! কাজটা সফলভাবে সম্পন্ন হয়েছে!',
    en: 'Yay! Task completed successfully!',
    hi: 'बढ़िया! काम सफलतापूर्वक पूरा हो गया!',
  };

  // Caring help phrases
  public readonly caringPhrases: Record<JarvisLanguage, string> = {
    bn: 'চিন্তা করো না, আমি তোমার পাশেই আছি। বলো কী সমস্যা?',
    en: "Don't worry, I'm right here with you. Tell me what you need!",
    hi: 'चिंता मत करो, मैं तुम्हारे साथ हूँ। बताओ क्या समस्या है?',
  };

  constructor() {
    this.loadSettings();
    this.initRecognition();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.autoSelectBestVoices();
      };
    }
  }

  private loadSettings() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('hinata_voice_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.settings = { ...this.settings, ...parsed };
      }
    } catch {
      // ignore
    }
  }

  private saveSettings() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('hinata_voice_settings', JSON.stringify(this.settings));
    } catch {
      // ignore
    }
  }

  private initRecognition() {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.updateRecognitionLanguage();
    }
  }

  setLanguage(lang: JarvisLanguage) {
    this.currentLanguage = lang;
    this.updateRecognitionLanguage();
  }

  getLanguage(): JarvisLanguage {
    return this.currentLanguage;
  }

  private getLocaleString(lang: JarvisLanguage): string {
    switch (lang) {
      case 'bn':
        return 'bn-IN';
      case 'hi':
        return 'hi-IN';
      default:
        return 'en-US';
    }
  }

  private updateRecognitionLanguage() {
    if (this.recognition) {
      this.recognition.lang = this.getLocaleString(this.currentLanguage);
    }
  }

  isSpeechRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.recognition) {
      this.initRecognition();
    }

    if (!this.recognition) {
      onError('Speech recognition is not supported in this browser.');
      return false;
    }

    try {
      this.updateRecognitionLanguage();

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const text = finalTranscript || interimTranscript;
        onResult(text, !!finalTranscript);
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        onError(event.error || 'Speech recognition error');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        onEnd();
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err: any) {
      this.isListening = false;
      onError(err?.message || 'Failed to start speech recognition');
      return false;
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch {
        // ignore
      }
      this.isListening = false;
    }
  }

  // --- ANIME VOICE TUNING ENGINE ---

  public getSettings(): VoiceSettings {
    return { ...this.settings };
  }

  public setPreset(preset: VoicePreset) {
    this.settings.preset = preset;
    switch (preset) {
      case 'hinata_sweet':
        this.settings.pitchMultiplier = 1.28;
        this.settings.rateMultiplier = 1.06;
        break;
      case 'hinata_idol':
        this.settings.pitchMultiplier = 1.36;
        this.settings.rateMultiplier = 1.14;
        break;
      case 'hinata_gentle':
        this.settings.pitchMultiplier = 1.18;
        this.settings.rateMultiplier = 0.98;
        break;
      case 'hinata_kuudere':
        this.settings.pitchMultiplier = 1.12;
        this.settings.rateMultiplier = 1.04;
        break;
      case 'custom':
        // preserve current sliders
        break;
    }
    this.saveSettings();
  }

  public setCustomPitch(pitch: number) {
    this.settings.preset = 'custom';
    this.settings.pitchMultiplier = Math.min(1.8, Math.max(0.6, pitch));
    this.saveSettings();
  }

  public setCustomRate(rate: number) {
    this.settings.preset = 'custom';
    this.settings.rateMultiplier = Math.min(1.6, Math.max(0.6, rate));
    this.saveSettings();
  }

  public setPreferredVoice(lang: JarvisLanguage, voiceURI: string) {
    this.settings.preferredVoices[lang] = voiceURI;
    this.saveSettings();
  }

  public getAvailableVoices(lang: JarvisLanguage): VoiceOption[] {
    if (typeof window === 'undefined' || !window.speechSynthesis) return [];
    const voices = window.speechSynthesis.getVoices();
    const prefix = lang === 'bn' ? 'bn' : lang === 'hi' ? 'hi' : 'en';

    const matched = voices.filter((v) => v.lang.toLowerCase().startsWith(prefix));

    return matched.map((v) => {
      const nameLower = v.name.toLowerCase();
      const isFemale =
        nameLower.includes('female') ||
        nameLower.includes('zira') ||
        nameLower.includes('samantha') ||
        nameLower.includes('victoria') ||
        nameLower.includes('karen') ||
        nameLower.includes('swara') ||
        nameLower.includes('lekha') ||
        nameLower.includes('kalpana') ||
        nameLower.includes('natural') ||
        nameLower.includes('online') ||
        nameLower.includes('google');

      const isRecommended =
        isFemale &&
        (nameLower.includes('google') ||
          nameLower.includes('natural') ||
          nameLower.includes('samantha') ||
          nameLower.includes('neural'));

      return {
        name: v.name,
        voiceURI: v.voiceURI,
        lang: v.lang,
        isFemale,
        isRecommended,
      };
    });
  }

  private autoSelectBestVoices() {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const voices = window.speechSynthesis.getVoices();
    if (!voices || voices.length === 0) return;

    (['en', 'bn', 'hi'] as JarvisLanguage[]).forEach((lang) => {
      if (!this.settings.preferredVoices[lang]) {
        const available = this.getAvailableVoices(lang);
        const best =
          available.find((v) => v.isRecommended) ||
          available.find((v) => v.isFemale) ||
          available[0];

        if (best) {
          this.settings.preferredVoices[lang] = best.voiceURI;
        }
      }
    });
  }

  // Calculate emotion-adjusted pitch & rate for expressive anime acting
  private getEmotionModulation(emotion: VoiceEmotion = 'standard'): { pitch: number; rate: number } {
    let basePitch = this.settings.pitchMultiplier;
    let baseRate = this.settings.rateMultiplier;

    switch (emotion) {
      case 'greeting':
        return {
          pitch: Math.min(1.7, basePitch * 1.04),
          rate: baseRate * 1.03,
        };
      case 'success':
        // Excited, upbeat, celebratory
        return {
          pitch: Math.min(1.8, basePitch * 1.08),
          rate: baseRate * 1.06,
        };
      case 'explaining':
        // Calm, clear, attentive
        return {
          pitch: basePitch * 0.95,
          rate: baseRate * 0.98,
        };
      case 'caring':
        // Gentle, soft, comforting
        return {
          pitch: basePitch * 0.98,
          rate: baseRate * 0.93,
        };
      case 'playful':
        // Bouncy, lively
        return {
          pitch: Math.min(1.75, basePitch * 1.05),
          rate: baseRate * 1.04,
        };
      default:
        return { pitch: basePitch, rate: baseRate };
    }
  }

  // Real-time lip-sync subscription for 3D Character
  public onLipSync(listener: (intensity: number) => void): () => void {
    this.lipSyncListeners.add(listener);
    return () => this.lipSyncListeners.delete(listener);
  }

  private emitLipSync(intensity: number) {
    this.lipSyncListeners.forEach((fn) => fn(intensity));
  }

  private startLipSyncSimulation() {
    this.stopLipSyncSimulation();
    let tick = 0;
    this.lipSyncInterval = setInterval(() => {
      tick += 0.25;
      // Synthesize realistic speech envelope (phoneme modulation + pauses)
      const syllableBurst = Math.sin(tick * 3.5) * 0.5 + Math.cos(tick * 6.2) * 0.3 + 0.2;
      const intensity = Math.max(0.1, Math.min(1.0, syllableBurst));
      this.emitLipSync(intensity);
    }, 45);
  }

  private stopLipSyncSimulation() {
    if (this.lipSyncInterval) {
      clearInterval(this.lipSyncInterval);
      this.lipSyncInterval = null;
    }
    this.emitLipSync(0);
  }

  // Speaks text with Anime Personality Inflection & Lip Sync
  speak(
    text: string,
    lang?: JarvisLanguage,
    onStart?: () => void,
    onEnd?: () => void,
    emotion: VoiceEmotion = 'standard'
  ) {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    this.stopLipSyncSimulation();

    const targetLang = lang || this.currentLanguage;
    const utterance = new SpeechSynthesisUtterance(text);
    const localeStr = this.getLocaleString(targetLang);
    utterance.lang = localeStr;

    // Apply Anime Voice personality emotion modulation
    const { pitch, rate } = this.getEmotionModulation(emotion);
    utterance.pitch = pitch;
    utterance.rate = rate;

    // Select chosen or best matching female/anime voice
    const voices = window.speechSynthesis.getVoices();
    const preferredURI = this.settings.preferredVoices[targetLang];

    if (preferredURI) {
      const match = voices.find((v) => v.voiceURI === preferredURI);
      if (match) utterance.voice = match;
    } else {
      const prefix = targetLang === 'bn' ? 'bn' : targetLang === 'hi' ? 'hi' : 'en';
      const fallbackVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith(prefix) &&
          (v.name.toLowerCase().includes('female') ||
            v.name.toLowerCase().includes('natural') ||
            v.name.toLowerCase().includes('google') ||
            v.name.toLowerCase().includes('samantha'))
      ) || voices.find((v) => v.lang.toLowerCase().startsWith(prefix));

      if (fallbackVoice) utterance.voice = fallbackVoice;
    }

    // Lip sync & syllable boundary sync
    utterance.onboundary = (e: any) => {
      if (e.name === 'word') {
        this.emitLipSync(0.85);
      }
    };

    utterance.onstart = () => {
      this.startLipSyncSimulation();
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.stopLipSyncSimulation();
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.stopLipSyncSimulation();
      if (onEnd) onEnd();
    };

    window.speechSynthesis.speak(utterance);
  }

  // Speaks text with specific Hinata anime voice emotion and auto language detection
  speakHinata(
    text: string,
    emotion: VoiceEmotion = 'greeting',
    lang?: JarvisLanguage,
    onStart?: () => void,
    onEnd?: () => void
  ) {
    let detectedLang = lang || this.currentLanguage;
    if (!lang) {
      if (/[\u0980-\u09FF]/.test(text)) detectedLang = 'bn';
      else if (/[\u0900-\u097F]/.test(text)) detectedLang = 'hi';
    }
    this.speak(text, detectedLang, onStart, onEnd, emotion);
  }

  // Convenience helper for previewing anime voice in settings
  previewVoice(emotion: VoiceEmotion = 'greeting', lang?: JarvisLanguage) {
    const targetLang = lang || this.currentLanguage;
    let sampleText = this.greetings[targetLang];

    if (emotion === 'success') {
      sampleText = this.successPhrases[targetLang];
    } else if (emotion === 'caring') {
      sampleText = this.caringPhrases[targetLang];
    } else if (emotion === 'explaining') {
      sampleText =
        targetLang === 'bn'
          ? 'আমি আপনার ডিভাইসের সব সেটিংস নিখুঁতভাবে সমন্বয় করেছি।'
          : targetLang === 'hi'
          ? 'मैंने आपके डिवाइस की सभी सेटिंग्स को बिल्कुल ठीक से समायोजित कर दिया है।'
          : 'I have calibrated your device settings and verified all system connections.';
    }

    this.speak(sampleText, targetLang, undefined, undefined, emotion);
  }

  stopSpeaking() {
    this.stopLipSyncSimulation();
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

export const speechManager = new HinataAnimeSpeechManager();
