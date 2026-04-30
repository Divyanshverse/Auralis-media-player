import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { usePlayerStore } from '../store/usePlayerStore';
import { useAuthStore } from '../store/useAuthStore';
import { ArrowLeft, MoreHorizontal, Play, Pause, Heart, Music, Plus, User } from 'lucide-react';
import { cn } from '../utils/helpers';
import CreatePlaylistModal from '../components/CreatePlaylistModal';

export default function Library() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { playlists, likedTracks, currentTrack, isPlaying, playTrack, pause } = usePlayerStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');

  return (
    <div className="pt-4 md:pt-6 pb-40 h-full overflow-y-auto overflow-x-hidden bg-transparent">
      <CreatePlaylistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      {/* Top Header */}
      <div className="flex items-center justify-between px-4 md:px-6 mb-6">
        <div className="flex items-center gap-2">
           <svg className="w-5 h-5 text-[#A78BFA]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
           <span className="font-display text-sm tracking-wide text-white drop-shadow-md">Auralis</span>
        </div>
        <div
          className="w-8 h-8 rounded-full bg-gradient-to-br from-[#A78BFA] to-[#67E8F9] flex items-center justify-center text-[#0B0B0D] font-bold text-sm shadow-[0_0_10px_rgba(167,139,250,0.5)] cursor-pointer"
          onClick={() => navigate('/profile')}
        >
          {user?.name?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || <User className="w-4 h-4" />}
        </div>
      </div>

      <div className="px-4 md:px-6 mb-6">
        <h1 className="text-3xl md:text-5xl font-bold font-display text-white mb-6">Your Library</h1>

        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {['All', 'Playlists', 'Albums', 'Artists'].map(tab => (
             <button
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={cn(
                 "px-5 py-1.5 rounded-full font-medium text-sm whitespace-nowrap transition-all border",
                 activeTab === tab ? "bg-[#A78BFA] text-[#0B0B0D] border-[#A78BFA] shadow-[0_0_10px_rgba(167,139,250,0.4)]" : "bg-[#141416] text-gray-300 hover:bg-[#1f1f22] border-white/10"
               )}
             >
               {tab}
             </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col gap-6 px-4 md:px-6 relative">
        <div className="absolute left-7 top-0 bottom-0 w-px bg-white/10 hidden md:block z-0"></div>

        <div>
          <h3 className="text-xs font-bold font-display text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#A78BFA] shadow-[0_0_5px_rgba(167,139,250,0.8)]"></div>
            This Week
          </h3>
          <div className="space-y-2">
            {/* Liked Songs Item */}
            <div
              className="flex items-center justify-between group cursor-pointer hover:bg-[#1f1f22] p-2 rounded-xl transition-colors relative z-10"
              onClick={() => navigate('/liked')}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#A78BFA] to-[#67E8F9] flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Heart className="w-6 h-6 text-[#0B0B0D] fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold text-base truncate">Liked Songs</h4>
                  <p className="text-gray-400 text-sm truncate">Playlist &bull; {likedTracks.length} tracks</p>
                </div>
              </div>
            </div>

            {playlists.slice(0, 1).map((playlist) => (
              <div
                key={playlist.id}
                className="flex items-center justify-between group cursor-pointer hover:bg-[#1f1f22] p-2 rounded-xl transition-colors relative z-10"
                onClick={() => navigate(`/playlist/${playlist.id}`)}
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  {playlist.tracks.length > 0 ? (
                    <img
                      src={playlist.tracks[0].artwork}
                      alt={playlist.name}
                      className="w-14 h-14 rounded-lg object-cover flex-shrink-0 shadow-md"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-[#141416] border border-white/5 flex items-center justify-center flex-shrink-0">
                      <Music className="w-6 h-6 text-gray-500" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-bold text-base truncate">{playlist.name}</h4>
                    <p className="text-gray-400 text-sm truncate">Playlist &bull; {playlist.tracks.length} tracks</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {playlists.length > 1 && (
          <div>
            <h3 className="text-xs font-bold font-display text-gray-500 uppercase tracking-widest mb-4 mt-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
              This Month
            </h3>
            <div className="space-y-2">
              {playlists.slice(1).map((playlist) => (
                <div
                  key={playlist.id}
                  className="flex items-center justify-between group cursor-pointer hover:bg-[#1f1f22] p-2 rounded-xl transition-colors relative z-10"
                  onClick={() => navigate(`/playlist/${playlist.id}`)}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {playlist.tracks.length > 0 ? (
                      <img
                        src={playlist.tracks[0].artwork}
                        alt={playlist.name}
                        className="w-14 h-14 rounded-lg object-cover flex-shrink-0 shadow-md"
                        loading="lazy"
                      />
                    ) : (
                   <div className="w-14 h-14 rounded-lg bg-[#141416] border border-white/5 flex items-center justify-center flex-shrink-0">
                        <Music className="w-6 h-6 text-gray-500" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold text-base truncate">{playlist.name}</h4>
                      <p className="text-gray-400text-sm truncate">Playlist &bull; {playlist.tracks.length} tracks</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-4 text-white hover:text-[#A78BFA] transition-colors mt-4 p-2 relative z-10 group"
        >
          <div className="w-14 h-14 rounded-full bg-[#141416] group-hover:bg-[#A78BFA]/20 border border-white/10 group-hover:border-[#A78BFA]/50 flex items-center justify-center transition-all">
            <Plus className="w-6 h-6" />
          </div>
          <span className="font-bold">Create New Playlist</span>
        </button>

      </div>
    </div>
  );
}
