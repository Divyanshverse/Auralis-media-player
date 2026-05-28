import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X, ListMusic, Disc3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchTracks, searchArtists, getPopularArtistsDynamic, searchPlaylists, searchAlbums } from '../utils/api';
import { Track } from '../types';
import TrackList from '../components/TrackList';
import { cn } from '../utils/helpers';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [popularArtists, setPopularArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'All' | 'Tracks' | 'Artists' | 'Playlists' | 'Albums'>('All');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Fetch dynamic popular artists on mount
    getPopularArtistsDynamic().then(setPopularArtists);
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    
    const timer = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        const [tracks, artistsRes, playlistsRes, albumsRes] = await Promise.all([
          searchTracks(query, 15, abortController.signal),
          searchArtists(query, 6, abortController.signal),
          searchPlaylists(query, 6, abortController.signal),
          searchAlbums(query, 6, abortController.signal),
        ]);
        if (!abortController.signal.aborted) {
          setResults(tracks);
          setArtists(artistsRes);
          setPlaylists(playlistsRes);
          setAlbums(albumsRes);
          setLoading(false);
        }
      } else {
        setResults([]);
        setArtists([]);
        setPlaylists([]);
        setAlbums([]);
        setLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [query]);

  const hasResults = results.length > 0 || artists.length > 0 || playlists.length > 0 || albums.length > 0;

  return (
    <div className="p-4 md:p-6 pb-40 h-full overflow-y-auto bg-[#0B0B0D]/40 backdrop-blur-3xl">
      <div className="sticky top-0 z-10 bg-[#0B0B0D]/80 backdrop-blur-xl pt-2 pb-4 md:pb-6 border-b border-white/5 mb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="block w-full pl-10 pr-10 py-3 border border-white/10 rounded-full leading-5 bg-[#1a1a1a]/80 text-white placeholder-gray-400 focus:outline-none focus:border-[#A78BFA]/50 focus:ring-1 focus:ring-[#A78BFA]/50 sm:text-sm transition-all shadow-inner"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 md:mt-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-[#A78BFA] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : hasResults ? (
          <div className="space-y-8">
            <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
              {['All', 'Tracks', 'Artists', 'Playlists', 'Albums'].map(tab => (
                 <button
                   key={tab}
                   onClick={() => setActiveTab(tab as any)}
                   className={cn(
                     "px-5 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition-all border",
                     activeTab === tab ? "bg-[#A78BFA] text-[#0B0B0D] border-[#A78BFA] shadow-[0_0_10px_rgba(167,139,250,0.4)]" : "bg-[#141416] text-gray-300 hover:bg-[#1f1f22] border-white/10"
                   )}
                 >
                   {tab}
                 </button>
              ))}
            </div>

            {(activeTab === 'All' || activeTab === 'Artists') && artists.length > 0 && (
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 drop-shadow-md">Artists</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {artists.map((artist, index) => (
                    <div
                      key={`${artist.id}-${index}`}
                      onClick={() => navigate(`/artist/${encodeURIComponent(artist.name)}`)}
                      className="bg-[#141416]/80 backdrop-blur-md border border-white/5 p-4 rounded-xl hover:bg-[#1f1f22] transition-all cursor-pointer hover:scale-105 shadow-lg flex flex-col items-center"
                    >
                      <img src={artist.image} alt={artist.name} className="w-full aspect-square rounded-full mb-4 object-cover shadow-xl" />
                      <h3 className="text-white font-bold truncate text-center w-full">{artist.name}</h3>
                      <p className="text-gray-400 text-xs mt-1">Artist</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {(activeTab === 'All' || activeTab === 'Playlists') && playlists.length > 0 && (
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 drop-shadow-md">Playlists</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {playlists.map((playlist, index) => (
                    <div
                      key={`${playlist.id}-${index}`}
                      onClick={() => navigate(`/playlist/${playlist.id}`)}
                      className="bg-[#141416]/80 backdrop-blur-md border border-white/5 p-4 rounded-xl hover:bg-[#1f1f22] transition-all cursor-pointer hover:scale-105 shadow-lg group relative"
                    >
                      <div className="relative mb-4 overflow-hidden rounded-md shadow-xl aspect-square bg-[#222]">
                        {playlist.image ? (
                          <img src={playlist.image} alt={playlist.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                             <ListMusic className="w-12 h-12 mb-2" />
                          </div>
                        )}
                      </div>
                      <h3 className="text-white font-bold truncate text-sm">{playlist.name}</h3>
                      <p className="text-gray-400 truncate text-xs mt-1">{playlist.creator}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(activeTab === 'All' || activeTab === 'Albums') && albums.length > 0 && (
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 drop-shadow-md">Albums</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {albums.map((album, index) => (
                    <div
                      key={`${album.id}-${index}`}
                      onClick={() => navigate(`/album/${album.id}`)}
                      className="bg-[#141416]/80 backdrop-blur-md border border-white/5 p-4 rounded-xl hover:bg-[#1f1f22] transition-all cursor-pointer hover:scale-105 shadow-lg group relative"
                    >
                       <div className="relative mb-4 overflow-hidden rounded-md shadow-xl aspect-square bg-[#222]">
                          {album.artwork ? (
                            <img src={album.artwork} alt={album.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                               <Disc3 className="w-12 h-12 mb-2" />
                            </div>
                          )}
                        </div>
                      <h3 className="text-white font-bold truncate text-sm">{album.title}</h3>
                      <p className="text-gray-400 truncate text-xs mt-1">{album.artist} • {album.year}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(activeTab === 'All' || activeTab === 'Tracks') && results.length > 0 && (
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 drop-shadow-md">Tracks</h2>
                <TrackList tracks={results} />
              </div>
            )}
          </div>
        ) : query ? (
          <div className="text-center text-gray-400 mt-20 px-4">
            <h3 className="text-lg md:text-xl font-bold text-white mb-2 font-display">No results found for "{query}"</h3>
            <p className="text-sm md:text-base">Please make sure your words are spelled correctly or use less or different keywords.</p>
          </div>
        ) : (
          <div className="space-y-10">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 font-display border-l-2 border-[#A78BFA] pl-3">Browse by feeling</h2>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                {[
                  { title: "Hip-Hop", bg: "bg-orange-800", img: "https://images.unsplash.com/photo-1542204625-2dfb94ec18f3?w=500&auto=format&fit=crop" },
                  { title: "Classical", bg: "bg-gray-800", img: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=500&auto=format&fit=crop" },
                  { title: "Electronic", bg: "bg-indigo-900", img: "https://images.unsplash.com/photo-1571266028243-cb40fce0ea0a?w=500&auto=format&fit=crop" },
                  { title: "Jazz", bg: "bg-amber-900", img: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=500&auto=format&fit=crop" }
                ].map((cat, i) => (
                  <div
                    key={i}
                    onClick={() => { setQuery(cat.title); }}
                    className={cn(
                      "relative overflow-hidden rounded-2xl cursor-pointer hover:scale-[1.02] transition-transform aspect-[4/3] flex items-end p-4 shadow-xl border border-white/10 group",
                      cat.bg
                    )}
                  >
                    <img src={cat.img} alt={cat.title} className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" />
                    <h3 className="text-white font-bold font-display text-xl z-10 drop-shadow-md">{cat.title}</h3>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 font-display border-l-2 border-[#67E8F9] pl-3">Trending Searches</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { rank: "01", title: "Midnight Resonance", artist: "Artist Name" },
                  { rank: "02", title: "Echoes of the Void", artist: "Another Artist" },
                  { rank: "03", title: "Lofi Beats", artist: "Playlist" }
                ].map((trend, i) => (
                  <div
                    key={i}
                    onClick={() => setQuery(trend.title)}
                    className="flex items-center gap-4 bg-[#141416]/80 backdrop-blur-md border border-white/5 p-4 rounded-xl hover:bg-[#1f1f22] transition-colors cursor-pointer group"
                  >
                    <span className="text-2xl font-bold font-display text-gray-600 group-hover:text-[#A78BFA] transition-colors">{trend.rank}</span>
                    <div>
                      <h3 className="text-white font-bold text-lg">{trend.title}</h3>
                      <p className="text-gray-400 text-sm">{trend.artist}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {popularArtists.length > 0 && (
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 font-display border-l-2 border-white/20 pl-3">Popular Artists</h2>
                <div className="flex overflow-x-auto gap-4 pb-4 hide-scrollbar">
                  {popularArtists.map((artist, i) => (
                    <div
                      key={i}
                      onClick={() => navigate(`/artist/${encodeURIComponent(artist.name)}`)}
                      className="bg-[#141416]/80 backdrop-blur-md border border-white/5 p-4 rounded-xl hover:bg-[#1f1f22] transition-all cursor-pointer hover:scale-105 shadow-lg flex-shrink-0 w-[140px] flex flex-col items-center"
                    >
                      <img src={artist.image} alt={artist.name} className="w-full aspect-square rounded-full mb-4 object-cover shadow-xl" />
                      <h3 className="text-white font-bold text-center truncate w-full text-sm">{artist.name}</h3>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
