export type AnimeStatus = 'watching' | 'planned' | 'completed' | 'dropped' | 'hold';

export interface AnimeEpisode {
  id: string | number;
  ordinal: number;
  title: string;
  thumbnail?: string;
  duration?: number;
  hls?: {
    fhd?: string;
    hd?: string;
    sd?: string;
  };
  skips?: {
    opening?: [number, number];
    ending?: [number, number];
  };
}

export interface AnimeTitle {
  id: string | number;
  shikimoriId?: number;
  anilibriaCode?: string;
  titleRu: string;
  titleEn: string;
  titleOriginal?: string;
  poster: string;
  banner?: string;
  description: string;
  score: number;
  year?: number;
  season?: string;
  genres: string[];
  episodesTotal?: number;
  episodesAired?: number;
  status: string; // 'released' | 'ongoing'
  hasAniLibria: boolean;
  episodes: AnimeEpisode[];
}

export type FranchiseCategory = 'main' | 'movie' | 'ova' | 'spinoff';

export interface FranchiseItem {
  id: number;
  titleRu: string;
  titleEn: string;
  year?: number;
  kind: string; // 'tv' | 'movie' | 'ova' | 'special' | 'ona'
  episodes?: number;
  poster: string;
  score: number;
  category: FranchiseCategory;
  seasonLabel: string; // e.g. "Сезон 1 (366 серий)", "Сезон 2 · Часть 1"
  order: number;
}

export interface FranchiseTree {
  mainSeasons: FranchiseItem[];
  movies: FranchiseItem[];
  ovasAndSpecials: FranchiseItem[];
  spinOffs: FranchiseItem[];
}

export interface WatchProgress {
  animeId: string | number;
  animeTitle: string;
  animePoster: string;
  seasonNumber: number;
  seasonLabel?: string;
  episodeNumber: number;
  currentTime: number;
  duration: number;
  completed: boolean;
  updatedAt: number;
}

export interface UserStats {
  totalHoursWatched: number;
  totalEpisodesWatched: number;
  weeklyHoursWatched: number;
  friendsCount: number;
  statusCounts: {
    watching: number;
    planned: number;
    completed: number;
    dropped: number;
    hold: number;
  };
}

export interface UserSettings {
  uiScale: number; // 0.8 - 1.2
  theme: 'animix' | 'cyber' | 'oled';
  activeAvatarFrame: string;
  autoSkipOpening: boolean;
  autoNextEpisode: boolean;
  preferredQuality: 'fhd' | 'hd' | 'sd';
  volume: number;
}
