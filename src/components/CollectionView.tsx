import React, { useState } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { StorageService } from '../services/storage';
import { Briefcase, Play } from 'lucide-react';
import { AnimeStatus } from '../types/anime';

const STATUS_TABS: { key: AnimeStatus; label: string }[] = [
  { key: 'watching', label: 'Смотрю' },
  { key: 'planned', label: 'В планах' },
  { key: 'completed', label: 'Просмотрено' },
  { key: 'dropped', label: 'Брошено' },
];

export const CollectionView: React.FC = () => {
  const { openAnime } = usePlayerStore();
  const [activeTab, setActiveTab] = useState<AnimeStatus>('watching');

  const storage = StorageService.getInstance();
  const lists = storage.getUserLists();

  const filtered = Object.entries(lists)
    .filter(([_, item]) => item.status === activeTab)
    .map(([id, item]) => ({ id, ...item }));

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 select-none">
      <div className="flex items-center space-x-2 text-white">
        <Briefcase size={22} className="text-emerald-400" />
        <h2 className="text-2xl font-black tracking-tight">Моя коллекция</h2>
      </div>

      {/* Status tabs */}
      <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition ${
              activeTab === tab.key
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-[#121620] text-gray-400 hover:bg-[#181E2B] hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="py-20 text-center text-xs text-gray-500">
          В списке «{STATUS_TABS.find((t) => t.key === activeTab)?.label}» пока нет аниме.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                openAnime({
                  id: item.id,
                  titleRu: item.title,
                  titleEn: item.title,
                  poster: item.poster,
                  description: '',
                  score: 9.0,
                  genres: ['Аниме'],
                  status: 'released',
                  hasAniLibria: true,
                  episodes: [
                    {
                      id: 1,
                      ordinal: 1,
                      title: '1 серия',
                      thumbnail: item.poster,
                    },
                  ],
                });
              }}
              className="bg-[#121620] hover:bg-[#181E2B] rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 border border-white/5 hover:border-emerald-500/30 flex flex-col"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={item.poster}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-2.5">
                <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
