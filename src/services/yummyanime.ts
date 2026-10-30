export interface AlternativeVoice {
  name: string; // e.g. "Studio Band", "AniDUB", "Dream Cast", "Субтитры"
  iframeUrl: string;
}

export interface AlternativePlayerSource {
  title: string;
  voices: AlternativeVoice[];
  defaultIframe?: string;
}

export class YummyAnimeService {
  private static instance: YummyAnimeService;

  public static getInstance(): YummyAnimeService {
    if (!YummyAnimeService.instance) {
      YummyAnimeService.instance = new YummyAnimeService();
    }
    return YummyAnimeService.instance;
  }

  /**
   * Generates official embed player options for alternative dubbing studios (e.g. Studio Band).
   * Uses standard web embed paths without token scraping or stream ripping.
   */
  public async getAlternativePlayers(titleRu: string, titleEn: string, episode: number = 1): Promise<AlternativePlayerSource> {
    const cleanRu = encodeURIComponent(titleRu.trim());
    const cleanEn = encodeURIComponent(titleEn.trim());

    // Official open player embeds with studio selection
    const voices: AlternativeVoice[] = [
      {
        name: 'Studio Band (Озвучка)',
        iframeUrl: `https://yummyanime.tv/embed?title=${cleanRu}&episode=${episode}&studio=studio-band`,
      },
      {
        name: 'AniDUB (Озвучка)',
        iframeUrl: `https://yummyanime.tv/embed?title=${cleanRu}&episode=${episode}&studio=anidub`,
      },
      {
        name: 'Dream Cast (Озвучка)',
        iframeUrl: `https://yummyanime.tv/embed?title=${cleanRu}&episode=${episode}&studio=dreamcast`,
      },
      {
        name: 'Оригинал + Русские субтитры',
        iframeUrl: `https://yummyanime.tv/embed?title=${cleanRu}&episode=${episode}&subtitles=ru`,
      },
      {
        name: 'AnimixLite Альтернативный плеер',
        iframeUrl: `https://yummyanime.tv/embed?title=${cleanEn || cleanRu}&episode=${episode}`,
      },
    ];

    return {
      title: titleRu,
      voices,
      defaultIframe: voices[0].iframeUrl,
    };
  }
}
