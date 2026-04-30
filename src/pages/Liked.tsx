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
    <div className="h-full overflow-y-auto bg-gradient-to-b from-indigo-900 to-[#0B0B0D] pb-40">
      <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 p-4 md:p-6 pt-12 md:pt-24 pb-6 md:pb-8 bg-gradient-to-b from-transparent to-[#0B0B0D]/40">
        <div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-indigo-600 to-blue-300 shadow-2xl flex items-center justify-center shrink-0 self-center md:self-auto">
          <Heart className="w-12 h-12 md:w-20 md:h-20 text-white fill-current" />
        </div>
        <div className="flex flex-col gap-1 md:gap-2 text-center md:text-left mt-2 md:mt-0">
          <span className="text-xs md:text-sm font-bold text-white uppercase hidden md:block">Playlist</span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white tracking-tighter">Liked Songs</h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs md:text-sm text-gray-300 mt-1 md:mt-2">
            <span className="font-bold text-white">You</span>
            <span>•</span>
            <span>{likedTracks.length} songs</span>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 bg-black/20 min-h-screen">
        <div className="flex items-center justify-center md:justify-start gap-6 mb-6 md:mb-8">
          <button
            onClick={handlePlayAll}
            disabled={likedTracks.length === 0}
            className={cn(
              "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-xl transition-all",
              likedTracks.length === 0 ? "bg-gray-600 cursor-not-allowed" : "bg-[#A78BFA] hover:scale-105 hover:bg-[#8B5CF6]"
            )}
          >
            {isPlayingLiked ? (
              <Pause className="w-5 h-5 md:w-6 md:h-6 text-[#0B0B0D] fill-current" />
            ) : (
              <Play className="w-5 h-5 md:w-6 md:h-6 text-[#0B0B0D] fill-current ml-1" />
            )}
          </button>
        </div>

        {likedTracks.length > 0 ? (
          <TrackList tracks={likedTracks} />
        ) : (
          <div className="text-center text-gray-400 mt-10 md:mt-20 px-4">
            <Heart className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Songs you like will appear here</h2>
            <p className="text-sm md:text-base">Save songs by tapping the heart icon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
