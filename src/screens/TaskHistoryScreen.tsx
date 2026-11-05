import React, { useState } from 'react';
import { TaskRecord } from '../types/jarvis';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  ShieldCheck,
  Search,
  Filter,
  Trash2,
} from 'lucide-react';

interface TaskHistoryScreenProps {
  onBack: () => void;
  tasks: TaskRecord[];
  onRetryTask: (task: TaskRecord) => void;
  onClearHistory: () => void;
}

export const TaskHistoryScreen: React.FC<TaskHistoryScreenProps> = ({
  onBack,
  tasks,
  onRetryTask,
  onClearHistory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'COMPLETED' | 'FAILED'>('all');

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.command.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      statusFilter === 'all' ? true : t.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

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
              Task Execution History &amp; Audit Trail
            </h1>
            <p className="text-xs text-slate-400">
              Persistent records in Room Database (`TaskEntity`) with cryptographic verification
            </p>
          </div>
        </div>

        {tasks.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Audit Log</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search commands, action steps, or results..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-sky-500 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({tasks.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('COMPLETED')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              statusFilter === 'COMPLETED'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Verified ({tasks.filter((t) => t.status === 'COMPLETED').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('FAILED')}
            className={`px-3 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
              statusFilter === 'FAILED'
                ? 'bg-rose-600 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Failed ({tasks.filter((t) => t.status === 'FAILED').length})
          </button>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
          <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="font-medium text-slate-300">No task executions found</p>
          <p className="mt-1">Tasks executed via voice or chat will be indexed here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const isSuccess = task.status === 'COMPLETED';

            return (
              <div
                key={task.id}
                className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isSuccess
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-white">
                          "{task.command}"
                        </h3>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {task.language}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        {task.summary}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wider font-mono ${
                        isSuccess
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                          : 'bg-rose-950/80 text-rose-300 border border-rose-700/60'
                      }`}
                    >
                      {isSuccess ? 'VERIFIED' : 'FAILED'}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-1 tabular-nums font-mono">
                      {new Date(task.timestamp).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Atomic steps verification breakdown */}
                {task.steps && task.steps.length > 0 && (
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs font-mono">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-sky-400" />
                      <span>ATOMIC EXECUTION CHECKS ({task.steps.length} STEPS)</span>
                    </div>

                    <div className="space-y-1">
                      {task.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-[11px] text-slate-300"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sky-400">Step {step.stepNumber}:</span>
                            <span>{step.actionName}</span>
                          </div>
                          <span className="text-emerald-400 flex items-center gap-1 text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            {step.verificationCheck || 'Passed'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Spoken voice response */}
                {task.voiceResponse && (
                  <p className="text-xs text-slate-400 italic">
                    Spoken Feedback: "{task.voiceResponse}"
                  </p>
                )}

                {!isSuccess && (
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => onRetryTask(task)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Retry Directive</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
