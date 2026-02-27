import { NavLink } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';
import { Heart, PlusSquare, Music } from 'lucide-react';
import { cn } from '../utils/helpers';

export default function Library() {
  const { playlists, likedTracks, createPlaylist } = usePlayerStore();

  const handleCreatePlaylist = () => {
    const name = prompt('Enter playlist name:');
    if (name) {
      createPlaylist(name);
    }
  };

  return (
    <div className="p-4 md:p-6 pb-6 h-full overflow-y-auto bg-[#121212]">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">Your Library</h1>
        <button
          onClick={handleCreatePlaylist}
          className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform text-sm md:text-base"
        >
          <PlusSquare className="w-4 h-4 md:w-5 md:h-5" />
          <span className="hidden sm:inline">Create Playlist</span>
          <span className="sm:hidden">Create</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 md:gap-6">
        <NavLink
          to="/liked"
          className="bg-gradient-to-br from-indigo-600 to-blue-300 p-4 md:p-6 rounded-md hover:scale-105 transition-transform group cursor-pointer relative aspect-square flex flex-col justify-end"
        >
          <div className="absolute top-3 left-3 md:top-4 md:left-4">
            <Heart className="w-6 h-6 md:w-8 md:h-8 text-white fill-current" />
          </div>
          <h3 className="text-white font-bold text-xl md:text-2xl mb-1 md:mb-2">Liked Songs</h3>
          <p className="text-white/80 text-xs md:text-sm">{likedTracks.length} liked songs</p>
        </NavLink>

        {playlists.map((playlist) => (
          <NavLink
            key={playlist.id}
            to={`/playlist/${playlist.id}`}
            className="bg-[#181818] p-3 md:p-4 rounded-md hover:bg-[#282828] transition-colors group cursor-pointer relative aspect-square flex flex-col"
          >
            <div className="flex-1 flex items-center justify-center bg-[#282828] rounded-md mb-3 md:mb-4 shadow-lg overflow-hidden">
              {playlist.tracks.length > 0 ? (
                <img
                  src={playlist.tracks[0].artwork}
                  alt={playlist.name}
                  className="w-full h-full object-cover rounded-md"
                  loading="lazy"
                />
              ) : (
                <Music className="w-8 h-8 md:w-12 md:h-12 text-gray-500" />
              )}
            </div>
            <h3 className="text-white font-bold truncate mb-1 text-sm md:text-base">{playlist.name}</h3>
            <p className="text-gray-400 text-xs md:text-sm truncate">By You • {playlist.tracks.length} tracks</p>
          </NavLink>
        ))}
      </div>
    </div>
  );
}
