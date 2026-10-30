import React from 'react';
import { BookOpen } from 'lucide-react';

export const MangaView: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 select-none max-w-4xl mx-auto w-full">
      <div className="flex items-center space-x-2 text-white">
        <BookOpen size={22} className="text-pink-400" />
        <h2 className="text-2xl font-black tracking-tight flex items-center space-x-2">
          <span>Манга</span>
          <span className="text-xs bg-pink-500/20 text-pink-400 font-bold px-2 py-0.5 rounded uppercase">
            BETA
          </span>
        </h2>
      </div>

      <div className="bg-[#121620] rounded-3xl p-8 border border-white/5 text-center space-y-3">
        <h3 className="text-base font-bold text-white">Раздел манги находится в разработке</h3>
        <p className="text-xs text-gray-400 max-w-md mx-auto">
          Скоро здесь появится удобная читалка популярных глав и манги с синхронизацией закладок.
        </p>
      </div>
    </div>
  );
};
