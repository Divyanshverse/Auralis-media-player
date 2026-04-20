import { useEffect, useState, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';
import { getPopularArtistsDynamic, searchTracks } from '../utils/api';
import { Track } from '../types';
import { Play, Pause, RotateCw, User, Plus, Bell, Heart, Download, MoreHorizontal, Music } from 'lucide-react';
import { cn } from '../utils/helpers';
import ArtistSearchModal from '../components/ArtistSearchModal';

const TrackCard = memo(({ 
  track, 
  context, 
  isCurrent, 
  isPlaying, 
  onPlay, 
  onPause,
  customSubtitle
}: { 
  track: Track; 
  context: Track[]; 
  isCurrent: boolean; 
  isPlaying: boolean; 
  onPlay: (track: Track, context: Track[]) => void; 
  onPause: () => void;
  customSubtitle?: string;
}) => {
  const navigate = useNavigate();
  return (
    <div
      className="w-[140px] md:w-[180px] p-3 md:p-4 bg-[#181818] hover:bg-[#282828] rounded-lg transition-colors group cursor-pointer flex-shrink-0 snap-start"
      onClick={() => navigate(`/song/${track.id}`, { state: { track } })}
    >
      <div className="relative mb-3 md:mb-4 shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
        <img
          src={track.artwork}
          alt={track.title}
          className="w-full aspect-square object-cover rounded-md"
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
            "absolute bottom-2 right-2 w-10 h-10 md:w-12 md:h-12 bg-green-500 rounded-full flex items-center justify-center shadow-xl hover:scale-105 hover:bg-green-400 transition-all z-10",
            isCurrent && isPlaying ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0"
          )}
        >
          {isCurrent && isPlaying ? (
            <Pause className="w-5 h-5 text-black fill-current" />
          ) : (
            <Play className="w-5 h-5 text-black fill-current ml-1" />
          )}
        </button>
      </div>
      <h3 className="text-white font-bold text-sm md:text-base truncate mb-1">{track.title}</h3>
      <p className="text-gray-400 text-xs md:text-sm line-clamp-2">{customSubtitle || track.artist}</p>
    </div>
  );
});

const TrackListItem = memo(({ 
  track, 
  context, 
  isCurrent, 
  isPlaying, 
  onPlay, 
  onPause,
  customSubtitle
}: { 
  track: Track; 
  context: Track[]; 
  isCurrent: boolean; 
  isPlaying: boolean; 
  onPlay: (track: Track, context: Track[]) => void; 
  onPause: () => void;
  customSubtitle?: string;
}) => {
  const navigate = useNavigate();
  return (
    <div
      className="flex items-center justify-between group cursor-pointer hover:bg-[#282828] p-2 rounded-xl transition-colors"
      onClick={() => navigate(`/song/${track.id}`, { state: { track } })}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <img
          src={track.artwork}
          alt={track.title}
          className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-bold text-base truncate">{track.title}</h4>
          <p className="text-gray-400 text-sm truncate">By {track.artist} • {customSubtitle || "Song"}</p>
        </div>
      </div>
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
          "w-8 h-8 rounded-full flex items-center justify-center transition-colors flex-shrink-0 ml-4",
          isCurrent && isPlaying ? "bg-[#cbfb45] text-black" : "bg-[#282828] text-white group-hover:bg-[#cbfb45] group-hover:text-black"
        )}
      >
        {isCurrent && isPlaying ? (
          <Pause className="w-4 h-4 fill-current" />
        ) : (
          <Play className="w-4 h-4 fill-current ml-0.5" />
        )}
      </button>
    </div>
  );
});

const SectionHeader = ({ title, onShowAll }: { title: string, onShowAll?: () => void }) => (
  <div className="flex items-end justify-between mb-4 px-4 md:px-6">
    <h2 className="text-xl md:text-2xl font-bold text-white hover:underline cursor-pointer">{title}</h2>
    {onShowAll && (
      <button onClick={onShowAll} className="text-xs md:text-sm font-bold text-gray-400 hover:text-white transition-colors">
        Show all
      </button>
    )}
  </div>
);

interface HomeSection {
  id: string;
  title: string;
  subtitle?: string;
  tracks: Track[];
  artistImage?: string;
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { history, currentTrack, isPlaying, playTrack, pause, favoriteArtists, likedTracks, toggleLike, playlists, downloadedTracks } = usePlayerStore();
  
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [popularArtists, setPopularArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Playlists' | 'Liked Songs' | 'Downloaded'>('All');

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const fetchHomeData = useCallback(async () => {
    setLoading(true);
    try {
      const fallbackArtists = ["Arijit Singh", "Taylor Swift", "Diljit Dosanjh", "The Weeknd", "Shreya Ghoshal", "Karan Aujla", "Ed Sheeran", "AP Dhillon"];
      const favNames = favoriteArtists.map(a => a.name);
      const combinedArtists = [...new Set([...favNames, ...fallbackArtists])];
      const selectedArtists = combinedArtists.sort(() => 0.5 - Math.random()).slice(0, 3);

      const moodOptions = [
        { q: "road trip", t: "Travel & Road Trip", sub: "Perfect tunes for the open road." },
        { q: "workout", t: "Workout Mix", sub: "Get your heart pumping." },
        { q: "lofi", t: "Late Night Lofi", sub: "Chill beats to relax and study to." },
        { q: "party", t: "Party Hits", sub: "Turn up the volume." },
        { q: "chill", t: "Chill Vibes", sub: "Kick back and relax." },
        { q: "focus", t: "Focus & Study", sub: "Deep focus music." },
        { q: "sleep", t: "Sleep & Relax", sub: "Drift away with these calming tracks." },
        { q: "romantic", t: "Romantic Songs", sub: "Love is in the air." }
      ].sort(() => 0.5 - Math.random()).slice(0, 4);

      const regionalOptions = [
        { q: "punjabi hits", t: "Punjabi 101", sub: "Ultimate Punjabi hits." },
        { q: "bollywood top 50", t: "Bollywood Central", sub: "The biggest Bollywood tracks." },
        { q: "south indian hits", t: "South Indian Hits", sub: "Top tracks from the South." },
        { q: "indie pop", t: "Indie India", sub: "Best of the Indian Indie scene." }
      ].sort(() => 0.5 - Math.random()).slice(0, 2);

      const hitQueries = ["top 50", "viral hits", "global hits", "trending"];
      const hitQuery = hitQueries[Math.floor(Math.random() * hitQueries.length)];

      // Fetch artists first
      const artistsData = await getPopularArtistsDynamic(10);
      
      const artistImages = selectedArtists.map(name => {
        const found = artistsData.find(a => a.name.toLowerCase() === name.toLowerCase());
        const fav = favoriteArtists.find(a => a.name.toLowerCase() === name.toLowerCase());
        return fav?.image || found?.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop';
      });

      const trackPromises = [
        searchTracks(hitQuery, 15),
        searchTracks(`${selectedArtists[0]} radio`, 15),
        searchTracks(`Best of ${selectedArtists[0]}`, 15),
        searchTracks(`Best of ${selectedArtists[1]}`, 15),
        searchTracks(`Best of ${selectedArtists[2]}`, 15),
        ...moodOptions.map(m => searchTracks(m.q, 15)),
        ...regionalOptions.map(r => searchTracks(r.q, 15))
      ];

      const results = await Promise.allSettled(trackPromises);
      const getResult = (index: number): Track[] => 
        results[index].status === 'fulfilled' ? (results[index] as PromiseFulfilledResult<Track[]>).value : [];

      const newSections: HomeSection[] = [];
      
      const hits = getResult(0);
      if (hits.length > 0) {
        newSections.push({ id: 'hits', title: "Today's biggest hits", tracks: hits, subtitle: "Catch the hottest tracks right now." });
      }
      
      const stations = getResult(1);
      if (stations.length > 0) {
        newSections.push({ id: 'stations', title: "Recommended Stations", tracks: stations, subtitle: `With ${selectedArtists[0]} and more` });
      }
      
      const discover1 = getResult(2);
      if (discover1.length > 0) {
        newSections.push({ id: `discover-0`, title: `Discover more from ${selectedArtists[0]}`, tracks: discover1, artistImage: artistImages[0] });
      }
      
      const discover2 = getResult(3);
      if (discover2.length > 0) {
        newSections.push({ id: `discover-1`, title: `Discover more from ${selectedArtists[1]}`, tracks: discover2, artistImage: artistImages[1] });
      }

      moodOptions.forEach((mood, idx) => {
        const moodTracks = getResult(5 + idx);
        if (moodTracks.length > 0) {
          newSections.push({ id: `mood-${idx}`, title: mood.t, tracks: moodTracks, subtitle: mood.sub });
        }
      });

      const discover3 = getResult(4);
      if (discover3.length > 0) {
        newSections.push({ id: `discover-2`, title: `Discover more from ${selectedArtists[2]}`, tracks: discover3, artistImage: artistImages[2] });
      }

      regionalOptions.forEach((reg, idx) => {
        const regTracks = getResult(5 + moodOptions.length + idx);
        if (regTracks.length > 0) {
          newSections.push({ id: `reg-${idx}`, title: reg.t, tracks: regTracks, subtitle: reg.sub });
        }
      });

      setSections(newSections);
      setPopularArtists(artistsData);
      
    } catch (error) {
      console.error("Failed to fetch home data:", error);
    } finally {
      setLoading(false);
    }
  }, [favoriteArtists]);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  const handlePlay = useCallback((track: Track, context: Track[]) => {
    playTrack(track, context);
  }, [playTrack]);

  const renderSkeletons = () => (
    <div className="flex overflow-x-auto gap-4 pb-4 px-4 md:px-6 hide-scrollbar">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="w-[140px] md:w-[180px] p-3 md:p-4 bg-[#181818] rounded-lg animate-pulse flex-shrink-0">
          <div className="w-full aspect-square bg-[#282828] rounded-md mb-4"></div>
          <div className="h-4 bg-[#282828] rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-[#282828] rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="pt-4 md:pt-6 pb-40 h-full overflow-y-auto overflow-x-hidden bg-[#121212]">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-4 md:px-6 mb-8 bg-transparent py-3 -mt-4 md:-mt-6">
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate('/profile')}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-black font-bold text-xl shadow-lg">
            {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || <User className="w-6 h-6" />}
          </div>
          <div>
            <p className="text-sm text-gray-400">{greeting}!</p>
            <h1 className="text-xl font-bold text-white truncate max-w-[150px]">
              {user ? (user.name || user.username) : 'Guest'}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-3 ml-4 shrink-0">
          <button 
            className="w-10 h-10 rounded-full bg-[#282828] flex items-center justify-center text-white hover:bg-[#383838] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Select Category */}
      <div className="mb-8 px-4 md:px-6">
        <h2 className="text-lg font-bold text-white mb-4">Select Category</h2>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveCategory('All')}
            className={cn(
              "px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-colors",
              activeCategory === 'All' ? "bg-[#cbfb45] text-black" : "bg-[#282828] text-white hover:bg-[#383838]"
            )}
          >
            All
          </button>
          <button 
            onClick={() => setActiveCategory('Playlists')}
            className={cn(
              "px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-colors",
              activeCategory === 'Playlists' ? "bg-[#cbfb45] text-black" : "bg-[#282828] text-white hover:bg-[#383838]"
            )}
          >
            Playlists
          </button>
          <button 
            onClick={() => setActiveCategory('Liked Songs')}
            className={cn(
              "px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-colors",
              activeCategory === 'Liked Songs' ? "bg-[#cbfb45] text-black" : "bg-[#282828] text-white hover:bg-[#383838]"
            )}
          >
            Liked Songs
          </button>
          <button 
            onClick={() => setActiveCategory('Downloaded')}
            className={cn(
              "px-6 py-2 rounded-full font-semibold whitespace-nowrap transition-colors",
              activeCategory === 'Downloaded' ? "bg-[#cbfb45] text-black" : "bg-[#282828] text-white hover:bg-[#383838]"
            )}
          >
            Downloaded
          </button>
        </div>
      </div>

      {activeCategory === 'All' && (
        <>
          {/* Latest & Trending */}
      <div className="mb-8 px-4 md:px-6">
        <h2 className="text-lg font-bold text-white mb-4">Latest & Trending</h2>
        <div 
          onClick={() => sections.length > 0 && handlePlay(sections[0].tracks[0], sections[0].tracks)}
          className="w-full bg-gradient-to-r from-[#d9a7ff] to-[#a67cff] rounded-2xl p-6 relative overflow-hidden flex justify-between items-center cursor-pointer hover:scale-[1.02] transition-transform"
        >
          <div className="z-10 w-2/3">
            <h3 className="text-2xl font-bold text-black mb-2">Discover Weekly</h3>
            <p className="text-black/80 text-sm mb-6">The Original slow instrumental<br/>best Playlists</p>
            <div className="flex items-center gap-4">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (sections.length > 0) {
                    const track = sections[0].tracks[0];
                    if (currentTrack?.id === track.id && isPlaying) {
                      pause();
                    } else {
                      handlePlay(track, sections[0].tracks);
                    }
                  }
                }}
                className="w-10 h-10 bg-[#8a4fff] rounded-full flex items-center justify-center text-white shadow-lg"
              >
                {sections.length > 0 && currentTrack?.id === sections[0].tracks[0].id && isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-1" />
                )}
              </button>
              <Heart 
                className={cn(
                  "w-5 h-5 cursor-pointer transition-colors",
                  sections.length > 0 && likedTracks.some(t => t.id === sections[0].tracks[0].id) ? "text-red-500 fill-current" : "text-purple-900"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  if (sections.length > 0) toggleLike(sections[0].tracks[0]);
                }}
              />
              <Download className="w-5 h-5 text-purple-900 cursor-pointer hover:text-purple-700 transition-colors" />
              <MoreHorizontal className="w-5 h-5 text-purple-900 cursor-pointer hover:text-purple-700 transition-colors" />
            </div>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/2 flex justify-end">
            <img 
              src="https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&h=500&fit=crop" 
              className="h-full object-cover mix-blend-overlay opacity-90" 
              alt="Discover" 
            />
          </div>
        </div>
      </div>

      {/* Top Daily playlists (List View) */}
      {sections.length > 0 && (
        <div className="mb-8 px-4 md:px-6">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-lg font-bold text-white">Top Daily playlists</h2>
            <span className="text-sm text-gray-400 cursor-pointer hover:text-white transition-colors">See all</span>
          </div>
          <div className="flex flex-col gap-2">
            {sections[0].tracks.slice(0, 5).map(track => (
              <TrackListItem
                key={track.id}
                track={track}
                context={sections[0].tracks}
                isCurrent={currentTrack?.id === track.id}
                isPlaying={isPlaying}
                onPlay={handlePlay}
                onPause={pause}
                customSubtitle="8 Songs"
              />
            ))}
          </div>
        </div>
      )}

      {/* Other Dynamic Sections (Horizontal scroll) */}
      {loading ? (
        <div className="px-4 md:px-6">{renderSkeletons()}</div>
      ) : (
        sections.slice(1).map((section) => (
          <section key={section.id} className="mb-8 md:mb-10">
            <SectionHeader title={section.title} onShowAll={() => {}} />
            <div className="flex overflow-x-auto gap-4 pb-4 px-4 md:px-6 snap-x snap-mandatory hide-scrollbar after:content-[''] after:w-4 after:shrink-0">
              {section.tracks.map((track, index) => (
                <TrackCard
                  key={`${track.id}-${index}`}
                  track={track}
                  context={section.tracks}
                  isCurrent={currentTrack?.id === track.id}
                  isPlaying={isPlaying}
                  onPlay={handlePlay}
                  onPause={pause}
                  customSubtitle={section.subtitle}
                />
              ))}
            </div>
          </section>
        ))
      )}
      </>
      )}

      {activeCategory === 'Playlists' && (
        <div className="px-4 md:px-6 flex flex-col gap-2">
          {playlists.length === 0 ? (
            <div className="text-center text-gray-400 py-10">No playlists found. Create one in your Library!</div>
          ) : (
            playlists.map(playlist => (
              <div
                key={playlist.id}
                className="flex items-center justify-between group cursor-pointer hover:bg-[#282828] p-2 rounded-xl transition-colors"
                onClick={() => navigate(`/playlist/${playlist.id}`)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {playlist.tracks.length > 0 ? (
                    <img src={playlist.tracks[0].artwork} alt={playlist.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-[#282828] flex items-center justify-center flex-shrink-0">
                      <Music className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-base truncate">{playlist.name}</h4>
                    <p className="text-gray-400 text-sm truncate">By You • {playlist.tracks.length} Songs</p>
                  </div>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if (playlist.tracks.length > 0) {
                      playTrack(playlist.tracks[0], playlist.tracks);
                    }
                  }}
                  className="w-8 h-8 rounded-full bg-[#282828] flex items-center justify-center text-white group-hover:bg-[#cbfb45] group-hover:text-black transition-colors flex-shrink-0 ml-4"
                >
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {activeCategory === 'Liked Songs' && (
        <div className="px-4 md:px-6 flex flex-col gap-2">
          {likedTracks.length === 0 ? (
            <div className="text-center text-gray-400 py-10">No liked songs yet.</div>
          ) : (
            likedTracks.map(track => (
              <TrackListItem
                key={track.id}
                track={track}
                context={likedTracks}
                isCurrent={currentTrack?.id === track.id}
                isPlaying={isPlaying}
                onPlay={handlePlay}
                onPause={pause}
              />
            ))
          )}
        </div>
      )}

      {activeCategory === 'Downloaded' && (
        <div className="px-4 md:px-6 flex flex-col gap-2">
          {downloadedTracks.length === 0 ? (
            <div className="text-center text-gray-400 py-10">No downloaded songs yet.</div>
          ) : (
            <div className="text-center text-gray-400 py-10">Downloaded songs will appear here.</div>
          )}
        </div>
      )}

      <ArtistSearchModal 
        isOpen={isArtistModalOpen} 
        onClose={() => setIsArtistModalOpen(false)} 
      />
    </div>
  );
}
