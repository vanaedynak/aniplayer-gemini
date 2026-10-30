import React, { useState } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { Award, Layers, BookOpen, Briefcase, ChevronDown, ZoomIn, ZoomOut, Palette, Check } from 'lucide-react';

const THEMES = [
  { id: 'animix' as const, name: 'Midnight Violet', color: '#8B5CF6' },
  { id: 'cyber' as const, name: 'Cyber Neon', color: '#06B6D4' },
  { id: 'oled' as const, name: 'OLED Pure Black', color: '#10B981' },
];

export const Sidebar: React.FC = () => {
  const { currentView, setView, settings, updateSettings, setTheme } = usePlayerStore();
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const handleScaleChange = (delta: number) => {
    const newScale = Math.min(1.2, Math.max(0.8, +(settings.uiScale + delta).toFixed(2)));
    updateSettings({ uiScale: newScale });
  };

  const currentThemeObj = THEMES.find((t) => t.id === settings.theme) || THEMES[0];

  return (
    <aside className="w-60 bg-[#0B0E14] border-r border-white/5 flex flex-col justify-between p-4 select-none shrink-0 overflow-y-auto">
      {/* Top Nav Navigation */}
      <div className="space-y-2">
        <button
          onClick={() => setView('categories')}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition font-bold text-xs ${
            currentView === 'categories'
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-neon'
              : 'bg-[#121620] text-gray-300 hover:bg-[#181E2B] hover:text-white border border-white/5'
          }`}
        >
          <Layers size={16} className="text-violet-400" />
          <span>Каталог аниме</span>
        </button>

        <button
          onClick={() => setView('collection')}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition font-bold text-xs ${
            currentView === 'collection'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg'
              : 'bg-[#121620] text-gray-300 hover:bg-[#181E2B] hover:text-white border border-white/5'
          }`}
        >
          <Briefcase size={16} className="text-emerald-400" />
          <span>Моя коллекция</span>
        </button>

        <button
          onClick={() => setView('leaderboard')}
          className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-2xl transition font-bold text-xs ${
            currentView === 'leaderboard'
              ? 'bg-[#1C2230] text-white shadow border border-white/10'
              : 'bg-[#121620] text-gray-300 hover:bg-[#181E2B] hover:text-white border border-white/5'
          }`}
        >
          <Award size={16} className="text-yellow-400" />
          <span>Лидерборд</span>
        </button>

        <button
          onClick={() => setView('manga')}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-2xl transition font-bold text-xs ${
            currentView === 'manga'
              ? 'bg-[#1C2230] text-white shadow border border-white/10'
              : 'bg-[#121620] text-gray-300 hover:bg-[#181E2B] hover:text-white border border-white/5'
          }`}
        >
          <div className="flex items-center space-x-3">
            <BookOpen size={16} className="text-pink-400" />
            <span>Манга</span>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-wider bg-white/10 text-gray-300 px-1.5 py-0.5 rounded">
            BETA
          </span>
        </button>
      </div>

      {/* Middle & Bottom Configuration */}
      <div className="space-y-5 pt-6 border-t border-white/5">
        {/* Real Theme Selector */}
        <div className="relative">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center space-x-1.5">
            <Palette size={13} className="text-violet-400" />
            <span>Тема интерфейса</span>
          </h3>

          <button
            onClick={() => setShowThemeMenu(!showThemeMenu)}
            className="w-full bg-[#121620] hover:bg-[#181E2B] border border-white/5 rounded-2xl px-3.5 py-2 text-xs text-gray-200 flex items-center justify-between transition shadow-sm"
          >
            <div className="flex items-center space-x-2">
              <span
                style={{ backgroundColor: currentThemeObj.color }}
                className="w-2.5 h-2.5 rounded-full shadow"
              />
              <span className="font-semibold">{currentThemeObj.name}</span>
            </div>
            <ChevronDown size={14} className="text-gray-400" />
          </button>

          {showThemeMenu && (
            <div className="absolute bottom-12 left-0 w-full bg-[#161B26] border border-white/10 rounded-2xl p-1.5 shadow-2xl z-40 space-y-1">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    setShowThemeMenu(false);
                  }}
                  className="w-full px-3 py-2 rounded-xl text-left text-xs font-semibold text-gray-200 hover:text-white hover:bg-white/10 flex items-center justify-between transition"
                >
                  <div className="flex items-center space-x-2">
                    <span
                      style={{ backgroundColor: t.color }}
                      className="w-2.5 h-2.5 rounded-full"
                    />
                    <span>{t.name}</span>
                  </div>
                  {settings.theme === t.id && <Check size={14} className="text-violet-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* UI Zoom / Scaling without offset */}
        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center justify-between">
            <span>Масштаб UI</span>
            <span className="text-violet-400 font-mono font-bold">
              {Math.round(settings.uiScale * 100)}%
            </span>
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleScaleChange(-0.05)}
              className="p-1.5 bg-[#121620] hover:bg-[#181E2B] rounded-xl text-gray-300 transition"
              title="Уменьшить"
            >
              <ZoomOut size={15} />
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
              title="Увеличить"
            >
              <ZoomIn size={15} />
            </button>
          </div>
        </div>

        {/* Footer Brand Info */}
        <div className="pt-2 text-center">
          <span className="text-[11px] font-bold text-gray-400 tracking-wider">
            AniPlayer v1.0.3
          </span>
        </div>
      </div>
    </aside>
  );
};
