import React from 'react';
import { LogoIcon, RefreshIcon } from './Icons.tsx';

interface HeaderProps {
  onRefresh: () => void;
  isLoading: boolean;
  currentUserEmail: string;
  onLogout: () => void;
  lastRefreshed: Date | null;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, isLoading, currentUserEmail, onLogout, lastRefreshed }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow-sm border-b border-slate-900/10">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <LogoIcon className="h-8 w-8 text-blue-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Task Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">{currentUserEmail}</p>
                <p className="text-xs text-slate-500" suppressHydrationWarning>
                  {lastRefreshed ? `Updated: ${lastRefreshed.toLocaleTimeString()}` : 'Updating...'}
                </p>
              </div>
              <button onClick={onLogout} className="rounded-md bg-slate-200/70 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-300/80 transition-colors">Change User</button>
            </div>
           
            <div className="h-6 w-px bg-slate-300/60"></div>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-200 hover:-translate-y-0.5"
            >
              <RefreshIcon className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{isLoading ? 'Refreshing...' : 'Refresh'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};