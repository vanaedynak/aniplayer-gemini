import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { Search, SlidersHorizontal, Bell, ArrowLeft, ArrowRight, Minus, Square, X, Download } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentView,
    setView,
    setSearchOpen,
    updateAvailable,
  } = usePlayerStore();

  const [isMaximized, setIsMaximized] = useState(false);
  const [appVersion, setAppVersion] = useState<string>('1.0.0');

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getAppVersion().then(setAppVersion);
      window.electronAPI.isMaximized().then(setIsMaximized);
      const unsubscribe = window.electronAPI.onWindowStateChange(setIsMaximized);
      return () => unsubscribe();
    }
  }, []);

  const handleMinimize = () => window.electronAPI?.minimize();
  const handleMaximize = () => window.electronAPI?.maximize();
  const handleClose = () => window.electronAPI?.close();

  return (
    <header className="h-14 bg-[#0B0E14] border-b border-white/5 flex items-center justify-between px-4 z-40 select-none drag-region">
      {/* Left: Window Controls + Logo */}
      <div className="flex items-center space-x-3 no-drag">
        {/* Navigation arrows (desktop browser/electron style) */}
        <div className="flex items-center space-x-1 text-gray-400">
          <button
            onClick={() => setView('home')}
            className="p-1 hover:text-white hover:bg-white/5 rounded-full transition"
            title="Назад"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            onClick={() => {}}
            className="p-1 text-gray-600 cursor-not-allowed"
            title="Вперед"
          >
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Desktop title text */}
        <span className="text-xs text-gray-400 font-medium hidden sm:inline-block">
          animix desktop
        </span>

        {/* Logo */}
        <div
          onClick={() => setView('home')}
          className="flex items-center cursor-pointer ml-2 group"
        >
          <span className="text-2xl font-black tracking-tight text-white relative">
            anim
            <span className="relative">
              i
              <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-violet-500 shadow-neon animate-pulse" />
            </span>
            x
          </span>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-xl mx-4 no-drag">
        <div
          onClick={() => setSearchOpen(true)}
          className="bg-[#161B26] hover:bg-[#1C2230] text-gray-400 hover:text-gray-200 border border-white/5 hover:border-violet-500/30 rounded-full h-9 px-4 flex items-center justify-between cursor-pointer transition shadow-inner"
        >
          <span className="text-sm font-medium text-gray-400">Быстрый поиск</span>
          <div className="flex items-center space-x-2 text-gray-400">
            <Search size={16} />
            <SlidersHorizontal size={15} />
          </div>
        </div>
      </div>

      {/* Right: Actions, Avatar, Window Controls */}
      <div className="flex items-center space-x-3 no-drag">
        {/* Update Notification Pill if available */}
        {updateAvailable && (
          <button
            onClick={() => {
              if (updateAvailable.downloadUrl) {
                window.electronAPI?.openExternal(updateAvailable.downloadUrl);
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-semibold rounded-full shadow-lg shadow-emerald-500/20 hover:scale-105 transition animate-bounce"
            title={`Доступно обновление v${updateAvailable.version}`}
          >
            <Download size={13} />
            <span>Обновить</span>
          </button>
        )}

        {/* Premium Button */}
        <button
          onClick={() => alert('AniPlayer Премиум активен! Приятного просмотра без рекламы.')}
          className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center space-x-1.5 shadow-neon transition active:scale-95"
        >
          <span>★</span>
          <span>Премиум</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => alert('Уведомления: Вы используете AniPlayer v' + appVersion)}
          className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition relative"
        >
          <Bell size={18} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User Avatar with Neon Particle Frame */}
        <div
          onClick={() => setView('profile')}
          className="relative cursor-pointer group"
          title="Профиль и статистика"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-emerald-400/80 p-0.5 shadow-[0_0_12px_rgba(52,211,153,0.5)] group-hover:scale-105 transition">
            <img
              src="https://api.dicebear.com/7.x/bottts/svg?seed=AniGirl&backgroundColor=121620"
              alt="Avatar"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          {/* Animated particle glow badge */}
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0B0E14]" />
        </div>

        {/* Electron Window Controls (only on desktop) */}
        {window.electronAPI && (
          <div className="flex items-center space-x-1 pl-2 border-l border-white/10">
            <button
              onClick={handleMinimize}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition"
              title="Свернуть"
            >
              <Minus size={14} />
            </button>
            <button
              onClick={handleMaximize}
              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition"
              title={isMaximized ? 'Восстановить' : 'Развернуть'}
            >
              <Square size={12} />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/20 rounded transition"
              title="Закрыть"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
