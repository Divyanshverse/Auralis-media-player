import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Music, User, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const { login, user } = useAuthStore();
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (pin.length < 4) {
      setError('Secret code must be at least 4 digits');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    // Simulate verification
    setTimeout(() => {
      setIsLoading(false);
      login(username);
      navigate('/home');
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a] font-sans overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-green-500/20 rounded-full blur-[120px] opacity-60 mix-blend-screen animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-emerald-600/20 rounded-full blur-[120px] opacity-60 mix-blend-screen animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/80 to-[#0a0a0a]"></div>
        
        {/* Grid Pattern overlay */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 animate-in fade-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-10">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(34,197,94,0.3)] transform transition-transform hover:scale-105">
            <Music className="w-10 h-10 text-black" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-3 text-center tracking-tight">
            Auralis
          </h1>
          <p className="text-gray-400 text-center text-lg font-medium">
            Log in or create an account
          </p>
        </div>

        <div className="bg-[#121212]/60 backdrop-blur-3xl p-8 sm:p-10 rounded-[2rem] border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Subtle inner glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent"></div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-300 ml-1 uppercase tracking-wider">Username</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <User className="h-6 w-6 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  placeholder="e.g. musiclover99"
                  className="w-full bg-[#1a1a1a]/80 text-white pl-14 pr-6 py-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 border border-white/5 focus:border-green-500/50 transition-all placeholder-gray-600 text-xl font-medium shadow-inner"
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-300 ml-1 uppercase tracking-wider">Secret Code</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Lock className="h-6 w-6 text-gray-500 group-focus-within:text-green-500 transition-colors" />
                </div>
                <input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="Min 4 digits"
                  className="w-full bg-[#1a1a1a]/80 text-white pl-14 pr-6 py-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500/50 border border-white/5 focus:border-green-500/50 transition-all placeholder-gray-600 text-xl font-medium shadow-inner tracking-widest"
                />
              </div>
              {error && <p className="text-red-400 text-sm pl-2 mt-2 font-medium animate-in slide-in-from-top-1">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading || username.length < 3 || pin.length < 4}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-black font-bold py-5 rounded-2xl hover:from-green-400 hover:to-emerald-500 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3 text-lg mt-4 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
            >
              {isLoading ? (
                <div className="w-7 h-7 border-3 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Continue <ArrowRight className="w-6 h-6" />
                </>
              )}
            </button>
          </form>
        </div>
        
        <p className="text-gray-500 text-sm text-center mt-10 font-medium">
          By continuing, you agree to Auralis's <br className="sm:hidden" />
          <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">Terms of Service</span> and <span className="text-gray-400 hover:text-white cursor-pointer transition-colors">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
