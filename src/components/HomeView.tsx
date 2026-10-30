import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { AniLibriaService } from '../services/anilibria';
import { ShikimoriService } from '../services/shikimori';
import { AnimeTitle, WatchProgress } from '../types/anime';
import { Play, Clock, Sparkles } from 'lucide-react';

const DAYS_OF_WEEK = [
  'Понедельник',
  'Вторник',
  'Среда',
  'Четверг',
  'Пятница',
  'Суббота',
  'Воскресенье',
];

export const HomeView: React.FC = () => {
  const { recentProgress, openAnime, setFranchiseTree } = usePlayerStore();
  const [schedule, setSchedule] = useState<{ day: number; titles: AnimeTitle[] }[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  const anilibria = AniLibriaService.getInstance();
  const shikimori = ShikimoriService.getInstance();

  useEffect(() => {
    let isMounted = true;
    anilibria.getSchedule().then((data) => {
      if (isMounted) {
        setSchedule(data);
        setLoadingSchedule(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenAnimeFromSchedule = async (anime: AnimeTitle) => {
    // If it's from schedule, fetch full title details
    const full = anime.anilibriaCode ? await anilibria.getTitleByCode(anime.anilibriaCode) : anime;
    const finalAnime = full || anime;

    // Search shikimori for franchise tree
    shikimori.search(finalAnime.titleRu || finalAnime.titleEn).then((results) => {
      if (results.length > 0 && results[0].shikimoriId) {
        shikimori.getFranchise(results[0].shikimoriId).then(setFranchiseTree);
      }
    });

    openAnime(finalAnime);
  };

  const handleOpenRecent = async (item: WatchProgress) => {
    // Search anime by title
    const searchRes = await anilibria.search(item.animeTitle);
    if (searchRes.length > 0) {
      handleOpenAnimeFromSchedule(searchRes[0]);
    } else {
      // Fallback
      openAnime({
        id: item.animeId,
        titleRu: item.animeTitle,
        titleEn: item.animeTitle,
        poster: item.animePoster,
        description: 'Продолжение просмотра',
        score: 9.0,
        genres: ['Экшен', 'Сёнэн'],
        status: 'released',
        hasAniLibria: true,
        episodes: [
          {
            id: item.episodeNumber,
            ordinal: item.episodeNumber,
            title: `${item.episodeNumber} серия`,
            thumbnail: item.animePoster,
          },
        ],
      }, item.episodeNumber);
    }
  };

  const formatRemainingTime = (current: number, duration: number): string => {
    const remaining = Math.max(0, duration - current);
    const mins = Math.floor(remaining / 60);
    const secs = Math.floor(remaining % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 select-none">
      {/* Hero Banner (Exactly like Screenshot 3) */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl h-80 flex flex-col justify-end p-8 bg-[#121620] group">
        {/* Panoramic Background Image */}
        <img
          src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1400&q=80"
          alt="Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
        />
        {/* Gradient dark overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/70 to-transparent" />

        {/* Content */}
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-violet-600/80 text-white flex items-center space-x-1">
              <Sparkles size={12} />
              <span>Хит сезона</span>
            </span>
            <span className="text-xs text-gray-400 font-medium">AniLibria HLS</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
            Реинкарнация безработного
          </h1>
          <p className="text-sm text-gray-300 font-medium drop-shadow">
            Новый сезон получился очень крутым — смотреть обязательно
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                handleOpenRecent({
                  animeId: 'mushoku-tensei',
                  animeTitle: 'Реинкарнация безработного',
                  animePoster: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=600&q=80',
                  seasonNumber: 2,
                  seasonLabel: '2 сезон',
                  episodeNumber: 1,
                  currentTime: 0,
                  duration: 1440,
                  completed: false,
                  updatedAt: Date.now(),
                });
              }}
              className="bg-white hover:bg-gray-100 text-[#0B0E14] font-bold text-sm px-6 py-2.5 rounded-full flex items-center space-x-2 shadow-xl hover:scale-105 transition active:scale-95"
            >
              <Play size={16} className="fill-current" />
              <span>Смотреть</span>
            </button>
          </div>
        </div>
      </div>

      {/* Continue Watching / Recently Watched Section (Screenshots 1 & 3) */}
      <section className="space-y-4">
        <div className="flex items-center space-x-2">
          <Clock size={20} className="text-violet-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Недавно просмотренное
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {recentProgress.slice(0, 8).map((item, index) => (
            <div
              key={`${item.animeId}-${item.episodeNumber}-${index}`}
              onClick={() => handleOpenRecent(item)}
              className="bg-[#121620] hover:bg-[#181E2B] rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 border border-white/5 hover:border-violet-500/30 hover:shadow-card relative aspect-video flex flex-col justify-end"
            >
              {/* Thumbnail image */}
              <img
                src={item.animePoster}
                alt={item.animeTitle}
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/40 to-transparent" />

              {/* Top Right Badge: 03:10 or Просмотрено */}
              <div className="absolute top-2.5 right-2.5 z-10">
                {item.completed ? (
                  <span className="bg-[#0B0E14]/80 backdrop-blur-md text-gray-300 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-white/10">
                    Просмотрено
                  </span>
                ) : (
                  <span className="bg-[#0B0E14]/80 backdrop-blur-md text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border border-white/10 flex items-center space-x-1">
                    <span>{formatRemainingTime(item.currentTime, item.duration)}</span>
                  </span>
                )}
              </div>

              {/* Bottom Information */}
              <div className="relative z-10 p-3">
                <p className="text-xs text-gray-300 font-medium">
                  {item.episodeNumber} серия, {item.seasonLabel || '1 сезон'}
                </p>
                <h3 className="text-sm font-bold text-white truncate drop-shadow">
                  {item.animeTitle}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ongoing Schedule from AniLibria */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2">
            <span>Расписание онгоингов</span>
            <span className="text-xs font-semibold px-2 py-0.5 bg-violet-600/30 text-violet-400 rounded-full border border-violet-500/20">
              AniLibria
            </span>
          </h2>
        </div>

        {/* Day selection tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {DAYS_OF_WEEK.map((dayName, idx) => (
            <button
              key={dayName}
              onClick={() => setSelectedDay(idx)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition shrink-0 ${
                selectedDay === idx
                  ? 'bg-violet-600 text-white shadow-neon'
                  : 'bg-[#121620] text-gray-400 hover:bg-[#181E2B] hover:text-white'
              }`}
            >
              {dayName}
            </button>
          ))}
        </div>

        {/* Schedule cards */}
        {loadingSchedule ? (
          <div className="h-40 flex items-center justify-center text-gray-500 text-sm">
            Загрузка расписания онгоингов...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {(schedule[selectedDay]?.titles || []).map((anime) => (
              <div
                key={anime.id}
                onClick={() => handleOpenAnimeFromSchedule(anime)}
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
                  {anime.hasAniLibria && (
                    <div className="absolute bottom-2 left-2 bg-violet-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                      AniLibria
                    </div>
                  )}
                </div>
                <div className="p-2.5 space-y-1">
                  <h4 className="text-xs font-bold text-white truncate" title={anime.titleRu}>
                    {anime.titleRu}
                  </h4>
                  <p className="text-[11px] text-gray-400 truncate">
                    {anime.genres.slice(0, 2).join(', ') || 'Онгоинг'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
