import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';
import { getAlbumTracks } from '../utils/api';
import { Track } from '../types';
import { Play, Pause, Heart, Disc, Clock } from 'lucide-react';
import { cn, formatTime } from '../utils/helpers';

export default function AlbumDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { currentTrack, isPlaying, playTrack, pause, toggleLike, likedTracks } = usePlayerStore();
  
  const [albumTracks, setAlbumTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getAlbumTracks(id);
        setAlbumTracks(res);
      } catch (error) {
        console.error("Error fetching album details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (!id) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0B0B0D] text-white">
        <h2 className="text-2xl font-bold mb-4">Album not found</h2>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-white text-[#0B0B0D] rounded-full font-bold hover:scale-105 transition-transform">
          Go Home
        </button>
      </div>
    );
  }

  const albumTitle = albumTracks[0]?.album || 'Unknown Album';
  const artistName = albumTracks[0]?.artist || 'Unknown Artist';
  const artwork = albumTracks[0]?.artwork || '';
  
  const isCurrentAlbum = currentTrack?.album === albumTitle;

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-[#2a2a2a] to-[#0B0B0D] pb-40">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end gap-6 p-6 md:p-8 bg-gradient-to-b from-transparent to-[#0B0B0D]/40">
        <div className="w-48 h-48 md:w-60 md:h-60 shadow-2xl rounded-md bg-gray-800 flex items-center justify-center overflow-hidden">
          {artwork ? (
            <img src={artwork} alt={albumTitle} className="w-full h-full object-cover" />
          ) : (
            <Disc className="w-24 h-24 text-gray-600" />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold uppercase tracking-wider text-gray-300">Album</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-2 line-clamp-2">{albumTitle}</h1>
          <div className="text-sm text-gray-300 flex items-center gap-2">
            <span className="font-bold text-white cursor-pointer hover:underline" onClick={() => navigate(`/artist/${encodeURIComponent(artistName)}`)}>
              {artistName}
            </span>
            <span>•</span>
            <span>{albumTracks.length} tracks</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-6 px-6 md:px-8 py-4">
        <button
          onClick={() => isCurrentAlbum && isPlaying ? pause() : playTrack(albumTracks[0], albumTracks)}
          className="w-14 h-14 bg-[#A78BFA] rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
          disabled={albumTracks.length === 0}
        >
          {isCurrentAlbum && isPlaying ? (
            <Pause className="w-7 h-7 text-[#0B0B0D] fill-current" />
          ) : (
            <Play className="w-7 h-7 text-[#0B0B0D] fill-current ml-1" />
          )}
        </button>
      </div>

      <div className="px-6 md:px-8 mt-4">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-14 bg-white/5 rounded animate-pulse"></div>
            ))}
          </div>
        ) : albumTracks.length > 0 ? (
          <div>
            <div className="flex items-center text-gray-400 text-sm border-b border-white/10 pb-2 mb-4 px-2">
              <div className="w-8 text-center">#</div>
              <div className="flex-1">Title</div>
              <div className="w-12 text-right"><Clock className="w-4 h-4 inline-block" /></div>
            </div>
            <div className="space-y-1">
              {albumTracks.map((t, index) => (
                <div 
                  key={`${t.id}-${index}`}
                  onClick={() => playTrack(t, albumTracks)}
                  className="flex items-center gap-4 p-2 rounded-md hover:bg-white/10 group cursor-pointer"
                >
                  <div className="w-8 text-center text-gray-400 group-hover:hidden">{index + 1}</div>
                  <div className="w-8 text-center hidden group-hover:block text-white">
                    <Play className="w-4 h-4 mx-auto fill-current" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={cn("font-medium truncate", currentTrack?.id === t.id ? "text-[#A78BFA]" : "text-white")}>
                      {t.title}
                    </div>
                    <div className="text-gray-400 text-sm truncate">{t.artist}</div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleLike(t); }}
                    className="opacity-0 group-hover:opacity-100 p-2"
                  >
                    <Heart className={cn("w-4 h-4", likedTracks.some(lt => lt.id === t.id) ? "text-[#A78BFA] fill-current" : "text-gray-400 hover:text-white")} />
                  </button>
                  <div className="text-gray-400 text-sm w-12 text-right">
                    {formatTime(t.duration)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-400">No tracks found in this album.</p>
        )}
      </div>
    </div>
  );
}
