import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { AniLibriaService } from '../services/anilibria';
import { ShikimoriService } from '../services/shikimori';
import { YummyAnimeService } from '../services/yummyanime';
import { StorageService } from '../services/storage';
import { AnimePoster } from './common/AnimePoster';
import {
  Play,
  ArrowLeft,
  Star,
  Bookmark,
  Calendar,
  Layers,
  Film,
  Sparkles,
  Tv,
  Check,
  ChevronDown,
} from 'lucide-react';
import { AnimeEpisode, AnimeStatus } from '../types/anime';

export const TitleDetailView: React.FC = () => {
  const {
    selectedAnime,
    setView,
    startWatching,
    franchiseTree,
    setFranchiseTree,
    openAnimeDetails,
  } = usePlayerStore();

  const [activeTab, setActiveTab] = useState<'episodes' | 'franchise'>('episodes');
  const [selectedSeason, setSelectedSeason] = useState<string>('Сезон 1');
  const [activeVoice, setActiveVoice] = useState<string>('AniLibria');
  const [voiceOptions, setVoiceOptions] = useState<{ name: string; iframeUrl?: string }[]>([
    { name: 'AniLibria (HLS UHD)' },
    { name: 'Studio Band (Дубляж)' },
    { name: 'AniDUB' },
    { name: 'Dream Cast' },
    { name: 'Субтитры' },
  ]);
  const [userListStatus, setUserListStatus] = useState<AnimeStatus | null>(null);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const anilibria = AniLibriaService.getInstance();
  const shikimori = ShikimoriService.getInstance();
  const yummy = YummyAnimeService.getInstance();
  const storage = StorageService.getInstance();

  useEffect(() => {
    if (!selectedAnime) return;

    // Check user's current list status
    const lists = storage.getUserLists();
    if (lists[String(selectedAnime.id)]) {
      setUserListStatus(lists[String(selectedAnime.id)].status);
    }

    // Load alternative voices from YummyAnime
    yummy
      .getAlternativePlayers(selectedAnime.titleRu, selectedAnime.titleEn, 1)
      .then((res) => {
        const voices = [
          { name: 'AniLibria' },
          ...res.voices.map((v) => ({ name: v.name, iframeUrl: v.iframeUrl })),
        ];
        setVoiceOptions(voices);
      });

    // Load full details & franchise from Shikimori
    if (!franchiseTree) {
      if (selectedAnime.shikimoriId) {
        shikimori.getFranchise(selectedAnime.shikimoriId).then(setFranchiseTree);
      } else {
        shikimori.search(selectedAnime.titleRu || selectedAnime.titleEn).then((res) => {
          if (res.length > 0 && res[0].shikimoriId) {
            shikimori.getFranchise(res[0].shikimoriId).then(setFranchiseTree);
          }
        });
      }
    }

    // Ensure episodes from AniLibria are fetched if not yet loaded
    if (selectedAnime.episodes.length === 0) {
      setLoading(true);
      anilibria
        .findReleaseEpisodes(selectedAnime.titleRu, selectedAnime.titleEn, selectedAnime.shikimoriId)
        .then(({ release, episodes }) => {
          setLoading(false);
          if (episodes.length > 0) {
            usePlayerStore.setState((state) => ({
              selectedAnime: state.selectedAnime
                ? {
                    ...state.selectedAnime,
                    hasAniLibria: true,
                    anilibriaCode: release?.anilibriaCode || state.selectedAnime.anilibriaCode,
                    episodes,
                  }
                : null,
            }));
          }
        })
        .catch(() => setLoading(false));
    }
  }, [selectedAnime?.id]);

  if (!selectedAnime) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Аниме не выбрано
      </div>
    );
  }

  const handleStatusChange = (status: AnimeStatus) => {
    setUserListStatus(status);
    storage.setAnimeListStatus(selectedAnime.id, status, selectedAnime.titleRu, selectedAnime.poster);
    setShowStatusMenu(false);
  };

  const handleStartPlay = () => {
    const selectedVoiceObj = voiceOptions.find((v) => v.name.includes(activeVoice) || activeVoice.includes(v.name));
    startWatching(selectedAnime, 1, activeVoice);
  };

  const totalEpisodesCount =
    selectedAnime.episodes.length > 0
      ? selectedAnime.episodes.length
      : selectedAnime.episodesTotal || selectedAnime.episodesAired || 12;

  const displayEpisodes: AnimeEpisode[] =
    selectedAnime.episodes.length > 0
      ? selectedAnime.episodes
      : Array.from({ length: totalEpisodesCount }, (_, i) => ({
          id: `${selectedAnime.id}-${i + 1}`,
          ordinal: i + 1,
          title: `${i + 1} серия`,
          thumbnail: selectedAnime.poster,
        }));

  return (
    <div className="flex-1 overflow-y-auto select-none">
      {/* Hero Backdrop Header */}
      <div className="relative w-full h-72 sm:h-80 overflow-hidden">
        <img
          src={selectedAnime.poster}
          alt=""
          className="w-full h-full object-cover scale-110 blur-2xl opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0E14] via-transparent to-[#0B0E14]" />

        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <button
            onClick={() => setView('home')}
            className="flex items-center space-x-2 bg-[#121620]/90 hover:bg-[#181E2B] backdrop-blur-md px-4 py-2 rounded-full border border-white/10 text-white text-xs font-bold transition shadow-lg"
          >
            <ArrowLeft size={16} />
            <span>Назад</span>
          </button>
        </div>
      </div>

      {/* Main Content Info Container */}
      <div className="max-w-6xl mx-auto px-6 -mt-36 relative z-20 space-y-8 pb-16">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* High-res Poster */}
          <div className="w-52 sm:w-64 aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl border-2 border-white/10 shrink-0 relative group bg-[#121620]">
            <AnimePoster
              src={selectedAnime.poster}
              alt={selectedAnime.titleRu}
              title={selectedAnime.titleRu}
              loading="eager"
            />
            {selectedAnime.hasAniLibria && (
              <span className="absolute top-3 left-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-neon">
                AniLibria HLS
              </span>
            )}
          </div>

          {/* Details & Actions */}
          <div className="flex-1 space-y-4">
            {/* Title & Original */}
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {selectedAnime.titleRu}
              </h1>
              <p className="text-sm text-gray-400 font-medium">
                {selectedAnime.titleEn} {selectedAnime.titleOriginal ? `· ${selectedAnime.titleOriginal}` : ''}
              </p>
            </div>

            {/* Badges Row */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-1 rounded-full flex items-center space-x-1">
                <Star size={13} className="fill-current" />
                <span>{selectedAnime.score ? selectedAnime.score.toFixed(1) : '8.5'}</span>
              </span>

              {selectedAnime.year && (
                <span className="bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center space-x-1">
                  <Calendar size={13} />
                  <span>{selectedAnime.year} г.</span>
                </span>
              )}

              <span className="bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold px-3 py-1 rounded-full">
                {selectedAnime.status === 'released' ? 'Завершён' : 'Онгоинг'}
              </span>

              {selectedAnime.episodesTotal ? (
                <span className="bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold px-3 py-1 rounded-full">
                  {selectedAnime.episodesTotal} серий
                </span>
              ) : null}
            </div>

            {/* Voiceover Selection Bar */}
            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Выбор озвучки:
              </label>
              <div className="flex flex-wrap gap-2">
                {voiceOptions.map((v) => {
                  const isSelected = activeVoice === v.name;
                  return (
                    <button
                      key={v.name}
                      onClick={() => setActiveVoice(v.name)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
                        isSelected
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-neon'
                          : 'bg-[#181E2B] text-gray-300 hover:bg-[#202738] hover:text-white border border-white/5'
                      }`}
                    >
                      {v.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={handleStartPlay}
                className="bg-white hover:bg-gray-100 text-[#0B0E14] font-black text-sm px-8 py-3 rounded-full flex items-center space-x-2 shadow-xl hover:scale-105 transition active:scale-95"
              >
                <Play size={18} className="fill-current" />
                <span>Смотреть</span>
              </button>

              {/* Status List Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className="bg-[#181E2B] hover:bg-[#202738] text-white border border-white/10 text-xs font-bold px-5 py-3 rounded-full flex items-center space-x-2 transition"
                >
                  <Bookmark size={16} className="text-violet-400" />
                  <span>
                    {userListStatus === 'watching'
                      ? 'В списке: Смотрю'
                      : userListStatus === 'planned'
                      ? 'В списке: В планах'
                      : userListStatus === 'completed'
                      ? 'В списке: Просмотрено'
                      : userListStatus === 'dropped'
                      ? 'В списке: Брошено'
                      : 'Добавить в список'}
                  </span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>

                {showStatusMenu && (
                  <div className="absolute left-0 mt-2 w-48 bg-[#121620] border border-white/10 rounded-2xl p-2 shadow-2xl z-40 space-y-1 text-xs font-semibold">
                    {[
                      { key: 'watching', label: 'Смотрю' },
                      { key: 'planned', label: 'В планах' },
                      { key: 'completed', label: 'Просмотрено' },
                      { key: 'dropped', label: 'Брошено' },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => handleStatusChange(item.key as AnimeStatus)}
                        className="w-full text-left px-3 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 flex items-center justify-between transition"
                      >
                        <span>{item.label}</span>
                        {userListStatus === item.key && <Check size={14} className="text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">
                Описание
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-normal">
                {selectedAnime.description || 'Описание временно недоступно.'}
              </p>
            </div>

            {/* Genres pills */}
            {selectedAnime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {selectedAnime.genres.map((g) => (
                  <span
                    key={g}
                    className="bg-white/5 border border-white/5 text-[11px] font-semibold text-gray-400 px-3 py-1 rounded-full"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Tabs: Episodes & Franchise */}
        <div className="space-y-6 pt-6 border-t border-white/5">
          <div className="flex items-center space-x-4 border-b border-white/5 pb-2">
            <button
              onClick={() => setActiveTab('episodes')}
              className={`text-sm font-bold pb-2 transition flex items-center space-x-2 border-b-2 ${
                activeTab === 'episodes'
                  ? 'border-violet-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Tv size={16} />
              <span>Список серий ({displayEpisodes.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('franchise')}
              className={`text-sm font-bold pb-2 transition flex items-center space-x-2 border-b-2 ${
                activeTab === 'franchise'
                  ? 'border-violet-500 text-white'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <Layers size={16} />
              <span>Франшиза и хронология</span>
            </button>
          </div>

          {/* Episodes Tab Content */}
          {activeTab === 'episodes' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {displayEpisodes.map((ep) => (
                  <div
                    key={ep.id}
                    onClick={() => startWatching(selectedAnime, ep.ordinal, activeVoice)}
                    className="bg-[#121620] hover:bg-[#181E2B] rounded-2xl overflow-hidden cursor-pointer group transition border border-white/5 hover:border-violet-500/40 hover:shadow-card flex flex-col"
                  >
                    <div className="relative aspect-video overflow-hidden bg-black/40">
                      <AnimePoster
                        src={ep.thumbnail || selectedAnime.poster}
                        alt={ep.title}
                        title={ep.title}
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-9 h-9 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-neon">
                          <Play size={16} className="fill-current ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <div className="p-2.5">
                      <span className="text-xs font-bold text-white block truncate">
                        {ep.title || `${ep.ordinal} серия`}
                      </span>
                      <span className="text-[10px] text-gray-400">Серия {ep.ordinal}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Franchise Tab Content */}
          {activeTab === 'franchise' && (
            <div className="space-y-6">
              {franchiseTree ? (
                <div className="space-y-6">
                  {/* Main Seasons */}
                  {franchiseTree.mainSeasons.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center space-x-1.5">
                        <Tv size={15} />
                        <span>Основные сезоны по порядку</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {franchiseTree.mainSeasons.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              shikimori.getAnimeDetails(item.id).then((d) => {
                                if (d) openAnimeDetails(d);
                              });
                            }}
                            className="bg-[#121620] hover:bg-[#181E2B] p-3 rounded-2xl border border-white/5 flex items-center space-x-3 cursor-pointer group transition hover:border-violet-500/30"
                          >
                            <img
                              src={item.poster || selectedAnime.poster}
                              alt=""
                              className="w-14 h-20 rounded-xl object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-violet-400 uppercase tracking-wider block">
                                {item.seasonLabel}
                              </span>
                              <h5 className="text-xs font-bold text-white truncate group-hover:text-violet-300">
                                {item.titleRu}
                              </h5>
                              <span className="text-[11px] text-gray-400 block">
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
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center space-x-1.5">
                        <Film size={15} />
                        <span>Фильмы</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {franchiseTree.movies.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              shikimori.getAnimeDetails(item.id).then((d) => {
                                if (d) openAnimeDetails(d);
                              });
                            }}
                            className="bg-[#121620] hover:bg-[#181E2B] p-3 rounded-2xl border border-white/5 flex items-center space-x-3 cursor-pointer group transition hover:border-amber-500/30"
                          >
                            <img
                              src={item.poster || selectedAnime.poster}
                              alt=""
                              className="w-14 h-20 rounded-xl object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                                Фильм
                              </span>
                              <h5 className="text-xs font-bold text-white truncate group-hover:text-amber-300">
                                {item.titleRu}
                              </h5>
                              <span className="text-[11px] text-gray-400 block">
                                {item.year || ''} · ★ {item.score}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* OVAs and Specials */}
                  {franchiseTree.ovasAndSpecials.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center space-x-1.5">
                        <Sparkles size={15} />
                        <span>Спешлы и OVA</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {franchiseTree.ovasAndSpecials.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              shikimori.getAnimeDetails(item.id).then((d) => {
                                if (d) openAnimeDetails(d);
                              });
                            }}
                            className="bg-[#121620] hover:bg-[#181E2B] p-3 rounded-2xl border border-white/5 flex items-center space-x-3 cursor-pointer group transition hover:border-pink-500/30"
                          >
                            <img
                              src={item.poster || selectedAnime.poster}
                              alt=""
                              className="w-14 h-20 rounded-xl object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-pink-400 uppercase tracking-wider block">
                                {item.kind.toUpperCase()}
                              </span>
                              <h5 className="text-xs font-bold text-white truncate group-hover:text-pink-300">
                                {item.titleRu}
                              </h5>
                              <span className="text-[11px] text-gray-400 block">★ {item.score}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Spin-offs */}
                  {franchiseTree.spinOffs.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center space-x-1.5">
                        <Layers size={15} />
                        <span>Спин-оффы и ответвления</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {franchiseTree.spinOffs.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => {
                              shikimori.getAnimeDetails(item.id).then((d) => {
                                if (d) openAnimeDetails(d);
                              });
                            }}
                            className="bg-[#121620] hover:bg-[#181E2B] p-3 rounded-2xl border border-white/5 flex items-center space-x-3 cursor-pointer group transition hover:border-cyan-500/30"
                          >
                            <img
                              src={item.poster || selectedAnime.poster}
                              alt=""
                              className="w-14 h-20 rounded-xl object-cover shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                                Спин-офф
                              </span>
                              <h5 className="text-xs font-bold text-white truncate group-hover:text-cyan-300">
                                {item.titleRu}
                              </h5>
                              <span className="text-[11px] text-gray-400 block">★ {item.score}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-gray-500 py-6 text-center">Загрузка информации о франшизе...</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
