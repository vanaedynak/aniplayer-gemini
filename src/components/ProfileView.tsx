import React from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { BarChart3, Trophy, Users, Star, ArrowRight, Check } from 'lucide-react';

const AVATAR_FRAMES = [
  { id: 'neon-purple', name: 'Неоновый импульс', glow: 'shadow-[0_0_15px_#8b5cf6] border-violet-500' },
  { id: 'cyan-cyber', name: 'Кибер Кицунэ', glow: 'shadow-[0_0_15px_#06b6d4] border-cyan-400' },
  { id: 'emerald-aura', name: 'Изумрудный свет', glow: 'shadow-[0_0_15px_#10b981] border-emerald-400' },
  { id: 'pink-sakura', name: 'Лепестки сакуры', glow: 'shadow-[0_0_15px_#ec4899] border-pink-500' },
];

export const ProfileView: React.FC = () => {
  const { userStats, settings, updateSettings, setView } = usePlayerStore();

  const counts = userStats.statusCounts;
  const totalListItems = counts.watching + counts.planned + counts.completed + counts.dropped + counts.hold;

  // Calculate donut chart stroke dashes
  const cPercent = (counts.completed / totalListItems) * 100;
  const wPercent = (counts.watching / totalListItems) * 100;
  const pPercent = (counts.planned / totalListItems) * 100;
  const dPercent = (counts.dropped / totalListItems) * 100;
  const hPercent = (counts.hold / totalListItems) * 100;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 select-none max-w-6xl mx-auto w-full">
      {/* Top Grid: Stats Box + Frames & Friends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Watch Statistics Box (Screenshot 4) */}
        <div className="lg:col-span-2 bg-[#121620] rounded-3xl p-6 border border-white/5 space-y-6">
          <div className="flex items-center space-x-2 text-white">
            <BarChart3 size={20} className="text-violet-400" />
            <h2 className="text-lg font-bold">Статистика просмотра</h2>
          </div>

          {/* Big Total Hours Watched Banner */}
          <div className="bg-[#1C2230] rounded-2xl p-6 flex flex-col justify-center space-y-1">
            <span className="text-5xl font-black text-white tracking-tight">
              {userStats.totalHoursWatched}
            </span>
            <span className="text-xs text-gray-400 font-medium">часов просмотра</span>
          </div>

          {/* Metric Sub-cards & Donut Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            {/* Numbers row */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-[#181E2B] p-3 rounded-2xl text-center">
                <span className="text-xl font-bold text-white block">
                  {userStats.totalEpisodesWatched}
                </span>
                <span className="text-[11px] text-gray-400">серии</span>
              </div>

              <div className="bg-[#181E2B] p-3 rounded-2xl text-center">
                <span className="text-xl font-bold text-white block">
                  {userStats.weeklyHoursWatched}
                </span>
                <span className="text-[11px] text-gray-400">часов за неделю</span>
              </div>

              <div className="bg-[#181E2B] p-3 rounded-2xl text-center">
                <span className="text-xl font-bold text-white block">
                  {userStats.friendsCount}
                </span>
                <span className="text-[11px] text-gray-400">друзей</span>
              </div>
            </div>

            {/* SVG Donut Chart with Legend */}
            <div className="flex items-center justify-around">
              {/* Donut SVG */}
              <div className="relative w-28 h-28 shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Background circle */}
                  <path
                    className="text-[#181E2B]"
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Completed (Green) */}
                  <path
                    className="text-emerald-500"
                    strokeDasharray={`${cPercent}, 100`}
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Watching (Cyan) */}
                  <path
                    className="text-cyan-400"
                    strokeDasharray={`${wPercent}, 100`}
                    strokeDashoffset={`-${cPercent}`}
                    strokeWidth="4"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>

              {/* Legend List */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-gray-300">Просмотрено</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />
                  <span className="text-gray-300">Брошено</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0" />
                  <span className="text-gray-300">Отложено</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                  <span className="text-gray-300">В процессе</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
                  <span className="text-gray-300">В планах</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setView('collection')}
              className="text-xs font-semibold text-gray-300 hover:text-white flex items-center space-x-1 transition"
            >
              <span>Смотреть коллекции</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Right 1 Col: Frames & Friends (Screenshot 4) */}
        <div className="space-y-6">
          {/* Frames Showcase */}
          <div className="bg-[#121620] rounded-3xl p-6 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white">
                <Trophy size={18} className="text-yellow-400" />
                <h3 className="text-sm font-bold">Рамки и достижения</h3>
              </div>
              <span className="text-[11px] text-gray-400">12 в коллекции</span>
            </div>

            {/* Frames list */}
            <div className="grid grid-cols-4 gap-2 py-2">
              {AVATAR_FRAMES.map((f) => (
                <div
                  key={f.id}
                  onClick={() => updateSettings({ activeAvatarFrame: f.id })}
                  className={`w-12 h-12 rounded-full border-2 p-0.5 cursor-pointer flex items-center justify-center transition-all ${
                    f.glow
                  } ${settings.activeAvatarFrame === f.id ? 'scale-110 ring-2 ring-white' : 'opacity-70 hover:opacity-100'}`}
                  title={f.name}
                >
                  <img
                    src="https://api.dicebear.com/7.x/bottts/svg?seed=AniGirl&backgroundColor=121620"
                    alt=""
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => alert('Все 12 рамок профиля открыты!')}
              className="w-full bg-[#181E2B] hover:bg-[#202738] text-white text-xs font-bold py-2.5 rounded-2xl transition border border-white/5"
            >
              Показать все
            </button>
          </div>

          {/* Friends Section */}
          <div className="bg-[#121620] rounded-3xl p-6 border border-white/5 space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <Users size={18} className="text-blue-400" />
              <h3 className="text-sm font-bold">Друзья</h3>
            </div>
            <p className="text-xs text-gray-400">Список друзей пока пуст.</p>
            <button
              onClick={() => alert('Поиск друзей станет доступен при подключении аккаунта')}
              className="w-full bg-[#181E2B] hover:bg-[#202738] text-white text-xs font-bold py-2.5 rounded-2xl transition border border-white/5"
            >
              Все друзья
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Reviews Section (Screenshot 4) */}
      <div className="bg-[#121620] rounded-3xl p-6 border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-white">
            <Star size={18} className="text-amber-400 fill-amber-400" />
            <h3 className="text-sm font-bold">Отзывы</h3>
          </div>
          <span className="text-[11px] text-gray-400">Последние публикации — 3</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#181E2B] p-4 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs">
                <Star size={14} className="fill-current" />
                <span>10</span>
              </div>
              <span className="text-[11px] text-gray-500">29 октября 2026</span>
            </div>
            <h4 className="text-xs font-bold text-white">Блич: Тысячелетняя кровавая война</h4>
            <p className="text-xs text-gray-400">
              Потрясающая динамика боёв, звук и анимация уровня полнометражных фильмов. Лучшая арка!
            </p>
          </div>

          <div className="bg-[#181E2B] p-4 rounded-2xl border border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-amber-400 font-bold text-xs">
                <Star size={14} className="fill-current" />
                <span>10</span>
              </div>
              <span className="text-[11px] text-gray-500">26 октября 2026</span>
            </div>
            <h4 className="text-xs font-bold text-white">Реинкарнация безработного 2</h4>
            <p className="text-xs text-gray-400">
              Глубокая проработка персонажей и мира. Смотрел на одном дыхании.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
