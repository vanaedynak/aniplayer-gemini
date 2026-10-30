import { create } from 'zustand';
import { AnimeEpisode, AnimeTitle, FranchiseTree, UserSettings, UserStats, WatchProgress } from '../types/anime';
import { StorageService } from '../services/storage';

export type ActiveView = 'home' | 'title_detail' | 'player' | 'profile' | 'categories' | 'manga' | 'collection' | 'leaderboard';
export type PlayerSourceType = 'anilibria' | 'alternative';

interface PlayerState {
  currentView: ActiveView;
  selectedAnime: AnimeTitle | null;
  currentEpisode: AnimeEpisode | null;
  activeVoiceover: string;
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
  openAnimeDetails: (anime: AnimeTitle) => void;
  startWatching: (anime: AnimeTitle, episodeOrdinal?: number, voiceover?: string) => void;
  playEpisode: (episode: AnimeEpisode) => void;
  setVoiceover: (voiceover: string, iframeUrl?: string) => void;
  setFranchiseTree: (tree: FranchiseTree | null) => void;
  saveProgress: (progress: WatchProgress) => void;
  refreshProgress: () => void;
  updateSettings: (patch: Partial<UserSettings>) => void;
  setTheme: (theme: 'animix' | 'cyber' | 'oled') => void;
  setSearchOpen: (open: boolean) => void;
  setUpdateAvailable: (update: any) => void;
}

const storage = StorageService.getInstance();

export const usePlayerStore = create<PlayerState>((set, get) => ({
  currentView: 'home',
  selectedAnime: null,
  currentEpisode: null,
  activeVoiceover: 'AniLibria',
  activeSource: 'anilibria',
  customIframeUrl: null,
  franchiseTree: null,
  recentProgress: storage.getRecentProgress(),
  userStats: storage.getUserStats(),
  settings: storage.getSettings(),
  isSearchOpen: false,
  updateAvailable: null,

  setView: (view) => set({ currentView: view }),

  openAnimeDetails: (anime) => {
    set({
      selectedAnime: anime,
      currentView: 'title_detail',
    });
  },

  startWatching: (anime, episodeOrdinal = 1, voiceover = 'AniLibria') => {
    let ep = anime.episodes.find((e) => e.ordinal === episodeOrdinal);
    if (!ep && anime.episodes.length > 0) {
      ep = anime.episodes[0];
    }
    if (!ep) {
      // Create a default episode structure
      ep = {
        id: `${anime.id}-${episodeOrdinal}`,
        ordinal: episodeOrdinal,
        title: `${episodeOrdinal} серия`,
        thumbnail: anime.poster,
      };
    }

    const isAl = voiceover === 'AniLibria' && (ep.hls?.fhd || ep.hls?.hd || ep.hls?.sd);

    set({
      selectedAnime: anime,
      currentEpisode: ep,
      currentView: 'player',
      activeVoiceover: voiceover,
      activeSource: isAl ? 'anilibria' : 'alternative',
    });
  },

  playEpisode: (episode) => {
    const { selectedAnime, activeVoiceover } = get();
    const isAl = activeVoiceover === 'AniLibria' && (episode.hls?.fhd || episode.hls?.hd || episode.hls?.sd);

    set({
      currentEpisode: episode,
      activeSource: isAl ? 'anilibria' : 'alternative',
    });

    if (selectedAnime) {
      storage.saveProgress({
        animeId: selectedAnime.id,
        animeTitle: selectedAnime.titleRu,
        animePoster: selectedAnime.poster,
        seasonNumber: 1,
        seasonLabel: selectedAnime.season || '1 сезон',
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

  setVoiceover: (voiceover, iframeUrl) => {
    const { currentEpisode } = get();
    const isAl = voiceover === 'AniLibria' && (currentEpisode?.hls?.fhd || currentEpisode?.hls?.hd);
    set({
      activeVoiceover: voiceover,
      activeSource: isAl ? 'anilibria' : 'alternative',
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
  },

  setTheme: (theme) => {
    const updated = storage.saveSettings({ theme });
    set({ settings: updated });
    // Update theme class on HTML element
    document.documentElement.classList.remove('theme-animix', 'theme-cyber', 'theme-oled');
    document.documentElement.classList.add(`theme-${theme}`);
  },

  setSearchOpen: (open) => set({ isSearchOpen: open }),

  setUpdateAvailable: (update) => set({ updateAvailable: update }),
}));
