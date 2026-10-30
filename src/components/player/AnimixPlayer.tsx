import React, { useRef, useState, useEffect, useCallback } from 'react';
import Hls from 'hls.js';
import { StatusBar } from '@capacitor/status-bar';
import { AnimeEpisode, AnimeTitle } from '../../types/anime';
import { usePlayerStore } from '../../store/usePlayerStore';
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Camera,
  PictureInPicture,
  Settings,
  Sparkles,
} from 'lucide-react';

interface AnimixPlayerProps {
  episode: AnimeEpisode;
  anime: AnimeTitle;
  onNextEpisode?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export const AnimixPlayer: React.FC<AnimixPlayerProps> = ({
  episode,
  anime,
  onNextEpisode,
  hasNext,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  const { saveProgress, settings, updateSettings } = usePlayerStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(settings.volume || 0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [quality, setQuality] = useState<'fhd' | 'hd' | 'sd'>('fhd');
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  // Opening & Ending skip states
  const [showOpeningPrompt, setShowOpeningPrompt] = useState(false);
  const [openingCountdown, setOpeningCountdown] = useState(5);
  const [skipOpeningCancelled, setSkipOpeningCancelled] = useState(false);

  const [showEndingPrompt, setShowEndingPrompt] = useState(false);
  const [endingCountdown, setEndingCountdown] = useState(5);

  // iPad Double Tap state (left/right)
  const [seekOverlay, setSeekOverlay] = useState<{
    side: 'left' | 'right';
    seconds: number;
    visible: boolean;
  } | null>(null);

  const lastTapRef = useRef<{ time: number; x: number }>({ time: 0, x: 0 });
  const seekOverlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Stream URL selection
  const getStreamUrl = useCallback(() => {
    if (!episode.hls) return '';
    if (quality === 'fhd' && episode.hls.fhd) return episode.hls.fhd;
    if (quality === 'hd' && episode.hls.hd) return episode.hls.hd;
    if (quality === 'sd' && episode.hls.sd) return episode.hls.sd;
    return episode.hls.fhd || episode.hls.hd || episode.hls.sd || '';
  }, [episode.hls, quality]);

  // Initialize HLS
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const streamUrl = getStreamUrl();
    if (!streamUrl) return;

    if (Hls.isSupported()) {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }

      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch(() => setIsPlaying(false));
      });

      hlsRef.current = hls;
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native Safari / iOS HLS
      video.src = streamUrl;
      video.play().catch(() => setIsPlaying(false));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [getStreamUrl]);

  // Reset skip flags on episode change
  useEffect(() => {
    setSkipOpeningCancelled(false);
    setShowOpeningPrompt(false);
    setShowEndingPrompt(false);
    setOpeningCountdown(5);
    setEndingCountdown(5);
  }, [episode.id]);

  // Handle Opening / Ending Detection & Timers
  useEffect(() => {
    const op = episode.skips?.opening;
    const ed = episode.skips?.ending;

    // Opening check
    if (op && op.length === 2 && !skipOpeningCancelled) {
      const [opStart, opEnd] = op;
      if (currentTime >= opStart && currentTime < opEnd) {
        if (!showOpeningPrompt) {
          setShowOpeningPrompt(true);
          setOpeningCountdown(5);
        }
      } else {
        setShowOpeningPrompt(false);
      }
    } else {
      setShowOpeningPrompt(false);
    }

    // Ending check
    if (ed && ed.length === 2) {
      const [edStart] = ed;
      if (currentTime >= edStart) {
        if (!showEndingPrompt && hasNext) {
          setShowEndingPrompt(true);
          setEndingCountdown(5);
        }
      } else {
        setShowEndingPrompt(false);
      }
    }
  }, [currentTime, episode.skips, skipOpeningCancelled, showOpeningPrompt, showEndingPrompt, hasNext]);

  // 5-second countdown for opening auto-skip
  useEffect(() => {
    if (!showOpeningPrompt) return;

    const interval = setInterval(() => {
      setOpeningCountdown((prev) => {
        if (prev <= 1) {
          // Auto-skip opening now!
          const op = episode.skips?.opening;
          if (op && videoRef.current) {
            videoRef.current.currentTime = op[1];
          }
          setShowOpeningPrompt(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showOpeningPrompt, episode.skips]);

  // 5-second countdown for ending auto-next
  useEffect(() => {
    if (!showEndingPrompt) return;

    const interval = setInterval(() => {
      setEndingCountdown((prev) => {
        if (prev <= 1) {
          // Auto next episode!
          if (onNextEpisode) {
            onNextEpisode();
          }
          setShowEndingPrompt(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showEndingPrompt, onNextEpisode]);

  // Keep progress saved
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    setCurrentTime(video.currentTime);
    setDuration(video.duration || 1440);

    if (Math.floor(video.currentTime) % 4 === 0) {
      saveProgress({
        animeId: anime.id,
        animeTitle: anime.titleRu,
        animePoster: anime.poster,
        seasonNumber: 1,
        seasonLabel: anime.season || '1 сезон',
        episodeNumber: episode.ordinal,
        currentTime: video.currentTime,
        duration: video.duration || 1440,
        completed: video.duration > 0 && video.currentTime >= video.duration * 0.9,
        updatedAt: Date.now(),
      });
    }
  };

  // Play / Pause toggle
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  // Skip Opening manually clicked ("Смотреть опенинг")
  const handleWatchOpening = () => {
    // User wants to watch opening, cancel auto-skip countdown
    setSkipOpeningCancelled(true);
    setShowOpeningPrompt(false);
  };

  const handleSkipOpeningNow = () => {
    const op = episode.skips?.opening;
    if (op && videoRef.current) {
      videoRef.current.currentTime = op[1];
    }
    setShowOpeningPrompt(false);
  };

  // Skip Ending manually
  const handleCancelNextEpisode = () => {
    setShowEndingPrompt(false);
  };

  // Seeking on Scrubber
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
    setCurrentTime(video.currentTime);
  };

  // Volume
  const handleVolumeChange = (newVol: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = newVol;
    setVolume(newVol);
    setIsMuted(newVol === 0);
    updateSettings({ volume: newVol });
  };

  // Fullscreen toggle with iPad Status Bar auto-hide
  const toggleFullscreen = async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      await container.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
      try {
        await StatusBar.hide();
      } catch {}
    } else {
      await document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
      try {
        await StatusBar.show();
      } catch {}
    }
  };

  // Screenshot capture
  const handleTakeScreenshot = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${anime.titleRu}_ep${episode.ordinal}_shot.png`;
      a.click();
    }
  };

  // Picture in Picture
  const handleTogglePiP = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP not available', err);
    }
  };

  // iPad Touch Gesture: Double-tap edges ±10s with accumulating time
  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.changedTouches[0];
    if (!touch || !containerRef.current || !videoRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const width = rect.width;
    const now = Date.now();

    // Check if double tap happened within 300ms
    if (now - lastTapRef.current.time < 350) {
      const isLeft = x < width * 0.35;
      const isRight = x > width * 0.65;

      if (isLeft || isRight) {
        const side = isLeft ? 'left' : 'right';
        const delta = isLeft ? -10 : 10;

        videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
        setCurrentTime(videoRef.current.currentTime);

        setSeekOverlay((prev) => {
          const currentSecs = prev && prev.side === side && prev.visible ? prev.seconds : 0;
          return {
            side,
            seconds: currentSecs + 10,
            visible: true,
          };
        });

        if (seekOverlayTimerRef.current) clearTimeout(seekOverlayTimerRef.current);
        seekOverlayTimerRef.current = setTimeout(() => {
          setSeekOverlay(null);
        }, 750);
      }
    }

    lastTapRef.current = { time: now, x };
  };

  // Controls visibility auto-hide
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setControlsVisible(false);
    }, 3000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const video = videoRef.current;
      if (!video) return;

      if (e.code === 'Space' || e.code === 'KeyK') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft' || e.code === 'KeyJ') {
        video.currentTime = Math.max(0, video.currentTime - 5);
      } else if (e.code === 'ArrowRight' || e.code === 'KeyL') {
        video.currentTime = Math.min(duration, video.currentTime + 5);
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        setIsMuted(!isMuted);
        video.muted = !isMuted;
      } else if (e.code === 'KeyS') {
        handleTakeScreenshot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [duration, isMuted, isPlaying]);

  // Format time (03:28) & remaining (-21:04)
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const formatRemaining = (cur: number, dur: number) => {
    const rem = Math.max(0, dur - cur);
    return `-${formatTime(rem)}`;
  };

  // Colored timeline intervals
  const opInterval = episode.skips?.opening;
  const edInterval = episode.skips?.ending;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden group select-none shadow-2xl flex items-center justify-center"
    >
      <video
        ref={videoRef}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => onNextEpisode && onNextEpisode()}
        className="w-full h-full object-contain cursor-pointer"
        onClick={togglePlay}
        playsInline
      />

      {/* iPad Double-Tap Seek Waves Overlay */}
      {seekOverlay && seekOverlay.visible && (
        <div
          className={`absolute inset-y-0 w-1/3 flex items-center justify-center pointer-events-none z-30 transition-all ${
            seekOverlay.side === 'left' ? 'left-0' : 'right-0'
          }`}
        >
          <div className="bg-[#0B0E14]/80 backdrop-blur-md rounded-full w-24 h-24 flex flex-col items-center justify-center text-white border border-violet-500/40 shadow-neon animate-ripple">
            <span className="text-sm font-bold">
              {seekOverlay.side === 'left' ? `-${seekOverlay.seconds}с` : `+${seekOverlay.seconds}с`}
            </span>
            <span className="text-[10px] text-gray-300">перемотка</span>
          </div>
        </div>
      )}

      {/* Opening Skip Countdown Banner */}
      {showOpeningPrompt && (
        <div className="absolute bottom-24 right-6 z-30 bg-[#0B0E14]/90 backdrop-blur-md border border-violet-500/40 p-4 rounded-2xl shadow-neon flex items-center space-x-3 animate-fade-in">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Начался опенинг</span>
            <span className="text-sm font-bold text-white flex items-center space-x-1">
              <Sparkles size={14} className="text-violet-400" />
              <span>Автопропуск через {openingCountdown}с</span>
            </span>
          </div>
          <button
            onClick={handleWatchOpening}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition"
          >
            Смотреть опенинг
          </button>
          <button
            onClick={handleSkipOpeningNow}
            className="bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold px-3 py-1.5 rounded-full transition shadow"
          >
            Пропустить
          </button>
        </div>
      )}

      {/* Ending Next Episode Countdown Banner */}
      {showEndingPrompt && (
        <div className="absolute bottom-24 right-6 z-30 bg-[#0B0E14]/90 backdrop-blur-md border border-emerald-500/40 p-4 rounded-2xl shadow-lg flex items-center space-x-3 animate-fade-in">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Серия заканчивается</span>
            <span className="text-sm font-bold text-white">
              Следующая серия через {endingCountdown}с
            </span>
          </div>
          <button
            onClick={handleCancelNextEpisode}
            className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition"
          >
            Отмена
          </button>
          <button
            onClick={() => onNextEpisode && onNextEpisode()}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full transition shadow"
          >
            Смотреть сейчас
          </button>
        </div>
      )}

      {/* Custom Minimalist Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 flex flex-col justify-between p-4 transition-opacity duration-300 pointer-events-none z-20 ${
          controlsVisible || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top bar in player */}
        <div className="flex items-center justify-between text-white pointer-events-auto">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold drop-shadow">
              {episode.title || `Серия ${episode.ordinal}`}
            </span>
            <span className="text-xs text-gray-400">· {anime.titleRu}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="bg-violet-600/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {quality.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Center Big Play Button (if paused) */}
        {!isPlaying && (
          <div className="self-center pointer-events-auto">
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-violet-600/90 text-white flex items-center justify-center shadow-neon hover:scale-110 active:scale-95 transition"
            >
              <Play size={28} className="fill-current ml-1" />
            </button>
          </div>
        )}

        {/* Bottom Controls Bar (Exactly as Screenshot 2) */}
        <div className="space-y-2 pointer-events-auto">
          {/* Scrubber Timeline */}
          <div
            onClick={handleSeek}
            className="relative w-full h-2 hover:h-3 bg-white/20 hover:bg-white/30 rounded-full cursor-pointer transition-all flex items-center"
          >
            {/* Colored Opening Marker on timeline */}
            {opInterval && duration > 0 && (
              <div
                style={{
                  left: `${(opInterval[0] / duration) * 100}%`,
                  width: `${((opInterval[1] - opInterval[0]) / duration) * 100}%`,
                }}
                className="absolute h-full bg-violet-500/80 rounded-full"
                title="Опенинг"
              />
            )}

            {/* Colored Ending Marker on timeline */}
            {edInterval && duration > 0 && (
              <div
                style={{
                  left: `${(edInterval[0] / duration) * 100}%`,
                  width: `${((duration - edInterval[0]) / duration) * 100}%`,
                }}
                className="absolute h-full bg-amber-500/80 rounded-full"
                title="Эндинг"
              />
            )}

            {/* Played Progress Bar */}
            <div
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
              className="h-full bg-white rounded-full relative"
            >
              {/* White Thumb Scrubber */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow" />
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-white pt-1">
            {/* Left Controls: Play, Next, Volume, Time */}
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlay}
                className="p-1.5 hover:text-violet-400 transition"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} className="fill-current" />}
              </button>

              {hasNext && (
                <button
                  onClick={onNextEpisode}
                  className="p-1.5 hover:text-violet-400 transition"
                  title="Следующая серия"
                >
                  <SkipForward size={20} />
                </button>
              )}

              {/* Volume Slider */}
              <div className="flex items-center space-x-2 group/vol">
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 hover:text-violet-400 transition"
                >
                  {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-16 accent-white h-1 bg-white/20 rounded cursor-pointer opacity-0 group-hover/vol:opacity-100 transition-opacity"
                />
              </div>

              {/* Time displays: 03:28 and -21:04 */}
              <div className="flex items-center space-x-2 text-xs font-mono text-gray-300 pl-2">
                <span>{formatTime(currentTime)}</span>
                <span className="text-gray-500">/</span>
                <span>{formatRemaining(currentTime, duration)}</span>
              </div>
            </div>

            {/* Right Controls: Screenshot, PiP, Settings, Fullscreen */}
            <div className="flex items-center space-x-2 relative">
              <button
                onClick={handleTakeScreenshot}
                className="p-1.5 text-gray-300 hover:text-white transition"
                title="Сделать скриншот"
              >
                <Camera size={18} />
              </button>

              <button
                onClick={handleTogglePiP}
                className="p-1.5 text-gray-300 hover:text-white transition"
                title="Картинка в картинке"
              >
                <PictureInPicture size={18} />
              </button>

              {/* Settings Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                  className="p-1.5 text-gray-300 hover:text-white transition"
                  title="Настройки качества и скорости"
                >
                  <Settings size={18} />
                </button>

                {showSettingsMenu && (
                  <div className="absolute bottom-10 right-0 bg-[#0B0E14]/95 backdrop-blur-md border border-white/10 p-3 rounded-2xl w-48 space-y-3 z-40 text-xs shadow-2xl">
                    {/* Quality */}
                    <div>
                      <span className="text-gray-400 font-semibold block mb-1">Качество</span>
                      <div className="flex space-x-1">
                        {(['fhd', 'hd', 'sd'] as const).map((q) => (
                          <button
                            key={q}
                            onClick={() => {
                              setQuality(q);
                              setShowSettingsMenu(false);
                            }}
                            className={`flex-1 py-1 rounded text-center font-bold uppercase ${
                              quality === q ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                            }`}
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Speed */}
                    <div>
                      <span className="text-gray-400 font-semibold block mb-1">Скорость</span>
                      <div className="grid grid-cols-3 gap-1">
                        {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                          <button
                            key={s}
                            onClick={() => {
                              setPlaybackRate(s);
                              if (videoRef.current) videoRef.current.playbackRate = s;
                              setShowSettingsMenu(false);
                            }}
                            className={`py-1 rounded text-center font-semibold ${
                              playbackRate === s ? 'bg-violet-600 text-white' : 'bg-white/5 text-gray-300 hover:bg-white/10'
                            }`}
                          >
                            {s}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-1.5 text-gray-300 hover:text-white transition"
                title={isFullscreen ? 'Обычный режим' : 'Во весь экран'}
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
