import React from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { Award, Layers, BookOpen, Briefcase, ChevronDown, ZoomIn, ZoomOut } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { currentView, setView, settings, updateSettings } = usePlayerStore();

  const handleScaleChange = (delta: number) => {
    const newScale = Math.min(1.2, Math.max(0.8, +(settings.uiScale + delta).toFixed(2)));
    updateSettings({ uiScale: newScale });
  };

  return (
    <aside className="w-64 bg-[#0B0E14] border-r border-white/5 flex flex-col justify-between p-4 select-none shrink-0 overflow-y-auto">
      {/* Top Nav Buttons */}
      <div className="space-y-2">
        <button
          onClick={() => setView('leaderboard')}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition font-medium text-sm ${
            currentView === 'leaderboard'
              ? 'bg-[#1C2230] text-white shadow-card border border-white/10'
              : 'bg-[#121620] text-gray-300 hover:bg-[#181E2B] hover:text-white'
          }`}
        >
          <Award size={18} className="text-yellow-400" />
          <span>Лидерборд</span>
        </button>

        <button
          onClick={() => setView('categories')}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition font-medium text-sm ${
            currentView === 'categories'
              ? 'bg-[#1C2230] text-white shadow-card border border-white/10'
              : 'bg-[#121620] text-gray-300 hover:bg-[#181E2B] hover:text-white'
          }`}
        >
          <Layers size={18} className="text-violet-400" />
          <span>Категории</span>
        </button>

        <button
          onClick={() => setView('manga')}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition font-medium text-sm ${
            currentView === 'manga'
              ? 'bg-[#1C2230] text-white shadow-card border border-white/10'
              : 'bg-[#121620] text-gray-300 hover:bg-[#181E2B] hover:text-white'
          }`}
        >
          <div className="flex items-center space-x-3">
            <BookOpen size={18} className="text-pink-400" />
            <span>Манга</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-gray-300 px-1.5 py-0.5 rounded">
            BETA
          </span>
        </button>

        <button
          onClick={() => setView('collection')}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition font-medium text-sm ${
            currentView === 'collection'
              ? 'bg-[#1C2230] text-white shadow-card border border-white/10'
              : 'bg-[#121620] text-gray-300 hover:bg-[#181E2B] hover:text-white'
          }`}
        >
          <Briefcase size={18} className="text-emerald-400" />
          <span>Моя коллекция</span>
        </button>
      </div>

      {/* Middle & Bottom Sections */}
      <div className="space-y-6 pt-6 border-t border-white/5">
        {/* Friends Section */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Друзья в сети
          </h3>
          <p className="text-xs text-gray-400">Друзей в сети пока что нет</p>
        </div>

        {/* Theme Selector */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Тема сайта
          </h3>
          <div className="relative">
            <button
              onClick={() => {}}
              className="w-full bg-[#121620] hover:bg-[#181E2B] border border-white/5 rounded-2xl px-4 py-2 text-xs text-gray-300 flex items-center justify-between transition"
            >
              <span>{settings.theme === 'animix' ? 'Animix Dark' : settings.theme}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* UI Zoom / Scaling */}
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 flex items-center justify-between">
            <span>Масштаб UI</span>
            <span className="text-violet-400 font-mono">{Math.round(settings.uiScale * 100)}%</span>
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleScaleChange(-0.05)}
              className="p-1.5 bg-[#121620] hover:bg-[#181E2B] rounded-xl text-gray-300 transition"
              title="Уменьшить масштаб"
            >
              <ZoomOut size={16} />
            </button>
            <input
              type="range"
              min="0.8"
              max="1.2"
              step="0.05"
              value={settings.uiScale}
              onChange={(e) => updateSettings({ uiScale: parseFloat(e.target.value) })}
              className="flex-1 accent-violet-500 cursor-pointer h-1.5 bg-[#181E2B] rounded-lg"
            />
            <button
              onClick={() => handleScaleChange(0.05)}
              className="p-1.5 bg-[#121620] hover:bg-[#181E2B] rounded-xl text-gray-300 transition"
              title="Увеличить масштаб"
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>

        {/* Hosting banner footer */}
        <div className="pt-2">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-1">
            ХОСТИНГ ПРЕДОСТАВЛЕН
          </p>
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center font-bold text-[10px] text-white">
              e
            </div>
            <span className="text-sm font-bold tracking-tight text-gray-300">cloud</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
