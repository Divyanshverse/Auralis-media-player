import React, { useState, useRef, useEffect, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Heart, MoreHorizontal, Plus, Trash2, Download, CheckCircle2, FileDown } from 'lucide-react';
import { Track } from '../types';
import { usePlayerStore } from '../store/usePlayerStore';
import { formatTime, cn, downloadToDevice } from '../utils/helpers';
import { saveTrackOffline, removeTrackOffline } from '../utils/offline';

interface TrackItemProps {
  track: Track;
  index: number;
  isCurrent: boolean;
  isPlaying: boolean;
  isLiked: boolean;
  isDownloaded: boolean;
  isDownloading: boolean;
  isDropdownOpen: boolean;
  playlistId?: string;
  playlists: any[];
  onPlay: (track: Track) => void;
  onPause: () => void;
  onToggleLike: (track: Track) => void;
  onDownloadToggle: (e: React.MouseEvent, track: Track) => void;
  onDropdownToggle: (trackId: string | null) => void;
  onAddToQueue: (track: Track) => void;
  onAddToPlaylist: (playlistId: string, track: Track) => void;
  onRemoveFromPlaylist: (playlistId: string, trackId: string) => void;
  onSaveToDevice: (track: Track) => void;
  onNavigateToSong: (track: Track) => void;
  onNavigateToArtist: (artist: string) => void;
}

const TrackItem = memo(({
  track, index, isCurrent, isPlaying, isLiked, isDownloaded, isDownloading, isDropdownOpen,
  playlistId, playlists, onPlay, onPause, onToggleLike, onDownloadToggle, onDropdownToggle,
  onAddToQueue, onAddToPlaylist, onRemoveFromPlaylist, onSaveToDevice, onNavigateToSong, onNavigateToArtist
}: TrackItemProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onDropdownToggle(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen, onDropdownToggle]);

  return (
    <div
      className="group flex md:grid md:grid-cols-[16px_4fr_3fr_2fr_minmax(150px,1fr)] gap-3 md:gap-4 px-3 md:px-4 py-2 text-sm text-gray-400 hover:bg-white/10 rounded-md transition-colors items-center cursor-pointer relative"
      onClick={() => onNavigateToSong(track)}
    >
      <div className="w-4 hidden md:flex justify-center">
        {isCurrent && isPlaying ? (
          <Pause className="w-4 h-4 text-green-500 hover:scale-110" onClick={(e) => { e.stopPropagation(); onPause(); }} />
        ) : isCurrent ? (
          <Play className="w-4 h-4 text-green-500 hover:scale-110" onClick={(e) => { e.stopPropagation(); onPlay(track); }} />
        ) : (
          <span className="group-hover:hidden">{index + 1}</span>
        )}
        {!isCurrent && (
          <Play className="w-4 h-4 text-white hidden group-hover:block hover:scale-110" onClick={(e) => { e.stopPropagation(); onPlay(track); }} />
        )}
      </div>

      <div className="flex-1 md:flex-none flex items-center gap-3 overflow-hidden">
        <div className="relative w-10 h-10 shrink-0">
          <img src={track.artwork} alt={track.title} className="w-10 h-10 object-cover rounded-sm" loading="lazy" />
          <div className="absolute inset-0 bg-black/40 hidden md:hidden group-hover:flex items-center justify-center rounded-sm">
            {isCurrent && isPlaying ? (
              <Pause className="w-4 h-4 text-white hover:scale-110" onClick={(e) => { e.stopPropagation(); onPause(); }} />
            ) : (
              <Play className="w-4 h-4 text-white ml-0.5 hover:scale-110" onClick={(e) => { e.stopPropagation(); onPlay(track); }} />
            )}
          </div>
          {/* Mobile play indicator */}
          {isCurrent && (
            <div className="absolute inset-0 bg-black/60 flex md:hidden items-center justify-center rounded-sm">
              {isPlaying ? (
                <Pause className="w-4 h-4 text-green-500 hover:scale-110" onClick={(e) => { e.stopPropagation(); onPause(); }} />
              ) : (
                <Play className="w-4 h-4 text-green-500 ml-0.5 hover:scale-110" onClick={(e) => { e.stopPropagation(); onPlay(track); }} />
              )}
            </div>
          )}
        </div>
        <div className="truncate">
          <div className={cn("truncate text-base hover:underline", isCurrent ? "text-green-500" : "text-white")}>
            {track.title}
          </div>
          <div 
            className="flex items-center gap-2 truncate text-sm group-hover:text-white transition-colors hover:underline cursor-pointer"
            onClick={(e) => { e.stopPropagation(); onNavigateToArtist(track.artist); }}
          >
            {isDownloaded && <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0" />}
            <span className="truncate">{track.artist}</span>
          </div>
        </div>
      </div>

      <div className="truncate group-hover:text-white transition-colors hidden md:block">
        {track.album}
      </div>

      <div className="truncate hidden md:block">
        {new Date().toLocaleDateString()}
      </div>

      <div className="flex items-center justify-end gap-3 md:gap-4 relative shrink-0">
        <button
          onClick={(e) => onDownloadToggle(e, track)}
          className={cn(
            "opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity", 
            isDownloaded && "opacity-100 text-green-500",
            isDownloading && "opacity-100 animate-pulse text-gray-400"
          )}
          disabled={isDownloading}
        >
          {isDownloaded ? <CheckCircle2 className="w-4 h-4" /> : <Download className="w-4 h-4" />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onToggleLike(track); }}
          className={cn("opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity", isLiked && "opacity-100 text-green-500")}
        >
          <Heart className={cn("w-4 h-4", isLiked && "fill-current")} />
        </button>
        <div className="w-10 text-right hidden md:block">{formatTime(track.duration)}</div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDropdownToggle(isDropdownOpen ? null : track.id);
          }}
          className={cn("opacity-100 md:opacity-50 group-hover:opacity-100 transition-opacity text-white hover:scale-110", isDropdownOpen && "opacity-100")}
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>

        {isDropdownOpen && (
          <div 
            ref={dropdownRef}
            className="absolute right-0 top-8 w-48 bg-[#282828] rounded-md shadow-2xl z-50 py-1 border border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/10 mb-1">
              Options
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToQueue(track);
                onDropdownToggle(null);
              }}
              className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Queue</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSaveToDevice(track);
                onDropdownToggle(null);
              }}
              className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              <span>Save to Device</span>
            </button>
            <div className="border-t border-white/10 my-1"></div>
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
                      onAddToPlaylist(playlist.id, track);
                      onDropdownToggle(null);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-white hover:bg-white/10 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="truncate">{playlist.name}</span>
                  </button>
                ))
              )}
            </div>
            {playlistId && (
              <>
                <div className="border-t border-white/10 my-1"></div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFromPlaylist(playlistId, track.id);
                    onDropdownToggle(null);
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-white/10 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove from this playlist</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

interface TrackListProps {
  tracks: Track[];
  showHeader?: boolean;
  playlistId?: string;
}

export default function TrackList({ tracks, showHeader = true, playlistId }: TrackListProps) {
  const navigate = useNavigate();
  const { 
    currentTrack, isPlaying, playTrack, pause, toggleLike, likedTracks, 
    playlists, addTrackToPlaylist, removeTrackFromPlaylist, addToQueue,
    downloadedTracks, addDownloadedTrack, removeDownloadedTrack
  } = usePlayerStore();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownloadToggle = useCallback(async (e: React.MouseEvent, track: Track) => {
    e.stopPropagation();
    const isDownloaded = downloadedTracks.includes(track.id);
    
    if (isDownloaded) {
      await removeTrackOffline(track.id);
      removeDownloadedTrack(track.id);
    } else {
      setDownloading(track.id);
      const success = await saveTrackOffline(track);
      if (success) {
        addDownloadedTrack(track.id);
      }
      setDownloading(null);
    }
  }, [downloadedTracks, removeDownloadedTrack, addDownloadedTrack]);

  const handleSaveToDevice = useCallback(async (track: Track) => {
    await downloadToDevice(track);
  }, []);

  const handlePlay = useCallback((track: Track) => {
    playTrack(track, tracks);
  }, [playTrack, tracks]);

  const handleDropdownToggle = useCallback((trackId: string | null) => {
    setActiveDropdown(trackId);
  }, []);

  const handleNavigateToSong = useCallback((track: Track) => {
    navigate(`/song/${track.id}`, { state: { track } });
  }, [navigate]);

  const handleNavigateToArtist = useCallback((artist: string) => {
    navigate(`/artist/${encodeURIComponent(artist)}`);
  }, [navigate]);

  return (
    <div className="w-full pb-8">
      {showHeader && (
        <div className="hidden md:grid grid-cols-[16px_4fr_3fr_2fr_minmax(150px,1fr)] gap-4 px-4 py-2 text-sm text-gray-400 border-b border-white/10 mb-4">
          <div>#</div>
          <div>Title</div>
          <div>Album</div>
          <div>Date added</div>
          <div className="text-right">Time</div>
        </div>
      )}

      <div className="space-y-1">
        {tracks.map((track, index) => (
          <TrackItem
            key={`${track.id}-${index}`}
            track={track}
            index={index}
            isCurrent={currentTrack?.id === track.id}
            isPlaying={isPlaying}
            isLiked={likedTracks.some(t => t.id === track.id)}
            isDownloaded={downloadedTracks.includes(track.id)}
            isDownloading={downloading === track.id}
            isDropdownOpen={activeDropdown === track.id}
            playlistId={playlistId}
            playlists={playlists}
            onPlay={handlePlay}
            onPause={pause}
            onToggleLike={toggleLike}
            onDownloadToggle={handleDownloadToggle}
            onDropdownToggle={handleDropdownToggle}
            onAddToQueue={addToQueue}
            onAddToPlaylist={addTrackToPlaylist}
            onRemoveFromPlaylist={removeTrackFromPlaylist}
            onSaveToDevice={handleSaveToDevice}
            onNavigateToSong={handleNavigateToSong}
            onNavigateToArtist={handleNavigateToArtist}
          />
        ))}
      </div>
    </div>
  );
}



