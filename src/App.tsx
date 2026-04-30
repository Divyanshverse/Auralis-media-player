/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import BottomNav from './components/BottomNav';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPopup from './components/LoginPopup';
import { usePlayerStore } from './store/usePlayerStore';

const Home = lazy(() => import('./pages/Home'));
const Search = lazy(() => import('./pages/Search'));
const Library = lazy(() => import('./pages/Library'));
const Liked = lazy(() => import('./pages/Liked'));
const Playlist = lazy(() => import('./pages/Playlist'));
const Queue = lazy(() => import('./pages/Queue'));
const Downloaded = lazy(() => import('./pages/Downloaded'));
const Profile = lazy(() => import('./pages/Profile'));
const SongDetails = lazy(() => import('./pages/SongDetails'));
const ArtistDetails = lazy(() => import('./pages/ArtistDetails'));
const AlbumDetails = lazy(() => import('./pages/AlbumDetails'));
const Login = lazy(() => import('./pages/Login'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full w-full text-gray-400 absolute inset-0 bg-[#0B0B0D] z-40">
    <div className="w-8 h-8 border-4 border-[#A78BFA] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  const { showLoginPopup, setShowLoginPopup } = usePlayerStore();

  return (
    <Router>
      <div className="fixed inset-0 flex flex-col bg-[#0f0f13] overflow-hidden font-sans">
        <LoginPopup isOpen={showLoginPopup} onClose={() => setShowLoginPopup(false)} />
        {/* Global Premium Background Effects for Glassmorphism */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] bg-[#A78BFA]/10 rounded-full blur-[120px] opacity-40 mix-blend-screen animate-pulse" style={{ animationDuration: '8s' }}></div>
          <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-[#67E8F9]/10 rounded-full blur-[120px] opacity-30 mix-blend-screen animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }}></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
        </div>

        <Routes>
          <Route path="/login" element={
            <ErrorBoundary>
              <Suspense fallback={<LoadingFallback />}>
                <Login />
              </Suspense>
            </ErrorBoundary>
          } />
          <Route path="*" element={
            <>
              <div className="flex flex-1 overflow-hidden relative z-10">
                <div className="hidden md:flex">
                  <Sidebar />
                </div>
                <main className="flex-1 relative bg-transparent md:rounded-lg md:m-2 md:ml-0 overflow-hidden">
                  <ErrorBoundary>
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        <Route path="/" element={<Navigate to="/home" replace />} />
                        <Route path="/home" element={<Home />} />
                        <Route path="/search" element={<Search />} />
                        <Route path="/library" element={<Library />} />
                        <Route path="/liked" element={<Liked />} />
                        <Route path="/playlist/:id" element={<Playlist />} />
                        <Route path="/queue" element={<Queue />} />
                        <Route path="/downloaded" element={<Downloaded />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/song/:id" element={<SongDetails />} />
                        <Route path="/artist/:name" element={<ArtistDetails />} />
                        <Route path="/album/:id" element={<AlbumDetails />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </main>
              </div>
              <div className="relative z-20">
                <Player />
                <BottomNav />
              </div>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}



