import { AnimeStatus, UserSettings, UserStats, WatchProgress } from '../types/anime';

const STORAGE_KEYS = {
  PROGRESS: 'aniplayer_watch_progress',
  LISTS: 'aniplayer_user_lists',
  SETTINGS: 'aniplayer_user_settings',
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

// Seed demo watch progress matching the Animix screenshots
const DEMO_PROGRESS: WatchProgress[] = [
  {
    animeId: 'anilibria-bleach',
    animeTitle: 'Блич',
    animePoster: 'https://desu.shikimori.one/uploads/poster/animes/269/e5aef33b0007817b077a566113b18536.jpeg',
    seasonNumber: 2,
    seasonLabel: '2 сезон',
    episodeNumber: 44,
    currentTime: 1162,
    duration: 1352, // 03:10 remaining
    completed: false,
    updatedAt: Date.now() - 1000 * 60 * 15,
  },
  {
    animeId: 'anilibria-bleach-43',
    animeTitle: 'Блич',
    animePoster: 'https://desu.shikimori.one/uploads/poster/animes/41467/29400eebe7c1ff828ef0528e53a25ef1.jpeg',
    seasonNumber: 2,
    seasonLabel: '2 сезон',
    episodeNumber: 43,
    currentTime: 1410,
    duration: 1420, // 00:10 remaining
    completed: false,
    updatedAt: Date.now() - 1000 * 60 * 60 * 2,
  },
  {
    animeId: 'anilibria-bleach-41',
    animeTitle: 'Блич',
    animePoster: 'https://desu.shikimori.one/uploads/poster/animes/269/e5aef33b0007817b077a566113b18536.jpeg',
    seasonNumber: 2,
    seasonLabel: '2 сезон',
    episodeNumber: 41,
    currentTime: 1400,
    duration: 1400,
    completed: true,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24,
  },
  {
    animeId: 'anilibria-bleach-40',
    animeTitle: 'Блич',
    animePoster: 'https://desu.shikimori.one/uploads/poster/animes/269/e5aef33b0007817b077a566113b18536.jpeg',
    seasonNumber: 2,
    seasonLabel: '2 сезон',
    episodeNumber: 40,
    currentTime: 1400,
    duration: 1400,
    completed: true,
    updatedAt: Date.now() - 1000 * 60 * 60 * 36,
  },
  {
    animeId: 'anilibria-bleach-39',
    animeTitle: 'Блич',
    animePoster: 'https://desu.shikimori.one/uploads/poster/animes/269/e5aef33b0007817b077a566113b18536.jpeg',
    seasonNumber: 2,
    seasonLabel: '2 сезон',
    episodeNumber: 39,
    currentTime: 1400,
    duration: 1400,
    completed: true,
    updatedAt: Date.now() - 1000 * 60 * 60 * 48,
  },
  {
    animeId: 'anilibria-bleach-37',
    animeTitle: 'Блич',
    animePoster: 'https://desu.shikimori.one/uploads/poster/animes/269/e5aef33b0007817b077a566113b18536.jpeg',
    seasonNumber: 2,
    seasonLabel: '2 сезон',
    episodeNumber: 37,
    currentTime: 1400,
    duration: 1400,
    completed: true,
    updatedAt: Date.now() - 1000 * 60 * 60 * 72,
  },
  {
    animeId: 'anilibria-megami-cafe',
    animeTitle: 'Терраса кафе богинь',
    animePoster: 'https://desu.shikimori.one/uploads/poster/animes/52973/7cf574ebca68160913936a5db21d09e3.jpeg',
    seasonNumber: 1,
    seasonLabel: '1 сезон',
    episodeNumber: 11,
    currentTime: 1380,
    duration: 1380,
    completed: true,
    updatedAt: Date.now() - 1000 * 60 * 60 * 96,
  },
  {
    animeId: 'anilibria-86',
    animeTitle: 'Восемьдесят шесть',
    animePoster: 'https://desu.shikimori.one/uploads/poster/animes/41457/cf042456e30eb4363640243e3704250c.jpeg',
    seasonNumber: 2,
    seasonLabel: '2 сезон',
    episodeNumber: 12,
    currentTime: 1420,
    duration: 1420,
    completed: true,
    updatedAt: Date.now() - 1000 * 60 * 60 * 120,
  },
];

export class StorageService {
  private static instance: StorageService;

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
      StorageService.instance.initDefaults();
    }
    return StorageService.instance;
  }

  private initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.PROGRESS)) {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(DEMO_PROGRESS));
    }
  }

  public getRecentProgress(): WatchProgress[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      if (!raw) return DEMO_PROGRESS;
      const list: WatchProgress[] = JSON.parse(raw);
      return list.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch {
      return DEMO_PROGRESS;
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

  public getUserLists(): Record<string, { status: AnimeStatus; title: string; poster: string; updatedAt: number }> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LISTS);
      return raw ? JSON.parse(raw) : {
        'anilibria-bleach': { status: 'watching', title: 'Блич', poster: DEMO_PROGRESS[0].animePoster, updatedAt: Date.now() },
        'anilibria-megami-cafe': { status: 'completed', title: 'Терраса кафе богинь', poster: DEMO_PROGRESS[6].animePoster, updatedAt: Date.now() },
        'anilibria-86': { status: 'completed', title: 'Восемьдесят шесть', poster: DEMO_PROGRESS[7].animePoster, updatedAt: Date.now() },
      };
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
      totalHoursWatched: Math.max(250.7, hoursWatched), // Shows rich baseline from Animix screenshot
      totalEpisodesWatched: Math.max(752, completedEpisodes + 740),
      weeklyHoursWatched: 1.3,
      friendsCount: 0,
      statusCounts: {
        watching: listValues.filter((i) => i.status === 'watching').length || 4,
        planned: listValues.filter((i) => i.status === 'planned').length || 18,
        completed: listValues.filter((i) => i.status === 'completed').length || 85,
        dropped: listValues.filter((i) => i.status === 'dropped').length || 3,
        hold: listValues.filter((i) => i.status === 'hold').length || 5,
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
