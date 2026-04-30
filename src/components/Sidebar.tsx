import { NavLink } from "react-router-dom";
import { Home, Search, Library, Heart, Music, Download, User, PlusSquare } from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";
import { useAuthStore } from "../store/useAuthStore";
import { cn } from "../utils/helpers";
import { useState } from "react";
import CreatePlaylistModal from "./CreatePlaylistModal";

export default function Sidebar() {
  const { playlists } = usePlayerStore();
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="w-64 bg-[#0B0B0D]/40 backdrop-blur-2xl border-r border-white/5 h-full flex flex-col text-gray-300 p-4 shrink-0">
      <CreatePlaylistModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <div className="flex items-center gap-2 px-2 mb-8">
        <Music className="w-8 h-8 text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
        <span className="text-white text-xl font-bold tracking-tight drop-shadow-md">
          Auralis
        </span>
      </div>

      <nav className="space-y-4 mb-8">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-4 px-2 py-1 text-sm font-semibold transition-colors hover:text-white",
              isActive ? "text-white drop-shadow-md" : "text-gray-400",
            )
          }
        >
          <Home className="w-6 h-6" />
          Home
        </NavLink>
        <NavLink
          to="/search"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-4 px-2 py-1 text-sm font-semibold transition-colors hover:text-white",
              isActive ? "text-white drop-shadow-md" : "text-gray-400",
            )
          }
        >
          <Search className="w-6 h-6" />
          Search
        </NavLink>
        <NavLink
          to="/library"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-4 px-2 py-1 text-sm font-semibold transition-colors hover:text-white",
              isActive ? "text-white drop-shadow-md" : "text-gray-400",
            )
          }
        >
          <Library className="w-6 h-6" />
          Your Library
        </NavLink>
        <NavLink
          to={user ? "/profile" : "/login"}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-4 px-2 py-1 text-sm font-semibold transition-colors hover:text-white",
              isActive ? "text-white drop-shadow-md" : "text-gray-400",
            )
          }
        >
          <User className="w-6 h-6" />
          {user ? "Profile" : "Login"}
        </NavLink>
      </nav>

      <div className="space-y-4 mb-4">
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex w-full items-center gap-4 px-2 py-1 text-sm font-semibold transition-colors text-gray-400 hover:text-white group"
        >
          <div className="bg-gray-400 group-hover:bg-[#A78BFA] p-1 rounded-sm text-[#0B0B0D] transition-colors">
            <PlusSquare className="w-4 h-4" />
          </div>
          Create Playlist
        </button>
        <NavLink
          to="/downloaded"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-4 px-2 py-1 text-sm font-semibold transition-colors hover:text-white",
              isActive ? "text-white drop-shadow-md" : "text-gray-400",
            )
          }
        >
          <div className="bg-gradient-to-br from-[#A78BFA] to-[#67E8F9] p-1 rounded-sm text-[#0B0B0D] shadow-[0_0_10px_rgba(167,139,250,0.3)]">
            <Download className="w-4 h-4" />
          </div>
          Downloaded
        </NavLink>
      </div>

      <hr className="border-white/5 my-2" />

      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
        <div className="space-y-2 py-2">
          {playlists.map((playlist) => (
            <NavLink
              key={playlist.id}
              to={`/playlist/${playlist.id}`}
              className={({ isActive }) =>
                cn(
                  "block px-2 py-1 text-sm truncate transition-colors hover:text-white",
                  isActive ? "text-white drop-shadow-md" : "text-gray-400",
                )
              }
            >
              {playlist.name}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="mt-auto p-6 flex flex-col items-center justify-center gap-4 border-t border-white/5 bg-white/5 backdrop-blur-md rounded-xl mx-2 mb-2 shadow-inner">
        <div className="text-sm text-gray-400 font-medium tracking-wide flex flex-col items-center justify-center gap-2 text-center">
          <span className="mb-1">© 2026</span>
          <span className="font-['Updock'] text-gray-300 text-5xl not-italic tracking-wider py-2 drop-shadow-md">
            Divyanshverse
          </span>
        </div>
        <div className="text-xs font-bold text-gray-500 tracking-widest uppercase text-center mt-2">
          Open-Source & Free to Use
        </div>
      </div>
    </div>
  );
}
