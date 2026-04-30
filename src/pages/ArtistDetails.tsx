import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';
import { Album, getArtistRadio, getArtistDetails, getArtistAlbums } from '../utils/api';
import { Track } from '../types';
import { Play, Pause, Heart, Disc, Radio } from 'lucide-react';
import { cn } from '../utils/helpers';
import { useDominantColor } from '../hooks/useDominantColor';

export default function ArtistDetails() {
  const { name } = useParams();
  const navigate = useNavigate();
  const decodedName = decodeURIComponent(name || '');

  const { currentTrack, isPlaying, playTrack, pause, toggleLike, likedTracks } = usePlayerStore();
  
  const [artistSongs, setArtistSongs] = useState<Track[]>([]);
  const [artistAlbums, setArtistAlbums] = useState<Album[]>([]);
  const [artistInfo, setArtistInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!decodedName) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [songsRes, albumsRes, infoRes] = await Promise.all([
          getArtistRadio(decodedName),
          getArtistAlbums(decodedName),
          getArtistDetails(decodedName)
        ]);
        setArtistSongs(songsRes);
        setArtistAlbums(albumsRes);
        setArtistInfo(infoRes);
      } catch (error) {
        console.error("Error fetching artist details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [decodedName, navigate]);

  const handleRadio = async () => {
    if (!decodedName || artistSongs.length === 0) return;
    playTrack(artistSongs[0], artistSongs);
  };

  const artistImage = artistInfo?.image || artistSongs[0]?.artwork;
  const dominantColor = useDominantColor(artistImage);

  if (!decodedName) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#0B0B0D] text-white">
        <h2 className="text-2xl font-bold mb-4">Artist not found</h2>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-white text-[#0B0B0D] rounded-full font-bold hover:scale-105 transition-transform">
          Go Home
        </button>
      </div>
    );
  }

  const isCurrentArtist = currentTrack?.artist?.includes(decodedName) ?? false;

  return (
    <div className="h-full overflow-y-auto bg-[#0B0B0D] pb-40">
      {/* Header */}
      <div 
        className="flex flex-col md:flex-row items-end gap-6 p-6 md:p-8 transition-colors duration-700"
        style={{
          background: dominantColor 
            ? `linear-gradient(to bottom, ${dominantColor} 0%, #121212 100%)`
            : `linear-gradient(to bottom, #2a2a2a 0%, #121212 100%)`
        }}
      >
        <div className="w-48 h-48 md:w-60 md:h-60 shadow-2xl rounded-full bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
          {artistImage ? (
            <img src={artistImage} alt={decodedName} className="w-full h-full object-cover" crossOrigin="anonymous" />
          ) : (
            <span className="text-6xl text-gray-600">{decodedName.charAt(0)}</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold uppercase tracking-wider text-white/80">Artist</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-2 line-clamp-2">{artistInfo?.name || decodedName}</h1>
          <div className="text-sm text-white/80 flex items-center gap-2">
            <span>{artistSongs.length} tracks available</span>
            {artistInfo?.subscribers && (
              <>
                <span>•</span>
                <span>{artistInfo.subscribers}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-6 px-6 md:px-8 py-4">
        <button
          onClick={() => isCurrentArtist && isPlaying ? pause() : playTrack(artistSongs[0], artistSongs)}
          className="w-14 h-14 bg-[#A78BFA] rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
          disabled={artistSongs.length === 0}
        >
          {isCurrentArtist && isPlaying ? (
            <Pause className="w-7 h-7 text-[#0B0B0D] fill-current" />
          ) : (
            <Play className="w-7 h-7 text-[#0B0B0D] fill-current ml-1" />
          )}
        </button>
        <button 
          onClick={handleRadio}
          disabled={artistSongs.length === 0}
          className="px-6 py-3 bg-transparent border border-gray-400 text-white rounded-full flex items-center gap-2 font-bold hover:border-white hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
        >
          <Radio className="w-5 h-5" />
          Artist Radio
        </button>
      </div>

      <div className="px-6 md:px-8 space-y-10 mt-4">
        {/* Popular Tracks */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Popular</h2>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-14 bg-white/5 rounded animate-pulse"></div>
              ))}
            </div>
          ) : artistSongs.length > 0 ? (
            <div className="space-y-1">
              {artistSongs.slice(0, 20).map((t, index) => (
                <div 
                  key={`${t.id}-${index}`}
                  onClick={() => playTrack(t, artistSongs)}
                  className="flex items-center gap-4 p-2 rounded-md hover:bg-white/10 group cursor-pointer"
                >
                  <div className="w-8 text-center text-gray-400 group-hover:hidden">{index + 1}</div>
                  <div className="w-8 text-center hidden group-hover:block text-white">
                    <Play className="w-4 h-4 mx-auto fill-current" />
                  </div>
                  <img src={t.artwork} alt={t.title} className="w-10 h-10 rounded object-cover" />
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">{t.title}</div>
                  </div>
                  <div className="text-gray-400 text-sm hidden md:block w-1/3 truncate">{t.album}</div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleLike(t); }}
                    className="opacity-0 group-hover:opacity-100 p-2"
                  >
                    <Heart className={cn("w-4 h-4", likedTracks.some(lt => lt.id === t.id) ? "text-[#A78BFA] fill-current" : "text-gray-400 hover:text-white")} />
                  </button>
                  <div className="text-gray-400 text-sm w-12 text-right">
                    {Math.floor(t.duration / 60000)}:{((t.duration % 60000) / 1000).toFixed(0).padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No tracks found.</p>
          )}
        </section>

        {/* Artist Albums */}
        {artistAlbums.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Albums</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {artistAlbums.map((album) => (
                <div 
                  key={album.id} 
                  onClick={() => navigate(`/album/${album.id}`)}
                  className="bg-[#141416] p-4 rounded-md flex flex-col cursor-pointer hover:bg-[#1f1f22] transition-colors group"
                >
                  <div className="w-full aspect-square bg-gray-800 rounded-md mb-3 relative overflow-hidden shadow-lg">
                    {album.artwork ? (
                      <img src={album.artwork} alt={album.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Disc className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 w-10 h-10 bg-[#A78BFA] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xl translate-y-2 group-hover:translate-y-0">
                      <Play className="w-5 h-5 text-[#0B0B0D] fill-current ml-1" />
                    </div>
                  </div>
                  <div className="text-white font-bold truncate mb-1">{album.title}</div>
                  <div className="text-gray-400 text-sm truncate">{album.year || 'Album'}</div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
