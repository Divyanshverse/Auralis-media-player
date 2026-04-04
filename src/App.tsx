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

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full w-full text-gray-400 absolute inset-0 bg-[#121212] z-40">
    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <Router>
      <div className="fixed inset-0 flex flex-col bg-black overflow-hidden font-sans">
        <div className="flex flex-1 overflow-hidden">
          <div className="hidden md:flex">
            <Sidebar />
          </div>
          <main className="flex-1 relative bg-[#121212] md:rounded-lg md:m-2 md:ml-0 overflow-hidden">
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
        <Player />
        <BottomNav />
      </div>
    </Router>
  );
}



