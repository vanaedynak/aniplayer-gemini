import React from 'react';
import { Award, Trophy } from 'lucide-react';

const TOP_USERS = [
  { rank: 1, name: 'SatoruGojo', hours: 1420.5, episodes: 4120, badge: '🏆 Легенда' },
  { rank: 2, name: 'MikasaAckerman', hours: 980.2, episodes: 2850, badge: '🥈 Мастер' },
  { rank: 3, name: 'LeviCaptain', hours: 745.0, episodes: 2190, badge: '🥉 Эксперт' },
  { rank: 4, name: 'KurosakiIchigo', hours: 610.8, episodes: 1840, badge: 'Зритель' },
  { rank: 5, name: 'UzumakiNaruto', hours: 550.2, episodes: 1620, badge: 'Зритель' },
];

export const LeaderboardView: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 select-none max-w-4xl mx-auto w-full">
      <div className="flex items-center space-x-2 text-white">
        <Award size={22} className="text-yellow-400" />
        <h2 className="text-2xl font-black tracking-tight">Лидерборд зрителей</h2>
      </div>

      <div className="bg-[#121620] rounded-3xl p-6 border border-white/5 space-y-4">
        <p className="text-xs text-gray-400">
          Топ пользователей по общему времени просмотра в приложении AniGemini.
        </p>

        <div className="space-y-2">
          {TOP_USERS.map((u) => (
            <div
              key={u.rank}
              className="bg-[#181E2B] p-4 rounded-2xl flex items-center justify-between border border-white/5"
            >
              <div className="flex items-center space-x-4">
                <span className={`w-8 text-center font-black text-sm ${u.rank === 1 ? 'text-yellow-400 text-lg' : 'text-gray-400'}`}>
                  #{u.rank}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-white">{u.name}</h4>
                  <span className="text-[10px] text-gray-400">{u.badge}</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-black text-violet-400 block">{u.hours} ч.</span>
                <span className="text-[10px] text-gray-500">{u.episodes} серий</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
