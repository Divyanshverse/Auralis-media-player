import { usePlayerStore } from '../store/usePlayerStore';
import TrackList from '../components/TrackList';
import { Download, Play, Pause } from 'lucide-react';
import { cn } from '../utils/helpers';

export default function Downloaded() {
  const { downloadedTracks, history, likedTracks, playlists, currentTrack, isPlaying, playTrack, pause } = usePlayerStore();

  // Reconstruct track objects from the IDs
  // Since we don't store the full track object for downloaded tracks, we need to find them
  // in our other stores (history, liked, playlists)
  const allKnownTracks = [
    ...history,
    ...likedTracks,
    ...playlists.flatMap(p => p.tracks)
  ];
  
  // Deduplicate and filter
  const uniqueTracks = Array.from(new Map(allKnownTracks.map(t => [t.id, t])).values());
  const tracks = uniqueTracks.filter(t => downloadedTracks.includes(t.id));

  const isPlayingDownloaded = currentTrack && tracks.some(t => t.id === currentTrack.id) && isPlaying;

  const handlePlayAll = () => {
    if (tracks.length === 0) return;
    if (isPlayingDownloaded) {
      pause();
    } else {
      playTrack(tracks[0], tracks);
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-green-900 to-[#121212] pb-24">
      <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6 p-4 md:p-6 pt-12 md:pt-24 pb-6 md:pb-8 bg-gradient-to-b from-transparent to-black/40">
        <div className="w-32 h-32 md:w-48 md:h-48 bg-gradient-to-br from-green-600 to-emerald-300 shadow-2xl flex items-center justify-center shrink-0 self-center md:self-auto">
          <Download className="w-12 h-12 md:w-20 md:h-20 text-white" />
        </div>
        <div className="flex flex-col gap-1 md:gap-2 text-center md:text-left mt-2 md:mt-0">
          <span className="text-xs md:text-sm font-bold text-white uppercase hidden md:block">Playlist</span>
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-white tracking-tighter">Downloaded</h1>
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs md:text-sm text-gray-300 mt-1 md:mt-2">
            <span className="font-bold text-white">Available Offline</span>
            <span>•</span>
            <span>{tracks.length} songs</span>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 bg-black/20 min-h-screen">
        <div className="flex items-center justify-center md:justify-start gap-6 mb-6 md:mb-8">
          <button
            onClick={handlePlayAll}
            disabled={tracks.length === 0}
            className={cn(
              "w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-xl transition-all",
              tracks.length === 0 ? "bg-gray-600 cursor-not-allowed" : "bg-green-500 hover:scale-105 hover:bg-green-400"
            )}
          >
            {isPlayingDownloaded ? (
              <Pause className="w-5 h-5 md:w-6 md:h-6 text-black fill-current" />
            ) : (
              <Play className="w-5 h-5 md:w-6 md:h-6 text-black fill-current ml-1" />
            )}
          </button>
        </div>

        {tracks.length > 0 ? (
          <TrackList tracks={tracks} />
        ) : (
          <div className="text-center text-gray-400 mt-10 md:mt-20 px-4">
            <Download className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl md:text-2xl font-bold text-white mb-2">No downloaded songs</h2>
            <p className="text-sm md:text-base">Songs you download will appear here for offline listening.</p>
          </div>
        )}
      </div>
    </div>
  );
}
