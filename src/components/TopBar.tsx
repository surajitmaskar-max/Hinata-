import React from 'react';
import { AppScreen } from '../types/jarvis';
import { Download, Sparkles, ShieldCheck, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopBarProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
  onOpenExporter: () => void;
  onOpenAuthModal: () => void;
  isDarkTheme: boolean;
  onToggleTheme: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentScreen,
  onNavigate,
  onOpenExporter,
  onOpenAuthModal,
}) => {
  const { currentUser, userProfile } = useAuth();

  return (
    <header className="w-full border-b border-violet-500/20 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: HINATA AI Brand wordmark */}
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="text-base font-bold tracking-wider text-slate-100 hover:text-violet-300 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2.5 cursor-pointer font-display"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 via-indigo-600 to-sky-400 p-0.5 shadow-md shadow-violet-600/30">
            <div className="w-full h-full rounded-[6px] bg-slate-950 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-violet-300" />
            </div>
          </div>
          <span className="bg-gradient-to-r from-violet-200 via-sky-200 to-fuchsia-200 bg-clip-text text-transparent font-extrabold">
            HINATA AI
          </span>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-slate-400">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentScreen === 'dashboard'
                ? 'text-violet-300 font-semibold shadow-[0_1px_0_0_#a855f7]'
                : 'hover:text-slate-200'
            }`}
          >
            Home
          </button>
          <button
            type="button"
            onClick={() => onNavigate('voice')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentScreen === 'voice'
                ? 'text-violet-300 font-semibold shadow-[0_1px_0_0_#a855f7]'
                : 'hover:text-slate-200'
            }`}
          >
            Voice Assistant
          </button>
          <button
            type="button"
            onClick={() => onNavigate('chat')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentScreen === 'chat'
                ? 'text-violet-300 font-semibold shadow-[0_1px_0_0_#a855f7]'
                : 'hover:text-slate-200'
            }`}
          >
            AI Chat
          </button>
          <button
            type="button"
            onClick={() => onNavigate('memory')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentScreen === 'memory'
                ? 'text-violet-300 font-semibold shadow-[0_1px_0_0_#a855f7]'
                : 'hover:text-slate-200'
            }`}
          >
            Memory Vault
          </button>
          <button
            type="button"
            onClick={() => onNavigate('automation')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              currentScreen === 'automation'
                ? 'text-violet-300 font-semibold shadow-[0_1px_0_0_#a855f7]'
                : 'hover:text-slate-200'
            }`}
          >
            Automations
          </button>
          <button
            type="button"
            onClick={() => onNavigate('background_service')}
            className={`transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 ${
              currentScreen === 'background_service'
                ? 'text-violet-300 font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Always-On Service</span>
          </button>
        </nav>

        {/* Zone 3: Actions - Auth / Account + Project Exporter */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* User Account / Multi-User Isolation Trigger */}
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-500/30 text-xs text-slate-200 flex items-center gap-2 cursor-pointer transition-all hover:border-purple-400 shadow-sm"
            title="Manage account & data isolation"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white">
              {userProfile?.displayName ? userProfile.displayName.charAt(0).toUpperCase() : <UserIcon className="w-3 h-3" />}
            </div>
            <span className="font-medium text-slate-200 max-w-[90px] truncate hidden sm:inline">
              {userProfile?.displayName || (currentUser ? 'User' : 'Sign In')}
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" title="Firebase Auth Active" />
          </button>

          <button
            type="button"
            onClick={onOpenExporter}
            className="px-3 py-1.5 text-xs font-medium text-white bg-gradient-to-r from-violet-600 to-sky-600 hover:from-violet-500 hover:to-sky-500 active:from-violet-700 active:to-sky-700 rounded-xl transition-all shadow-md shadow-violet-600/30 whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Android Studio Project</span>
            <span className="sm:hidden">Export</span>
          </button>
        </div>
      </div>
    </header>
  );
};
