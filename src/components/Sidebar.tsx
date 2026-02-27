import { NavLink } from "react-router-dom";
import { Home, Search, Library, Heart, Music, Download } from "lucide-react";
import { usePlayerStore } from "../store/usePlayerStore";
import { cn } from "../utils/helpers";

export default function Sidebar() {
  const playlists = usePlayerStore((state) => state.playlists);

  return (
    <div className="w-64 bg-black h-full flex flex-col text-gray-300 p-4 shrink-0">
      <div className="flex items-center gap-2 px-2 mb-8">
        <Music className="w-8 h-8 text-white" />
        <span className="text-white text-xl font-bold tracking-tight">
          Auralis
        </span>
      </div>

      <nav className="space-y-4 mb-8">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-4 px-2 py-1 text-sm font-semibold transition-colors hover:text-white",
              isActive ? "text-white" : "text-gray-400",
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
              isActive ? "text-white" : "text-gray-400",
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
              isActive ? "text-white" : "text-gray-400",
            )
          }
        >
          <Library className="w-6 h-6" />
          Your Library
        </NavLink>
      </nav>

      <div className="space-y-4 mb-4">
        <NavLink
          to="/liked"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-4 px-2 py-1 text-sm font-semibold transition-colors hover:text-white",
              isActive ? "text-white" : "text-gray-400",
            )
          }
        >
          <div className="bg-gradient-to-br from-indigo-600 to-blue-300 p-1 rounded-sm text-white">
            <Heart className="w-4 h-4 fill-current" />
          </div>
          Liked Songs
        </NavLink>
        <NavLink
          to="/downloaded"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-4 px-2 py-1 text-sm font-semibold transition-colors hover:text-white",
              isActive ? "text-white" : "text-gray-400",
            )
          }
        >
          <div className="bg-gradient-to-br from-green-600 to-emerald-300 p-1 rounded-sm text-white">
            <Download className="w-4 h-4" />
          </div>
          Downloaded
        </NavLink>
      </div>

      <hr className="border-gray-800 my-2" />

      <div className="flex-1 overflow-y-auto min-h-0 scrollbar-hide">
        <div className="space-y-2 py-2">
          {playlists.map((playlist) => (
            <NavLink
              key={playlist.id}
              to={`/playlist/${playlist.id}`}
              className={({ isActive }) =>
                cn(
                  "block px-2 py-1 text-sm truncate transition-colors hover:text-white",
                  isActive ? "text-white" : "text-gray-400",
                )
              }
            >
              {playlist.name}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="mt-auto p-6 flex flex-col items-center justify-center gap-4 border-t border-gray-800/50 bg-black/20 rounded-xl mx-2 mb-2">
        <div className="text-sm text-gray-400 font-medium tracking-wide flex flex-col items-center justify-center gap-1 text-center">
          <span className="mb-1">© 2026</span>
          <span className="font-serif italic text-gray-300 text-lg">
            Divyanshverse
          </span>
          <span className="text-gray-500 text-2xl leading-none my-1">×</span>
          <span className="text-[#f96d38] font-bold text-base">
            AryansDevStudios
          </span>
        </div>
        <div className="text-xs font-bold text-gray-500 tracking-widest uppercase text-center mt-2">
          Open-Source & Free to Use
        </div>
      </div>
    </div>
  );
}
