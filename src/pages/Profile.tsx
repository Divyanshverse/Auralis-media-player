import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { User, LogOut, Phone } from 'lucide-react';

export default function Profile() {
  const { user, login, logout } = useAuthStore();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length < 5) {
      setError('Please enter a valid number (min 5 digits)');
      return;
    }
    setError('');
    login(phoneNumber);
    setPhoneNumber('');
  };

  return (
    <div className="p-4 md:p-8 pb-8 h-full overflow-y-auto bg-gradient-to-b from-[#2a2a2a] to-[#121212] flex flex-col items-center justify-center">
      <div className="w-full max-w-md bg-[#181818] rounded-2xl p-8 shadow-2xl border border-white/5">
        {!user ? (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-6">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome</h2>
            <p className="text-gray-400 text-sm mb-8">Enter your number to login or create an account.</p>

            <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter your number"
                  className="w-full bg-[#282828] text-white pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 transition-all placeholder-gray-500"
                  autoFocus
                />
              </div>
              {error && <p className="text-red-400 text-xs text-left pl-2">{error}</p>}
              
              <button
                type="submit"
                className="w-full bg-green-500 text-black font-bold py-3 rounded-xl hover:bg-green-400 transition-colors mt-2"
              >
                Continue
              </button>
            </form>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <span className="text-3xl font-bold text-black">{user.name?.charAt(0) || 'U'}</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
            <p className="text-gray-400 text-sm mb-8 flex items-center justify-center gap-2">
              <Phone className="w-4 h-4" /> {user.phoneNumber}
            </p>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 bg-[#282828] text-white font-bold py-3 rounded-xl hover:bg-[#333] transition-colors"
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
