import React, { useState } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { AniLibriaService } from '../services/anilibria';
import { AnimeTitle } from '../types/anime';
import { Layers, Sparkles } from 'lucide-react';

const GENRES = [
  'Все',
  'Сёнэн',
  'Экшен',
  'Комедия',
  'Драма',
  'Фэнтези',
  'Романтика',
  'Приключения',
  'Детектив',
  'Повседневность',
  'Мистика',
];

export const CategoriesView: React.FC = () => {
  const { openAnime } = usePlayerStore();
  const [selectedGenre, setSelectedGenre] = useState('Все');
  const [titles, setTitles] = useState<AnimeTitle[]>([]);
  const [loading, setLoading] = useState(false);

  const anilibria = AniLibriaService.getInstance();

  React.useEffect(() => {
    setLoading(true);
    anilibria.search(selectedGenre === 'Все' ? 'а' : selectedGenre).then((res) => {
      setTitles(res);
      setLoading(false);
    });
  }, [selectedGenre]);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 select-none">
      <div className="flex items-center space-x-2 text-white">
        <Layers size={22} className="text-violet-400" />
        <h2 className="text-2xl font-black tracking-tight">Каталог и категории</h2>
      </div>

      {/* Genre pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setSelectedGenre(g)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold transition shrink-0 ${
              selectedGenre === g
                ? 'bg-violet-600 text-white shadow-neon'
                : 'bg-[#121620] text-gray-400 hover:bg-[#181E2B] hover:text-white'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Grid of anime */}
      {loading ? (
        <div className="py-20 text-center text-xs text-gray-500">Загрузка каталога...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {titles.map((anime) => (
            <div
              key={anime.id}
              onClick={() => openAnime(anime)}
              className="bg-[#121620] hover:bg-[#181E2B] rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 border border-white/5 hover:border-violet-500/30 hover:shadow-card flex flex-col"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={anime.poster}
                  alt={anime.titleRu}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 bg-[#0B0E14]/80 backdrop-blur-md text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white/10">
                  ★ {anime.score.toFixed(1)}
                </div>
              </div>
              <div className="p-2.5 space-y-1">
                <h4 className="text-xs font-bold text-white truncate">{anime.titleRu}</h4>
                <p className="text-[11px] text-gray-400 truncate">
                  {anime.genres.slice(0, 2).join(', ') || 'Аниме'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
