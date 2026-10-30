import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { Search, SlidersHorizontal, Bell, ArrowLeft, ArrowRight, Minus, Square, X, Download, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentView,
    setView,
    setSearchOpen,
    updateAvailable,
  } = usePlayerStore();

  const [isMaximized, setIsMaximized] = useState(false);
  const [appVersion, setAppVersion] = useState<string>('1.0.4');
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'downloading' | 'ready' | 'error'>('idle');
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getAppVersion().then(setAppVersion);
      window.electronAPI.isMaximized().then(setIsMaximized);
      const unsubscribe = window.electronAPI.onWindowStateChange(setIsMaximized);

      const unsubProgress = (window.electronAPI as any).onUpdateProgress?.((data: any) => {
        setUpdateStatus('downloading');
        setDownloadProgress(data.percent || 0);
      });

      const unsubReady = (window.electronAPI as any).onUpdateReady?.(() => {
        setUpdateStatus('ready');
      });

      const unsubError = (window.electronAPI as any).onUpdateError?.((err: string) => {
        setUpdateStatus('error');
        setErrorMessage(err);
      });

      return () => {
        unsubscribe();
        unsubProgress?.();
        unsubReady?.();
        unsubError?.();
      };
    }
  }, []);

  const handleUpdateClick = () => {
    if (!updateAvailable?.downloadUrl) return;

    if ((window.electronAPI as any)?.downloadAndInstallUpdate) {
      setUpdateStatus('downloading');
      setDownloadProgress(0);
      (window.electronAPI as any).downloadAndInstallUpdate(updateAvailable.downloadUrl);
    } else if (window.electronAPI?.openExternal) {
      window.electronAPI.openExternal(updateAvailable.downloadUrl);
    } else {
      window.open(updateAvailable.downloadUrl, '_blank');
    }
  };

  const handleMinimize = () => {
    if (window.electronAPI?.minimize) {
      window.electronAPI.minimize();
    }
  };

  const handleMaximize = () => {
    if (window.electronAPI?.maximize) {
      window.electronAPI.maximize().then(setIsMaximized);
    } else if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      setIsMaximized(false);
    } else {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsMaximized(true);
    }
  };

  const handleClose = () => {
    if (window.electronAPI?.close) {
      window.electronAPI.close();
    } else {
      window.close();
    }
  };

  return (
    <header className="h-14 bg-[#0B0E14] border-b border-white/5 flex items-center justify-between px-4 z-40 select-none drag-region">
      {/* Left: Nav Back/Forward + Original AniPlayer Brand Logo */}
      <div className="flex items-center space-x-3 no-drag">
        <div className="flex items-center space-x-1 text-gray-400">
          <button
            onClick={() => setView('home')}
            className="p-1 hover:text-white hover:bg-white/5 rounded-full transition"
            title="На главную"
          >
            <ArrowLeft size={16} />
          </button>
        </div>

        {/* Brand Logo with Custom Prism Icon */}
        <div
          onClick={() => setView('home')}
          className="flex items-center space-x-2 cursor-pointer group ml-1"
        >
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-500 to-pink-500 p-0.5 shadow-neon group-hover:scale-105 transition">
            <div className="w-full h-full bg-[#0B0E14] rounded-[10px] flex items-center justify-center">
              <Sparkles size={14} className="text-violet-400" />
            </div>
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Ani<span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-pink-400">Gemini</span>
          </span>
        </div>
      </div>

      {/* Center: Search Bar */}
      <div className="flex-1 max-w-xl mx-4 no-drag">
        <div
          onClick={() => setSearchOpen(true)}
          className="bg-[#161B26] hover:bg-[#1C2230] text-gray-400 hover:text-gray-200 border border-white/5 hover:border-violet-500/40 rounded-full h-9 px-4 flex items-center justify-between cursor-pointer transition shadow-inner"
        >
          <span className="text-xs font-semibold text-gray-400">
            Быстрый поиск любого аниме (Ctrl + K)...
          </span>
          <div className="flex items-center space-x-2 text-gray-400">
            <Search size={15} />
            <SlidersHorizontal size={14} />
          </div>
        </div>
      </div>

      {/* Right: Actions, Avatar, Window Controls */}
      <div className="flex items-center space-x-3 no-drag">
        {updateAvailable && (
          <div>
            {updateStatus === 'idle' && (
              <button
                onClick={handleUpdateClick}
                className="flex items-center space-x-1.5 px-3 py-1 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-xs font-bold rounded-full shadow-lg hover:scale-105 transition animate-pulse"
                title={`Доступно обновление v${updateAvailable.version}`}
              >
                <Download size={13} />
                <span>Обновить до v{updateAvailable.version}</span>
              </button>
            )}

            {updateStatus === 'downloading' && (
              <div className="flex items-center space-x-2 px-3 py-1 bg-[#161B26] border border-emerald-500/40 rounded-full text-xs shadow-lg">
                <div className="w-16 h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-200"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
                <span className="font-mono text-emerald-400 font-bold">{downloadProgress}%</span>
              </div>
            )}

            {updateStatus === 'ready' && (
              <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-full shadow-lg animate-bounce">
                <Sparkles size={13} />
                <span>Перезапуск...</span>
              </div>
            )}

            {updateStatus === 'error' && (
              <button
                onClick={() => {
                  if (updateAvailable.downloadUrl) {
                    window.electronAPI?.openExternal(updateAvailable.downloadUrl);
                  }
                }}
                className="text-xs text-red-400 hover:text-red-300 font-semibold underline px-2 py-1"
                title="Скачать вручную"
              >
                Ошибка. Скачать вручную
              </button>
            )}
          </div>
        )}

        {/* User Profile Avatar with Glowing Border */}
        <div
          onClick={() => setView('profile')}
          className="relative cursor-pointer group"
          title="Профиль и статистика"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-violet-500 p-0.5 shadow-neon group-hover:scale-105 transition">
            <img
              src="https://api.dicebear.com/7.x/bottts/svg?seed=AniGirl&backgroundColor=121620"
              alt="Avatar"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-violet-400 rounded-full border-2 border-[#0B0E14]" />
        </div>

        {/* Windows / Desktop Window Controls (Always available with graceful fallback) */}
        <div className="flex items-center space-x-1 pl-2 border-l border-white/10">
          <button
            onClick={handleClose}
            className="text-xs font-semibold text-red-400 hover:text-red-300 px-2 py-1 hover:bg-red-500/10 rounded transition hidden sm:inline-block"
            title="Выйти из приложения"
          >
            Выйти
          </button>
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
            title="Закрыть (✕)"
          >
            <X size={15} />
          </button>
        </div>
      </div>
    </header>
  );
};
