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
      <div className="flex items-end gap-6 p-6 pt-24 pb-8 bg-gradient-to-b from-transparent to-black/40">
        <div className="w-48 h-48 bg-gradient-to-br from-green-600 to-emerald-300 shadow-2xl flex items-center justify-center shrink-0">
          <Download className="w-20 h-20 text-white" />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold text-white uppercase">Playlist</span>
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tighter">Downloaded</h1>
          <div className="flex items-center gap-2 text-sm text-gray-300 mt-2">
            <span className="font-bold text-white">Available Offline</span>
            <span>•</span>
            <span>{tracks.length} songs</span>
          </div>
        </div>
      </div>

      <div className="p-6 bg-black/20 min-h-screen">
        <div className="flex items-center gap-6 mb-8">
          <button
            onClick={handlePlayAll}
            disabled={tracks.length === 0}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all",
              tracks.length === 0 ? "bg-gray-600 cursor-not-allowed" : "bg-green-500 hover:scale-105 hover:bg-green-400"
            )}
          >
            {isPlayingDownloaded ? (
              <Pause className="w-6 h-6 text-black fill-current" />
            ) : (
              <Play className="w-6 h-6 text-black fill-current ml-1" />
            )}
          </button>
        </div>

        {tracks.length > 0 ? (
          <TrackList tracks={tracks} />
        ) : (
          <div className="text-center text-gray-400 mt-20">
            <Download className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-2xl font-bold text-white mb-2">No downloaded songs</h2>
            <p>Songs you download will appear here for offline listening.</p>
          </div>
        )}
      </div>
    </div>
  );
}
