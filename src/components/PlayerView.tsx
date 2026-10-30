import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { AnimixPlayer } from './player/AnimixPlayer';
import { YummyAnimeService } from '../services/yummyanime';
import { AnimePoster } from './common/AnimePoster';
import { ArrowLeft, SkipBack, SkipForward, Mic, Info } from 'lucide-react';
import { AnimeEpisode } from '../types/anime';

export const PlayerView: React.FC = () => {
  const {
    selectedAnime,
    currentEpisode,
    playEpisode,
    activeVoiceover,
    setVoiceover,
    activeSource,
    customIframeUrl,
    setView,
  } = usePlayerStore();

  const [voiceOptions, setVoiceOptions] = useState<{ name: string; iframeUrl?: string }[]>([
    { name: 'AniLibria' },
    { name: 'Studio Band (Дубляж)' },
    { name: 'AniDUB' },
    { name: 'Dream Cast' },
    { name: 'Субтитры' },
  ]);

  const yummy = YummyAnimeService.getInstance();

  useEffect(() => {
    if (selectedAnime) {
      yummy
        .getAlternativePlayers(selectedAnime.titleRu, selectedAnime.titleEn, currentEpisode?.ordinal || 1)
        .then((res) => {
          const list = [
            { name: 'AniLibria' },
            ...res.voices.map((v) => ({ name: v.name, iframeUrl: v.iframeUrl })),
          ];
          setVoiceOptions(list);
        });
    }
  }, [selectedAnime?.id, currentEpisode?.ordinal]);

  if (!selectedAnime || !currentEpisode) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Серия не выбрана
      </div>
    );
  }

  const totalEpisodesCount =
    selectedAnime.episodes.length > 0
      ? selectedAnime.episodes.length
      : selectedAnime.episodesTotal || selectedAnime.episodesAired || 12;

  const episodesList: AnimeEpisode[] =
    selectedAnime.episodes.length > 0
      ? selectedAnime.episodes
      : Array.from({ length: totalEpisodesCount }, (_, i) => ({
          id: `${selectedAnime.id}-${i + 1}`,
          ordinal: i + 1,
          title: `${i + 1} серия`,
          thumbnail: selectedAnime.poster,
        }));

  const handleNextEpisode = () => {
    const next = episodesList.find((e) => e.ordinal === currentEpisode.ordinal + 1);
    if (next) {
      playEpisode(next);
    }
  };

  const handlePrevEpisode = () => {
    const prev = episodesList.find((e) => e.ordinal === currentEpisode.ordinal - 1);
    if (prev) {
      playEpisode(prev);
    }
  };

  const hasNext = episodesList.some((e) => e.ordinal === currentEpisode.ordinal + 1);
  const hasPrev = episodesList.some((e) => e.ordinal === currentEpisode.ordinal - 1);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 select-none max-w-6xl mx-auto w-full">
      {/* Top Bar: Return to Title + Info */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setView('title_detail')}
          className="flex items-center space-x-2 bg-[#121620] hover:bg-[#181E2B] px-4 py-2 rounded-full border border-white/10 text-white text-xs font-bold transition shadow"
        >
          <ArrowLeft size={16} />
          <span>К описанию тайтла</span>
        </button>

        <div className="text-right">
          <span className="text-sm font-bold text-white block truncate max-w-md">
            {selectedAnime.titleRu}
          </span>
          <span className="text-xs text-gray-400">
            {currentEpisode.title || `Серия ${currentEpisode.ordinal}`}
          </span>
        </div>
      </div>

      {/* Video Player Box */}
      <div className="w-full space-y-4">
        {activeSource === 'anilibria' && currentEpisode.hls ? (
          <AnimixPlayer
            episode={currentEpisode}
            anime={selectedAnime}
            onNextEpisode={handleNextEpisode}
            hasNext={hasNext}
          />
        ) : (
          <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <iframe
              src={
                customIframeUrl ||
                voiceOptions.find((v) => v.name === activeVoiceover)?.iframeUrl ||
                voiceOptions[1]?.iframeUrl ||
                'about:blank'
              }
              className="w-full h-full border-0"
              allowFullScreen
              title="Player"
            />
          </div>
        )}

        {/* Player Navigation & Voiceover Bar */}
        <div className="bg-[#121620] p-4 rounded-3xl border border-white/5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Episode navigation buttons */}
            <div className="flex items-center space-x-2">
              <button
                disabled={!hasPrev}
                onClick={handlePrevEpisode}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
                  hasPrev
                    ? 'bg-[#181E2B] hover:bg-[#202738] text-white border border-white/10'
                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                }`}
              >
                <SkipBack size={15} />
                <span>Предыдущая</span>
              </button>

              <button
                disabled={!hasNext}
                onClick={handleNextEpisode}
                className={`flex items-center space-x-1.5 px-4 py-2 rounded-full text-xs font-bold transition ${
                  hasNext
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-neon'
                    : 'bg-white/5 text-gray-500 cursor-not-allowed'
                }`}
              >
                <span>Следующая</span>
                <SkipForward size={15} />
              </button>
            </div>

            {/* Current Source Badge */}
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                {activeSource === 'anilibria'
                  ? 'AniLibria HLS (UHD Плеер)'
                  : `${activeVoiceover} (Альтернативный плеер)`}
              </span>
            </div>
          </div>

          {/* Voiceover Selector Chips */}
          <div className="pt-2 border-t border-white/5 space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
              <Mic size={14} className="text-violet-400" />
              <span>Выбор озвучки:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {voiceOptions.map((v) => {
                const isSelected = activeVoiceover === v.name;
                return (
                  <button
                    key={v.name}
                    onClick={() => setVoiceover(v.name, v.iframeUrl)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                      isSelected
                        ? 'bg-violet-600 text-white shadow-neon'
                        : 'bg-[#181E2B] text-gray-300 hover:bg-[#202738] hover:text-white border border-white/5'
                    }`}
                  >
                    {v.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Episode Carousel / Grid Below Player */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Все серии ({episodesList.length})
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {episodesList.map((ep) => {
            const isCurrent = ep.ordinal === currentEpisode.ordinal;
            return (
              <div
                key={ep.id}
                onClick={() => playEpisode(ep)}
                className={`p-2 rounded-2xl cursor-pointer transition border flex flex-col space-y-1.5 ${
                  isCurrent
                    ? 'bg-violet-600/20 border-violet-500 shadow-neon ring-1 ring-violet-500'
                    : 'bg-[#121620] hover:bg-[#181E2B] border-white/5'
                }`}
              >
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black/40">
                  <AnimePoster
                    src={ep.thumbnail || selectedAnime.poster}
                    alt={ep.title}
                    title={ep.title}
                  />
                  {isCurrent && (
                    <div className="absolute inset-0 bg-violet-600/40 flex items-center justify-center font-bold text-xs text-white">
                      Сейчас играет
                    </div>
                  )}
                </div>
                <span className="text-xs font-bold text-white truncate">
                  {ep.title || `${ep.ordinal} серия`}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
