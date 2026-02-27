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
} from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";
import { formatTime, cn } from "../utils/helpers";
import { getOfflineTrackUrl } from "../utils/offline";

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
    setVolume,
    toggleMute,
    toggleRepeat,
    toggleShuffle,
    toggleLike,
  } = usePlayerStore();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const lastUpdateRef = useRef<number>(0);

  const isLiked = currentTrack
    ? likedTracks.some((t) => t.id === currentTrack.id)
    : false;
  const isQueueActive = location.pathname === "/queue";

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error);
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    let currentOfflineUrl: string | null = null;

    const loadTrack = async () => {
      if (!currentTrack && audioRef.current) {
        audioRef.current.src = "";
        return;
      }
      if (currentTrack && audioRef.current) {
        const offlineUrl = await getOfflineTrackUrl(currentTrack.id);
        currentOfflineUrl = offlineUrl;
        audioRef.current.src = offlineUrl || currentTrack.url;
        audioRef.current.play().catch(console.error);
        setProgress(0);
        lastUpdateRef.current = 0;

        if ("mediaSession" in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: currentTrack.title,
            artist: currentTrack.artist,
            album: currentTrack.album,
            artwork: [
              {
                src: currentTrack.artwork,
                sizes: "300x300",
                type: "image/jpeg",
              },
            ],
          });

          navigator.mediaSession.setActionHandler("play", resume);
          navigator.mediaSession.setActionHandler("pause", pause);
          navigator.mediaSession.setActionHandler("previoustrack", previous);
          navigator.mediaSession.setActionHandler("nexttrack", next);
        }
      }
    };
    loadTrack();

    return () => {
      if (currentOfflineUrl) {
        URL.revokeObjectURL(currentOfflineUrl);
      }
    };
  }, [currentTrack]);

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
      />

      {/* Mini Player (Mobile) & Standard Player (Desktop) */}
      <div 
        className={cn(
          "bg-[#282828] md:bg-[#181818] flex items-center justify-between shrink-0 transition-all cursor-pointer md:cursor-default relative overflow-hidden",
          "md:h-24 md:border-t md:border-[#282828] md:px-4 md:m-0 md:rounded-none",
          "h-14 mx-2 mb-2 px-2 rounded-md", // Mobile styles
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
            <span className="text-white text-sm font-medium hover:underline cursor-pointer truncate">
              {currentTrack.title}
            </span>
            <span className="text-xs text-gray-400 hover:underline cursor-pointer truncate">
              {currentTrack.artist}
            </span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); toggleLike(currentTrack); }}
            className={cn(
              "text-gray-400 hover:text-white transition-colors hidden sm:block",
              isLiked && "text-green-500 hover:text-green-400",
            )}
          >
            <Heart className={cn("w-5 h-5", isLiked && "fill-current")} />
          </button>
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
              onClick={previous}
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
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-gray-800 to-[#121212] flex flex-col md:hidden animate-in slide-in-from-bottom-full duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pt-6">
            <button onClick={() => setIsExpanded(false)} className="p-2">
              <ChevronDown className="w-6 h-6 text-white" />
            </button>
            <div className="text-center flex flex-col items-center">
              <span className="text-[10px] text-white font-bold tracking-widest uppercase opacity-80">
                Playing from playlist
              </span>
              <span className="text-xs text-white font-bold mt-0.5">
                {currentTrack.album || "Single"}
              </span>
            </div>
            <button className="p-2">
              <MoreVertical className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Artwork */}
          <div className="flex-1 p-6 flex items-center justify-center max-h-[50vh]">
            <img 
              src={currentTrack.artwork} 
              alt={currentTrack.title}
              className="w-full max-w-[320px] aspect-square object-cover rounded-lg shadow-2xl" 
            />
          </div>

          {/* Info & Controls */}
          <div className="p-6 pb-12 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div className="flex flex-col overflow-hidden pr-4">
                <h2 className="text-2xl font-bold text-white truncate">{currentTrack.title}</h2>
                <p className="text-gray-400 text-lg truncate">{currentTrack.artist}</p>
              </div>
              <button onClick={() => toggleLike(currentTrack)} className="shrink-0">
                <Heart className={cn("w-7 h-7", isLiked ? "text-green-500 fill-current" : "text-white")} />
              </button>
            </div>

            {/* Progress */}
            <div className="flex flex-col gap-2">
              <div className="w-full group flex items-center h-4">
                <input
                  type="range"
                  min={0}
                  max={duration || 100}
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                  style={{
                    background: `linear-gradient(to right, #fff ${(progress / (duration || 1)) * 100}%, #4d4d4d ${(progress / (duration || 1)) * 100}%)`,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 font-medium">
                <span>{formatTime(progress * 1000)}</span>
                <span>{formatTime((duration || (currentTrack?.duration ? currentTrack.duration / 1000 : 0)) * 1000)}</span>
              </div>
            </div>

            {/* Playback Controls */}
            <div className="flex items-center justify-between mt-2">
              <button onClick={toggleShuffle} className={cn("text-white", isShuffle && "text-green-500")}>
                <Shuffle className="w-6 h-6" />
              </button>
              <button onClick={previous} className="text-white">
                <SkipBack className="w-10 h-10 fill-current" />
              </button>
              <button 
                onClick={isPlaying ? pause : resume} 
                className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
              </button>
              <button onClick={next} className="text-white">
                <SkipForward className="w-10 h-10 fill-current" />
              </button>
              <button onClick={toggleRepeat} className={cn("text-white relative", repeatMode !== 'off' && "text-green-500")}>
                <Repeat className="w-6 h-6" />
                {repeatMode === "one" && (
                  <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-[#181818] rounded-full w-3 h-3 flex items-center justify-center">
                    1
                  </span>
                )}
              </button>
            </div>
            
            {/* Bottom Actions */}
            <div className="flex items-center justify-between mt-4">
              <button className="text-white">
                <ListMusic className="w-5 h-5" onClick={() => { setIsExpanded(false); navigate('/queue'); }} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
