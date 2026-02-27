/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Player from './components/Player';

const Home = lazy(() => import('./pages/Home'));
const Search = lazy(() => import('./pages/Search'));
const Library = lazy(() => import('./pages/Library'));
const Liked = lazy(() => import('./pages/Liked'));
const Playlist = lazy(() => import('./pages/Playlist'));
const Queue = lazy(() => import('./pages/Queue'));
const Downloaded = lazy(() => import('./pages/Downloaded'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full text-gray-400">
    <div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

export default function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen bg-black overflow-hidden font-sans">
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 relative bg-[#121212] rounded-lg m-2 ml-0 overflow-hidden">
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
              </Routes>
            </Suspense>
          </main>
        </div>
        <Player />
      </div>
    </Router>
  );
}



