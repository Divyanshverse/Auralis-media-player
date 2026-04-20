import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';
import TrackList from '../components/TrackList';
import { Play, Pause, Music, Trash2, Edit2 } from 'lucide-react';
import { cn } from '../utils/helpers';

export default function Playlist() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playlists, currentTrack, isPlaying, playTrack, pause, deletePlaylist, renamePlaylist } = usePlayerStore();

  const playlist = playlists.find(p => p.id === id);

  if (!playlist) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#121212] text-white">
        <Music className="w-24 h-24 text-gray-600 mb-6" />
        <h1 className="text-3xl font-bold mb-4">Playlist not found</h1>
        <button
          onClick={() => navigate('/library')}
          className="px-6 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform"
        >
          Go to Library
        </button>
      </div>
    );
  }

  const isPlayingPlaylist = currentTrack && playlist.tracks.some(t => t.id === currentTrack.id) && isPlaying;

  const handlePlayAll = () => {
    if (playlist.tracks.length === 0) return;
    if (isPlayingPlaylist) {
      pause();
    } else {
      playTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this playlist?')) {
      deletePlaylist(playlist.id);
      navigate('/library');
    }
  };

  const handleRename = () => {
    const newName = prompt('Enter new playlist name:', playlist.name);
    if (newName && newName.trim()) {
      renamePlaylist(playlist.id, newName.trim());
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-gray-800 to-[#121212] pb-40">
      <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 p-4 md:p-6 pt-12 md:pt-24 pb-6 md:pb-8 bg-gradient-to-b from-transparent to-black/40">
        <div className="w-32 h-32 md:w-48 md:h-48 bg-[#282828] shadow-2xl flex items-center justify-center shrink-0 self-center md:self-auto">
          {playlist.tracks.length > 0 ? (
            <img src={playlist.tracks[0].artwork} alt={playlist.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <Music className="w-12 h-12 md:w-20 md:h-20 text-gray-500" />
          )}
        </div>
        <div className="flex flex-col gap-1 md:gap-2 w-full text-center md:text-left mt-2 md:mt-0">
          <span className="text-xs md:text-sm font-bold text-white uppercase hidden md:block">Playlist</span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white tracking-tighter truncate">{playlist.name}</h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs md:text-sm text-gray-300 mt-1 md:mt-2">
            <span className="font-bold text-white">You</span>
            <span>•</span>
            <span>{playlist.tracks.length} songs</span>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 bg-black/20 min-h-screen">
        <div className="flex items-center justify-center md:justify-start gap-6 mb-6 md:mb-8">
          <button
            onClick={handlePlayAll}
            disabled={playlist.tracks.length === 0}
            className={cn(
              "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-xl transition-all",
              playlist.tracks.length === 0 ? "bg-gray-600 cursor-not-allowed" : "bg-green-500 hover:scale-105 hover:bg-green-400"
            )}
          >
            {isPlayingPlaylist ? (
              <Pause className="w-5 h-5 md:w-6 md:h-6 text-black fill-current" />
            ) : (
              <Play className="w-5 h-5 md:w-6 md:h-6 text-black fill-current ml-1" />
            )}
          </button>
          <button onClick={handleRename} className="text-gray-400 hover:text-white transition-colors">
            <Edit2 className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button onClick={handleDelete} className="text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {playlist.tracks.length > 0 ? (
          <TrackList tracks={playlist.tracks} playlistId={playlist.id} />
        ) : (
          <div className="text-center text-gray-400 mt-10 md:mt-20 px-4">
            <Music className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Let's find something for your playlist</h2>
            <button
              onClick={() => navigate('/search')}
              className="mt-4 px-4 py-2 md:px-6 md:py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform text-sm md:text-base"
            >
              Go to Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
