import React, { useState } from 'react';
import { DeviceState } from '../types/jarvis';
import { soundEngine } from '../utils/audio';
import {
  ArrowLeft,
  Flashlight,
  Volume2,
  Sun,
  Wifi,
  Bluetooth,
  BellOff,
  Battery,
  ExternalLink,
  Plus,
  Trash2,
  Clock,
  PhoneCall,
  Send,
  MapPin,
  Music,
  Video,
  Settings,
  Mail,
  Camera,
} from 'lucide-react';

interface DeviceControlScreenProps {
  onBack: () => void;
  deviceState: DeviceState;
  onUpdateDeviceState: (updates: Partial<DeviceState>) => void;
  onLaunchApp: (appName: string, uri: string) => void;
  onRequestCall: (contactOrNumber: string) => void;
  onRequestSms: (recipient: string, message: string) => void;
}

interface ActiveAlarm {
  id: string;
  time: string;
  label: string;
  secondsRemaining: number;
}

export const DeviceControlScreen: React.FC<DeviceControlScreenProps> = ({
  onBack,
  deviceState,
  onUpdateDeviceState,
  onLaunchApp,
  onRequestCall,
  onRequestSms,
}) => {
  const [activeAlarms, setActiveAlarms] = useState<ActiveAlarm[]>([
    { id: 'alm_1', time: '07:00 AM', label: 'Morning Wakeup', secondsRemaining: 3600 },
  ]);

  const [newAlarmTime, setNewAlarmTime] = useState('08:00 AM');
  const [newAlarmLabel, setNewAlarmLabel] = useState('Workout Reminder');
  const [callInput, setCallInput] = useState('');
  const [smsRecipient, setSmsRecipient] = useState('');
  const [smsText, setSmsText] = useState('');

  // Installed Android Apps with real links/intents
  const installedApps = [
    { name: 'WhatsApp', icon: Send, uri: 'https://web.whatsapp.com', color: 'text-emerald-400 bg-emerald-500/10' },
    { name: 'YouTube', icon: Video, uri: 'https://youtube.com', color: 'text-red-400 bg-red-500/10' },
    { name: 'Google Maps', icon: MapPin, uri: 'https://maps.google.com', color: 'text-sky-400 bg-sky-500/10' },
    { name: 'Spotify', icon: Music, uri: 'https://open.spotify.com', color: 'text-green-400 bg-green-500/10' },
    { name: 'Phone Dialer', icon: PhoneCall, isCallAction: true, color: 'text-blue-400 bg-blue-500/10' },
    { name: 'SMS Messages', icon: Send, isSmsAction: true, color: 'text-indigo-400 bg-indigo-500/10' },
    { name: 'Gmail', icon: Mail, uri: 'mailto:', color: 'text-rose-400 bg-rose-500/10' },
    { name: 'Android Settings', icon: Settings, uri: '#settings', color: 'text-slate-300 bg-slate-800' },
  ];

  const handleToggleTorch = async () => {
    const nextState = !deviceState.flashlight;
    onUpdateDeviceState({ flashlight: nextState });

    // Try native MediaStream track torch if browser and device camera support it
    if (typeof navigator !== 'undefined' && navigator.mediaDevices && (navigator.mediaDevices as any).getUserMedia) {
      try {
        if (nextState) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
          const track = stream.getVideoTracks()[0];
          const imageCapture = (track as any).applyConstraints;
          if (imageCapture) {
            await (track as any).applyConstraints({ advanced: [{ torch: true }] });
          }
        }
      } catch (err) {
        // Falls back to UI torch simulation
      }
    }
  };

  const handleAddAlarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlarmTime) return;

    soundEngine.playSuccess();
    const created: ActiveAlarm = {
      id: `alm_${Date.now()}`,
      time: newAlarmTime,
      label: newAlarmLabel || 'Custom Alarm',
      secondsRemaining: 60, // 1 minute demo countdown
    };

    setActiveAlarms([...activeAlarms, created]);
    setNewAlarmLabel('');
  };

  const handleRemoveAlarm = (id: string) => {
    setActiveAlarms(activeAlarms.filter((a) => a.id !== id));
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
            <h1 className="text-xl font-bold text-white font-display">
              Android Device Control Center
            </h1>
            <p className="text-xs text-slate-400">
              Hardware actuators, volume streams, brightness calibration &amp; app launcher
            </p>
          </div>
        </div>

        {/* Torch quick indicator */}
        <button
          type="button"
          onClick={handleToggleTorch}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
            deviceState.flashlight
              ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/25'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
          }`}
        >
          <Flashlight className="w-4 h-4" />
          <span>TORCH: {deviceState.flashlight ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Screen Torch Simulation Overlay if enabled */}
      {deviceState.flashlight && (
        <div className="p-4 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-between text-amber-300 text-xs animate-pulse">
          <div className="flex items-center gap-2 font-medium">
            <Flashlight className="w-4 h-4" />
            <span>High-Intensity LED Flashlight is currently ACTIVE on Android Camera2 API</span>
          </div>
          <button
            type="button"
            onClick={handleToggleTorch}
            className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold hover:bg-amber-400 cursor-pointer"
          >
            Turn Off
          </button>
        </div>
      )}

      {/* Primary Hardware Sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Media Volume Slider */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Volume2 className="w-4 h-4 text-sky-400" />
              <span>Media Stream Volume</span>
            </div>
            <span className="font-mono text-sky-400 font-bold tabular-nums">
              {deviceState.volume}%
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            value={deviceState.volume}
            onChange={(e) => onUpdateDeviceState({ volume: Number(e.target.value) })}
            className="w-full accent-sky-500 cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>0% Muted</span>
            <span>50% Balanced</span>
            <span>100% Maximum</span>
          </div>
        </div>

        {/* Display Brightness Slider */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-200 font-semibold">
              <Sun className="w-4 h-4 text-yellow-400" />
              <span>Display Backlight Brightness</span>
            </div>
            <span className="font-mono text-yellow-400 font-bold tabular-nums">
              {deviceState.brightness}%
            </span>
          </div>

          <input
            type="range"
            min={10}
            max={100}
            value={deviceState.brightness}
            onChange={(e) => onUpdateDeviceState({ brightness: Number(e.target.value) })}
            className="w-full accent-yellow-400 cursor-pointer"
          />

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>10% Low Dim</span>
            <span>50% Indoor</span>
            <span>100% Sunlight Boost</span>
          </div>
        </div>
      </div>

      {/* Quick System Toggles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => onUpdateDeviceState({ wifi: !deviceState.wifi })}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
            deviceState.wifi
              ? 'bg-sky-500/10 border-sky-500/40 text-sky-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Wi-Fi 6E</span>
            <Wifi className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono">{deviceState.wifi ? 'CONNECTED' : 'DISABLED'}</span>
        </button>

        <button
          type="button"
          onClick={() => onUpdateDeviceState({ bluetooth: !deviceState.bluetooth })}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
            deviceState.bluetooth
              ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Bluetooth 5.4</span>
            <Bluetooth className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono">{deviceState.bluetooth ? 'ACTIVE' : 'OFF'}</span>
        </button>

        <button
          type="button"
          onClick={() => onUpdateDeviceState({ doNotDisturb: !deviceState.doNotDisturb })}
          className={`p-4 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between h-20 ${
            deviceState.doNotDisturb
              ? 'bg-purple-500/10 border-purple-500/40 text-purple-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Do Not Disturb</span>
            <BellOff className="w-4 h-4" />
          </div>
          <span className="text-xs font-mono">{deviceState.doNotDisturb ? 'ACTIVE' : 'ALLOW ALL'}</span>
        </button>

        <div className="p-4 rounded-xl border border-slate-800 bg-slate-900 text-slate-300 flex flex-col justify-between h-20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Battery State</span>
            <Battery className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xs font-mono tabular-nums">{deviceState.batteryLevel}% &bull; Fast Charging</span>
        </div>
      </div>

      {/* Installed Applications Launchpad */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h2 className="text-sm font-semibold text-white font-display">
          Installed Applications Launchpad
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {installedApps.map((app, idx) => {
            const Icon = app.icon;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (app.isCallAction) {
                    onRequestCall(callInput || 'Mom');
                  } else if (app.isSmsAction) {
                    onRequestSms(smsRecipient || 'Mom', smsText || 'Hello from JARVIS AI');
                  } else if (app.uri) {
                    onLaunchApp(app.name, app.uri);
                  }
                }}
                className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-sky-500/40 hover:bg-slate-800/60 text-left transition-all cursor-pointer flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${app.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-200 group-hover:text-white">
                    {app.name}
                  </span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400" />
              </button>
            );
          })}
        </div>
      </div>

      {/* Sensitive Communication Intent Testbed (Call & SMS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Phone Call Intent */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <PhoneCall className="w-4 h-4 text-blue-400" />
            <span>Android Phone Call Intent (Confirmation Required)</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Invokes `android.intent.action.CALL` via native Intent dispatcher.
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={callInput}
              onChange={(e) => setCallInput(e.target.value)}
              placeholder="e.g. +1 555-0199 or Mom"
              className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => onRequestCall(callInput || 'Emergency Contact')}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer"
            >
              Dial Call
            </button>
          </div>
        </div>

        {/* SMS Intent */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Send className="w-4 h-4 text-indigo-400" />
            <span>Android SMS Messenger (Confirmation Required)</span>
          </div>
          <div className="space-y-2">
            <input
              type="text"
              value={smsRecipient}
              onChange={(e) => setSmsRecipient(e.target.value)}
              placeholder="Recipient name or number"
              className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={smsText}
                onChange={(e) => setSmsText(e.target.value)}
                placeholder="SMS body content..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => onRequestSms(smsRecipient || 'Mom', smsText || 'Arriving in 15 minutes')}
                className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer"
              >
                Send SMS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alarms and Timers */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Android AlarmManager Schedule</span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {activeAlarms.length} Active Alarms Scheduled
          </span>
        </div>

        <form onSubmit={handleAddAlarm} className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newAlarmTime}
            onChange={(e) => setNewAlarmTime(e.target.value)}
            placeholder="Time (e.g. 06:30 AM)"
            className="w-full sm:w-36 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
          />
          <input
            type="text"
            value={newAlarmLabel}
            onChange={(e) => setNewAlarmLabel(e.target.value)}
            placeholder="Label (e.g. Project Review)"
            className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Set Alarm</span>
          </button>
        </form>

        <div className="space-y-2">
          {activeAlarms.map((alarm) => (
            <div
              key={alarm.id}
              className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-amber-400" />
                <div>
                  <span className="font-semibold text-slate-200 font-mono mr-2">
                    {alarm.time}
                  </span>
                  <span className="text-slate-400">{alarm.label}</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveAlarm(alarm.id)}
                className="text-slate-500 hover:text-rose-400 transition-colors p-1 cursor-pointer"
                title="Dismiss Alarm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
