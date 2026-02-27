import { useState, useEffect, useRef } from 'react';
import { Search as SearchIcon, X } from 'lucide-react';
import { searchTracks } from '../utils/api';
import { Track } from '../types';
import TrackList from '../components/TrackList';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        const tracks = await searchTracks(query);
        setResults(tracks);
        setLoading(false);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="p-4 md:p-6 pb-6 h-full overflow-y-auto bg-[#121212]">
      <div className="sticky top-0 z-10 bg-[#121212] pt-2 pb-4 md:pb-6">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            ref={inputRef}
            type="text"
            className="block w-full pl-10 pr-10 py-3 border-transparent rounded-full leading-5 bg-[#242424] text-white placeholder-gray-400 focus:outline-none focus:bg-white focus:text-black focus:ring-0 sm:text-sm transition-colors"
            placeholder="What do you want to listen to?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-black transition-colors" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 md:mt-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : results.length > 0 ? (
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6">Top Results</h2>
            <TrackList tracks={results} />
          </div>
        ) : query ? (
          <div className="text-center text-gray-400 mt-20 px-4">
            <h3 className="text-lg md:text-xl font-bold text-white mb-2">No results found for "{query}"</h3>
            <p className="text-sm md:text-base">Please make sure your words are spelled correctly or use less or different keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {/* Browse all categories placeholder */}
            {['Podcasts', 'Live Events', 'Made For You', 'New Releases', 'Pop', 'Hip-Hop'].map((category, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg p-3 md:p-4 relative overflow-hidden cursor-pointer hover:scale-105 transition-transform"
                style={{ backgroundColor: `hsl(${i * 60}, 70%, 40%)` }}
              >
                <h3 className="text-white font-bold text-lg md:text-xl">{category}</h3>
                <div className="absolute -bottom-4 -right-4 w-20 h-20 md:w-24 md:h-24 bg-black/20 rounded-full rotate-45"></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
