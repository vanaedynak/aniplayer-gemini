import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { ShikimoriService, ANIME_GENRES } from '../services/shikimori';
import { AniLibriaService } from '../services/anilibria';
import { AnimePoster } from './common/AnimePoster';
import { AnimeTitle } from '../types/anime';
import { Layers, Star, ArrowUpDown } from 'lucide-react';

const SORT_OPTIONS = [
  { key: 'ranked', label: 'По рейтингу' },
  { key: 'popularity', label: 'По популярности' },
  { key: 'aired_on', label: 'По дате выхода' },
];

export const CategoriesView: React.FC = () => {
  const { openAnimeDetails } = usePlayerStore();
  const [selectedGenreId, setSelectedGenreId] = useState<number>(0);
  const [selectedSort, setSelectedSort] = useState<string>('ranked');
  const [titles, setTitles] = useState<AnimeTitle[]>([]);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const shikimori = ShikimoriService.getInstance();
  const anilibria = AniLibriaService.getInstance();

  const loadTitles = async (genreId: number, sort: string, pageNum: number, append: boolean = false) => {
    setLoading(true);
    try {
      const list = await shikimori.getCatalog(genreId, sort, pageNum, 36);
      if (append) {
        setTitles((prev) => [...prev, ...list]);
      } else {
        setTitles(list);
      }
      setHasMore(list.length === 36);
    } catch (err) {
      console.error('Error loading catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadTitles(selectedGenreId, selectedSort, 1, false);
  }, [selectedGenreId, selectedSort]);

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadTitles(selectedGenreId, selectedSort, nextPage, true);
  };

  const handleSelectAnime = async (anime: AnimeTitle) => {
    let full = anime;
    if (anime.shikimoriId) {
      const details = await shikimori.getAnimeDetails(anime.shikimoriId);
      if (details) full = details;
    }
    // Check AniLibria for full release details & episodes
    const alRes = await anilibria.findReleaseEpisodes(full.titleRu, full.titleEn, full.shikimoriId);
    if (alRes.episodes.length > 0) {
      full.episodes = alRes.episodes;
      full.hasAniLibria = true;
      full.anilibriaCode = alRes.release?.anilibriaCode || full.anilibriaCode;
    }
    openAnimeDetails(full);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 select-none max-w-7xl mx-auto w-full">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-2 text-white">
          <Layers size={22} className="text-violet-400" />
          <h2 className="text-2xl font-black tracking-tight">Каталог аниме со всего мира</h2>
        </div>

        {/* Sort selector */}
        <div className="flex items-center space-x-2 bg-[#121620] px-3 py-1.5 rounded-full border border-white/5">
          <ArrowUpDown size={14} className="text-gray-400" />
          <span className="text-xs text-gray-400 font-medium">Сортировка:</span>
          {SORT_OPTIONS.map((s) => (
            <button
              key={s.key}
              onClick={() => setSelectedSort(s.key)}
              className={`text-xs font-bold px-2.5 py-1 rounded-full transition ${
                selectedSort === s.key
                  ? 'bg-violet-600 text-white shadow-neon'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
        {ANIME_GENRES.map((g) => (
          <button
            key={g.id}
            onClick={() => setSelectedGenreId(g.id)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition shrink-0 ${
              selectedGenreId === g.id
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-neon scale-105'
                : 'bg-[#121620] text-gray-400 hover:bg-[#181E2B] hover:text-white border border-white/5'
            }`}
          >
            {g.name}
          </button>
        ))}
      </div>

      {/* Anime Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {titles.map((anime) => (
          <div
            key={anime.id}
            onClick={() => handleSelectAnime(anime)}
            className="bg-[#121620] hover:bg-[#181E2B] rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 border border-white/5 hover:border-violet-500/40 hover:shadow-card flex flex-col"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-black/30">
              <AnimePoster
                src={anime.poster}
                alt={anime.titleRu}
                title={anime.titleRu}
                badge={
                  <div className="absolute top-2 right-2 bg-[#0B0E14]/80 backdrop-blur-md text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-white/10 flex items-center space-x-1 z-10">
                    <Star size={10} className="fill-current" />
                    <span>{anime.score ? anime.score.toFixed(1) : '8.0'}</span>
                  </div>
                }
              />
            </div>
            <div className="p-3 space-y-1">
              <h4 className="text-xs font-bold text-white truncate group-hover:text-violet-300 transition">
                {anime.titleRu}
              </h4>
              <p className="text-[11px] text-gray-400 truncate">
                {anime.year ? `${anime.year} г.` : 'Аниме'} {anime.episodesTotal ? `· ${anime.episodesTotal} эп.` : ''}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Loading state / Load More */}
      {loading && (
        <div className="py-12 text-center text-xs text-gray-500">Загрузка каталога...</div>
      )}

      {!loading && hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={handleLoadMore}
            className="bg-[#181E2B] hover:bg-[#202738] text-white text-xs font-bold px-8 py-3 rounded-full border border-white/10 hover:border-violet-500/40 transition shadow"
          >
            Загрузить ещё аниме
          </button>
        </div>
      )}
    </div>
  );
};
