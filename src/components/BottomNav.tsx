import React from 'react';
import { AppScreen } from '../types/jarvis';
import { Home, History, Grid, User } from 'lucide-react';

interface BottomNavProps {
  currentScreen: AppScreen;
  onNavigate: (screen: AppScreen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate }) => {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-2xl border-t border-purple-950/60 shadow-[0_-5px_25px_rgba(0,0,0,0.8)] px-4 py-2"
      aria-label="HINATA Bottom Navigation"
    >
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className={`flex-1 py-1 flex flex-col items-center gap-1 transition-all cursor-pointer relative ${
            currentScreen === 'dashboard' ? 'text-purple-300' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] font-medium tracking-wide">Home</span>
          {currentScreen === 'dashboard' && (
            <span className="absolute -bottom-1.5 w-10 h-[2.5px] rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-500 shadow-[0_0_10px_#c084fc]" />
          )}
        </button>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-slate-800/80 mx-1" />

        {/* 2. History */}
        <button
          type="button"
          onClick={() => onNavigate('history')}
          className={`flex-1 py-1 flex flex-col items-center gap-1 transition-all cursor-pointer relative ${
            currentScreen === 'history' ? 'text-purple-300' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <History className="w-5 h-5" />
          <span className="text-[11px] font-medium tracking-wide">History</span>
          {currentScreen === 'history' && (
            <span className="absolute -bottom-1.5 w-10 h-[2.5px] rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-500 shadow-[0_0_10px_#c084fc]" />
          )}
        </button>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-slate-800/80 mx-1" />

        {/* 3. Tools */}
        <button
          type="button"
          onClick={() => onNavigate('devices')}
          className={`flex-1 py-1 flex flex-col items-center gap-1 transition-all cursor-pointer relative ${
            currentScreen === 'devices' || currentScreen === 'automation'
              ? 'text-purple-300'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[11px] font-medium tracking-wide">Tools</span>
          {(currentScreen === 'devices' || currentScreen === 'automation') && (
            <span className="absolute -bottom-1.5 w-10 h-[2.5px] rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-500 shadow-[0_0_10px_#c084fc]" />
          )}
        </button>

        {/* Divider */}
        <div className="h-6 w-[1px] bg-slate-800/80 mx-1" />

        {/* 4. Profile */}
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className={`flex-1 py-1 flex flex-col items-center gap-1 transition-all cursor-pointer relative ${
            currentScreen === 'settings' ? 'text-purple-300' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[11px] font-medium tracking-wide">Profile</span>
          {currentScreen === 'settings' && (
            <span className="absolute -bottom-1.5 w-10 h-[2.5px] rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-400 to-purple-500 shadow-[0_0_10px_#c084fc]" />
          )}
        </button>
      </div>
    </nav>
  );
};
