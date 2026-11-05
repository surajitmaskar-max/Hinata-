export type JarvisLanguage = 'en' | 'hi' | 'bn';

export type AppScreen =
  | 'splash'
  | 'onboarding'
  | 'dashboard'
  | 'voice'
  | 'chat'
  | 'automation'
  | 'devices'
  | 'history'
  | 'memory'
  | 'settings'
  | 'background_service'
  | 'code_exporter';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  language?: JarvisLanguage;
  functionCalls?: any[];
  executionResult?: {
    success: boolean;
    summary: string;
  };
}

export interface TaskStep {
  stepNumber: number;
  actionType: string;
  actionName: string;
  targetPackageOrUri?: string;
  parameters?: Record<string, any>;
  verificationCheck?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'running' | 'verified' | 'failed';
  resultDetails?: string;
}

export interface TaskRecord {
  id: string;
  command: string;
  summary: string;
  intent: string;
  language: JarvisLanguage;
  timestamp: number;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'CONFIRMATION_REQUIRED';
  steps: TaskStep[];
  requiresConfirmation: boolean;
  confirmationPrompt?: string;
  voiceResponse?: string;
  verified: boolean;
  errorMessage?: string;
}

export interface UserMemory {
  id: string;
  key: string;
  value: string;
  category: 'identity' | 'preference' | 'contact' | 'custom';
  updatedAt: number;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  description: string;
  icon: string;
  steps: string[];
  category: 'routine' | 'utility' | 'emergency';
  language?: JarvisLanguage;
}

export interface DeviceState {
  flashlight: boolean;
  volume: number; // 0 - 100
  brightness: number; // 10 - 100
  wifi: boolean;
  bluetooth: boolean;
  doNotDisturb: boolean;
  batteryLevel: number;
  isCharging: boolean;
  activeApp?: string;
}

export interface SecurityPermission {
  id: string;
  name: string;
  androidName: string;
  description: string;
  granted: boolean;
  isEssential: boolean;
  category: 'accessibility' | 'notification' | 'hardware' | 'communication';
}

export interface BackgroundServiceState {
  isRunning: boolean;
  isWakeWordEnabled: boolean;
  activeKeywords: string[];
  batteryOptimizationExempt: boolean;
  microphoneState: 'idle' | 'listening_local' | 'active_gemini' | 'disabled';
  bytesUploadedBackground: number;
  lastWakeTriggerTimestamp?: number;
  lastTriggerKeyword?: string;
  manufacturerPreset: 'pixel' | 'samsung' | 'xiaomi' | 'oneplus' | 'standard';
  allowLockscreenActivation: boolean;
}

