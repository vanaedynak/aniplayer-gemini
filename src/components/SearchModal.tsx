import React, { useState, useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { ShikimoriService } from '../services/shikimori';
import { AniLibriaService } from '../services/anilibria';
import { AnimeTitle } from '../types/anime';
import { Search, X, Sparkles, Film, Star } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setSearchOpen, openAnime, setFranchiseTree } = usePlayerStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<AnimeTitle[]>([]);
  const [loading, setLoading] = useState(false);

  const shikimori = ShikimoriService.getInstance();
  const anilibria = AniLibriaService.getInstance();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);

      try {
        // Query both Shikimori and AniLibria concurrently
        const [shikiResults, anilibriaResults] = await Promise.all([
          shikimori.search(query),
          anilibria.search(query),
        ]);

        // Merge results: match AniLibria items by titles
        const merged: AnimeTitle[] = [];

        // Add AniLibria results first
        for (const al of anilibriaResults) {
          merged.push({ ...al, hasAniLibria: true });
        }

        // Add Shikimori results, marking whether AniLibria has them
        for (const sh of shikiResults) {
          const alreadyInList = merged.some(
            (m) =>
              m.titleRu.toLowerCase() === sh.titleRu.toLowerCase() ||
              (m.titleEn && sh.titleEn && m.titleEn.toLowerCase() === sh.titleEn.toLowerCase())
          );

          if (!alreadyInList) {
            // Check if any AniLibria result matches this shikimori anime
            const matchedAl = anilibriaResults.find(
              (al) =>
                al.titleRu.toLowerCase().includes(sh.titleRu.toLowerCase()) ||
                (sh.titleEn && al.titleEn.toLowerCase().includes(sh.titleEn.toLowerCase()))
            );

            merged.push({
              ...sh,
              hasAniLibria: !!matchedAl,
              anilibriaCode: matchedAl?.anilibriaCode,
              episodes: matchedAl?.episodes || [],
            });
          }
        }

        setResults(merged);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isSearchOpen) return null;

  const handleSelectAnime = async (anime: AnimeTitle) => {
    setSearchOpen(false);

    // If it has anilibriaCode or ID, fetch full episodes
    let readyAnime = anime;
    if (anime.anilibriaCode) {
      const fullAl = await anilibria.getTitleByCode(anime.anilibriaCode);
      if (fullAl) readyAnime = fullAl;
    } else if (anime.hasAniLibria && anime.id) {
      const fullAl = await anilibria.getTitleById(anime.id);
      if (fullAl) readyAnime = fullAl;
    }

    // Load franchise tree from Shikimori
    if (anime.shikimoriId) {
      shikimori.getFranchise(anime.shikimoriId).then(setFranchiseTree);
    } else {
      shikimori.search(anime.titleRu || anime.titleEn).then((res) => {
        if (res.length > 0 && res[0].shikimoriId) {
          shikimori.getFranchise(res[0].shikimoriId).then(setFranchiseTree);
        }
      });
    }

    openAnime(readyAnime);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-start justify-center pt-16 px-4 animate-fade-in">
      <div className="bg-[#121620] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-white/5 flex items-center space-x-3">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск аниме по-русски или по-английски (напр. «атака титанов», «bleach»)..."
            className="flex-1 bg-transparent text-white placeholder-gray-500 text-sm focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} className="text-gray-400 hover:text-white p-1">
              <X size={16} />
            </button>
          )}
          <button
            onClick={() => setSearchOpen(false)}
            className="text-xs font-semibold text-gray-400 hover:text-white px-2 py-1 bg-white/5 rounded-lg transition"
          >
            Esc
          </button>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {loading && (
            <div className="text-center py-8 text-xs text-gray-400">
              Поиск по базам Shikimori и AniLibria...
            </div>
          )}

          {!loading && query && results.length === 0 && (
            <div className="text-center py-8 text-xs text-gray-400">
              Ничего не найдено по запросу «{query}»
            </div>
          )}

          {!query && (
            <div className="py-6 text-center space-y-2 text-xs text-gray-500">
              <p>Популярные запросы: «Блич», «Атака титанов», «Наруто», «Магическая битва»</p>
            </div>
          )}

          {results.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelectAnime(item)}
              className="bg-[#181E2B] hover:bg-[#202738] p-3 rounded-2xl flex items-center space-x-3 cursor-pointer group transition border border-white/5 hover:border-violet-500/30"
            >
              <img
                src={item.poster}
                alt=""
                className="w-12 h-16 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-bold text-white truncate group-hover:text-violet-300">
                    {item.titleRu}
                  </h4>
                  {item.hasAniLibria && (
                    <span className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 shadow-neon">
                      AniLibria
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">{item.titleEn}</p>
                <div className="flex items-center space-x-3 text-[11px] text-gray-400 pt-0.5">
                  {item.year && <span>{item.year} г.</span>}
                  {item.episodesTotal ? <span>{item.episodesTotal} эп.</span> : null}
                  <span className="flex items-center space-x-1 text-amber-400 font-semibold">
                    <Star size={12} className="fill-current" />
                    <span>{item.score?.toFixed(1) || '8.0'}</span>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
