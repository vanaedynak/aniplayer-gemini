import React, { useState } from 'react';
import { Film, Sparkles } from 'lucide-react';

interface AnimePosterProps {
  src?: string;
  alt: string;
  title?: string;
  className?: string;
  badge?: React.ReactNode;
  loading?: 'lazy' | 'eager';
}

const KNOWN_POSTERS: Record<string, string> = {
  // Death Note (blocked on Shikimori)
  'тетрадь смерти': 'https://media.kitsu.app/anime/poster_images/1376/large.jpg',
  'death note': 'https://media.kitsu.app/anime/poster_images/1376/large.jpg',
  // JoJo Steel Ball Run
  'steel ball run': 'https://anilibria.top/storage/releases/posters/10172/5bHZeLaIKOser7WZsyhCy6jVrneAKOfO.jpg',
  'стальной шар': 'https://anilibria.top/storage/releases/posters/10172/5bHZeLaIKOser7WZsyhCy6jVrneAKOfO.jpg',
  // Re:Zero 4
  're:zero': 'https://media.kitsu.app/anime/poster_images/11209/large.jpg',
  'жизнь с нуля': 'https://media.kitsu.app/anime/poster_images/11209/large.jpg',
};

export const AnimePoster: React.FC<AnimePosterProps> = ({
  src,
  alt,
  title,
  className = '',
  badge,
  loading = 'lazy',
}) => {
  const [hasError, setHasError] = useState(false);

  // Determine initial image url
  const normalizedTitle = (title || alt || '').toLowerCase();
  let resolvedUrl = src;

  // Filter out Shikimori's built-in 404 sketch images
  const isShikimoriMissing = !src || src.includes('missing_') || src.includes('missing.');

  if (isShikimoriMissing) {
    for (const [key, fallbackUrl] of Object.entries(KNOWN_POSTERS)) {
      if (normalizedTitle.includes(key)) {
        resolvedUrl = fallbackUrl;
        break;
      }
    }
  }

  // If still missing or errored, render high quality stylized anime card
  if (hasError || !resolvedUrl || resolvedUrl.includes('missing_')) {
    return (
      <div
        className={`relative w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-br from-[#1C1836] via-[#121620] to-[#0D111A] overflow-hidden select-none border border-white/5 ${className}`}
      >
        <div className="absolute inset-0 bg-radial-gradient opacity-30 pointer-events-none" />
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600/30 to-pink-600/30 border border-violet-500/20 flex items-center justify-center mb-2 shadow-inner">
          <Film size={22} className="text-violet-400" />
        </div>
        <span className="text-xs font-bold text-white line-clamp-3 leading-snug drop-shadow px-1">
          {title || alt}
        </span>
        <span className="text-[10px] text-violet-400/80 font-medium mt-1 flex items-center space-x-1">
          <Sparkles size={10} />
          <span>AniPlayer</span>
        </span>
        {badge}
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full overflow-hidden bg-black/40 ${className}`}>
      <img
        src={resolvedUrl}
        alt={alt}
        loading={loading}
        onError={() => setHasError(true)}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {badge}
    </div>
  );
};
