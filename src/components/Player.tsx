import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Shuffle,
  ListMusic,
  Heart,
  ChevronDown,
  MoreVertical,
  FileDown,
  Mic2,
  Plus,
} from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";
import { formatTime, cn, downloadToDevice } from "../utils/helpers";
import { getOfflineTrackUrl } from "../utils/offline";
import { getLyrics } from "../utils/api";
import Hls from "hls.js";

export default function Player() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    repeatMode,
    isShuffle,
    likedTracks,
    playTrack,
    pause,
    resume,
    next,
    previous,
    queue: playerQueue,
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    toggleLike,
    playlists,
    addTrackToPlaylist,
  } = usePlayerStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedTrackIdRef = useRef<string | null>(null);
  const isTrackLoadedRef = useRef<boolean>(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [isPlaylistDropdownOpen, setIsPlaylistDropdownOpen] = useState(false);
  const playlistDropdownRef = useRef<HTMLDivElement>(null);
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loadingLyrics, setLoadingLyrics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const lastUpdateRef = useRef<number>(0);

  const hlsRef = useRef<Hls | null>(null);
  const nextTrackPreloadRef = useRef<string | null>(null);

  useEffect(() => {
    setRetryCount(0);
  }, [currentTrack?.id]);

  useEffect(() => {
    if (playerQueue.length > 0) {
      const nextTrack = playerQueue[0];
      if (nextTrack.id !== nextTrackPreloadRef.current) {
        nextTrackPreloadRef.current = nextTrack.id;
        getOfflineTrackUrl(nextTrack.id);
      }
    }
  }, [currentTrack, playerQueue]);

  const isLiked = currentTrack
    ? likedTracks.some((t) => t.id === currentTrack.id)
    : false;
  const isQueueActive = location.pathname === "/queue";

  useEffect(() => {
    if (!isPlaylistDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (playlistDropdownRef.current && !playlistDropdownRef.current.contains(event.target as Node)) {
        setIsPlaylistDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isPlaylistDropdownOpen]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying && isTrackLoadedRef.current) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            if (error.name !== 'AbortError') {
              console.error('Playback error:', error);
            }
          });
        }
      } else if (!isPlaying) {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    let currentOfflineUrl: string | null = null;

    const loadTrack = async () => {
      console.log("loadTrack started for:", currentTrack?.title, currentTrack?.id);
      isTrackLoadedRef.current = false;
      if (!currentTrack && audioRef.current) {
        audioRef.current.src = "";
        loadedTrackIdRef.current = null;
        return;
      }
      
      if (currentTrack && audioRef.current) {
        loadedTrackIdRef.current = currentTrack.id;
        const offlineUrl = await getOfflineTrackUrl(currentTrack.id);
        currentOfflineUrl = offlineUrl;
        
        const isYouTube = currentTrack.url.includes('youtube.com') || currentTrack.url.includes('youtu.be') || currentTrack.url.includes('/api/stream');
        console.log("isYouTube:", isYouTube, "url:", currentTrack.url);
        
        let urlToPlay = offlineUrl || currentTrack.fullUrl || currentTrack.url;
        
        if (!offlineUrl && !currentTrack.fullUrl && isYouTube) {
          try {
            console.log("Resolving track...");
            // Extract id, title, artist from currentTrack.url if it's an /api/stream URL
            let resolveUrl = `/api/resolve-track?url=${encodeURIComponent(currentTrack.url)}&title=${encodeURIComponent(currentTrack.title)}&artist=${encodeURIComponent(currentTrack.artist)}`;
            
            if (currentTrack.url.includes('/api/stream')) {
              const urlObj = new URL(currentTrack.url, window.location.origin);
              const id = urlObj.searchParams.get('id');
              if (id) {
                resolveUrl = `/api/resolve-track?id=${id}&title=${encodeURIComponent(currentTrack.title)}&artist=${encodeURIComponent(currentTrack.artist)}`;
              }
            }

            if (retryCount > 0) {
              resolveUrl += '&nocache=true';
            }
            
            const res = await fetch(resolveUrl);
            if (res.ok) {
              const resolved = await res.json();
              urlToPlay = resolved.url;
              console.log("Resolved URL:", urlToPlay.substring(0, 50) + "...");
              
              // Check if the track hasn't changed while we were fetching
              const latestTrack = usePlayerStore.getState().currentTrack;
              if (latestTrack && latestTrack.id === currentTrack.id) {
                // Update the current track in the store with the resolved metadata
                // This ensures the UI matches the actual audio being played
                if (resolved.title || resolved.artist) {
                  usePlayerStore.getState().setCurrentTrack({
                    ...latestTrack,
                    title: resolved.title || latestTrack.title,
                    artist: resolved.artist || latestTrack.artist,
                    artwork: resolved.artwork || latestTrack.artwork
                  });
                }
              } else {
                console.log("Track changed during fetch, aborting old track");
                // Track changed during fetch, abort playback of this old track
                return;
              }
            } else {
              urlToPlay = ''; // Force error if resolution fails
              console.log("Resolution failed with status:", res.status);
            }
          } catch (err) {
            console.error("Failed to resolve track:", err);
            urlToPlay = '';
          }
        }

        if (!urlToPlay) {
          console.warn("No preview URL available for this track.");
          pause();
          return;
        }

        console.log("Setting src and playing...");
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }

        if (urlToPlay.includes(".m3u8") && Hls.isSupported()) {
          console.log("Using HLS");
          const hls = new Hls();
          hlsRef.current = hls;
          hls.loadSource(urlToPlay);
          hls.attachMedia(audioRef.current);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            isTrackLoadedRef.current = true;
            if (usePlayerStore.getState().isPlaying) {
              const playPromise = audioRef.current?.play();
              if (playPromise !== undefined) {
                playPromise.catch(error => {
                  if (error.name !== 'AbortError') {
                    console.error('Playback error:', error);
                  }
                });
              }
            }
          });
          hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  if (retryCount < 3) {
                    console.error("fatal network error encountered, try to recover", data);
                    setRetryCount(prev => prev + 1);
                  } else {
                    console.error("fatal network error, cannot recover", data);
                    hls.destroy();
                  }
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  console.error("fatal media error encountered, try to recover");
                  hls.recoverMediaError();
                  break;
                default:
                  console.error("fatal error, cannot recover", data);
                  hls.destroy();
                  break;
              }
            } else {
              console.warn("HLS error:", data);
            }
          });
        } else {
          console.log("Using native audio");
          audioRef.current.src = urlToPlay;
          isTrackLoadedRef.current = true;
          if (usePlayerStore.getState().isPlaying) {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
              playPromise.catch(error => {
                if (error.name !== 'AbortError') {
                  console.error('Playback error:', error);
                }
              });
            }
          }
        }
        
        setProgress(0);
        lastUpdateRef.current = 0;

        if ("mediaSession" in navigator) {
          navigator.mediaSession.setActionHandler("play", resume);
          navigator.mediaSession.setActionHandler("pause", pause);
          navigator.mediaSession.setActionHandler("previoustrack", handlePrevious);
          navigator.mediaSession.setActionHandler("nexttrack", next);
        }
      }
    };
    loadTrack();

    return () => {
      console.log("Cleanup for:", currentTrack?.title);
      if (currentOfflineUrl) {
        URL.revokeObjectURL(currentOfflineUrl);
      }
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentTrack?.id, retryCount]);

  useEffect(() => {
    if (currentTrack && "mediaSession" in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album,
        artwork: [{ src: currentTrack.artwork, sizes: "300x300", type: "image/jpeg" }],
      });
    }
  }, [currentTrack]);

  useEffect(() => {
    if (showLyrics && currentTrack) {
      setLoadingLyrics(true);
      getLyrics(currentTrack.id, currentTrack.artist, currentTrack.title).then((res) => {
        setLyrics(res);
        setLoadingLyrics(false);
      });
    }
  }, [currentTrack, showLyrics]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const currentTime = audioRef.current.currentTime;
      // Throttle updates to once per second to reduce re-renders
      if (Math.abs(currentTime - lastUpdateRef.current) >= 1) {
        setProgress(currentTime);
        lastUpdateRef.current = currentTime;
      }
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const handleEnded = () => {
    if (repeatMode === "one" && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      next();
    }
  };

  const handlePrevious = (details?: React.MouseEvent | MediaSessionActionDetails) => {
    if ('stopPropagation' in (details || {})) {
      (details as React.MouseEvent).stopPropagation();
    }
    if (audioRef.current && audioRef.current.currentTime > 3) {
      audioRef.current.currentTime = 0;
    } else {
      previous();
    }
  };

  const handleError = () => {
    console.error("Failed to load audio source.");
    setError("Failed to load audio stream.");
    pause();
  };

  const handleQueueClick = () => {
    if (isQueueActive) {
      navigate(-1);
    } else {
      navigate("/queue");
    }
  };

  if (!currentTrack) {
    return (
      <div className="hidden md:flex h-24 bg-[#181818] border-t border-[#282828] items-center justify-center text-gray-500 text-sm shrink-0">
        Select a track to start listening
      </div>
    );
  }

  return (
    <>
      <audio
        ref={audioRef}
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onLoadedMetadata={handleTimeUpdate}
        onError={handleError}
      />

      {/* Mini Player (Mobile) & Standard Player (Desktop) */}
      <div 
        className={cn(
          "bg-[#181818]/95 backdrop-blur-2xl flex items-center justify-between shrink-0 transition-all cursor-pointer md:cursor-default relative overflow-hidden",
          "md:h-24 md:border-t md:border-white/5 md:px-4 md:m-0 md:rounded-none md:relative md:bottom-auto md:left-auto md:right-auto md:z-auto",
          "fixed bottom-[88px] left-2 right-2 h-14 px-2 rounded-xl border border-white/10 z-40 shadow-2xl", // Mobile styles
          isExpanded ? "hidden md:flex" : "flex"
        )}
        onClick={() => {
          if (window.innerWidth < 768) {
            setIsExpanded(true);
          }
        }}
      >
        {/* Track Info */}
        <div className="flex items-center w-[60%] md:w-[30%] min-w-[120px] md:min-w-[180px]">
          <img
            src={currentTrack.artwork}
            alt={currentTrack.title}
            className="w-10 h-10 md:w-14 md:h-14 rounded-md object-cover mr-2 md:mr-4 shadow-md"
            loading="lazy"
          />
          <div className="flex flex-col justify-center truncate mr-2 md:mr-4">
            <span 
              className="text-white text-sm font-medium hover:underline cursor-pointer truncate"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
                navigate(`/song/${currentTrack.id}`, { state: { track: currentTrack } });
              }}
            >
              {currentTrack.title}
            </span>
            <span 
              className="text-xs text-gray-400 hover:underline cursor-pointer truncate"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
                navigate(`/artist/${encodeURIComponent(currentTrack.artist)}`);
              }}
            >
              {currentTrack.artist}
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); toggleLike(currentTrack); }}
            className={cn(
              "text-gray-400 hover:text-white transition-colors",
              isLiked && "text-green-500 hover:text-green-400",
            )}
          >
            <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
          </button>
          <div className="relative hidden sm:block ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsPlaylistDropdownOpen(!isPlaylistDropdownOpen);
              }}
              className={cn(
                "text-gray-400 hover:text-white transition-colors",
                isPlaylistDropdownOpen && "text-white"
              )}
            >
              <Plus className="w-5 h-5" />
            </button>
            {isPlaylistDropdownOpen && (
              <div 
                ref={playlistDropdownRef}
                className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-[#282828] rounded-md shadow-2xl z-50 py-1 border border-white/10"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 mb-1">
                  Add to Playlist
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {playlists.length === 0 ? (
                    <div className="px-3 py-2 text-sm text-gray-400">No playlists found</div>
                  ) : (
                    playlists.map(playlist => (
                      <button
                        key={playlist.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          addTrackToPlaylist(playlist.id, currentTrack);
                          setIsPlaylistDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span className="truncate">{playlist.name}</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center flex-1 md:max-w-[40%] w-full">
          {/* Mobile Controls */}
          <div className="flex md:hidden items-center justify-end w-full gap-3 pr-1">
            <button
              onClick={(e) => { e.stopPropagation(); isPlaying ? pause() : resume(); }}
              className="text-white hover:scale-105 transition-transform"
            >
              {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="text-white hover:scale-105 transition-transform"
            >
              <SkipForward className="w-6 h-6 fill-current" />
            </button>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-6 mb-2">
            <button
              onClick={toggleShuffle}
              className={cn(
                "text-gray-400 hover:text-white transition-colors",
                isShuffle && "text-green-500 hover:text-green-400",
              )}
            >
              <Shuffle className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrevious}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <SkipBack className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={isPlaying ? pause : resume}
              className="w-8 h-8 flex items-center justify-center bg-white rounded-full text-black hover:scale-105 transition-transform"
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-1" />
              )}
            </button>
            <button
              onClick={next}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <SkipForward className="w-5 h-5 fill-current" />
            </button>
            <button
              onClick={toggleRepeat}
              className={cn(
                "text-gray-400 hover:text-white transition-colors relative",
                repeatMode !== "off" && "text-green-500 hover:text-green-400",
              )}
            >
              <Repeat className="w-4 h-4" />
              {repeatMode === "one" && (
                <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-[#181818] rounded-full w-3 h-3 flex items-center justify-center">
                  1
                </span>
              )}
            </button>
          </div>
          <div className="hidden md:flex items-center w-full gap-2 text-xs text-gray-400">
            <span className="w-10 text-right">{formatTime(progress * 1000)}</span>
            <div className="flex-1 group flex items-center h-4">
              <input
                type="range"
                min={0}
                max={duration || 100}
                value={progress}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:hidden group-hover:[&::-webkit-slider-thumb]:block"
                style={{
                  background: `linear-gradient(to right, #1db954 ${(progress / (duration || 1)) * 100}%, #4d4d4d ${(progress / (duration || 1)) * 100}%)`,
                }}
              />
            </div>
            <span className="w-10">
              {formatTime(
                (duration ||
                  (currentTrack?.duration ? currentTrack.duration / 1000 : 0)) *
                  1000,
              )}
            </span>
          </div>
        </div>

        {/* Volume & Extras */}
        <div className="hidden md:flex items-center justify-end w-[30%] min-w-[180px] gap-4">
          <button
            onClick={(e) => { e.stopPropagation(); setShowLyrics(!showLyrics); }}
            className={cn(
              "text-gray-400 hover:text-white transition-colors relative",
              showLyrics && "text-green-500 hover:text-green-400",
            )}
          >
            <Mic2 className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleQueueClick(); }}
            className={cn(
              "text-gray-400 hover:text-white transition-colors relative",
              isQueueActive && "text-green-500 hover:text-green-400",
            )}
          >
            <ListMusic className="w-5 h-5" />
            {isQueueActive && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full"></div>
            )}
          </button>
          <div className="flex items-center gap-2 group">
            <button
              onClick={(e) => { e.stopPropagation(); toggleMute(); }}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              onClick={(e) => e.stopPropagation()}
              className="w-24 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:hidden group-hover:[&::-webkit-slider-thumb]:block"
              style={{
                background: `linear-gradient(to right, #1db954 ${(isMuted ? 0 : volume) * 100}%, #4d4d4d ${(isMuted ? 0 : volume) * 100}%)`,
              }}
            />
          </div>
        </div>

        {/* Mobile Progress Bar (Bottom Edge of Mini Player) */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gray-600 rounded-b-md overflow-hidden md:hidden">
          <div 
            className="h-full bg-white"
            style={{ width: `${(progress / (duration || 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* Full Screen Mobile Player */}
      {isExpanded && (
        <div className="fixed inset-0 z-[100] flex flex-col md:hidden animate-in slide-in-from-bottom-full duration-300 overflow-hidden h-[100dvh]">
          {/* Blurred Background */}
          <div 
            className="absolute inset-0 z-0 bg-cover bg-center blur-3xl scale-110 opacity-40"
            style={{ backgroundImage: `url(${currentTrack.artwork})` }}
          />
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/40 via-[#121212]/80 to-[#121212]" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between p-4 pt-8 shrink-0">
            <button 
              onClick={() => { setIsExpanded(false); setShowLyrics(false); }} 
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md"
            >
              <ChevronDown className="w-6 h-6 text-white rotate-90" />
            </button>
            <span className="text-sm font-semibold tracking-wide text-white/80 uppercase">
              Now Playing
            </span>
            <button 
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-md"
              onClick={(e) => {
                e.stopPropagation();
                toggleLike(currentTrack);
              }}
            >
              <Heart className={cn("w-5 h-5", isLiked ? "text-red-500 fill-current" : "text-white")} />
            </button>
          </div>

          {/* Artwork */}
          <div className="relative z-10 flex-1 p-4 flex items-center justify-center min-h-0">
            <div className="w-full max-w-[280px] sm:max-w-[320px] aspect-square rounded-full overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border-4 border-white/5">
              <img 
                src={currentTrack.artwork} 
                alt={currentTrack.title}
                className="w-full h-full object-cover animate-[spin_20s_linear_infinite]" 
                style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
              />
            </div>
          </div>

          {/* Info & Controls */}
          <div className="relative z-10 p-4 pb-8 flex flex-col gap-4 text-center shrink-0">
            <div className="flex flex-col items-center px-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1 line-clamp-1">{currentTrack.title}</h2>
              <p className="text-gray-400 text-base sm:text-lg line-clamp-1">{currentTrack.artist}</p>
            </div>

            {/* Progress */}
            <div className="flex flex-col gap-2 mt-2">
              <div className="w-full group flex items-center h-4">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-1.5 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#cbfb45] [&::-webkit-slider-thumb]:rounded-full"
                  style={{
                    background: `linear-gradient(to right, #cbfb45 ${(progress / (duration || 1)) * 100}%, #4d4d4d ${(progress / (duration || 1)) * 100}%)`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 font-medium">
                <span>{formatTime(progress * 1000)}</span>
                <span>-{formatTime((duration || (currentTrack?.duration ? currentTrack.duration / 1000 : 0)) * 1000 - progress * 1000)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between mt-2 px-2">
              <button onClick={toggleShuffle} className={cn("text-white", isShuffle && "text-[#cbfb45]")}>
                <Shuffle className="w-6 h-6" />
              </button>
              <button onClick={handlePrevious} className="text-white">
                <SkipBack className="w-8 h-8 sm:w-10 sm:h-10 fill-current" />
              </button>
              <button 
                onClick={isPlaying ? pause : resume} 
                className="w-16 h-16 sm:w-20 sm:h-20 bg-[#cbfb45] rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(203,251,69,0.3)] hover:scale-105 transition-transform shrink-0"
              >
                {isPlaying ? <Pause className="w-8 h-8 sm:w-10 sm:h-10 fill-current" /> : <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />}
              </button>
              <button onClick={next} className="text-white">
                <SkipForward className="w-8 h-8 sm:w-10 sm:h-10 fill-current" />
              </button>
              <button className="text-white">
                <ListMusic className="w-6 h-6" onClick={() => { setIsExpanded(false); navigate('/queue'); }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lyrics Overlay */}
      {showLyrics && currentTrack && (
        <div className="fixed inset-0 z-[60] bg-[#121212]/95 backdrop-blur-md flex flex-col pt-12 pb-24 px-6 md:px-20 overflow-y-auto animate-in fade-in duration-200">
          <button 
            onClick={() => setShowLyrics(false)} 
            className="absolute top-6 right-6 text-white p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-8 text-center">{currentTrack.title} - Lyrics</h2>
          {loadingLyrics ? (
            <div className="flex justify-center mt-20">
              <div className="animate-spin w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full"></div>
            </div>
          ) : lyrics ? (
            <div className="text-white/80 text-lg md:text-2xl leading-relaxed text-center whitespace-pre-wrap max-w-3xl mx-auto font-medium pb-20">
              {lyrics}
            </div>
          ) : (
            <div className="text-white/50 text-center text-xl mt-20">
              Lyrics not available for this track.
            </div>
          )}
        </div>
      )}
    </>
  );
}
