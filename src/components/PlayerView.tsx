import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { AnimixPlayer } from './player/AnimixPlayer';
import { YummyAnimeService } from '../services/yummyanime';
import { ShikimoriService } from '../services/shikimori';
import { MessageSquare, HelpCircle, Layers, Film, Tv, Sparkles } from 'lucide-react';

export const PlayerView: React.FC = () => {
  const {
    currentAnime,
    currentEpisode,
    playEpisode,
    activeSource,
    setPlayerSource,
    customIframeUrl,
    franchiseTree,
    setFranchiseTree,
    openAnime,
  } = usePlayerStore();

  const [selectedSeason, setSelectedSeason] = useState<string>('Сезон 1');
  const [comments, setComments] = useState<string[]>([
    'Серия просто огонь! Рисовка и анимация на высоте.',
    'Наконец-то этот бой экранизировали, ждал 10 лет!',
  ]);
  const [commentInput, setCommentInput] = useState('');
  const [alternativeVoices, setAlternativeVoices] = useState<{ name: string; iframeUrl: string }[]>([]);

  const yummyService = YummyAnimeService.getInstance();
  const shikimoriService = ShikimoriService.getInstance();

  useEffect(() => {
    if (currentAnime) {
      yummyService
        .getAlternativePlayers(currentAnime.titleRu, currentAnime.titleEn, currentEpisode?.ordinal || 1)
        .then((res) => {
          setAlternativeVoices(res.voices);
        });

      if (!franchiseTree) {
        shikimoriService.search(currentAnime.titleRu || currentAnime.titleEn).then((res) => {
          if (res.length > 0 && res[0].shikimoriId) {
            shikimoriService.getFranchise(res[0].shikimoriId).then(setFranchiseTree);
          }
        });
      }
    }
  }, [currentAnime?.id, currentEpisode?.ordinal]);

  if (!currentAnime || !currentEpisode) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-400">
        Выберите аниме для просмотра
      </div>
    );
  }

  const handleNextEpisode = () => {
    const next = currentAnime.episodes.find((e) => e.ordinal === currentEpisode.ordinal + 1);
    if (next) {
      playEpisode(next);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    setComments([commentInput.trim(), ...comments]);
    setCommentInput('');
  };

  const hasNext = currentAnime.episodes.some((e) => e.ordinal === currentEpisode.ordinal + 1);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 select-none">
      {/* Video Player Area */}
      <div className="w-full max-w-5xl mx-auto space-y-4">
        {activeSource === 'anilibria' && currentEpisode.hls ? (
          <AnimixPlayer
            episode={currentEpisode}
            anime={currentAnime}
            onNextEpisode={handleNextEpisode}
            hasNext={hasNext}
          />
        ) : (
          <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
            <iframe
              src={customIframeUrl || alternativeVoices[0]?.iframeUrl || 'about:blank'}
              className="w-full h-full border-0"
              allowFullScreen
              title="Alternative Player"
            />
          </div>
        )}

        {/* Source & Control Bar (Exactly like Screenshot 2) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Left: Anime title pill */}
          <div className="flex items-center space-x-2 bg-[#121620] px-3.5 py-1.5 rounded-full border border-white/5">
            <div className="w-6 h-6 rounded-full overflow-hidden">
              <img src={currentAnime.poster} alt="" className="w-full h-full object-cover" />
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[150px]">
              {currentAnime.titleRu}
            </span>
          </div>

          {/* Center-Right: Buttons & Sources */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => alert('Реклама в AniPlayer полностью отключена!')}
              className="bg-white text-[#0B0E14] text-xs font-bold px-4 py-1.5 rounded-full shadow hover:bg-gray-200 transition"
            >
              Отключить рекламу
            </button>

            {hasNext && (
              <button
                onClick={handleNextEpisode}
                className="bg-[#1C2230] hover:bg-[#252D40] text-white text-xs font-semibold px-4 py-1.5 rounded-full border border-white/10 transition"
              >
                След. серия
              </button>
            )}

            {/* Source Switchers */}
            <div className="flex items-center bg-[#121620] p-1 rounded-full border border-white/5 space-x-1">
              <button
                onClick={() => setPlayerSource('anilibria')}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
                  activeSource === 'anilibria'
                    ? 'bg-[#1C2230] text-white shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <span>Animix</span>
                <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[9px] px-1.5 py-0.2 rounded font-extrabold">
                  UHD
                </span>
              </button>

              <button
                onClick={() => {
                  setPlayerSource('animixlite', alternativeVoices[0]?.iframeUrl);
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                  activeSource === 'animixlite'
                    ? 'bg-white text-[#0B0E14] shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                AnimixLite
              </button>

              {alternativeVoices.length > 0 && (
                <button
                  onClick={() => {
                    setPlayerSource('iframe', alternativeVoices[0]?.iframeUrl);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition ${
                    activeSource === 'iframe'
                      ? 'bg-white text-[#0B0E14] shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Studio Band (Озвучка)
                </button>
              )}

              <button
                onClick={() => alert('Информация: AniPlayer использует официальные потоки AniLibria HLS в качестве UHD и открытые плееры YummyAnime для альтернативных озвучек.')}
                className="p-1 text-gray-400 hover:text-white rounded-full transition"
              >
                <HelpCircle size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Source info subline */}
        <div className="text-right">
          <span className="text-[11px] text-gray-500 font-medium">
            {activeSource === 'anilibria' ? 'Animix UHD • AniLibria HLS' : 'AnimixLite • Studio Band / AniDUB'}
          </span>
        </div>
      </div>

      {/* Main Bottom Section: Episodes + Franchise + Comments */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Title, Season Chips, Episode Carousel, Franchise */}
        <div className="lg:col-span-2 space-y-6">
          {/* Episode Title Header */}
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {currentEpisode.title || `${currentEpisode.ordinal} серия, 1 сезон`}
            </h2>
          </div>

          {/* Season Selector Chips (Screenshot 2) */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedSeason('Номер')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                selectedSeason === 'Номер'
                  ? 'bg-white text-[#0B0E14]'
                  : 'bg-[#121620] text-gray-300 hover:bg-[#181E2B]'
              }`}
            >
              Номер
            </button>
            <button
              onClick={() => setSelectedSeason('Сезон 1')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                selectedSeason === 'Сезон 1'
                  ? 'bg-white text-[#0B0E14]'
                  : 'bg-[#121620] text-gray-300 hover:bg-[#181E2B]'
              }`}
            >
              Сезон 1
            </button>
            <button
              onClick={() => setSelectedSeason('Сезон 2')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition ${
                selectedSeason === 'Сезон 2'
                  ? 'bg-white text-[#0B0E14]'
                  : 'bg-[#121620] text-gray-300 hover:bg-[#181E2B]'
              }`}
            >
              Сезон 2
            </button>
          </div>

          {/* Episode Thumbnails Horizontal Carousel */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {currentAnime.episodes.map((ep) => {
              const isSelected = ep.ordinal === currentEpisode.ordinal;
              return (
                <div
                  key={ep.id}
                  onClick={() => playEpisode(ep)}
                  className={`rounded-2xl overflow-hidden cursor-pointer group transition-all border relative aspect-video flex flex-col justify-end ${
                    isSelected
                      ? 'border-violet-500 shadow-neon scale-102 ring-1 ring-violet-500'
                      : 'border-white/5 bg-[#121620] hover:border-white/20'
                  }`}
                >
                  <img
                    src={ep.thumbnail || currentAnime.poster}
                    alt={ep.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/40 to-transparent" />
                  <div className="relative z-10 p-2.5">
                    <span className="text-xs font-bold text-white drop-shadow">
                      {ep.title || `Серия ${ep.ordinal}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* FRANCHISE SECTION (Full order, Bleach 366ep + 4 parts, Naruto, Movies, OVAs) */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <div className="flex items-center space-x-2">
              <Layers size={18} className="text-violet-400" />
              <h3 className="text-lg font-bold text-white tracking-tight">
                Франшиза и хронология
              </h3>
            </div>

            {franchiseTree ? (
              <div className="space-y-4">
                {/* Main Seasons */}
                {franchiseTree.mainSeasons.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Tv size={14} className="text-violet-400" />
                      <span>Основные сезоны по порядку</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {franchiseTree.mainSeasons.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            shikimoriService.getAnimeDetails(item.id).then((d) => {
                              if (d) openAnime(d);
                            });
                          }}
                          className="bg-[#121620] hover:bg-[#181E2B] p-2.5 rounded-2xl border border-white/5 flex items-center space-x-3 cursor-pointer group transition"
                        >
                          <img
                            src={item.poster || currentAnime.poster}
                            alt=""
                            className="w-12 h-16 rounded-xl object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider">
                              {item.seasonLabel}
                            </span>
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-violet-300">
                              {item.titleRu}
                            </h4>
                            <span className="text-[11px] text-gray-400">
                              {item.year || 'ТВ'} · ★ {item.score}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Movies */}
                {franchiseTree.movies.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Film size={14} className="text-amber-400" />
                      <span>Полнометражные фильмы</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {franchiseTree.movies.map((item) => (
                        <div
                          key={item.id}
                          className="bg-[#121620] hover:bg-[#181E2B] p-2.5 rounded-2xl border border-white/5 flex items-center space-x-3 cursor-pointer group transition"
                        >
                          <img
                            src={item.poster || currentAnime.poster}
                            alt=""
                            className="w-12 h-16 rounded-xl object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                              Фильм
                            </span>
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-amber-300">
                              {item.titleRu}
                            </h4>
                            <span className="text-[11px] text-gray-400">
                              {item.year || ''} · ★ {item.score}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* OVAs & Specials */}
                {franchiseTree.ovasAndSpecials.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                      <Sparkles size={14} className="text-pink-400" />
                      <span>Спешлы и OVA</span>
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {franchiseTree.ovasAndSpecials.map((item) => (
                        <div
                          key={item.id}
                          className="bg-[#121620] hover:bg-[#181E2B] p-2.5 rounded-2xl border border-white/5 flex items-center space-x-3 cursor-pointer group transition"
                        >
                          <img
                            src={item.poster || currentAnime.poster}
                            alt=""
                            className="w-12 h-16 rounded-xl object-cover shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider">
                              {item.kind.toUpperCase()}
                            </span>
                            <h4 className="text-xs font-bold text-white truncate group-hover:text-pink-300">
                              {item.titleRu}
                            </h4>
                            <span className="text-[11px] text-gray-400">★ {item.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-gray-500">Загрузка информации о франшизе...</div>
            )}
          </div>
        </div>

        {/* Right Column: Comments (Screenshot 2) */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <MessageSquare size={18} className="text-white" />
            <h3 className="text-lg font-bold text-white tracking-tight">Комментарии</h3>
          </div>

          <form onSubmit={handleAddComment} className="space-y-2">
            <textarea
              rows={3}
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Оставить комментарий..."
              className="w-full bg-[#121620] border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500/50 resize-none transition"
            />
            <p className="text-[10px] text-gray-500 leading-tight">
              Оставляя комментарий, Вы обязуетесь соблюдать Правила Сообщества
            </p>
            <button
              type="submit"
              className="w-full bg-[#1C2230] hover:bg-[#252D40] text-white text-xs font-bold py-2.5 rounded-2xl border border-white/10 transition"
            >
              Оставить комментарий
            </button>
          </form>

          {/* Comments list */}
          <div className="space-y-3 pt-2">
            {comments.map((c, i) => (
              <div key={i} className="bg-[#121620] p-3 rounded-2xl border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-gray-300">Анонимный зритель</span>
                  <span className="text-gray-500">только что</span>
                </div>
                <p className="text-xs text-gray-300">{c}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
