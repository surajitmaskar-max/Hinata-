import React, { useState } from 'react';
import { AutomationWorkflow, TaskStep, SecurityPermission } from '../types/jarvis';
import { soundEngine } from '../utils/audio';
import {
  ArrowLeft,
  Play,
  CheckCircle2,
  AlertCircle,
  Plus,
  Sun,
  Car,
  Moon,
  ShieldAlert,
  Sparkles,
  Zap,
  Clock,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Calendar,
  Activity,
  Layers,
} from 'lucide-react';

interface AutomationCenterScreenProps {
  onBack: () => void;
  onExecuteWorkflow: (workflow: AutomationWorkflow) => Promise<void>;
  activeRunningWorkflowId?: string;
  workflowStepsProgress?: {
    currentStep: number;
    totalSteps: number;
    stepName: string;
    completedSteps: TaskStep[];
  };
  permissions?: SecurityPermission[];
}

export const AutomationCenterScreen: React.FC<AutomationCenterScreenProps> = ({
  onBack,
  onExecuteWorkflow,
  activeRunningWorkflowId,
  workflowStepsProgress,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'running' | 'scheduled' | 'history'>('all');

  const [workflows, setWorkflows] = useState<AutomationWorkflow[]>([
    {
      id: 'wf_morning',
      name: 'Morning Briefing Protocol',
      description:
        'Reads daily weather, adjusts volume to 75%, launches news and sets productivity mode.',
      icon: 'Sun',
      category: 'routine',
      steps: [
        'Query system battery and network readiness',
        'Set Android media volume to 75%',
        'Synthesize daily greeting and schedule summary',
        'Launch Google Maps with morning traffic status',
      ],
    },
    {
      id: 'wf_commute',
      name: 'Car Commute Navigation',
      description:
        'Prepares smartphone for driving: maximum audio volume, GPS navigation, and hands-free voice mode.',
      icon: 'Car',
      category: 'routine',
      steps: [
        'Check GPS location provider state',
        'Set media volume to 90%',
        'Launch Google Maps turn-by-turn navigation',
        'Enable high-priority voice listening mode',
      ],
    },
    {
      id: 'wf_focus',
      name: 'Focus & Study Mode',
      description:
        'Minimizes distractions: dims display backlight, activates Do Not Disturb, silences notifications.',
      icon: 'Zap',
      category: 'utility',
      steps: [
        'Enable Android Do Not Disturb (DND) filter',
        'Adjust screen brightness to 30%',
        'Route non-critical notifications to silent backlog',
        'Verify quiet state via Notification Manager',
      ],
    },
    {
      id: 'wf_night',
      name: 'Night Recharge Routine',
      description:
        'Prepares phone for sleep: turns off torch, dims screen to 15%, and schedules tomorrow morning alarm.',
      icon: 'Moon',
      category: 'routine',
      steps: [
        'Verify camera flashlight is powered down',
        'Dim screen brightness to 15%',
        'Schedule 07:00 AM alarm via Android AlarmClock Intent',
        'Enter battery conservation state',
      ],
    },
    {
      id: 'wf_emergency',
      name: 'Emergency SOS Protocol',
      description:
        'High-urgency emergency assistance with explicit confirmation prompt before sending emergency dispatch.',
      icon: 'ShieldAlert',
      category: 'emergency',
      steps: [
        'Activate high-intensity flashlight strobe',
        'Synthesize audio distress beacon',
        'Prepare emergency SMS to saved contact (Requires User Confirmation)',
        'Prompt emergency phone dialer intent',
      ],
    },
  ]);

  const [scheduledTasks] = useState([
    { id: 'sch_1', name: 'Morning Briefing Routine', time: '07:00 AM', repeat: 'Daily', status: 'ACTIVE' },
    { id: 'sch_2', name: 'Night Recharge Protocol', time: '11:00 PM', repeat: 'Daily', status: 'ACTIVE' },
    { id: 'sch_3', name: 'Deep Battery Diagnostic', time: 'Sunday 02:00 AM', repeat: 'Weekly', status: 'PAUSED' },
  ]);

  const [historyTasks] = useState([
    { id: 'h_1', name: 'Morning Briefing Protocol', status: 'COMPLETED', time: 'Today 07:00 AM', steps: 4 },
    { id: 'h_2', name: 'Car Commute Navigation', status: 'COMPLETED', time: 'Yesterday 05:45 PM', steps: 4 },
    { id: 'h_3', name: 'Focus Mode Override', status: 'COMPLETED', time: 'Yesterday 02:15 PM', steps: 4 },
    { id: 'h_4', name: 'Cell Tower Telemetry Sync', status: 'FAILED', time: '2 days ago', steps: 1, reason: 'Airplane mode active' },
  ]);

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newWfName, setNewWfName] = useState('');
  const [newWfDesc, setNewWfDesc] = useState('');
  const [newWfSteps, setNewWfSteps] = useState('');

  const handleCreateWorkflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWfName.trim()) return;

    const parsedSteps = newWfSteps
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const created: AutomationWorkflow = {
      id: `wf_${Date.now()}`,
      name: newWfName.trim(),
      description: newWfDesc.trim() || 'Custom automated Android workflow',
      icon: 'Sparkles',
      category: 'utility',
      steps: parsedSteps.length > 0 ? parsedSteps : ['Verify device readiness', 'Execute action routine'],
    };

    setWorkflows([created, ...workflows]);
    setIsCreatingNew(false);
    setNewWfName('');
    setNewWfDesc('');
    setNewWfSteps('');
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sun':
        return <Sun className="w-5 h-5 text-amber-400" />;
      case 'Car':
        return <Car className="w-5 h-5 text-sky-400" />;
      case 'Moon':
        return <Moon className="w-5 h-5 text-indigo-400" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-5 h-5 text-rose-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-violet-400" />;
    }
  };

  const completedCount = historyTasks.filter((t) => t.status === 'COMPLETED').length;
  const failedCount = historyTasks.filter((t) => t.status === 'FAILED').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 pb-24 text-slate-100">
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
              <Zap className="w-5 h-5 text-violet-400" />
              <span>HINATA Automation Dashboard</span>
            </h1>
            <p className="text-xs text-slate-400">
              Multi-step Android workflows, scheduled tasks, live execution & verification
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreatingNew(!isCreatingNew)}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-violet-600/30"
        >
          <Plus className="w-4 h-4" />
          <span>New Workflow</span>
        </button>
      </div>

      {/* Requirement 8: Status Overview Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3 rounded-2xl bg-slate-900/70 border border-violet-500/20 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>Active</span>
            <Zap className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <p className="text-lg font-bold text-white font-mono">{workflows.length}</p>
          <span className="text-[10px] text-violet-300">Automations</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/70 border border-violet-500/20 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>Scheduled</span>
            <Clock className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <p className="text-lg font-bold text-white font-mono">{scheduledTasks.length}</p>
          <span className="text-[10px] text-sky-300">Routines</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/70 border border-violet-500/20 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>Running</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <p className="text-lg font-bold text-white font-mono">
            {activeRunningWorkflowId ? '1' : '0'}
          </p>
          <span className="text-[10px] text-cyan-300">Active Now</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/70 border border-violet-500/20 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>Completed</span>
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-emerald-400 font-mono">{completedCount}</p>
          <span className="text-[10px] text-emerald-300">Verified</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/70 border border-violet-500/20 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>Failed</span>
            <XCircle className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <p className="text-lg font-bold text-rose-400 font-mono">{failedCount}</p>
          <span className="text-[10px] text-rose-300">Audited</span>
        </div>

        <div className="p-3 rounded-2xl bg-slate-900/70 border border-violet-500/20 backdrop-blur-md">
          <div className="flex items-center justify-between text-slate-400 text-[11px] mb-1">
            <span>Permissions</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <p className="text-sm font-bold text-emerald-400 font-mono mt-0.5">GRANTED</p>
          <span className="text-[10px] text-slate-400">Accessibility Active</span>
        </div>
      </div>

      {/* Active Running Progress Card with Live Task Execution */}
      {activeRunningWorkflowId && workflowStepsProgress && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-violet-950/70 via-slate-900 to-indigo-950/70 border border-violet-500/40 shadow-2xl space-y-3 animate-in fade-in">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-violet-300 flex items-center gap-2 font-mono">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-ping" />
              EXECUTING LIVE ANDROID WORKFLOW
            </span>
            <span className="font-mono text-violet-300 font-bold tabular-nums">
              Step {workflowStepsProgress.currentStep} of {workflowStepsProgress.totalSteps}
            </span>
          </div>

          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-sky-400 to-fuchsia-400 transition-all duration-300"
              style={{
                width: `${(workflowStepsProgress.currentStep / workflowStepsProgress.totalSteps) * 100}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-200">
            <span className="font-medium">{workflowStepsProgress.stepName}</span>
            <span className="text-cyan-400 font-mono text-[11px] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verifying Android Accessibility Node...
            </span>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-violet-500/15 pb-2 text-xs">
        {[
          { id: 'all', label: 'All Automations' },
          { id: 'scheduled', label: 'Scheduled Tasks' },
          { id: 'history', label: 'Execution Audit' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer font-medium ${
              activeTab === tab.id
                ? 'bg-violet-600 text-white shadow-md shadow-violet-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Create New Workflow Form */}
      {isCreatingNew && (
        <form
          onSubmit={handleCreateWorkflow}
          className="p-5 rounded-3xl bg-slate-900/90 border border-violet-500/30 space-y-4 text-xs shadow-2xl backdrop-blur-xl"
        >
          <h3 className="text-sm font-semibold text-white">Create Custom Android Workflow</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Workflow Name</label>
              <input
                type="text"
                value={newWfName}
                onChange={(e) => setNewWfName(e.target.value)}
                placeholder="e.g. Gym Workout Protocol"
                required
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Description</label>
              <input
                type="text"
                value={newWfDesc}
                onChange={(e) => setNewWfDesc(e.target.value)}
                placeholder="e.g. Sets Spotify, volume 90%, starts timer"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Steps (One action per line)</label>
            <textarea
              value={newWfSteps}
              onChange={(e) => setNewWfSteps(e.target.value)}
              placeholder="Set volume to 85%&#10;Launch Spotify app&#10;Start 45 minute workout timer"
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-violet-500 font-sans"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsCreatingNew(false)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 text-white font-medium cursor-pointer shadow-md shadow-violet-600/30"
            >
              Save Workflow
            </button>
          </div>
        </form>
      )}

      {/* Tab: All Workflows */}
      {activeTab === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflows.map((wf) => {
            const isRunningThis = activeRunningWorkflowId === wf.id;

            return (
              <div
                key={wf.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between backdrop-blur-xl ${
                  isRunningThis
                    ? 'bg-violet-950/40 border-violet-500/50 shadow-2xl shadow-violet-950/50'
                    : 'bg-slate-900/70 border-violet-500/20 hover:border-violet-500/40 shadow-xl'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-violet-500/25 flex items-center justify-center shadow-md">
                        {getIcon(wf.icon)}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{wf.name}</h3>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {wf.steps.length} Verified Actions
                        </span>
                      </div>
                    </div>

                    {wf.category === 'emergency' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">
                        SAFETY GUARDED
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed mb-4">{wf.description}</p>

                  {/* Steps List */}
                  <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 mb-4 space-y-1.5 font-mono text-[11px]">
                    {wf.steps.map((step, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-slate-300">
                        <span className="text-violet-400 font-bold tabular-nums">0{idx + 1}.</span>
                        <span className="truncate">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Execution trigger button */}
                <button
                  type="button"
                  onClick={() => {
                    soundEngine.playStartup();
                    onExecuteWorkflow(wf);
                  }}
                  disabled={!!activeRunningWorkflowId}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                    isRunningThis
                      ? 'bg-violet-600 text-white animate-pulse'
                      : 'bg-slate-800 hover:bg-gradient-to-r hover:from-violet-600 hover:to-sky-600 text-slate-200 hover:text-white border border-slate-700/80 hover:border-violet-500 active:scale-[0.99]'
                  }`}
                >
                  {isRunningThis ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Executing Workflow Steps...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Execute Routine</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab: Scheduled Tasks */}
      {activeTab === 'scheduled' && (
        <div className="space-y-3">
          {scheduledTasks.map((sch) => (
            <div
              key={sch.id}
              className="p-4 rounded-2xl bg-slate-900/70 border border-violet-500/20 flex items-center justify-between gap-4 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{sch.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-sky-400" />
                    <span>{sch.time}</span>
                    <span>&bull;</span>
                    <span>{sch.repeat}</span>
                  </div>
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold ${
                  sch.status === 'ACTIVE'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {sch.status}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Execution History */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {historyTasks.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-slate-900/70 border border-violet-500/20 flex items-center justify-between gap-4 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center ${
                    item.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}
                >
                  {item.status === 'COMPLETED' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">{item.name}</h4>
                  <span className="text-xs text-slate-400 font-mono">
                    {item.time} &bull; {item.steps} Steps
                  </span>
                  {item.reason && (
                    <p className="text-[11px] text-rose-300 mt-0.5">Error: {item.reason}</p>
                  )}
                </div>
              </div>

              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold ${
                  item.status === 'COMPLETED'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {item.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
