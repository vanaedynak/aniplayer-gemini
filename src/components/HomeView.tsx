import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { AniLibriaService } from '../services/anilibria';
import { ShikimoriService } from '../services/shikimori';
import { AnimePoster } from './common/AnimePoster';
import { AnimeTitle, WatchProgress } from '../types/anime';
import { Play, Clock, Sparkles, Star, TrendingUp, Info } from 'lucide-react';

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
  const { recentProgress, openAnimeDetails, setView } = usePlayerStore();
  const [schedule, setSchedule] = useState<{ day: number; titles: AnimeTitle[] }[]>([]);
  const [popularTitles, setPopularTitles] = useState<AnimeTitle[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(0);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  const anilibria = AniLibriaService.getInstance();
  const shikimori = ShikimoriService.getInstance();

  useEffect(() => {
    let isMounted = true;

    // Load schedule from AniLibria
    anilibria.getSchedule().then((data) => {
      if (isMounted) {
        setSchedule(data);
        setLoadingSchedule(false);
      }
    });

    // Load top ranked popular titles from Shikimori
    shikimori.getCatalog(0, 'popularity', 1, 12).then((list) => {
      if (isMounted) {
        setPopularTitles(list);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenAnime = async (anime: AnimeTitle) => {
    let full = anime;
    if (anime.shikimoriId) {
      const details = await shikimori.getAnimeDetails(anime.shikimoriId);
      if (details) full = details;
    }
    const alRes = await anilibria.findReleaseEpisodes(full.titleRu, full.titleEn, full.shikimoriId);
    if (alRes.episodes.length > 0) {
      full.episodes = alRes.episodes;
      full.hasAniLibria = true;
      full.anilibriaCode = alRes.release?.anilibriaCode || full.anilibriaCode;
    }
    openAnimeDetails(full);
  };

  const handleOpenRecent = async (item: WatchProgress) => {
    const searchRes = await shikimori.search(item.animeTitle);
    if (searchRes.length > 0) {
      handleOpenAnime(searchRes[0]);
    } else {
      openAnimeDetails({
        id: item.animeId,
        titleRu: item.animeTitle,
        titleEn: item.animeTitle,
        poster: item.animePoster,
        description: 'Продолжение просмотра',
        score: 9.0,
        genres: ['Экшен'],
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
      });
    }
  };

  const formatRemainingTime = (current: number, duration: number): string => {
    const remaining = Math.max(0, duration - current);
    const mins = Math.floor(remaining / 60);
    const secs = Math.floor(remaining % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-8 select-none max-w-7xl mx-auto w-full">
      {/* Featured Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl h-80 sm:h-96 flex flex-col justify-end p-8 bg-[#121620] group">
        <img
          src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1600&q=80"
          alt="Featured"
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-[#0B0E14]/70 to-transparent" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-violet-600 to-indigo-600 text-white flex items-center space-x-1.5 shadow-neon">
              <Sparkles size={12} />
              <span>Главная премьера</span>
            </span>
            <span className="text-xs text-gray-400 font-medium">UHD 1080p</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
            Реинкарнация безработного
          </h1>

          <p className="text-xs sm:text-sm text-gray-300 font-medium drop-shadow line-clamp-2 max-w-xl">
            История 34-летнего затворника, переродившегося в фэнтезийном мире магии и меча под именем Рудеус Грейрат, решившего прожить новую жизнь на полную силу.
          </p>

          <div className="pt-2 flex items-center space-x-3">
            <button
              onClick={() => {
                shikimori.search('Реинкарнация безработного').then((res) => {
                  if (res.length > 0) handleOpenAnime(res[0]);
                });
              }}
              className="bg-white hover:bg-gray-100 text-[#0B0E14] font-black text-xs sm:text-sm px-6 py-2.5 rounded-full flex items-center space-x-2 shadow-xl hover:scale-105 transition active:scale-95"
            >
              <Play size={16} className="fill-current" />
              <span>Смотреть</span>
            </button>

            <button
              onClick={() => {
                shikimori.search('Реинкарнация безработного').then((res) => {
                  if (res.length > 0) handleOpenAnime(res[0]);
                });
              }}
              className="bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-bold px-5 py-2.5 rounded-full flex items-center space-x-1.5 transition"
            >
              <Info size={16} />
              <span>Подробнее</span>
            </button>
          </div>
        </div>
      </div>

      {/* Continue Watching Section (ONLY shown if user actually watched something!) */}
      {recentProgress.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center space-x-2">
            <Clock size={20} className="text-violet-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Продолжить просмотр
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {recentProgress.slice(0, 8).map((item, index) => (
              <div
                key={`${item.animeId}-${item.episodeNumber}-${index}`}
                onClick={() => handleOpenRecent(item)}
                className="bg-[#121620] hover:bg-[#181E2B] rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 border border-white/5 hover:border-violet-500/30 hover:shadow-card relative aspect-video flex flex-col justify-end"
              >
                <img
                  src={item.animePoster}
                  alt={item.animeTitle}
                  className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/40 to-transparent" />

                <div className="absolute top-2.5 right-2.5 z-10">
                  {item.completed ? (
                    <span className="bg-[#0B0E14]/80 backdrop-blur-md text-emerald-400 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-emerald-500/30">
                      Просмотрено
                    </span>
                  ) : (
                    <span className="bg-[#0B0E14]/80 backdrop-blur-md text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border border-white/10">
                      {formatRemainingTime(item.currentTime, item.duration)}
                    </span>
                  )}
                </div>

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
      )}

      {/* Popular Anime Worldwide Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp size={20} className="text-pink-400" />
            <h2 className="text-xl font-bold text-white tracking-tight">
              Популярное сейчас
            </h2>
          </div>
          <button
            onClick={() => setView('categories')}
            className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition"
          >
            Смотреть все →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {popularTitles.map((anime) => (
            <div
              key={anime.id}
              onClick={() => handleOpenAnime(anime)}
              className="bg-[#121620] hover:bg-[#181E2B] rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 border border-white/5 hover:border-violet-500/30 hover:shadow-card flex flex-col"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-black/40">
                <AnimePoster
                  src={anime.poster}
                  alt={anime.titleRu}
                  title={anime.titleRu}
                  badge={
                    <div className="absolute top-2 right-2 bg-[#0B0E14]/80 backdrop-blur-md text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white/10 flex items-center space-x-0.5 z-10">
                      <Star size={10} className="fill-current" />
                      <span>{anime.score ? anime.score.toFixed(1) : '8.0'}</span>
                    </div>
                  }
                />
              </div>
              <div className="p-2.5 space-y-1">
                <h4 className="text-xs font-bold text-white truncate group-hover:text-violet-300 transition">
                  {anime.titleRu}
                </h4>
                <p className="text-[11px] text-gray-400 truncate">
                  {anime.year ? `${anime.year} г.` : 'Аниме'}
                </p>
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
            <span className="text-xs font-bold px-2 py-0.5 bg-violet-600/30 text-violet-400 rounded-full border border-violet-500/20">
              AniLibria
            </span>
          </h2>
        </div>

        {/* Day selection tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
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
          <div className="h-40 flex items-center justify-center text-gray-500 text-xs">
            Загрузка расписания онгоингов...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {(schedule[selectedDay]?.titles || []).map((anime) => (
              <div
                key={anime.id}
                onClick={() => handleOpenAnime(anime)}
                className="bg-[#121620] hover:bg-[#181E2B] rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 border border-white/5 hover:border-violet-500/30 hover:shadow-card flex flex-col"
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-black/40">
                  <AnimePoster
                    src={anime.poster}
                    alt={anime.titleRu}
                    title={anime.titleRu}
                    badge={
                      <div className="absolute top-2 right-2 bg-[#0B0E14]/80 backdrop-blur-md text-amber-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white/10 z-10">
                        ★ {anime.score.toFixed(1)}
                      </div>
                    }
                  />
                </div>
                <div className="p-2.5 space-y-1">
                  <h4 className="text-xs font-bold text-white truncate group-hover:text-violet-300 transition">
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
