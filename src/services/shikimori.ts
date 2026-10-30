import { AnimeTitle, FranchiseItem, FranchiseTree } from '../types/anime';

const SHIKIMORI_API_BASE = 'https://shikimori.one/api';
const SHIKIMORI_HOST = 'https://shikimori.one';

export interface GenreItem {
  id: number;
  name: string;
}

export const ANIME_GENRES: GenreItem[] = [
  { id: 0, name: 'Все жанры' },
  { id: 27, name: 'Сёнен' },
  { id: 1, name: 'Экшен' },
  { id: 2, name: 'Приключения' },
  { id: 10, name: 'Фэнтези' },
  { id: 4, name: 'Комедия' },
  { id: 8, name: 'Драма' },
  { id: 22, name: 'Романтика' },
  { id: 7, name: 'Детектив' },
  { id: 24, name: 'Фантастика' },
  { id: 37, name: 'Мистика' },
  { id: 41, name: 'Триллер' },
  { id: 36, name: 'Повседневность' },
  { id: 30, name: 'Спорт' },
  { id: 18, name: 'Меха' },
  { id: 40, name: 'Психологическое' },
  { id: 14, name: 'Ужасы' },
  { id: 42, name: 'Сэйнэн' },
  { id: 25, name: 'Сёдзё' },
];

export class ShikimoriService {
  private static instance: ShikimoriService;

  public static getInstance(): ShikimoriService {
    if (!ShikimoriService.instance) {
      ShikimoriService.instance = new ShikimoriService();
    }
    return ShikimoriService.instance;
  }

  private headers() {
    return {
      'User-Agent': 'AniPlayer-App/1.0.0 (https://github.com/vanaedynak/aniplayer-gemini)',
    };
  }

  public async getCatalog(genreId: number = 0, order: string = 'ranked', page: number = 1, limit: number = 40): Promise<AnimeTitle[]> {
    try {
      let url = `${SHIKIMORI_API_BASE}/animes?order=${order}&page=${page}&limit=${limit}`;
      if (genreId > 0) {
        url += `&genre=${genreId}`;
      }
      const res = await fetch(url, { headers: this.headers() });
      if (!res.ok) return [];
      const list = await res.json();
      if (!Array.isArray(list)) return [];
      return list.map((item: any) => this.mapListItem(item));
    } catch (err) {
      console.error('Shikimori getCatalog error:', err);
      return [];
    }
  }

  public async search(query: string): Promise<AnimeTitle[]> {
    if (!query || query.trim().length === 0) return [];
    try {
      const url = `${SHIKIMORI_API_BASE}/animes?search=${encodeURIComponent(query.trim())}&limit=30`;
      const res = await fetch(url, { headers: this.headers() });
      if (!res.ok) return [];
      const list = await res.json();
      if (!Array.isArray(list)) return [];

      return list.map((item: any) => this.mapListItem(item));
    } catch (err) {
      console.error('Shikimori search error:', err);
      return [];
    }
  }

  public async getAnimeDetails(id: number): Promise<AnimeTitle | null> {
    try {
      const url = `${SHIKIMORI_API_BASE}/animes/${id}`;
      const res = await fetch(url, { headers: this.headers() });
      if (!res.ok) return null;
      const data = await res.json();
      return this.mapDetails(data);
    } catch (err) {
      console.error('Shikimori getAnimeDetails error:', err);
      return null;
    }
  }

  public async getFranchise(animeId: number): Promise<FranchiseTree> {
    try {
      const url = `${SHIKIMORI_API_BASE}/animes/${animeId}/franchise`;
      const res = await fetch(url, { headers: this.headers() });
      if (!res.ok) {
        return { mainSeasons: [], movies: [], ovasAndSpecials: [], spinOffs: [] };
      }
      const data = await res.json();
      return this.parseFranchiseData(data);
    } catch (err) {
      console.error('Shikimori getFranchise error:', err);
      return { mainSeasons: [], movies: [], ovasAndSpecials: [], spinOffs: [] };
    }
  }

  private parseFranchiseData(data: { nodes?: any[]; links?: any[] }): FranchiseTree {
    const nodes = data.nodes || [];
    const links = data.links || [];

    const spinOffIds = new Set<number>();
    for (const link of links) {
      if (link.relation === 'spin_off' || link.relation === 'alternative_setting') {
        spinOffIds.add(link.target_id);
      }
    }

    const sortedNodes = [...nodes].sort((a, b) => {
      const dateA = a.date || a.year || 0;
      const dateB = b.date || b.year || 0;
      return dateA - dateB;
    });

    const mainSeasons: FranchiseItem[] = [];
    const movies: FranchiseItem[] = [];
    const ovasAndSpecials: FranchiseItem[] = [];
    const spinOffs: FranchiseItem[] = [];

    let mainSeasonCounter = 1;

    for (const node of sortedNodes) {
      const rawKind = (node.kind || '').toLowerCase();
      const titleRu = node.name || node.russian || 'Аниме';
      const urlSlug = (node.url || '').toLowerCase();
      const year = node.year ? Number(node.year) : undefined;
      const poster = node.image_url
        ? (node.image_url.startsWith('http') ? node.image_url : `${SHIKIMORI_HOST}${node.image_url}`)
        : '';

      if (rawKind.includes('клип') || rawKind.includes('music')) {
        continue;
      }

      const isSpinOff =
        spinOffIds.has(node.id) ||
        titleRu.toLowerCase().includes('чиби') ||
        titleRu.toLowerCase().includes('спин-офф') ||
        titleRu.toLowerCase().includes('нинку') ||
        urlSlug.includes('spin-off') ||
        urlSlug.includes('chibi') ||
        urlSlug.includes('ninku');

      if (isSpinOff) {
        spinOffs.push({
          id: node.id,
          titleRu,
          titleEn: urlSlug.replace('/animes/', ''),
          year,
          kind: rawKind,
          poster,
          score: Number(node.weight || 8),
          category: 'spinoff',
          seasonLabel: 'Спин-офф',
          order: spinOffs.length + 1,
        });
        continue;
      }

      if (rawKind.includes('фильм') || rawKind.includes('movie')) {
        movies.push({
          id: node.id,
          titleRu,
          titleEn: urlSlug.replace('/animes/', ''),
          year,
          kind: 'movie',
          poster,
          score: Number(node.weight || 8),
          category: 'movie',
          seasonLabel: 'Фильм',
          order: movies.length + 1,
        });
        continue;
      }

      if (
        rawKind.includes('ova') ||
        rawKind.includes('спешл') ||
        rawKind.includes('она') ||
        rawKind.includes('ona') ||
        rawKind.includes('special')
      ) {
        ovasAndSpecials.push({
          id: node.id,
          titleRu,
          titleEn: urlSlug.replace('/animes/', ''),
          year,
          kind: rawKind.toUpperCase(),
          poster,
          score: Number(node.weight || 8),
          category: 'ova',
          seasonLabel: rawKind.toUpperCase(),
          order: ovasAndSpecials.length + 1,
        });
        continue;
      }

      let seasonLabel = `Сезон ${mainSeasonCounter}`;
      const lowerRu = titleRu.toLowerCase();

      if (urlSlug.includes('bleach') || lowerRu.includes('блич')) {
        if (node.id === 269 || year === 2004) {
          seasonLabel = 'Сезон 1 (366 серий)';
        } else if (urlSlug.includes('kashin-tan') || lowerRu.includes('бедствие')) {
          seasonLabel = 'Сезон 2 · Часть 4';
        } else if (urlSlug.includes('soukoku-tan') || lowerRu.includes('конфликт')) {
          seasonLabel = 'Сезон 2 · Часть 3';
        } else if (urlSlug.includes('ketsubetsu-tan') || lowerRu.includes('прощание')) {
          seasonLabel = 'Сезон 2 · Часть 2';
        } else if (urlSlug.includes('sennen-kessen-hen') || lowerRu.includes('тысячелетняя кровавая война')) {
          seasonLabel = 'Сезон 2 · Часть 1';
        } else {
          seasonLabel = `Сезон ${mainSeasonCounter}`;
          mainSeasonCounter++;
        }
      } else if (urlSlug.includes('naruto') || lowerRu.includes('наруто') || lowerRu.includes('боруто')) {
        if (node.id === 20 || (year === 2002 && lowerRu === 'наруто')) {
          seasonLabel = 'Сезон 1 (220 серий)';
        } else if (urlSlug.includes('shippuuden') || lowerRu.includes('ураганные хроники')) {
          seasonLabel = 'Сезон 2 (500 серий)';
        } else if (urlSlug.includes('boruto') || lowerRu.includes('боруто')) {
          seasonLabel = 'Боруто (Новое поколение)';
        } else {
          seasonLabel = `Сезон ${mainSeasonCounter}`;
          mainSeasonCounter++;
        }
      } else {
        const partMatch = lowerRu.match(/часть\s*(\d+)/) || urlSlug.match(/part-(\d+)/);
        const seasonMatch = lowerRu.match(/сезон\s*(\d+)/) || urlSlug.match(/season-(\d+)/);

        if (seasonMatch && partMatch) {
          seasonLabel = `Сезон ${seasonMatch[1]} · Часть ${partMatch[1]}`;
        } else if (partMatch) {
          seasonLabel = `Сезон ${Math.max(1, mainSeasonCounter - 1)} · Часть ${partMatch[1]}`;
        } else if (seasonMatch) {
          seasonLabel = `Сезон ${seasonMatch[1]}`;
        } else {
          seasonLabel = `Сезон ${mainSeasonCounter}`;
          mainSeasonCounter++;
        }
      }

      mainSeasons.push({
        id: node.id,
        titleRu,
        titleEn: urlSlug.replace('/animes/', ''),
        year,
        kind: 'tv',
        poster,
        score: Number(node.weight || 8),
        category: 'main',
        seasonLabel,
        order: mainSeasons.length + 1,
      });
    }

    return {
      mainSeasons,
      movies,
      ovasAndSpecials,
      spinOffs,
    };
  }

  private mapListItem(item: any): AnimeTitle {
    const posterUrl = item.image?.original
      ? (item.image.original.startsWith('http') ? item.image.original : `${SHIKIMORI_HOST}${item.image.original}`)
      : '';

    return {
      id: `shiki-${item.id}`,
      shikimoriId: item.id,
      titleRu: item.russian || item.name || 'Без названия',
      titleEn: item.name || '',
      poster: posterUrl,
      banner: posterUrl,
      description: '',
      score: parseFloat(item.score) || 8.0,
      year: item.aired_on ? parseInt(item.aired_on.slice(0, 4), 10) : undefined,
      genres: [],
      episodesTotal: item.episodes || 0,
      episodesAired: item.episodes_aired || item.episodes || 0,
      status: item.status === 'released' ? 'released' : 'ongoing',
      hasAniLibria: false,
      episodes: [],
    };
  }

  private mapDetails(item: any): AnimeTitle {
    const posterUrl = item.image?.original
      ? (item.image.original.startsWith('http') ? item.image.original : `${SHIKIMORI_HOST}${item.image.original}`)
      : '';

    return {
      id: `shiki-${item.id}`,
      shikimoriId: item.id,
      titleRu: item.russian || item.name || 'Без названия',
      titleEn: item.name || '',
      titleOriginal: item.japanese?.[0],
      poster: posterUrl,
      banner: posterUrl,
      description: item.description_html ? item.description_html.replace(/<[^>]*>?/gm, '') : (item.description || ''),
      score: parseFloat(item.score) || 8.0,
      year: item.aired_on ? parseInt(item.aired_on.slice(0, 4), 10) : undefined,
      season: item.season,
      genres: (item.genres || []).map((g: any) => g.russian || g.name),
      episodesTotal: item.episodes || 0,
      episodesAired: item.episodes_aired || item.episodes || 0,
      status: item.status === 'released' ? 'released' : 'ongoing',
      hasAniLibria: false,
      episodes: [],
    };
  }
}
