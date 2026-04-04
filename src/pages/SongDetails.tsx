import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';
import { searchTracks, getRecommendations, searchAlbums, Album } from '../utils/api';
import { Track } from '../types';
import { Play, Pause, Heart, MoreHorizontal, User as UserIcon, Disc } from 'lucide-react';
import { cn } from '../utils/helpers';

export default function SongDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const track = location.state?.track as Track;

  const { currentTrack, isPlaying, playTrack, pause, toggleLike, likedTracks, playlists } = usePlayerStore();
  
  const [artistSongs, setArtistSongs] = useState<Track[]>([]);
  const [similarSongs, setSimilarSongs] = useState<Track[]>([]);
  const [artistAlbums, setArtistAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!track) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [artistRes, similarRes, albumsRes] = await Promise.all([
          searchTracks(track.artist, 20),
          searchTracks(track.album || track.title, 15),
          searchAlbums(track.artist, 5)
        ]);
        
        let similar = similarRes.filter(t => t.id !== track.id);
        if (similar.length === 0) {
          const fallbackRecs = await getRecommendations();
          similar = fallbackRecs.filter(t => t.id !== track.id);
        }
        
        setArtistSongs(artistRes.filter(t => t.id !== track.id));
        setSimilarSongs(similar);
        setArtistAlbums(albumsRes);
      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [track, navigate]);

  if (!track) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-[#121212] text-white">
        <h2 className="text-2xl font-bold mb-4">Song not found</h2>
        <p className="text-gray-400 mb-6">Please select a song from the search or home page.</p>
        <button onClick={() => navigate('/')} className="px-6 py-2 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform">
          Go Home
        </button>
      </div>
    );
  }

  const isCurrentTrack = currentTrack?.id === track.id;
  const isLiked = likedTracks.some(t => t.id === track.id);
  
  // Find user playlists containing this song
  const containingPlaylists = playlists.filter(p => p.tracks.some(t => t.id === track.id));

  return (
    <div className="h-full overflow-y-auto bg-gradient-to-b from-[#2a2a2a] to-[#121212] pb-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-end gap-6 p-6 md:p-8 bg-gradient-to-b from-transparent to-black/40">
        <img 
          src={track.artwork} 
          alt={track.title} 
          className="w-48 h-48 md:w-60 md:h-60 shadow-2xl rounded-md object-cover"
        />
        <div className="flex flex-col gap-2">
          <span className="text-sm font-bold uppercase tracking-wider text-gray-300">Song</span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-2 line-clamp-2">{track.title}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <img src={track.artwork} alt={track.artist} className="w-6 h-6 rounded-full object-cover" />
            <span 
              className="font-bold text-white hover:underline cursor-pointer"
              onClick={() => navigate(`/artist/${encodeURIComponent(track.artist)}`)}
            >
              {track.artist}
            </span>
            <span>•</span>
            <span>{track.album}</span>
            <span>•</span>
            <span>{Math.floor(track.duration / 60000)}:{((track.duration % 60000) / 1000).toFixed(0).padStart(2, '0')}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-6 px-6 md:px-8 py-4">
        <button
          onClick={() => isCurrentTrack && isPlaying ? pause() : playTrack(track, [track, ...artistSongs])}
          className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-xl"
        >
          {isCurrentTrack && isPlaying ? (
            <Pause className="w-7 h-7 text-black fill-current" />
          ) : (
            <Play className="w-7 h-7 text-black fill-current ml-1" />
          )}
        </button>
        <button 
          onClick={() => toggleLike(track)}
          className={cn("hover:scale-105 transition-transform", isLiked ? "text-green-500" : "text-gray-400 hover:text-white")}
        >
          <Heart className={cn("w-8 h-8", isLiked && "fill-current")} />
        </button>
        <button className="text-gray-400 hover:text-white">
          <MoreHorizontal className="w-8 h-8" />
        </button>
      </div>

      <div className="px-6 md:px-8 space-y-10 mt-4">
        {/* Artist Profile Link */}
        <div 
          className="flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-colors w-fit pr-8"
          onClick={() => navigate(`/artist/${encodeURIComponent(track.artist)}`)}
        >
          <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
            <UserIcon className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <div className="text-sm text-gray-400 font-medium">Artist</div>
            <div className="text-lg font-bold text-white">{track.artist}</div>
          </div>
        </div>

        {/* Playlists containing this song */}
        {containingPlaylists.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Featured in your playlists</h2>
            <div className="flex flex-wrap gap-4">
              {containingPlaylists.map(playlist => (
                <div 
                  key={playlist.id}
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                  className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition-colors cursor-pointer flex items-center gap-4 min-w-[200px]"
                >
                  <div className="w-12 h-12 bg-gray-800 rounded flex items-center justify-center">
                    <Disc className="w-6 h-6 text-gray-400" />
                  </div>
                  <span className="text-white font-bold">{playlist.name}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Popular Tracks by Artist */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Popular tracks by {track.artist}</h2>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-14 bg-white/5 rounded animate-pulse"></div>
              ))}
            </div>
          ) : artistSongs.length > 0 ? (
            <div className="space-y-1">
              {artistSongs.slice(0, 5).map((t, index) => (
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
                    <div className="text-gray-400 text-sm truncate">{t.artist}</div>
                  </div>
                  <div className="text-gray-400 text-sm hidden md:block w-1/3 truncate">{t.album}</div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleLike(t); }}
                    className="opacity-0 group-hover:opacity-100 p-2"
                  >
                    <Heart className={cn("w-4 h-4", likedTracks.some(lt => lt.id === t.id) ? "text-green-500 fill-current" : "text-gray-400 hover:text-white")} />
                  </button>
                  <div className="text-gray-400 text-sm w-12 text-right">
                    {Math.floor(t.duration / 60000)}:{((t.duration % 60000) / 1000).toFixed(0).padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No popular tracks found.</p>
          )}
        </section>

        {/* Artist Albums */}
        {artistAlbums.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">Albums by {track.artist}</h2>
            <div className="flex flex-wrap gap-4">
              {artistAlbums.map((album) => (
                <div 
                  key={album.id} 
                  onClick={() => navigate(`/album/${album.id}`)}
                  className="bg-[#181818] p-4 rounded-md w-40 flex-shrink-0 cursor-pointer hover:bg-[#282828] transition-colors group"
                >
                  <div className="w-full aspect-square bg-gray-800 rounded-md mb-3 relative overflow-hidden shadow-lg">
                    {album.artwork ? (
                      <img src={album.artwork} alt={album.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Disc className="w-12 h-12 text-gray-600" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xl translate-y-2 group-hover:translate-y-0">
                      <Play className="w-5 h-5 text-black fill-current ml-1" />
                    </div>
                  </div>
                  <div className="text-white font-bold truncate mb-1">{album.title}</div>
                  <div className="text-gray-400 text-sm truncate">{album.year || 'Album'}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Similar Songs */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-4">Similar Songs</h2>
          {loading ? (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="w-40 h-56 bg-white/5 rounded-md animate-pulse flex-shrink-0"></div>
              ))}
            </div>
          ) : similarSongs.length > 0 ? (
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {similarSongs.map((t, index) => (
                <div 
                  key={`${t.id}-${index}`}
                  onClick={() => navigate(`/song/${t.id}`, { state: { track: t } })}
                  className="bg-[#181818] p-4 rounded-md hover:bg-[#282828] transition-colors cursor-pointer w-40 flex-shrink-0 group relative"
                >
                  <div className="relative mb-3">
                    <img src={t.artwork} alt={t.title} className="w-full aspect-square object-cover rounded-md" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        playTrack(t, similarSongs);
                      }}
                      className="absolute bottom-2 right-2 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all z-10"
                    >
                      <Play className="w-5 h-5 text-black fill-current ml-1" />
                    </button>
                  </div>
                  <div className="text-white font-bold truncate">{t.title}</div>
                  <div className="text-gray-400 text-sm truncate">{t.artist}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">No similar songs found.</p>
          )}
        </section>
      </div>
    </div>
  );
}
