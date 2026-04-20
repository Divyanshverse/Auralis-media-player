import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';
import { ArrowLeft, MoreHorizontal, Play, Pause, Heart, Music } from 'lucide-react';
import { cn } from '../utils/helpers';
import CreatePlaylistModal from '../components/CreatePlaylistModal';

export default function Library() {
  const navigate = useNavigate();
  const { playlists, likedTracks, currentTrack, isPlaying, playTrack, pause } = usePlayerStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="pt-4 md:pt-6 pb-40 h-full overflow-y-auto bg-[#121212]">
      <CreatePlaylistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 mb-8 pt-2">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-[#282828] flex items-center justify-center text-white hover:bg-[#383838] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-white">My Music</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-10 h-10 rounded-full bg-[#282828] flex items-center justify-center text-white hover:bg-[#383838] transition-colors"
        >
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* List */}
      <div className="flex flex-col gap-2 px-4 md:px-6">
        {/* Liked Songs Item */}
        <div
          className="flex items-center justify-between group cursor-pointer hover:bg-[#282828] p-2 rounded-xl transition-colors"
          onClick={() => navigate('/liked')}
        >
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-300 flex items-center justify-center flex-shrink-0">
              <Heart className="w-6 h-6 text-white fill-current" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-bold text-base truncate">Liked Songs</h4>
              <p className="text-gray-400 text-sm truncate">By You • {likedTracks.length} Songs</p>
            </div>
          </div>
          <button className="w-8 h-8 rounded-full bg-[#282828] flex items-center justify-center text-white group-hover:bg-[#cbfb45] group-hover:text-black transition-colors flex-shrink-0 ml-4">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </button>
        </div>

        {/* Playlists */}
        {playlists.map((playlist) => (
          <div
            key={playlist.id}
            className="flex items-center justify-between group cursor-pointer hover:bg-[#282828] p-2 rounded-xl transition-colors"
            onClick={() => navigate(`/playlist/${playlist.id}`)}
          >
            <div className="flex items-center gap-4 flex-1 min-w-0">
              {playlist.tracks.length > 0 ? (
                <img
                  src={playlist.tracks[0].artwork}
                  alt={playlist.name}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  loading="lazy"
                />
              ) : (
                <div className="w-14 h-14 rounded-lg bg-[#282828] flex items-center justify-center flex-shrink-0">
                  <Music className="w-6 h-6 text-gray-500" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h4 className="text-white font-bold text-base truncate">{playlist.name}</h4>
                <p className="text-gray-400 text-sm truncate">By You • {playlist.tracks.length} Songs</p>
              </div>
            </div>
            <button className="w-8 h-8 rounded-full bg-[#282828] flex items-center justify-center text-white group-hover:bg-[#cbfb45] group-hover:text-black transition-colors flex-shrink-0 ml-4">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </button>
          </div>
        ))}
        
        {/* Liked Tracks (as individual items) */}
        {likedTracks.slice(0, 10).map((track) => {
          const isTrackCurrent = currentTrack?.id === track.id;
          return (
            <div
              key={track.id}
              className="flex items-center justify-between group cursor-pointer hover:bg-[#282828] p-2 rounded-xl transition-colors"
              onClick={() => navigate(`/song/${track.id}`, { state: { track } })}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <img
                  src={track.artwork}
                  alt={track.title}
                  className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
                  loading="lazy"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold text-base truncate">{track.title}</h4>
                  <p className="text-gray-400 text-sm truncate">{track.artist}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (isTrackCurrent && isPlaying) {
                    pause();
                  } else {
                    playTrack(track, likedTracks);
                  }
                }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ml-4",
                  isTrackCurrent && isPlaying ? "bg-[#cbfb45] text-black" : "bg-[#282828] text-white group-hover:bg-[#cbfb45] group-hover:text-black"
                )}
              >
                {isTrackCurrent && isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
