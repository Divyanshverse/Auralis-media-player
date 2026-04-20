import { NavLink } from "react-router-dom";
import { Home, Search, Library, Heart, Download, Settings, Bookmark, Radio, Music } from "lucide-react";
import { cn } from "../utils/helpers";

export default function BottomNav() {
  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md bg-[#282828]/95 backdrop-blur-xl rounded-full px-6 py-3 flex justify-between items-center z-50 shadow-2xl border border-white/5">
      <NavLink
        to="/home"
        className={({ isActive }) =>
          cn(
            "flex items-center justify-center transition-all duration-300 rounded-full",
            isActive ? "bg-[#cbfb45] text-black p-2.5" : "text-gray-400 hover:text-white p-2.5"
          )
        }
      >
        <Home className="w-6 h-6" />
      </NavLink>
      <NavLink
        to="/library"
        className={({ isActive }) =>
          cn(
            "flex items-center justify-center transition-all duration-300 rounded-full",
            isActive ? "bg-[#cbfb45] text-black p-2.5" : "text-gray-400 hover:text-white p-2.5"
          )
        }
      >
        <Music className="w-6 h-6" />
      </NavLink>
      <NavLink
        to="/search"
        className={({ isActive }) =>
          cn(
            "flex items-center justify-center transition-all duration-300 rounded-full",
            isActive ? "bg-[#cbfb45] text-black p-2.5" : "text-gray-400 hover:text-white p-2.5"
          )
        }
      >
        <Radio className="w-6 h-6" />
      </NavLink>
      <NavLink
        to="/liked"
        className={({ isActive }) =>
          cn(
            "flex items-center justify-center transition-all duration-300 rounded-full",
            isActive ? "bg-[#cbfb45] text-black p-2.5" : "text-gray-400 hover:text-white p-2.5"
          )
        }
      >
        <Bookmark className="w-6 h-6" />
      </NavLink>
      <NavLink
        to="/profile"
        className={({ isActive }) =>
          cn(
            "flex items-center justify-center transition-all duration-300 rounded-full",
            isActive ? "bg-[#cbfb45] text-black p-2.5" : "text-gray-400 hover:text-white p-2.5"
          )
        }
      >
        <Settings className="w-6 h-6" />
      </NavLink>
    </div>
  );
}
