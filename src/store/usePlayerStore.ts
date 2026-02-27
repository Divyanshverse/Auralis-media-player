import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Track, Playlist } from '../types';

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  history: Track[];
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  repeatMode: 'off' | 'all' | 'one';
  isShuffle: boolean;
  likedTracks: Track[];
  playlists: Playlist[];
  downloadedTracks: string[];
  
  // Actions
  playTrack: (track: Track, queue?: Track[]) => void;
  pause: () => void;
  resume: () => void;
  next: () => void;
  previous: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  reorderQueue: (startIndex: number, endIndex: number) => void;
  
  // Liked & Playlists
  toggleLike: (track: Track) => void;
  createPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  renamePlaylist: (id: string, name: string) => void;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  reorderPlaylist: (playlistId: string, startIndex: number, endIndex: number) => void;

  // Offline
  addDownloadedTrack: (id: string) => void;
  removeDownloadedTrack: (id: string) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      queue: [],
      history: [],
      isPlaying: false,
      volume: 1,
      isMuted: false,
      repeatMode: 'off',
      isShuffle: false,
      likedTracks: [],
      playlists: [],
      downloadedTracks: [],

      playTrack: (track, newQueue) => set((state) => {
        const history = state.currentTrack 
          ? [state.currentTrack, ...state.history.filter(t => t.id !== state.currentTrack?.id)].slice(0, 20)
          : state.history;
        return {
          currentTrack: track,
          queue: newQueue || state.queue,
          isPlaying: true,
          history,
        };
      }),
      
      pause: () => set({ isPlaying: false }),
      resume: () => set({ isPlaying: true }),
      
      next: () => set((state) => {
        if (state.queue.length === 0) {
          if (state.repeatMode === 'all' && state.history.length > 0) {
            // Loop back to start of history if we want to repeat all
            // Simplification: just play the first track in history if queue is empty
            return { currentTrack: state.history[state.history.length - 1] || null };
          }
          return { isPlaying: false };
        }
        
        let nextIndex = 0;
        if (state.isShuffle) {
          nextIndex = Math.floor(Math.random() * state.queue.length);
        }
        
        const nextTrack = state.queue[nextIndex];
        const newQueue = state.queue.filter((_, i) => i !== nextIndex);
        const history = state.currentTrack 
          ? [state.currentTrack, ...state.history.filter(t => t.id !== state.currentTrack?.id)].slice(0, 20)
          : state.history;
          
        return {
          currentTrack: nextTrack,
          queue: newQueue,
          history,
          isPlaying: true,
        };
      }),
      
      previous: () => set((state) => {
        if (state.history.length === 0) return state;
        
        const prevTrack = state.history[0];
        const newHistory = state.history.slice(1);
        const newQueue = state.currentTrack ? [state.currentTrack, ...state.queue] : state.queue;
        
        return {
          currentTrack: prevTrack,
          history: newHistory,
          queue: newQueue,
          isPlaying: true,
        };
      }),
      
      setVolume: (volume) => set({ volume, isMuted: volume === 0 }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
      
      toggleRepeat: () => set((state) => {
        const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
        const nextMode = modes[(modes.indexOf(state.repeatMode) + 1) % modes.length];
        return { repeatMode: nextMode };
      }),
      
      toggleShuffle: () => set((state) => ({ isShuffle: !state.isShuffle })),
      
      addToQueue: (track) => set((state) => ({ queue: [...state.queue, track].slice(0, 100) })),
      removeFromQueue: (index) => set((state) => ({ queue: state.queue.filter((_, i) => i !== index) })),
      reorderQueue: (startIndex, endIndex) => set((state) => {
        const result = Array.from(state.queue);
        const [removed] = result.splice(startIndex, 1);
        result.splice(endIndex, 0, removed);
        return { queue: result };
      }),
      
      toggleLike: (track) => set((state) => {
        const isLiked = state.likedTracks.some(t => t.id === track.id);
        if (isLiked) {
          return { likedTracks: state.likedTracks.filter(t => t.id !== track.id) };
        } else {
          return { likedTracks: [track, ...state.likedTracks].slice(0, 100) };
        }
      }),
      
      createPlaylist: (name) => set((state) => ({
        playlists: [...state.playlists, { id: Date.now().toString(), name, tracks: [], createdAt: Date.now() }]
      })),
      
      deletePlaylist: (id) => set((state) => ({
        playlists: state.playlists.filter(p => p.id !== id)
      })),
      
      renamePlaylist: (id, name) => set((state) => ({
        playlists: state.playlists.map(p => p.id === id ? { ...p, name } : p)
      })),
      
      addTrackToPlaylist: (playlistId, track) => set((state) => ({
        playlists: state.playlists.map(p => {
          if (p.id === playlistId) {
            if (p.tracks.some(t => t.id === track.id)) return p;
            return { ...p, tracks: [...p.tracks, track].slice(0, 100) };
          }
          return p;
        })
      })),
      
      removeTrackFromPlaylist: (playlistId, trackId) => set((state) => ({
        playlists: state.playlists.map(p => {
          if (p.id === playlistId) {
            return { ...p, tracks: p.tracks.filter(t => t.id !== trackId) };
          }
          return p;
        })
      })),
      
      reorderPlaylist: (playlistId, startIndex, endIndex) => set((state) => ({
        playlists: state.playlists.map(p => {
          if (p.id === playlistId) {
            const result = Array.from(p.tracks);
            const [removed] = result.splice(startIndex, 1);
            result.splice(endIndex, 0, removed);
            return { ...p, tracks: result };
          }
          return p;
        })
      })),

      addDownloadedTrack: (id) => set((state) => ({
        downloadedTracks: [...new Set([...state.downloadedTracks, id])]
      })),

      removeDownloadedTrack: (id) => set((state) => ({
        downloadedTracks: state.downloadedTracks.filter(tId => tId !== id)
      })),
    }),
    {
      name: 'spotify-clone-storage-v2',
      partialize: (state) => ({
        history: state.history,
        likedTracks: state.likedTracks,
        playlists: state.playlists,
        volume: state.volume,
        isMuted: state.isMuted,
        repeatMode: state.repeatMode,
        isShuffle: state.isShuffle,
        downloadedTracks: state.downloadedTracks,
      }),
    }
  )
);
