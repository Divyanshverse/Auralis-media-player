import { useEffect, useState, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';
import { getPopularArtistsDynamic, searchTracks } from '../utils/api';
import { Track } from '../types';
import { Play, Pause, RotateCw, User, Plus } from 'lucide-react';
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
  const { history, currentTrack, isPlaying, playTrack, pause, favoriteArtists } = usePlayerStore();
  
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [popularArtists, setPopularArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isArtistModalOpen, setIsArtistModalOpen] = useState(false);

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
    <div className="pt-4 md:pt-6 pb-24 h-full overflow-y-auto overflow-x-hidden bg-gradient-to-b from-[#2a2a2a] to-[#121212]">
      
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-4 md:px-6 mb-6 bg-transparent py-3 -mt-4 md:-mt-6">
        <h1 className="text-2xl md:text-3xl font-bold text-white">{greeting}</h1>
        <div className="flex items-center gap-3 ml-4 shrink-0">
          <button 
            onClick={() => fetchHomeData()}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Refresh page"
          >
            <RotateCw className="w-4 h-4 md:w-5 md:h-5" />
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
            aria-label="Profile"
          >
            <User className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Your Favorite Artists */}
      <section className="mb-8 md:mb-10">
        <div className="flex items-center justify-between mb-4 px-4 md:px-6">
          <h2 className="text-xl md:text-2xl font-bold text-white hover:underline cursor-pointer">Your Favorite Artists</h2>
          <button 
            onClick={() => setIsArtistModalOpen(true)}
            className="flex items-center gap-1 text-sm font-bold text-white hover:text-green-400 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Artists
          </button>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 px-4 md:px-6 snap-x snap-mandatory hide-scrollbar after:content-[''] after:w-4 after:shrink-0">
          {favoriteArtists.length === 0 ? (
            <div 
              onClick={() => setIsArtistModalOpen(true)}
              className="w-[140px] md:w-[180px] p-3 md:p-4 bg-[#181818] hover:bg-[#282828] rounded-lg transition-colors cursor-pointer flex flex-col items-center justify-center text-center flex-shrink-0 snap-start border border-dashed border-gray-600"
            >
              <Plus className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-gray-400 text-sm">Add your favorites</p>
            </div>
          ) : (
            favoriteArtists.map((artist, i) => (
              <div
                key={`${artist.id}-${i}`}
                onClick={() => navigate(`/artist/${encodeURIComponent(artist.name)}`)}
                className="w-[140px] md:w-[180px] p-3 md:p-4 bg-[#181818] hover:bg-[#282828] rounded-lg transition-colors group cursor-pointer flex flex-col items-center text-center flex-shrink-0 snap-start"
              >
                <div className="w-full aspect-square mb-3 md:mb-4 rounded-full overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                  <img
                    src={artist.image}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <h3 className="text-white font-bold text-sm md:text-base truncate w-full">{artist.name}</h3>
                <p className="text-gray-400 text-xs md:text-sm mt-1">Artist</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Jump Back In (History) */}
      {history.length > 0 && (
        <section className="mb-8 md:mb-10">
          <SectionHeader title="Jump back in" onShowAll={() => usePlayerStore.getState().clearHistory()} />
          <div className="flex overflow-x-auto gap-4 pb-4 px-4 md:px-6 snap-x snap-mandatory hide-scrollbar after:content-[''] after:w-4 after:shrink-0">
            {history.slice(0, 10).map((track, index) => (
              <TrackCard
                key={`${track.id}-${index}`}
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

      {/* Dynamic Sections */}
      {loading ? (
        <>
          <section className="mb-8 md:mb-10"><SectionHeader title="Loading..." />{renderSkeletons()}</section>
          <section className="mb-8 md:mb-10"><SectionHeader title="Loading..." />{renderSkeletons()}</section>
          <section className="mb-8 md:mb-10"><SectionHeader title="Loading..." />{renderSkeletons()}</section>
        </>
      ) : (
        sections.map((section) => (
          <section key={section.id} className="mb-8 md:mb-10">
            {section.artistImage ? (
              <div className="flex items-center gap-3 px-4 md:px-6 mb-4">
                <img 
                  src={section.artistImage} 
                  className="w-12 h-12 md:w-16 md:h-16 rounded-full object-cover shadow-lg"
                  alt=""
                />
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-bold">Discover more from</p>
                  <h2 className="text-xl md:text-2xl font-bold text-white hover:underline cursor-pointer">{section.title.replace('Discover more from ', '')}</h2>
                </div>
              </div>
            ) : (
              <SectionHeader title={section.title} onShowAll={() => {}} />
            )}
            
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

      {/* Popular Artists */}
      <section className="mb-8 md:mb-10">
        <div className="flex items-end justify-between mb-4 px-4 md:px-6">
          <h2 className="text-xl md:text-2xl font-bold text-white hover:underline cursor-pointer">Popular Artists</h2>
        </div>
        {loading ? renderSkeletons() : (
          <div className="flex overflow-x-auto gap-4 pb-4 px-4 md:px-6 snap-x snap-mandatory hide-scrollbar after:content-[''] after:w-4 after:shrink-0">
            {popularArtists.filter(pa => !favoriteArtists.some(fa => fa.id === pa.id)).map((artist, i) => (
              <div
                key={`${artist.name}-${i}`}
                onClick={() => navigate(`/artist/${encodeURIComponent(artist.name)}`)}
                className="w-[140px] md:w-[180px] p-3 md:p-4 bg-[#181818] hover:bg-[#282828] rounded-lg transition-colors group cursor-pointer flex flex-col items-center text-center flex-shrink-0 snap-start"
              >
                <div className="w-full aspect-square mb-3 md:mb-4 rounded-full overflow-hidden shadow-[0_8px_24px_rgba(0,0,0,0.5)]">
                  <img
                    src={artist.image || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop'}
                    alt={artist.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&h=500&fit=crop';
                    }}
                  />
                </div>
                <h3 className="text-white font-bold text-sm md:text-base truncate w-full">{artist.name}</h3>
                <p className="text-gray-400 text-xs md:text-sm mt-1">Artist</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <ArtistSearchModal 
        isOpen={isArtistModalOpen} 
        onClose={() => setIsArtistModalOpen(false)} 
      />
    </div>
  );
}
