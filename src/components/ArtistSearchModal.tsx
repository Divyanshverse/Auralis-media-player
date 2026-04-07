import React, { useState, useEffect } from 'react';
import { Search, X, Plus, Check } from 'lucide-react';
import { searchArtists } from '../utils/api';
import { usePlayerStore } from '../store/usePlayerStore';

interface ArtistSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ArtistSearchModal({ isOpen, onClose }: ArtistSearchModalProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { favoriteArtists, addFavoriteArtist, removeFavoriteArtist } = usePlayerStore();

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const abortController = new AbortController();
    
    const timer = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        const artistsRes = await searchArtists(query, 10, abortController.signal);
        if (!abortController.signal.aborted) {
          setResults(artistsRes);
          setLoading(false);
        }
      } else {
        setResults([]);
        setLoading(false);
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#181818] rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border border-white/10 shadow-2xl">
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-[#282828]">
          <h2 className="text-xl font-bold text-white">Choose your favorite artists</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4 border-b border-white/10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for an artist..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#242424] text-white pl-10 pr-4 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 border border-white/5"
              autoFocus
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {results.map((artist) => {
                const isSelected = favoriteArtists.some(a => a.id === artist.id);
                return (
                  <div
                    key={artist.id}
                    onClick={() => isSelected ? removeFavoriteArtist(artist.id) : addFavoriteArtist(artist)}
                    className={`relative flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all ${
                      isSelected ? 'bg-green-500/20 border border-green-500/50' : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="relative w-full aspect-square mb-3">
                      <img src={artist.image} alt={artist.name} className="w-full h-full object-cover rounded-full shadow-lg" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                          <Check className="w-8 h-8 text-green-500" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-white font-bold text-center text-sm truncate w-full">{artist.name}</h3>
                  </div>
                );
              })}
            </div>
          ) : query ? (
            <div className="text-center text-gray-400 mt-8">No artists found for "{query}"</div>
          ) : (
            <div className="text-center text-gray-400 mt-8">
              <p className="mb-4">Search to add artists to your favorites.</p>
              {favoriteArtists.length > 0 && (
                <div className="text-left mt-8">
                  <h3 className="text-white font-bold mb-4">Your Favorites</h3>
                  <div className="flex flex-wrap gap-2">
                    {favoriteArtists.map(artist => (
                      <div key={artist.id} className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-1">
                        <img src={artist.image} alt={artist.name} className="w-6 h-6 rounded-full object-cover" />
                        <span className="text-sm text-white">{artist.name}</span>
                        <button onClick={() => removeFavoriteArtist(artist.id)} className="text-gray-400 hover:text-white">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-white/10 flex justify-end bg-[#282828]">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
