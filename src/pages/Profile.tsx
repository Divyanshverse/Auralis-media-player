import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { User, LogOut, AtSign } from 'lucide-react';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  if (!user) {
    return (
    <div className="p-4 md:p-8 pb-40 h-full overflow-y-auto bg-gradient-to-b from-[#2a2a2a] to-[#0B0B0D] flex flex-col items-center justify-center">
        <div className="w-full max-w-md bg-[#141416] rounded-2xl p-8 shadow-2xl border border-white/5 text-center">
          <div className="w-16 h-16 bg-[#A78BFA]/10 text-[#A78BFA] rounded-full flex items-center justify-center mb-6 mx-auto">
            <User className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Not Logged In</h2>
          <p className="text-gray-400 text-sm mb-8">You need to be logged in to view your profile.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-[#A78BFA] text-[#0B0B0D] font-bold py-3 rounded-xl hover:bg-[#8B5CF6] transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pb-40 h-full overflow-y-auto bg-gradient-to-b from-[#2a2a2a] to-[#0B0B0D] flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-[#141416] rounded-2xl p-8 shadow-2xl border border-white/5">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-[#8B5CF6] to-[#67E8F9] rounded-full flex items-center justify-center mb-6 shadow-lg">
            <span className="text-3xl font-bold text-[#0B0B0D]">
              {user.name?.charAt(0).toUpperCase() || user.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
          <p className="text-gray-400 text-sm mb-8 flex items-center justify-center gap-2">
            <AtSign className="w-4 h-4" /> {user.username}
          </p>

          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 bg-[#1f1f22] text-white font-bold py-3 rounded-xl hover:bg-[#333] transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
