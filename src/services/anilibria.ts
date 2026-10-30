import { AnimeEpisode, AnimeTitle } from '../types/anime';

const ANILIBRIA_API_V1 = 'https://anilibria.top/api/v1';
const ANILIBRIA_STATIC = 'https://anilibria.top';

export class AniLibriaService {
  private static instance: AniLibriaService;

  public static getInstance(): AniLibriaService {
    if (!AniLibriaService.instance) {
      AniLibriaService.instance = new AniLibriaService();
    }
    return AniLibriaService.instance;
  }

  public async search(query: string): Promise<AnimeTitle[]> {
    if (!query || query.trim().length === 0) return [];
    try {
      const url = `${ANILIBRIA_API_V1}/app/search/releases?query=${encodeURIComponent(query.trim())}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const list = await res.json();
      if (!Array.isArray(list)) return [];

      return list.map((item: any) => this.mapV1Release(item));
    } catch (err) {
      console.error('AniLibria search error:', err);
      return [];
    }
  }

  public async getSchedule(): Promise<{ day: number; titles: AnimeTitle[] }[]> {
    try {
      const url = `${ANILIBRIA_API_V1}/anime/schedule/week`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      if (!Array.isArray(data)) return [];

      // Group releases by day of week (publish_day.value 1..7)
      const dayMap: { [day: number]: AnimeTitle[] } = {
        0: [], 1: [], 2: [], 3: [], 4: [], 5: [], 6: [],
      };

      for (const item of data) {
        const release = item.release || item;
        const mapped = this.mapV1Release(release);
        // Map 1-7 (Mon-Sun) to 0-6
        const dayVal = release.publish_day?.value ? (release.publish_day.value - 1) % 7 : 0;
        dayMap[dayVal].push(mapped);
      }

      return Object.keys(dayMap).map((d) => ({
        day: Number(d),
        titles: dayMap[Number(d)],
      }));
    } catch (err) {
      console.error('AniLibria getSchedule error:', err);
      return [];
    }
  }

  public async getTitleByAlias(alias: string): Promise<AnimeTitle | null> {
    try {
      const url = `${ANILIBRIA_API_V1}/anime/releases/${encodeURIComponent(alias)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      const data = await res.json();
      return this.mapV1Release(data);
    } catch (err) {
      console.error('AniLibria getTitleByAlias error:', err);
      return null;
    }
  }

  public async getTitleById(id: number | string): Promise<AnimeTitle | null> {
    return this.getTitleByAlias(String(id));
  }

  public async getTitleByCode(code: string): Promise<AnimeTitle | null> {
    return this.getTitleByAlias(code);
  }

  private mapV1Release(item: any): AnimeTitle {
    const posterPath = item.poster?.src || item.poster?.preview || item.poster?.thumbnail || '';
    const posterUrl = posterPath
      ? (posterPath.startsWith('http') ? posterPath : `${ANILIBRIA_STATIC}${posterPath}`)
      : 'https://placehold.co/300x450/121620/white?text=No+Poster';

    const episodes: AnimeEpisode[] = [];

    if (Array.isArray(item.episodes)) {
      for (const ep of item.episodes) {
        const previewPath = ep.preview?.src || ep.preview?.preview || '';
        const previewUrl = previewPath
          ? (previewPath.startsWith('http') ? previewPath : `${ANILIBRIA_STATIC}${previewPath}`)
          : posterUrl;

        episodes.push({
          id: ep.id || `${item.id}-${ep.ordinal}`,
          ordinal: ep.ordinal || ep.sort_order || 1,
          title: ep.name ? `${ep.name}` : `Серия ${ep.ordinal}`,
          thumbnail: previewUrl,
          duration: ep.duration || 1440,
          hls: {
            fhd: ep.hls_1080 || undefined,
            hd: ep.hls_720 || undefined,
            sd: ep.hls_480 || undefined,
          },
          skips: {
            opening:
              ep.opening && ep.opening.start != null && ep.opening.stop != null
                ? [ep.opening.start, ep.opening.stop]
                : undefined,
            ending:
              ep.ending && ep.ending.start != null && ep.ending.stop != null
                ? [ep.ending.start, ep.ending.stop]
                : undefined,
          },
        });
      }
    }

    return {
      id: `anilibria-${item.id}`,
      shikimoriId: item.shikimori?.id,
      anilibriaCode: item.alias || String(item.id),
      titleRu: item.name?.main || 'Без названия',
      titleEn: item.name?.english || '',
      titleOriginal: item.name?.alternative,
      poster: posterUrl,
      banner: posterUrl,
      description: item.description || '',
      score: item.rating?.average || 8.5,
      year: item.year,
      season: item.season?.description,
      genres: Array.isArray(item.genres) ? item.genres.map((g: any) => g.name || g.description || g) : [],
      episodesTotal: item.episodes_total || episodes.length,
      episodesAired: episodes.length,
      status: item.is_ongoing ? 'ongoing' : 'released',
      hasAniLibria: episodes.length > 0 || !!item.id,
      episodes,
    };
  }
}
