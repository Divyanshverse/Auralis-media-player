import { usePlayerStore } from '../store/usePlayerStore';
import TrackList from '../components/TrackList';
import { Play, Pause, Heart } from 'lucide-react';
import { cn } from '../utils/helpers';

export default function Liked() {
  const { likedTracks, currentTrack, isPlaying, playTrack, pause } = usePlayerStore();

  const isPlayingLiked = currentTrack && likedTracks.some(t => t.id === currentTrack.id) && isPlaying;

  const handlePlayAll = () => {
    if (likedTracks.length === 0) return;
    if (isPlayingLiked) {
      pause();
    } else {
      playTrack(likedTracks[0], likedTracks);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-indigo-900 to-[#121212] pb-24">
      <div className="flex items-end gap-6 p-6 pt-24 pb-8 bg-gradient-to-b from-transparent to-black/40">
        <div className="w-48 h-48 bg-gradient-to-br from-indigo-600 to-blue-300 shadow-2xl flex items-center justify-center shrink-0">
          <Heart className="w-20 h-20 text-white fill-current" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-white uppercase">Playlist</span>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">Liked Songs</h1>
          <div className="flex items-center gap-2 text-sm text-gray-300 mt-2">
            <span className="font-bold text-white">You</span>
            <span>•</span>
            <span>{likedTracks.length} songs</span>
          </div>
        </div>
      </div>

      <div className="p-6 bg-black/20 min-h-screen">
        <div className="flex items-center gap-6 mb-8">
          <button
            onClick={handlePlayAll}
            disabled={likedTracks.length === 0}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all",
              likedTracks.length === 0 ? "bg-gray-600 cursor-not-allowed" : "bg-green-500 hover:scale-105 hover:bg-green-400"
            )}
          >
            {isPlayingLiked ? (
              <Pause className="w-6 h-6 text-black fill-current" />
            ) : (
              <Play className="w-6 h-6 text-black fill-current ml-1" />
            )}
          </button>
        </div>

        {likedTracks.length > 0 ? (
          <TrackList tracks={likedTracks} />
        ) : (
          <div className="text-center text-gray-400 mt-20">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-2xl font-bold text-white mb-2">Songs you like will appear here</h2>
            <p>Save songs by tapping the heart icon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
