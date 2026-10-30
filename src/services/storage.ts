import { AnimeStatus, UserSettings, UserStats, WatchProgress } from '../types/anime';

const STORAGE_KEYS = {
  PROGRESS: 'aniplayer_watch_progress_v2',
  LISTS: 'aniplayer_user_lists_v2',
  SETTINGS: 'aniplayer_user_settings_v2',
};

const DEFAULT_SETTINGS: UserSettings = {
  uiScale: 1.0,
  theme: 'animix',
  activeAvatarFrame: 'neon-purple',
  autoSkipOpening: true,
  autoNextEpisode: true,
  preferredQuality: 'fhd',
  volume: 0.8,
};

export class StorageService {
  private static instance: StorageService;

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  public getRecentProgress(): WatchProgress[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (!raw) return [];
      const list: WatchProgress[] = JSON.parse(raw);
      return list.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch {
      return [];
    }
  }

  public getProgress(animeId: string | number, episodeNumber: number): WatchProgress | null {
    const list = this.getRecentProgress();
    return list.find((p) => String(p.animeId) === String(animeId) && p.episodeNumber === episodeNumber) || null;
  }

  public saveProgress(progress: WatchProgress) {
    const list = this.getRecentProgress();
    const index = list.findIndex(
      (p) => String(p.animeId) === String(progress.animeId) && p.episodeNumber === progress.episodeNumber
    );

    if (index >= 0) {
      list[index] = { ...progress, updatedAt: Date.now() };
    } else {
      list.unshift({ ...progress, updatedAt: Date.now() });
    }

    // Keep up to 60 items in history
    const trimmed = list.slice(0, 60);
    localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(trimmed));
  }

  public clearHistory() {
    localStorage.removeItem(STORAGE_KEYS.PROGRESS);
  }

  public getUserLists(): Record<string, { status: AnimeStatus; title: string; poster: string; updatedAt: number }> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LISTS);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  public setAnimeListStatus(animeId: string | number, status: AnimeStatus, title: string, poster: string) {
    const lists = this.getUserLists();
    lists[String(animeId)] = { status, title, poster, updatedAt: Date.now() };
    localStorage.setItem(STORAGE_KEYS.LISTS, JSON.stringify(lists));
  }

  public getUserStats(): UserStats {
    const progress = this.getRecentProgress();
    const lists = this.getUserLists();

    let totalSeconds = 0;
    let completedEpisodes = 0;

    for (const p of progress) {
      totalSeconds += p.currentTime || 0;
      if (p.completed || (p.currentTime > 0 && p.duration > 0 && p.currentTime >= p.duration * 0.85)) {
        completedEpisodes++;
      }
    }

    const hoursWatched = +(totalSeconds / 3600).toFixed(1);
    const listValues = Object.values(lists);

    return {
      totalHoursWatched: hoursWatched,
      totalEpisodesWatched: completedEpisodes,
      weeklyHoursWatched: +(hoursWatched * 0.4).toFixed(1),
      friendsCount: 0,
      statusCounts: {
        watching: listValues.filter((i) => i.status === 'watching').length,
        planned: listValues.filter((i) => i.status === 'planned').length,
        completed: listValues.filter((i) => i.status === 'completed').length,
        dropped: listValues.filter((i) => i.status === 'dropped').length,
        hold: listValues.filter((i) => i.status === 'hold').length,
      },
    };
  }

  public getSettings(): UserSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public saveSettings(patch: Partial<UserSettings>): UserSettings {
    const current = this.getSettings();
    const updated = { ...current, ...patch };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }
}
