import { useEffect, useState, memo, useCallback } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';
import { getRecommendations } from '../utils/api';
import { Track } from '../types';
import { Play, Pause } from 'lucide-react';
import { cn } from '../utils/helpers';

const TrackCard = memo(({ 
  track, 
  context, 
  isCurrent, 
  isPlaying, 
  onPlay, 
  onPause 
}: { 
  track: Track; 
  context: Track[]; 
  isCurrent: boolean; 
  isPlaying: boolean; 
  onPlay: (track: Track, context: Track[]) => void; 
  onPause: () => void; 
}) => {
  return (
    <div
      className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition-colors group cursor-pointer relative"
      onClick={() => onPlay(track, context)}
    >
      <div className="relative mb-4">
        <img
          src={track.artwork}
          alt={track.title}
          className="w-full aspect-square object-cover rounded-md shadow-lg"
          loading="lazy"
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (isCurrent && isPlaying) {
              onPause();
            } else {
              onPlay(track, context);
            }
          }}
          className={cn(
            "absolute bottom-2 right-2 w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-xl hover:scale-105 hover:bg-green-400 transition-all z-10",
            isCurrent && isPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
          )}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-6 h-6 text-black fill-current" />
          ) : (
            <Play className="w-6 h-6 text-black fill-current ml-1" />
          )}
        </button>
      </div>
      <h3 className="text-white font-bold truncate mb-1">{track.title}</h3>
      <p className="text-gray-400 text-sm truncate">{track.artist}</p>
    </div>
  );
});

export default function Home() {
  const { history, currentTrack, isPlaying, playTrack, pause } = usePlayerStore();
  const [recommendations, setRecommendations] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      setLoading(true);
      const recs = await getRecommendations();
      setRecommendations(recs);
      setLoading(false);
    };
    fetchRecs();
  }, []);

  const handlePlay = useCallback((track: Track, context: Track[]) => {
    playTrack(track, context);
  }, [playTrack]);

  return (
    <div className="p-6 pb-24 h-full overflow-y-auto bg-gradient-to-b from-[#2a2a2a] to-[#121212]">
      <h1 className="text-3xl font-bold text-white mb-6">Good evening</h1>

      {history.length > 0 && (
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4 hover:underline cursor-pointer">Recently played</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {history.slice(0, 6).map(track => (
              <TrackCard
                key={track.id}
                track={track}
                context={history}
                isCurrent={currentTrack?.id === track.id}
                isPlaying={isPlaying}
                onPlay={handlePlay}
                onPause={pause}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold text-white mb-4 hover:underline cursor-pointer">Recommended for you</h2>
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-[#181818] p-4 rounded-md animate-pulse">
                <div className="w-full aspect-square bg-[#282828] rounded-md mb-4"></div>
                <div className="h-4 bg-[#282828] rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-[#282828] rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {recommendations.map(track => (
              <TrackCard
                key={track.id}
                track={track}
                context={recommendations}
                isCurrent={currentTrack?.id === track.id}
                isPlaying={isPlaying}
                onPlay={handlePlay}
                onPause={pause}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
