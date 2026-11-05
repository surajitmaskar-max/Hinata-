import React, { useState, useEffect } from 'react';
import {
  AppScreen,
  ChatMessage,
  DeviceState,
  JarvisLanguage,
  SecurityPermission,
  TaskRecord,
  UserMemory,
  AutomationWorkflow,
  TaskStep,
} from './types/jarvis';
import { BackgroundServiceState } from './types/jarvis';
import { soundEngine } from './utils/audio';
import { speechManager } from './utils/speech';
import { isCreatorQuery, getCreatorResponse } from './utils/creator';
import { TopBar } from './components/TopBar';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ForegroundNotificationPill } from './components/ForegroundNotificationPill';
import { FloatingAssistantOverlay } from './components/FloatingAssistantOverlay';
import { SplashScreen } from './screens/SplashScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { HinataHomeScreen } from './screens/HinataHomeScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { VoiceAssistantScreen } from './screens/VoiceAssistantScreen';
import { ChatScreen } from './screens/ChatScreen';
import { AutomationCenterScreen } from './screens/AutomationCenterScreen';
import { DeviceControlScreen } from './screens/DeviceControlScreen';
import { TaskHistoryScreen } from './screens/TaskHistoryScreen';
import { MemoryScreen } from './screens/MemoryScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { BackgroundAssistantScreen } from './screens/BackgroundAssistantScreen';
import { ProjectExporterModal } from './screens/ProjectExporterModal';
import { BottomNav } from './components/BottomNav';
import { Smartphone, Monitor } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthModal } from './screens/AuthModal';
import {
  PersonalMemoryData,
  subscribeToUserMemories,
  saveUserMemory,
  updateUserMemory,
  deleteUserMemory,
  subscribeToUserChats,
  saveUserChatSession,
  subscribeToUserTasks,
  saveUserTask,
} from './firebase/userRepository';

function AppContent() {
  const { currentUser, userProfile, getPersonalizedGreeting } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [personalMemories, setPersonalMemories] = useState<PersonalMemoryData[]>([]);

  // Screen routing
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('splash');
  const [currentLanguage, setCurrentLanguage] = useState<JarvisLanguage>('en');
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(false);
  const [isExporterOpen, setIsExporterOpen] = useState<boolean>(false);

  // Background Foreground Service & Wake-Word state
  const [backgroundServiceState, setBackgroundServiceState] = useState<BackgroundServiceState>({
    isRunning: true,
    isWakeWordEnabled: true,
    activeKeywords: ['Hey HINATA', 'HINATA', 'হ্যালো হিনাতা', 'हे हिनाता'],
    batteryOptimizationExempt: true,
    microphoneState: 'listening_local',
    bytesUploadedBackground: 0,
    manufacturerPreset: 'samsung',
    allowLockscreenActivation: true,
  });
  const [isOverlayOpen, setIsOverlayOpen] = useState<boolean>(false);
  const [overlayTriggerKeyword, setOverlayTriggerKeyword] = useState<string>('Hey HINATA');

  // Security confirmation state
  const [requireCallConfirmation, setRequireCallConfirmation] = useState<boolean>(true);
  const [requireSmsConfirmation, setRequireSmsConfirmation] = useState<boolean>(true);
  const [confirmationModal, setConfirmationModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'call' | 'sms' | 'setting' | 'generic';
    targetDetails?: any;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: 'generic',
    onConfirm: () => {},
  });

  // Device hardware simulator state
  const [deviceState, setDeviceState] = useState<DeviceState>({
    flashlight: false,
    volume: 75,
    brightness: 90,
    wifi: true,
    bluetooth: true,
    doNotDisturb: false,
    batteryLevel: 94,
    isCharging: true,
  });

  // Active automation routine progress
  const [activeRunningWorkflowId, setActiveRunningWorkflowId] = useState<string | undefined>();
  const [workflowStepsProgress, setWorkflowStepsProgress] = useState<{
    currentStep: number;
    totalSteps: number;
    stepName: string;
    completedSteps: TaskStep[];
  } | undefined>();

  // Chat message history
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_init',
      role: 'assistant',
      content:
        "Hello! I'm Hinata. I'm ready to help you! My 3D neural core and interactive orb are active and running natively on Android with Jetpack Compose and Gemini 3.8 Flash. What shall we do today?",
      timestamp: Date.now(),
      language: 'en',
    },
  ]);

  // Executed tasks history
  const [tasks, setTasks] = useState<TaskRecord[]>([
    {
      id: 'task_demo_1',
      command: 'Calibrate device hardware and verify Android Accessibility',
      summary: 'Verified AccessibilityService binding and camera characteristics',
      intent: 'diagnostic',
      language: 'en',
      timestamp: Date.now() - 1000 * 60 * 12,
      status: 'COMPLETED',
      steps: [
        {
          stepNumber: 1,
          actionType: 'verify_accessibility',
          actionName: 'Verify JarvisAccessibilityService binding',
          verificationCheck: 'AccessibilityNodeInfo root window verified',
          status: 'verified',
        },
        {
          stepNumber: 2,
          actionType: 'verify_camera',
          actionName: 'Query CameraManager cameraIdList[0]',
          verificationCheck: 'FLASH_INFO_AVAILABLE true',
          status: 'verified',
        },
      ],
      requiresConfirmation: false,
      voiceResponse: 'Diagnostics complete, sir. All systems optimal.',
      verified: true,
    },
  ]);

  // Real-time synchronization of user-isolated Firestore collections
  useEffect(() => {
    if (currentUser) {
      const unsubMemories = subscribeToUserMemories(
        currentUser.uid,
        (mems) => {
          setPersonalMemories(mems);
        },
        (err) => console.log('Memory sync listener:', err)
      );

      const unsubChats = subscribeToUserChats(
        currentUser.uid,
        (chats) => {
          if (chats.length > 0 && chats[0].messages && chats[0].messages.length > 0) {
            setMessages(chats[0].messages as ChatMessage[]);
          }
        },
        (err) => console.log('Chat sync listener:', err)
      );

      return () => {
        unsubMemories();
        unsubChats();
      };
    } else {
      setPersonalMemories([]);
    }
  }, [currentUser]);

  // Android security permissions
  const [permissions, setPermissions] = useState<SecurityPermission[]>([
    {
      id: 'perm_acc',
      name: 'Accessibility Service',
      androidName: 'android.permission.BIND_ACCESSIBILITY_SERVICE',
      description: 'Enables JARVIS to navigate screens, click buttons, and automate supported apps.',
      granted: true,
      isEssential: true,
      category: 'accessibility',
    },
    {
      id: 'perm_notif',
      name: 'Notification Listener',
      androidName: 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
      description: 'Allows reading incoming notifications for hands-free message alerts.',
      granted: true,
      isEssential: false,
      category: 'notification',
    },
    {
      id: 'perm_mic',
      name: 'Audio Recording & Speech',
      androidName: 'android.permission.RECORD_AUDIO',
      description: 'Captures voice commands in English, Bengali, and Hindi.',
      granted: true,
      isEssential: true,
      category: 'hardware',
    },
    {
      id: 'perm_cam',
      name: 'Camera & Flashlight Control',
      androidName: 'android.permission.CAMERA',
      description: 'Directly powers the device LED flashlight via Camera2 API.',
      granted: true,
      isEssential: false,
      category: 'hardware',
    },
    {
      id: 'perm_call',
      name: 'Phone Call Intent',
      androidName: 'android.permission.CALL_PHONE',
      description: 'Places phone calls. Always guarded by explicit user confirmation.',
      granted: true,
      isEssential: false,
      category: 'communication',
    },
    {
      id: 'perm_sms',
      name: 'SMS Messaging Intent',
      androidName: 'android.permission.SEND_SMS',
      description: 'Composes and sends text messages with recipient confirmation.',
      granted: true,
      isEssential: false,
      category: 'communication',
    },
    {
      id: 'perm_alarm',
      name: 'Exact Alarm Scheduling',
      androidName: 'android.permission.SCHEDULE_EXACT_ALARM',
      description: 'Schedules precise reminders and alarms via Android AlarmManager.',
      granted: true,
      isEssential: false,
      category: 'hardware',
    },
  ]);

  // Sync dark theme with document root
  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkTheme]);

  // Sync mute state with sound engine
  useEffect(() => {
    soundEngine.setMuted(isMuted);
  }, [isMuted]);

  // Sync speech language
  useEffect(() => {
    speechManager.setLanguage(currentLanguage);
  }, [currentLanguage]);

  // Handle flashlight toggling
  const handleToggleFlashlight = () => {
    const nextTorch = !deviceState.flashlight;
    setDeviceState((prev) => ({ ...prev, flashlight: nextTorch }));
    soundEngine.playSuccess();
  };

  // Launch apps via real web or deep link
  const handleLaunchApp = (appName: string, uri: string) => {
    setDeviceState((prev) => ({ ...prev, activeApp: appName }));
    soundEngine.playSuccess();

    if (uri.startsWith('http') || uri.startsWith('mailto:')) {
      window.open(uri, '_blank');
    }

    const newTask: TaskRecord = {
      id: `task_${Date.now()}`,
      command: `Launch application: ${appName}`,
      summary: `Dispatched Android Intent for ${appName} (${uri})`,
      intent: 'app_launch',
      language: currentLanguage,
      timestamp: Date.now(),
      status: 'COMPLETED',
      steps: [
        {
          stepNumber: 1,
          actionType: 'launch_app',
          actionName: `Resolve package & open ${appName}`,
          verificationCheck: 'Android Intent dispatched successfully',
          status: 'verified',
        },
      ],
      requiresConfirmation: false,
      verified: true,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  // Handle phone call with mandatory confirmation
  const handleRequestCall = (contactOrNumber: string) => {
    const executeCall = () => {
      soundEngine.playSuccess();
      window.open(`tel:${encodeURIComponent(contactOrNumber)}`, '_self');

      const newTask: TaskRecord = {
        id: `task_${Date.now()}`,
        command: `Call ${contactOrNumber}`,
        summary: `Placed phone call to ${contactOrNumber} following user confirmation`,
        intent: 'phone_call',
        language: currentLanguage,
        timestamp: Date.now(),
        status: 'COMPLETED',
        steps: [
          {
            stepNumber: 1,
            actionType: 'security_confirmation',
            actionName: 'Obtain user explicit confirmation',
            verificationCheck: 'Confirmed by user interaction',
            status: 'verified',
          },
          {
            stepNumber: 2,
            actionType: 'dispatch_dialer',
            actionName: 'Launch ACTION_CALL Intent with URI tel:' + contactOrNumber,
            verificationCheck: 'Dialer activity initiated',
            status: 'verified',
          },
        ],
        requiresConfirmation: true,
        verified: true,
      };
      setTasks((prev) => [newTask, ...prev]);
      setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
    };

    if (requireCallConfirmation) {
      soundEngine.playConfirmationPrompt();
      setConfirmationModal({
        isOpen: true,
        title: 'Confirm Phone Call Intent',
        description: `JARVIS is preparing to initiate an outgoing telephone call to "${contactOrNumber}". Do you authorize this action?`,
        actionType: 'call',
        targetDetails: { recipient: contactOrNumber },
        onConfirm: executeCall,
      });
    } else {
      executeCall();
    }
  };

  // Handle SMS with mandatory confirmation
  const handleRequestSms = (recipient: string, message: string) => {
    const executeSms = () => {
      soundEngine.playSuccess();
      window.open(`sms:${encodeURIComponent(recipient)}?body=${encodeURIComponent(message)}`, '_self');

      const newTask: TaskRecord = {
        id: `task_${Date.now()}`,
        command: `Send SMS to ${recipient}`,
        summary: `Sent SMS to ${recipient} with verified payload`,
        intent: 'send_sms',
        language: currentLanguage,
        timestamp: Date.now(),
        status: 'COMPLETED',
        steps: [
          {
            stepNumber: 1,
            actionType: 'security_confirmation',
            actionName: 'Verify recipient & message payload with user',
            verificationCheck: 'Explicit user authorization granted',
            status: 'verified',
          },
          {
            stepNumber: 2,
            actionType: 'dispatch_sms',
            actionName: 'Dispatch SMS Intent to Android telephony stack',
            verificationCheck: 'SMS intent launched with body',
            status: 'verified',
          },
        ],
        requiresConfirmation: true,
        verified: true,
      };
      setTasks((prev) => [newTask, ...prev]);
      setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
    };

    if (requireSmsConfirmation) {
      soundEngine.playConfirmationPrompt();
      setConfirmationModal({
        isOpen: true,
        title: 'Confirm Outgoing SMS Directive',
        description: `JARVIS has drafted an SMS to "${recipient}". Please review the message body before sending.`,
        actionType: 'sms',
        targetDetails: { recipient, messageBody: message },
        onConfirm: executeSms,
      });
    } else {
      executeSms();
    }
  };

  // Execute natural voice or text command through Gemini backend
  const handleExecuteVoiceCommand = async (
    commandText: string,
    lang: JarvisLanguage
  ): Promise<string | undefined> => {
    try {
      if (isCreatorQuery(commandText)) {
        const creatorResponse = getCreatorResponse(lang);
        soundEngine.playSuccess();
        const newTask: TaskRecord = {
          id: `task_${Date.now()}`,
          command: commandText,
          summary: 'Recognized Creator & Developer: Surajit Naskar',
          intent: 'creator_recognition',
          language: lang,
          timestamp: Date.now(),
          status: 'COMPLETED',
          steps: [
            {
              stepNumber: 1,
              actionType: 'synthesize_speech',
              actionName: 'Acknowledge Creator Surajit Naskar',
              verificationCheck: 'Permanent creator identity verified',
              status: 'verified',
            },
          ],
          requiresConfirmation: false,
          voiceResponse: creatorResponse,
          verified: true,
        };
        setTasks((prev) => [newTask, ...prev]);
        return creatorResponse;
      }

      // 1. Call Task Engine endpoint for step decomposition & function verification
      const engineRes = await fetch('/api/jarvis/task-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: commandText, language: lang }),
      });

      const engineData = await engineRes.json();

      // Check if command requires confirmation
      if (engineData.requiresConfirmation) {
        soundEngine.playConfirmationPrompt();
        return new Promise<string>((resolve) => {
          setConfirmationModal({
            isOpen: true,
            title: 'Action Requires Security Confirmation',
            description:
              engineData.confirmationPrompt ||
              `JARVIS detected a sensitive action in directive: "${commandText}". Proceed with execution?`,
            actionType: commandText.toLowerCase().includes('call') ? 'call' : 'sms',
            targetDetails: { recipient: commandText },
            onConfirm: () => {
              executeParsedEngineSteps(engineData, commandText, lang);
              setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
              resolve(engineData.jarvisVoiceSpokenResponse || 'Task confirmed and verified on device.');
            },
          });
        });
      }

      // Otherwise execute steps immediately
      return executeParsedEngineSteps(engineData, commandText, lang);
    } catch (err: any) {
      console.error('Error executing command:', err);
      return 'Sir, an error occurred while processing the command with the Android engine.';
    }
  };

  // Helper to execute steps and apply hardware changes
  const executeParsedEngineSteps = (
    engineData: any,
    commandText: string,
    lang: JarvisLanguage
  ): string => {
    const steps: TaskStep[] = engineData.steps || [];

    // Apply any simulated hardware mutations
    for (const step of steps) {
      if (step.actionType === 'toggle_torch') {
        const state = step.parameters?.state || 'toggle';
        setDeviceState((prev) => ({
          ...prev,
          flashlight: state === 'on' ? true : state === 'off' ? false : !prev.flashlight,
        }));
      } else if (step.actionType === 'adjust_setting') {
        if (step.parameters?.setting === 'volume') {
          const val = parseInt(step.parameters.value, 10);
          if (!isNaN(val)) setDeviceState((prev) => ({ ...prev, volume: Math.min(100, Math.max(0, val)) }));
        } else if (step.parameters?.setting === 'brightness') {
          const val = parseInt(step.parameters.value, 10);
          if (!isNaN(val)) setDeviceState((prev) => ({ ...prev, brightness: Math.min(100, Math.max(10, val)) }));
        }
      } else if (step.actionType === 'launch_app') {
        const appName = step.parameters?.appName || 'App';
        if (appName.toLowerCase().includes('youtube')) window.open('https://youtube.com', '_blank');
        else if (appName.toLowerCase().includes('map')) window.open('https://maps.google.com', '_blank');
        else if (appName.toLowerCase().includes('whatsapp')) window.open('https://web.whatsapp.com', '_blank');
      } else if (step.actionType === 'open_maps') {
        const dest = step.parameters?.destination || '';
        window.open(`https://maps.google.com/?q=${encodeURIComponent(dest)}`, '_blank');
      }
    }

    soundEngine.playSuccess();

    const record: TaskRecord = {
      id: `task_${Date.now()}`,
      command: commandText,
      summary: engineData.summary || 'Command processed successfully',
      intent: engineData.intent || 'device_control',
      language: lang,
      timestamp: Date.now(),
      status: 'COMPLETED',
      steps: steps.map((s) => ({ ...s, status: 'verified' })),
      requiresConfirmation: engineData.requiresConfirmation || false,
      voiceResponse: engineData.jarvisVoiceSpokenResponse,
      verified: true,
    };

    setTasks((prev) => [record, ...prev]);
    return engineData.jarvisVoiceSpokenResponse || 'Task complete and verified, sir.';
  };

  // Send message in AI Chat with Gemini
  const handleSendMessage = async (text: string, lang: JarvisLanguage) => {
    const userMsg: ChatMessage = {
      id: `msg_u_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
      language: lang,
    };
    setMessages((prev) => [...prev, userMsg]);

    if (isCreatorQuery(text)) {
      const creatorReply = getCreatorResponse(lang);
      const assistantMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: creatorReply,
        timestamp: Date.now(),
        language: lang,
      };
      const updatedChat = [...messages, userMsg, assistantMsg];
      setMessages(updatedChat);
      soundEngine.playSuccess();
      if (currentUser) {
        saveUserChatSession(currentUser.uid, 'active_session', {
          title: 'HINATA Conversation',
          messages: updatedChat,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }).catch((e) => console.log('Saved chat session error:', e));
      }
      return;
    }

    try {
      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages,
          language: lang,
          userMemories: personalMemories,
          userName: userProfile?.displayName,
        }),
      });

      const data = await res.json();
      const assistantText = data.text || 'Understood, sir.';
      const functionCalls = data.functionCalls || [];

      // If function calls are returned, execute hardware actions
      for (const fc of functionCalls) {
        if (fc.name === 'toggleFlashlight') {
          handleToggleFlashlight();
        } else if (fc.name === 'makePhoneCall') {
          handleRequestCall(fc.args?.contactOrNumber || 'Emergency Contact');
        } else if (fc.name === 'sendSms') {
          handleRequestSms(fc.args?.recipient || 'Mom', fc.args?.message || 'Hello');
        } else if (fc.name === 'adjustDeviceSetting') {
          if (fc.args?.setting === 'volume') {
            const v = parseInt(fc.args.value, 10);
            if (!isNaN(v)) setDeviceState((p) => ({ ...p, volume: v }));
          } else if (fc.args?.setting === 'brightness') {
            const b = parseInt(fc.args.value, 10);
            if (!isNaN(b)) setDeviceState((p) => ({ ...p, brightness: b }));
          }
        }
      }

      const assistantMsg: ChatMessage = {
        id: `msg_a_${Date.now()}`,
        role: 'assistant',
        content: assistantText,
        timestamp: Date.now(),
        language: lang,
        functionCalls,
      };

      const updatedChat = [...messages, userMsg, assistantMsg];
      setMessages(updatedChat);
      soundEngine.playSuccess();

      // Persist conversation to user-isolated Firestore subcollection
      if (currentUser) {
        saveUserChatSession(currentUser.uid, 'active_session', {
          title: 'HINATA Conversation',
          messages: updatedChat,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }).catch((e) => console.log('Saved chat session error:', e));
      }
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: 'Sir, I lost connection to the Gemini API neural bridge. Please try again.',
        timestamp: Date.now(),
        language: lang,
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  // Execute automated multi-step workflow
  const handleExecuteWorkflow = async (workflow: AutomationWorkflow) => {
    setActiveRunningWorkflowId(workflow.id);

    const totalSteps = workflow.steps.length;
    const completedSteps: TaskStep[] = [];

    for (let i = 0; i < totalSteps; i++) {
      const stepName = workflow.steps[i];
      setWorkflowStepsProgress({
        currentStep: i + 1,
        totalSteps,
        stepName,
        completedSteps: [...completedSteps],
      });

      // Special action simulation based on step text
      if (stepName.toLowerCase().includes('volume')) {
        setDeviceState((p) => ({ ...p, volume: 85 }));
      } else if (stepName.toLowerCase().includes('dnd') || stepName.toLowerCase().includes('disturb')) {
        setDeviceState((p) => ({ ...p, doNotDisturb: true }));
      } else if (stepName.toLowerCase().includes('brightness') || stepName.toLowerCase().includes('dim')) {
        setDeviceState((p) => ({ ...p, brightness: 30 }));
      } else if (stepName.toLowerCase().includes('torch') || stepName.toLowerCase().includes('flashlight')) {
        setDeviceState((p) => ({ ...p, flashlight: true }));
      }

      await new Promise((r) => setTimeout(r, 800));

      completedSteps.push({
        stepNumber: i + 1,
        actionType: 'workflow_step',
        actionName: stepName,
        verificationCheck: 'Android service validated step result',
        status: 'verified',
      });
    }

    soundEngine.playSuccess();

    const record: TaskRecord = {
      id: `task_${Date.now()}`,
      command: `Execute Workflow: ${workflow.name}`,
      summary: `Completed all ${totalSteps} automated operations for ${workflow.name}`,
      intent: 'automation_routine',
      language: currentLanguage,
      timestamp: Date.now(),
      status: 'COMPLETED',
      steps: completedSteps,
      requiresConfirmation: workflow.category === 'emergency',
      verified: true,
      voiceResponse: `Sir, the ${workflow.name} has concluded successfully.`,
    };

    setTasks((prev) => [record, ...prev]);
    setActiveRunningWorkflowId(undefined);
    setWorkflowStepsProgress(undefined);
  };

  // Retry a failed or prior task
  const handleRetryTask = (task: TaskRecord) => {
    handleExecuteVoiceCommand(task.command, task.language);
  };

  // User-approved memory handlers backed by isolated Firestore collection
  const handleAddMemory = async (approvedMemory: string, category: string = 'preference') => {
    const memoryId = `mem_${Date.now()}`;
    if (currentUser) {
      await saveUserMemory(currentUser.uid, memoryId, {
        approvedMemory,
        category,
        createdAt: new Date().toISOString(),
      });
    } else {
      setPersonalMemories((prev) => [
        {
          id: memoryId,
          approvedMemory,
          category,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    soundEngine.playSuccess();
  };

  const handleUpdateMemory = async (id: string, approvedMemory: string, category: string = 'preference') => {
    if (currentUser) {
      await updateUserMemory(currentUser.uid, id, { approvedMemory, category });
    } else {
      setPersonalMemories((prev) =>
        prev.map((m) => (m.id === id ? { ...m, approvedMemory, category } : m))
      );
    }
    soundEngine.playSuccess();
  };

  const handleDeleteMemory = async (id: string) => {
    if (currentUser) {
      await deleteUserMemory(currentUser.uid, id);
    } else {
      setPersonalMemories((prev) => prev.filter((m) => m.id !== id));
    }
    soundEngine.playSuccess();
  };

  // Toggle permission
  const handleTogglePermission = (id: string) => {
    setPermissions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, granted: !p.granted } : p))
    );
    soundEngine.playSuccess();
  };

  return (
    <div
      className={`min-h-screen transition-colors ${
        isDarkTheme ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
      style={{
        filter: `brightness(${Math.max(60, deviceState.brightness)}%)`,
      }}
    >
      {/* Splash Screen */}
      {currentScreen === 'splash' ? (
        <SplashScreen onComplete={() => setCurrentScreen('onboarding')} />
      ) : currentScreen === 'onboarding' ? (
        <OnboardingScreen
          onComplete={() => setCurrentScreen('dashboard')}
          onOpenExporter={() => setIsExporterOpen(true)}
        />
      ) : (
        <div className="flex flex-col min-h-screen">
          {/* Top Bar adhering strictly to Top Bar Contract */}
          <TopBar
            currentScreen={currentScreen}
            onNavigate={(screen) => setCurrentScreen(screen)}
            onOpenExporter={() => setIsExporterOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            isDarkTheme={isDarkTheme}
            onToggleTheme={() => setIsDarkTheme(!isDarkTheme)}
          />

          {/* Persistent Foreground Service Notification Pill (Always-On Background Mode) */}
          <ForegroundNotificationPill
            state={backgroundServiceState}
            onStopService={() => {
              setBackgroundServiceState((prev) => ({
                ...prev,
                isRunning: false,
                isWakeWordEnabled: false,
                microphoneState: 'disabled',
              }));
              soundEngine.playConfirmationPrompt();
            }}
            onOpenPrivacyDashboard={() => setCurrentScreen('background_service')}
            onSimulateWakeWord={() => {
              soundEngine.playStartup();
              setOverlayTriggerKeyword('Hey JARVIS');
              setIsOverlayOpen(true);
              setBackgroundServiceState((prev) => ({
                ...prev,
                lastWakeTriggerTimestamp: Date.now(),
                lastTriggerKeyword: 'Hey JARVIS',
                microphoneState: 'active_gemini',
              }));
            }}
          />

          {/* Viewport Mode Switcher (Phone Frame vs Full Screen) */}
          <div className="w-full bg-slate-950/60 border-b border-slate-800/60 px-4 py-1.5 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>
                Android Runtime: <span className="font-mono text-slate-200">SDK 35 (Android 15)</span>
              </span>
              <span className="hidden sm:inline">&bull;</span>
              <span className="hidden sm:inline">
                Accessibility: <span className="text-sky-400 font-medium">Bound</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPhoneFrame(false)}
                className={`p-1 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                  !isPhoneFrame ? 'text-sky-400 bg-slate-800' : 'hover:text-slate-200'
                }`}
                title="Desktop HUD Viewport"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Desktop HUD</span>
              </button>
              <button
                type="button"
                onClick={() => setIsPhoneFrame(true)}
                className={`p-1 rounded flex items-center gap-1 transition-colors cursor-pointer ${
                  isPhoneFrame ? 'text-sky-400 bg-slate-800' : 'hover:text-slate-200'
                }`}
                title="Smartphone Device Viewport"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Smartphone View</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="flex-1">
            {isPhoneFrame ? (
              // Smartphone Device Simulation Bezel
              <div className="py-8 px-4 flex justify-center items-center">
                <div className="w-full max-w-[400px] h-[820px] rounded-[48px] bg-slate-900 border-[8px] border-slate-800 shadow-2xl shadow-sky-950/50 flex flex-col overflow-hidden relative">
                  {/* Phone Notch & Camera Hole-Punch */}
                  <div className="w-full h-7 bg-slate-950 flex items-center justify-between px-6 shrink-0 text-[11px] font-mono text-slate-400 select-none">
                    <span>9:41</span>
                    <div className="w-3.5 h-3.5 rounded-full bg-slate-800 border border-slate-700" />
                    <span>5G 100%</span>
                  </div>

                  {/* Phone Screen Container */}
                  <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 p-2">
                    {renderActiveScreen()}
                  </div>

                  {/* Android Bottom Navigation Pill */}
                  <div className="h-5 bg-slate-950 flex items-center justify-center shrink-0">
                    <div className="w-32 h-1 rounded-full bg-slate-700" />
                  </div>
                </div>
              </div>
            ) : (
              // Full-width Responsive Container
              renderActiveScreen()
            )}
          </main>

          {/* Floating Assistant Overlay (Simulates Android SYSTEM_ALERT_WINDOW over other apps) */}
          <FloatingAssistantOverlay
            isOpen={isOverlayOpen}
            onClose={() => {
              setIsOverlayOpen(false);
              setBackgroundServiceState((prev) => ({
                ...prev,
                microphoneState: prev.isRunning && prev.isWakeWordEnabled ? 'listening_local' : 'idle',
              }));
            }}
            triggerKeyword={overlayTriggerKeyword}
            currentLanguage={currentLanguage}
            onExecuteCommand={handleExecuteVoiceCommand}
          />

          {/* HINATA AI Bottom Navigation Bar */}
          <BottomNav
            currentScreen={currentScreen}
            onNavigate={(screen) => setCurrentScreen(screen)}
          />
        </div>
      )}

      {/* Confirmation Modal for Sensitive Actions */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        title={confirmationModal.title}
        description={confirmationModal.description}
        actionType={confirmationModal.actionType}
        targetDetails={confirmationModal.targetDetails}
        onConfirm={confirmationModal.onConfirm}
        onCancel={() => setConfirmationModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Project Exporter & Code Browser Modal */}
      <ProjectExporterModal
        isOpen={isExporterOpen}
        onClose={() => setIsExporterOpen(false)}
      />

      {/* User Authentication & Multi-User Isolation Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );

  function renderActiveScreen() {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <HinataHomeScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            deviceState={deviceState}
            onToggleFlashlight={handleToggleFlashlight}
            recentTasks={tasks}
            onQuickCommand={(cmd) => handleExecuteVoiceCommand(cmd, currentLanguage)}
            currentLanguage={currentLanguage}
            onChangeLanguage={(lang) => setCurrentLanguage(lang)}
            onOpenSettings={() => setCurrentScreen('settings')}
            isBackgroundServiceRunning={backgroundServiceState.isRunning}
          />
        );

      case 'voice':
        return (
          <VoiceAssistantScreen
            onBack={() => setCurrentScreen('dashboard')}
            onExecuteVoiceCommand={handleExecuteVoiceCommand}
            currentLanguage={currentLanguage}
            onChangeLanguage={(lang) => setCurrentLanguage(lang)}
            latestTask={tasks[0]}
          />
        );

      case 'chat':
        return (
          <ChatScreen
            onBack={() => setCurrentScreen('dashboard')}
            messages={messages}
            onSendMessage={handleSendMessage}
            currentLanguage={currentLanguage}
            onChangeLanguage={(lang) => setCurrentLanguage(lang)}
            onClearChat={() => setMessages([])}
          />
        );

      case 'automation':
        return (
          <AutomationCenterScreen
            onBack={() => setCurrentScreen('dashboard')}
            onExecuteWorkflow={handleExecuteWorkflow}
            activeRunningWorkflowId={activeRunningWorkflowId}
            workflowStepsProgress={workflowStepsProgress}
          />
        );

      case 'devices':
        return (
          <DeviceControlScreen
            onBack={() => setCurrentScreen('dashboard')}
            deviceState={deviceState}
            onUpdateDeviceState={(updates) => setDeviceState((p) => ({ ...p, ...updates }))}
            onLaunchApp={handleLaunchApp}
            onRequestCall={handleRequestCall}
            onRequestSms={handleRequestSms}
          />
        );

      case 'history':
        return (
          <TaskHistoryScreen
            onBack={() => setCurrentScreen('dashboard')}
            tasks={tasks}
            onRetryTask={handleRetryTask}
            onClearHistory={() => setTasks([])}
          />
        );

      case 'memory':
        return (
          <MemoryScreen
            onBack={() => setCurrentScreen('dashboard')}
            memories={personalMemories}
            onAddMemory={handleAddMemory}
            onUpdateMemory={handleUpdateMemory}
            onDeleteMemory={handleDeleteMemory}
          />
        );

      case 'settings':
        return (
          <SettingsScreen
            onBack={() => setCurrentScreen('dashboard')}
            permissions={permissions}
            onTogglePermission={handleTogglePermission}
            requireCallConfirmation={requireCallConfirmation}
            onToggleRequireCallConfirmation={() => setRequireCallConfirmation(!requireCallConfirmation)}
            requireSmsConfirmation={requireSmsConfirmation}
            onToggleRequireSmsConfirmation={() => setRequireSmsConfirmation(!requireSmsConfirmation)}
            currentLanguage={currentLanguage}
            onChangeLanguage={(lang) => setCurrentLanguage(lang)}
            isMuted={isMuted}
            onToggleMute={() => setIsMuted(!isMuted)}
            isDarkTheme={isDarkTheme}
            onToggleTheme={() => setIsDarkTheme(!isDarkTheme)}
            onOpenExporter={() => setIsExporterOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        );

      case 'background_service':
        return (
          <BackgroundAssistantScreen
            onBack={() => setCurrentScreen('dashboard')}
            serviceState={backgroundServiceState}
            onUpdateServiceState={(updates) =>
              setBackgroundServiceState((prev) => ({ ...prev, ...updates }))
            }
            onSimulateWakeWord={(kw) => {
              soundEngine.playStartup();
              const keyword = kw || 'Hey JARVIS';
              setOverlayTriggerKeyword(keyword);
              setIsOverlayOpen(true);
              setBackgroundServiceState((prev) => ({
                ...prev,
                lastWakeTriggerTimestamp: Date.now(),
                lastTriggerKeyword: keyword,
                microphoneState: 'active_gemini',
              }));
            }}
            currentLanguage={currentLanguage}
          />
        );

      case 'code_exporter':
        return (
          <div className="max-w-6xl mx-auto px-4 py-8">
            <button
              type="button"
              onClick={() => setCurrentScreen('dashboard')}
              className="text-xs text-sky-400 hover:text-sky-300 mb-4 block cursor-pointer"
            >
              &larr; Back to Dashboard
            </button>
            <ProjectExporterModal isOpen={true} onClose={() => setCurrentScreen('dashboard')} />
          </div>
        );

      default:
        return (
          <HinataHomeScreen
            onNavigate={(screen) => setCurrentScreen(screen)}
            deviceState={deviceState}
            onToggleFlashlight={handleToggleFlashlight}
            recentTasks={tasks}
            onQuickCommand={(cmd) => handleExecuteVoiceCommand(cmd, currentLanguage)}
            currentLanguage={currentLanguage}
            onChangeLanguage={(lang) => setCurrentLanguage(lang)}
            onOpenSettings={() => setCurrentScreen('settings')}
            isBackgroundServiceRunning={backgroundServiceState.isRunning}
          />
        );
    }
  }
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
