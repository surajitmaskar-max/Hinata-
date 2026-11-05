import React from 'react';
import { ShieldAlert, Check, X, PhoneCall, Send, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  actionType: 'call' | 'sms' | 'setting' | 'generic';
  targetDetails?: {
    recipient?: string;
    messageBody?: string;
    settingName?: string;
    newValue?: string;
  };
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  actionType,
  targetDetails,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md p-6 rounded-2xl bg-slate-900/95 border border-sky-500/30 shadow-2xl shadow-sky-950/50 text-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            {actionType === 'call' ? (
              <PhoneCall className="w-5 h-5" />
            ) : actionType === 'sms' ? (
              <Send className="w-5 h-5" />
            ) : actionType === 'setting' ? (
              <AlertTriangle className="w-5 h-5" />
            ) : (
              <ShieldAlert className="w-5 h-5" />
            )}
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 tracking-tight">
              {title}
            </h3>
            <p className="text-xs text-amber-400 font-medium">
              Security Protocol: Explicit User Confirmation Required
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          {description}
        </p>

        {targetDetails && (
          <div className="mb-5 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5 font-mono">
            {targetDetails.recipient && (
              <div className="flex justify-between">
                <span className="text-slate-400">Target Contact / Number:</span>
                <span className="text-sky-300 font-medium">{targetDetails.recipient}</span>
              </div>
            )}
            {targetDetails.messageBody && (
              <div>
                <span className="text-slate-400 block mb-1">Payload Content:</span>
                <p className="p-2 bg-slate-900 rounded border border-slate-800 text-slate-200 break-words font-sans text-xs">
                  "{targetDetails.messageBody}"
                </p>
              </div>
            )}
            {targetDetails.settingName && (
              <div className="flex justify-between">
                <span className="text-slate-400">Target Setting:</span>
                <span className="text-sky-300">{targetDetails.settingName} &rarr; {targetDetails.newValue}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 active:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" />
            Cancel Action
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 active:bg-sky-700 rounded-lg transition-colors shadow-lg shadow-sky-600/30 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            Confirm &amp; Execute Intent
          </button>
        </div>
      </div>
    </div>
  );
};
