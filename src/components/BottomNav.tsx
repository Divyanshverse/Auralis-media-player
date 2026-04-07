import { NavLink } from "react-router-dom";
import { Home, Search, Library, Heart, Download } from "lucide-react";
import { cn } from "../utils/helpers";

export default function BottomNav() {
  return (
    <div className="md:hidden flex items-center justify-around bg-[#121212]/80 backdrop-blur-2xl text-gray-400 p-2 pb-4 border-t border-white/5 shrink-0">
      <NavLink
        to="/home"
        className={({ isActive }) =>
          cn(
            "flex flex-col items-center gap-1 text-[10px] transition-colors",
            isActive ? "text-white drop-shadow-md" : "hover:text-white"
          )
        }
      >
        <Home className="w-5 h-5" />
        <span>Home</span>
      </NavLink>
      <NavLink
        to="/search"
        className={({ isActive }) =>
          cn(
            "flex flex-col items-center gap-1 text-[10px] transition-colors",
            isActive ? "text-white drop-shadow-md" : "hover:text-white"
          )
        }
      >
        <Search className="w-5 h-5" />
        <span>Search</span>
      </NavLink>
      <NavLink
        to="/library"
        className={({ isActive }) =>
          cn(
            "flex flex-col items-center gap-1 text-[10px] transition-colors",
            isActive ? "text-white drop-shadow-md" : "hover:text-white"
          )
        }
      >
        <Library className="w-5 h-5" />
        <span>Library</span>
      </NavLink>
      <NavLink
        to="/liked"
        className={({ isActive }) =>
          cn(
            "flex flex-col items-center gap-1 text-[10px] transition-colors",
            isActive ? "text-white drop-shadow-md" : "hover:text-white"
          )
        }
      >
        <Heart className="w-5 h-5" />
        <span>Liked</span>
      </NavLink>
      <NavLink
        to="/downloaded"
        className={({ isActive }) =>
          cn(
            "flex flex-col items-center gap-1 text-[10px] transition-colors",
            isActive ? "text-white drop-shadow-md" : "hover:text-white"
          )
        }
      >
        <Download className="w-5 h-5" />
        <span>Downloads</span>
      </NavLink>
    </div>
  );
}
