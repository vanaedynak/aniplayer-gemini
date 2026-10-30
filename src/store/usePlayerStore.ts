import { create } from 'zustand';
import { AnimeEpisode, AnimeTitle, FranchiseTree, UserSettings, UserStats, WatchProgress } from '../types/anime';
import { StorageService } from '../services/storage';

export type ActiveView = 'home' | 'player' | 'profile' | 'categories' | 'manga' | 'collection' | 'leaderboard';
export type PlayerSourceType = 'anilibria' | 'animixlite' | 'iframe';

interface PlayerState {
  currentView: ActiveView;
  currentAnime: AnimeTitle | null;
  currentEpisode: AnimeEpisode | null;
  activeSource: PlayerSourceType;
  customIframeUrl: string | null;
  franchiseTree: FranchiseTree | null;
  recentProgress: WatchProgress[];
  userStats: UserStats;
  settings: UserSettings;
  isSearchOpen: boolean;
  updateAvailable: { version: string; url: string; notes: string; downloadUrl?: string } | null;

  // Actions
  setView: (view: ActiveView) => void;
  openAnime: (anime: AnimeTitle, episodeOrdinal?: number) => void;
  playEpisode: (episode: AnimeEpisode) => void;
  setPlayerSource: (source: PlayerSourceType, iframeUrl?: string) => void;
  setFranchiseTree: (tree: FranchiseTree | null) => void;
  saveProgress: (progress: WatchProgress) => void;
  refreshProgress: () => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  setSearchOpen: (open: boolean) => void;
  setUpdateAvailable: (update: any) => void;
}

const storage = StorageService.getInstance();

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentView: 'home',
  currentAnime: null,
  currentEpisode: null,
  activeSource: 'anilibria',
  customIframeUrl: null,
  franchiseTree: null,
  recentProgress: storage.getRecentProgress(),
  userStats: storage.getUserStats(),
  settings: storage.getSettings(),
  isSearchOpen: false,
  updateAvailable: null,

  setView: (view) => set({ currentView: view }),

  openAnime: (anime, episodeOrdinal = 1) => {
    let ep = anime.episodes.find((e) => e.ordinal === episodeOrdinal);
    if (!ep && anime.episodes.length > 0) {
      ep = anime.episodes[0];
    }

    set({
      currentAnime: anime,
      currentEpisode: ep || null,
      currentView: 'player',
      activeSource: ep?.hls ? 'anilibria' : 'iframe',
    });
  },

  playEpisode: (episode) => {
    const { currentAnime } = get();
    set({
      currentEpisode: episode,
      activeSource: episode.hls ? 'anilibria' : 'iframe',
    });

    if (currentAnime) {
      storage.saveProgress({
        animeId: currentAnime.id,
        animeTitle: currentAnime.titleRu,
        animePoster: currentAnime.poster,
        seasonNumber: 1,
        seasonLabel: currentAnime.season || '1 сезон',
        episodeNumber: episode.ordinal,
        currentTime: 0,
        duration: 1440,
        completed: false,
        updatedAt: Date.now(),
      });
      set({
        recentProgress: storage.getRecentProgress(),
        userStats: storage.getUserStats(),
      });
    }
  },

  setPlayerSource: (source, iframeUrl) => {
    set({
      activeSource: source,
      customIframeUrl: iframeUrl || null,
    });
  },

  setFranchiseTree: (tree) => set({ franchiseTree: tree }),

  saveProgress: (progress) => {
    storage.saveProgress(progress);
    set({
      recentProgress: storage.getRecentProgress(),
      userStats: storage.getUserStats(),
    });
  },

  refreshProgress: () => {
    set({
      recentProgress: storage.getRecentProgress(),
      userStats: storage.getUserStats(),
    });
  },

  updateSettings: (patch) => {
    const updated = storage.saveSettings(patch);
    set({ settings: updated });
    // Apply UI scaling dynamically
    if (patch.uiScale) {
      document.documentElement.style.setProperty('--ui-scale', String(patch.uiScale));
    }
  },

  setSearchOpen: (open) => set({ isSearchOpen: open }),

  setUpdateAvailable: (update) => set({ updateAvailable: update }),
}));
