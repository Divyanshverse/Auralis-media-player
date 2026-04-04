import express from 'express';
import cors from 'cors';
import lyricsFinder from 'lyrics-finder';
import SaavnAPI from 'saavnapi';
import YTMusic from 'ytmusic-api';
import youtubedl from 'youtube-dl-exec';
import fetch from 'node-fetch';
import play from 'play-dl';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// SaavnAPI is a class with static methods
const saavn: any = (SaavnAPI as any).default || SaavnAPI;

// Initialize YTMusic
const ytmusic = new YTMusic();
ytmusic.initialize().then(() => console.log('YTMusic initialized')).catch(console.error);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Endpoint to resolve track stream URL and actual metadata
app.get('/api/resolve-track', async (req, res) => {
  const title = req.query.title as string;
  const artist = req.query.artist as string;
  const url = req.query.url as string;
  const id = req.query.id as string;
  
  try {
    let ytUrl = url;
    if (id && !url) {
      ytUrl = `https://www.youtube.com/watch?v=${id}`;
    }

    // 1. If URL is provided (e.g. YouTube), try to fetch stream URL
    if (ytUrl && (ytUrl.includes('youtube.com') || ytUrl.includes('youtu.be'))) {
      try {
        const cookiesPath = path.join(process.cwd(), 'cookies.txt');
        
        const ytdlOptions: any = {
          dumpJson: true,
          noWarnings: true,
          preferFreeFormats: true,
        };

        if (fs.existsSync(cookiesPath)) {
          ytdlOptions.cookies = cookiesPath;
        }

        const output = await youtubedl(ytUrl, ytdlOptions);
        
        const format = output.formats?.filter(f => f.acodec !== 'none' && f.vcodec === 'none')
          .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];
          
        if (format && format.url) {
          return res.json({
            url: format.url,
            title: title || output.title,
            artist: artist || output.uploader,
            artwork: output.thumbnail
          });
        }
      } catch (ytError: any) {
        const errMsg = String(ytError.message || ytError);
        if (!errMsg.includes('Sign in to confirm you’re not a bot')) {
          console.warn('YouTube stream error:', errMsg);
        }
      }
    }

    const query = `${title} ${artist}`;
    
    const isRelevant = (track: any, queryTitle: string, queryArtist: string) => {
      const qTitle = queryTitle.toLowerCase();
      const qArtist = queryArtist.toLowerCase();
      const tTitle = (track.title || track.name || '').toLowerCase();
      const tArtist = (track.artist || track.artists?.primary?.map((a: any) => a.name).join(', ') || track.user?.name || '').toLowerCase();
      
      const titleMatch = tTitle.includes(qTitle) || qTitle.includes(tTitle);
      
      // If artist is unknown, just match by title
      if (!qArtist || qArtist === 'unknown artist') return titleMatch;
      
      const artistMatch = tArtist.includes(qArtist) || qArtist.includes(tArtist) || tTitle.includes(qArtist);
      
      return titleMatch && artistMatch;
    };
    
    // Try Saavn first
    try {
      let searchResult = await saavn.search.searchSongs({ query, page: 1, limit: 5 });
      let song = searchResult.results?.find((s: any) => isRelevant(s, title, artist));
      
      if (!song) {
        searchResult = await saavn.search.searchSongs({ query: title, page: 1, limit: 10 });
        song = searchResult.results?.find((s: any) => isRelevant(s, title, artist));
      }
      
      if (song) {
        const downloadUrl = song.downloadUrl?.[song.downloadUrl.length - 1]?.url || song.downloadUrl?.[0]?.url;
        if (downloadUrl) {
          return res.json({
            url: downloadUrl,
            title: song.name,
            artist: song.artists?.primary?.map((a: any) => a.name).join(', ') || song.artist || 'Unknown Artist',
            artwork: song.image?.[song.image.length - 1]?.url || song.image?.[0]?.url || ''
          });
        }
      }
    } catch (saavnError: any) {
      console.warn('Saavn stream error:', saavnError.message || saavnError);
    }
    
    // Fallback to play-dl SoundCloud
    try {
      await play.getFreeClientID().then((clientID: string) => play.setToken({
        soundcloud : {
            client_id : clientID
        }
      })).catch(() => {});
      
      const search = await play.search(query, { source: { soundcloud: 'tracks' }, limit: 5 });
      const track = search.find((t: any) => isRelevant(t, title, artist)) || search[0];
      
      if (track) {
        const stream = await play.stream(track.url);
        if (stream && stream.url) {
          return res.json({
            url: stream.url,
            title: track.name,
            artist: track.user?.name || 'Unknown Artist',
            artwork: track.thumbnail || ''
          });
        }
      }
    } catch (scError: any) {
      console.warn('SoundCloud stream error:', scError.message || scError);
    }
    
    // Fallback to Audius
    try {
      const appName = 'react_music_player';
      const response = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=${appName}`);
      if (response.ok) {
        const data = await response.json();
        const track = data.data?.find((t: any) => isRelevant(t, title, artist));
        if (track) {
          return res.json({
            url: `https://discoveryprovider.audius.co/v1/tracks/${track.id}/stream?app_name=${appName}`,
            title: track.title,
            artist: track.user?.name || 'Unknown Artist',
            artwork: track.artwork?.['480x480'] || track.artwork?.['150x150'] || ''
          });
        }
      }
    } catch (audiusError: any) {
      console.warn('Audius stream error:', audiusError.message || audiusError);
    }

    return res.status(404).json({ error: 'Stream not found' });
  } catch (err: any) {
    console.error('Stream resolution error:', err.message);
    res.status(500).json({ error: 'Failed to resolve stream' });
  }
});

// Stream endpoint to dynamically fetch audio URL (legacy redirect)
app.get('/api/stream', async (req, res) => {
  const title = req.query.title as string;
  const artist = req.query.artist as string;
  const url = req.query.url as string;
  const id = req.query.id as string;
  
  try {
    let ytUrl = url;
    if (id && !url) {
      ytUrl = `https://www.youtube.com/watch?v=${id}`;
    }

    // 1. If URL is provided (e.g. YouTube), try to fetch stream URL
    if (ytUrl && (ytUrl.includes('youtube.com') || ytUrl.includes('youtu.be'))) {
      try {
        const cookiesPath = path.join(process.cwd(), 'cookies.txt');
        
        const ytdlOptions: any = {
          dumpJson: true,
          noWarnings: true,
          preferFreeFormats: true,
        };

        if (fs.existsSync(cookiesPath)) {
          ytdlOptions.cookies = cookiesPath;
        }

        const output = await youtubedl(ytUrl, ytdlOptions);
        
        // Find highest quality audio stream
        const format = output.formats?.filter(f => f.acodec !== 'none' && f.vcodec === 'none')
          .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];
          
        if (format && format.url) {
          return res.redirect(format.url);
        }
      } catch (ytError: any) {
        console.warn('YouTube stream error:', ytError.message || ytError);
      }
    }

    const query = `${title} ${artist}`;
    
    // Helper to validate song-artist relevance
    const isRelevant = (track: any, queryTitle: string, queryArtist: string) => {
      const qTitle = queryTitle.toLowerCase();
      const qArtist = queryArtist.toLowerCase();
      const tTitle = (track.title || track.name || '').toLowerCase();
      const tArtist = (track.artist || track.artists?.primary?.map((a: any) => a.name).join(', ') || track.user?.name || '').toLowerCase();
      
      // Check if title matches (at least partially)
      const titleMatch = tTitle.includes(qTitle) || qTitle.includes(tTitle);
      
      // Check if artist matches, or if artist is in the title
      const artistMatch = tArtist.includes(qArtist) || qArtist.includes(tArtist) || tTitle.includes(qArtist);
      
      return titleMatch && artistMatch;
    };
    
    // Try Saavn first
    try {
      let searchResult = await saavn.search.searchSongs({ query, page: 1, limit: 5 });
      let song = searchResult.results?.find((s: any) => isRelevant(s, title, artist));
      
      // Fallback: search just the title if query with artist fails
      if (!song) {
        searchResult = await saavn.search.searchSongs({ query: title, page: 1, limit: 10 });
        song = searchResult.results?.find((s: any) => isRelevant(s, title, artist));
      }
      
      if (song) {
        const downloadUrl = song.downloadUrl?.[song.downloadUrl.length - 1]?.url || song.downloadUrl?.[0]?.url;
        if (downloadUrl) {
          return res.redirect(downloadUrl);
        }
      }
    } catch (saavnError: any) {
      console.warn('Saavn stream error:', saavnError.message || saavnError);
    }
    
    // Fallback to Audius
    try {
      const appName = 'react_music_player';
      const response = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=${appName}`);
      if (response.ok) {
        const data = await response.json();
        const track = data.data?.find((t: any) => isRelevant(t, title, artist));
        if (track) {
          return res.redirect(`https://discoveryprovider.audius.co/v1/tracks/${track.id}/stream?app_name=${appName}`);
        }
      }
    } catch (audiusError: any) {
      console.warn('Audius stream error:', audiusError.message || audiusError);
    }
    
    res.status(404).send('Audio stream not found');
  } catch (e) {
    res.status(500).send('Error fetching audio stream');
  }
});

// Helper to format Saavn song to our Track type
const formatSaavnTrack = (song: any) => {
  // Saavn provides downloadUrl as an array of objects with quality and url
  // We'll pick the highest quality (usually the last one or 320kbps)
  const downloadUrl = song.downloadUrl?.[song.downloadUrl.length - 1]?.url || song.downloadUrl?.[0]?.url || '';
  const artwork = song.image?.[song.image.length - 1]?.url || song.image?.[0]?.url || '';
  
  return {
    id: song.id,
    title: song.name,
    artist: song.artists?.primary?.map((a: any) => a.name).join(', ') || song.artist || 'Unknown Artist',
    album: song.album?.name || 'Unknown Album',
    artwork: artwork,
    duration: parseInt(song.duration) * 1000 || 0,
    url: downloadUrl
  };
};

// Test route to verify SaavnAPI is working
app.get('/api/test-saavn', async (req, res) => {
  try {
    console.log('Testing SaavnAPI search...');
    const searchResult = await saavn.search.searchSongs({ query: 'Arijit Singh', page: 1, limit: 1 });
    res.json({ status: 'success', data: searchResult });
  } catch (error: any) {
    console.error('SaavnAPI test error:', error);
    res.status(500).json({ status: 'error', message: error.message, stack: error.stack });
  }
});

// API Routes
app.get('/api/search/audius', async (req, res) => {
  try {
    const query = req.query.q as string;
    const appName = 'react_music_player';
    
    // Audius requires an app_name parameter
    const response = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=${appName}`);
    
    if (!response.ok) {
      throw new Error('Audius API failed');
    }
    
    const data = await response.json();
    
    // Format Audius tracks to match our app's Track interface
    const tracks = data.data?.map((track: any) => ({
      id: track.id,
      title: track.title,
      artist: track.user?.name || 'Unknown Artist',
      album: 'Audius Single',
      artwork: track.artwork?.['480x480'] || track.artwork?.['150x150'] || '',
      duration: track.duration * 1000 || 0,
      // Audius provides direct stream URLs
      url: `https://discoveryprovider.audius.co/v1/tracks/${track.id}/stream?app_name=${appName}`
    })) || [];
    
    res.json(tracks);
  } catch (err: any) {
    console.warn('Audius search error:', err.message);
    res.json([]);
  }
});

app.get('/api/search/artists', async (req, res) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const searchResult = await saavn.search.searchArtists({ query, page: 1, limit });
    const artists = searchResult.results?.map((a: any) => ({
      id: a.id,
      name: a.name,
      image: a.image?.[a.image.length - 1]?.url || a.image?.[0]?.url || ''
    })) || [];
    
    res.json(artists);
  } catch (err: any) {
    console.warn('Artist search error:', err.message);
    res.json([]);
  }
});

// Helper to validate song-artist relevance
const isRelevant = (track: any, query: string) => {
  const q = query.toLowerCase();
  const title = track.title.toLowerCase();
  const artist = track.artist.toLowerCase();
  
  // Split query into terms to check if all terms appear in title or artist
  const terms = q.split(' ').filter(t => t.length > 1);
  if (terms.length === 0) return title.includes(q) || artist.includes(q);
  
  return terms.every(term => title.includes(term) || artist.includes(term));
};

// Helper to deduplicate tracks
const deduplicateTracks = (tracks: any[]) => {
  const seen = new Set();
  return tracks.filter(track => {
    const key = `${track.title.toLowerCase()}-${track.artist.toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

app.get('/api/search', async (req, res) => {
  const query = req.query.q as string;
  const limit = parseInt(req.query.limit as string) || 15;
  
  let allTracks: any[] = [];
  
  // Execute all searches in parallel
  const [ytResult, saavnResult, audiusResult] = await Promise.allSettled([
    // YTMusic
    (async () => {
      try {
        const ytSongs = await ytmusic.searchSongs(query);
        const mapped = ytSongs.slice(0, limit).map((song: any) => ({
          id: song.videoId,
          title: song.name,
          artist: song.artist?.name || 'Unknown Artist',
          album: song.album?.name || 'YouTube',
          artwork: song.thumbnails?.[song.thumbnails.length - 1]?.url || song.thumbnails?.[0]?.url || '',
          duration: song.duration * 1000 || 0,
          url: `/api/stream?id=${song.videoId}&title=${encodeURIComponent(song.name)}&artist=${encodeURIComponent(song.artist?.name || '')}`
        }));
        const filtered = mapped.filter(t => isRelevant(t, query));
        console.log(`YTMusic: ${mapped.length} mapped, ${filtered.length} filtered`);
        return filtered;
      } catch (e) { 
        console.error('YTMusic search error:', e);
        return []; 
      }
    })(),
    // Saavn
    (async () => {
      try {
        const searchResult = await saavn.search.searchSongs({ query, page: 1, limit });
        return searchResult.results?.map(formatSaavnTrack).filter(t => isRelevant(t, query)) || [];
      } catch { return []; }
    })(),
    // Audius
    (async () => {
      try {
        const appName = 'react_music_player';
        const response = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=${appName}`);
        if (!response.ok) return [];
        const data = await response.json();
        return data.data?.map((track: any) => ({
          id: track.id,
          title: track.title,
          artist: track.user?.name || 'Unknown Artist',
          album: 'Audius Single',
          artwork: track.artwork?.['480x480'] || track.artwork?.['150x150'] || '',
          duration: track.duration * 1000 || 0,
          url: `https://discoveryprovider.audius.co/v1/tracks/${track.id}/stream?app_name=${appName}`
        })).filter(t => isRelevant(t, query)) || [];
      } catch { return []; }
    })()
  ]);

  // Combine results
  if (ytResult.status === 'fulfilled') allTracks.push(...ytResult.value);
  if (saavnResult.status === 'fulfilled') allTracks.push(...saavnResult.value);
  if (audiusResult.status === 'fulfilled') allTracks.push(...audiusResult.value);
  
  res.json(deduplicateTracks(allTracks));
});

app.get('/api/lyrics', async (req, res) => {
  try {
    const artist = req.query.artist as string;
    const title = req.query.title as string;
    const lyrics = await lyricsFinder(artist, title) || "";
    res.json({ lyrics });
  } catch (err) {
    res.json({ lyrics: "" });
  }
});

app.get('/api/artist/details', async (req, res) => {
  try {
    const artistName = req.query.q as string;
    
    // Try YTMusic first
    try {
      const ytArtists = await ytmusic.searchArtists(artistName);
      if (ytArtists && ytArtists.length > 0) {
        const artist = ytArtists[0];
        return res.json({
          id: artist.artistId,
          name: artist.name,
          image: artist.thumbnails?.[artist.thumbnails.length - 1]?.url || artist.thumbnails?.[0]?.url || '',
          subscribers: (artist as any).subscribers || ''
        });
      }
    } catch (ytError: any) {
      console.warn('YTMusic artist details error:', ytError.message || ytError);
    }
    
    // Fallback to Saavn
    const searchResult = await saavn.search.searchArtists({ query: artistName, page: 1, limit: 1 });
    const artist = searchResult.results?.[0];
    
    if (artist) {
      return res.json({
        id: artist.id,
        name: artist.name,
        image: artist.image?.[artist.image.length - 1]?.url || artist.image?.[0]?.url || '',
        role: artist.role || ''
      });
    }
    
    res.json({ name: artistName, image: '' });
  } catch (err: any) {
    console.warn('Artist details error:', err.message);
    res.json({ name: req.query.q, image: '' });
  }
});

app.get('/api/artist/albums', async (req, res) => {
  try {
    const artistName = req.query.q as string;
    
    // 1. Try YTMusic first for better metadata
    try {
      const ytAlbums = await ytmusic.searchAlbums(artistName);
      if (ytAlbums && ytAlbums.length > 0) {
        const albums = ytAlbums
          .filter((album: any) => album.albumId) // Must have an albumId
          .map((album: any) => ({
            id: album.albumId,
            title: album.name,
            year: album.year || '',
            artwork: album.thumbnails?.[album.thumbnails.length - 1]?.url || album.thumbnails?.[0]?.url || '',
            artist: album.artist?.name || artistName
          }));
        
        // Remove duplicates by ID
        const uniqueAlbums = Array.from(new Map(albums.map(a => [a.id, a])).values());
        return res.json(uniqueAlbums);
      }
    } catch (ytError: any) {
      console.warn('YTMusic albums error:', ytError.message || ytError);
    }
    
    // 2. Fallback to Saavn
    let searchResult = await saavn.search.searchArtists({ query: artistName, page: 1, limit: 1 });
    let artistId = searchResult.results?.[0]?.id;
    
    if (!artistId) {
        const allResult = await saavn.search.searchAll({ query: artistName });
        artistId = allResult.artists?.results?.[0]?.id;
    }
    
    let allAlbums: any[] = [];
    
    if (artistId) {
        const pages = [1, 2, 3];
        const albumsPromises = pages.map(p => saavn.artists.getArtistAlbums({ artistId, page: p }).catch(() => ({ albums: [] })));
        const albumsResults = await Promise.all(albumsPromises);
        allAlbums = albumsResults.flatMap(r => r.albums || []);
    }
    
    if (allAlbums.length === 0) {
        const albumSearchResult = await saavn.search.searchAlbums({ query: artistName, page: 1, limit: 20 });
        allAlbums = albumSearchResult.results || [];
    }
    
    const albums = allAlbums
      .filter((album: any) => album.songCount !== 0)
      .map((album: any) => ({
        id: album.id,
        title: album.name,
        year: album.year || '',
        artwork: album.image?.[album.image.length - 1]?.url || album.image?.[0]?.url || '',
        artist: album.primaryArtists || album.artist || artistName
      }));
    
    const uniqueAlbums = Array.from(new Map(albums.map(a => [a.id, a])).values());
    res.json(uniqueAlbums);
  } catch (err: any) {
    console.warn('Artist albums error:', err.message);
    res.json([]);
  }
});

app.get('/api/album/tracks', async (req, res) => {
  try {
    const albumId = req.query.id as string;
    
    // Check if it's a YTMusic ID (MPREb_)
    if (albumId.startsWith('MPREb_')) {
      try {
        const ytAlbum = await ytmusic.getAlbum(albumId);
        if (ytAlbum && ytAlbum.songs) {
          const tracks = ytAlbum.songs.map((song: any) => ({
            id: song.videoId,
            title: song.name,
            artist: song.artists?.map((a: any) => a.name).join(', ') || ytAlbum.artist?.name || 'Unknown Artist',
            album: ytAlbum.name,
            artwork: ytAlbum.thumbnails?.[ytAlbum.thumbnails.length - 1]?.url || ytAlbum.thumbnails?.[0]?.url || '',
            duration: song.duration * 1000 || 0,
            url: `/api/stream?id=${song.videoId}&title=${encodeURIComponent(song.name)}&artist=${encodeURIComponent(song.artists?.[0]?.name || ytAlbum.artist?.name || '')}`
          }));
          return res.json(tracks);
        }
      } catch (ytError: any) {
        console.warn('YTMusic album tracks error:', ytError.message || ytError);
      }
    }
    
    // Fallback to Saavn
    const albumResult = await saavn.albums.getAlbumById(albumId);
    const tracks = albumResult?.songs?.map(formatSaavnTrack) || [];
    res.json(tracks);
  } catch (err: any) {
    console.warn('Album tracks error:', err.message);
    res.json([]);
  }
});

app.get('/api/artist/radio', async (req, res) => {
  try {
    const artistName = req.query.q as string;
    
    // 1. Try YTMusic first for better metadata
    try {
      const ytSongs = await ytmusic.searchSongs(artistName);
      if (ytSongs && ytSongs.length > 0) {
        const tracks = ytSongs.map((song: any) => ({
          id: song.videoId,
          title: song.name,
          artist: song.artist?.name || artistName,
          album: song.album?.name || 'Unknown Album',
          artwork: song.thumbnails?.[song.thumbnails.length - 1]?.url || song.thumbnails?.[0]?.url || '',
          duration: song.duration * 1000 || 0,
          url: `/api/stream?id=${song.videoId}&title=${encodeURIComponent(song.name)}&artist=${encodeURIComponent(song.artist?.name || artistName)}`
        }));
        
        const uniqueTracks = Array.from(new Map(tracks.map(t => [t.id, t])).values());
        return res.json(uniqueTracks);
      }
    } catch (ytError: any) {
      console.warn('YTMusic radio error:', ytError.message || ytError);
    }
    
    // 2. Fallback to Saavn
    let searchResult = await saavn.search.searchArtists({ query: artistName, page: 1, limit: 1 });
    let artistId = searchResult.results?.[0]?.id;
    
    if (!artistId) {
        const allResult = await saavn.search.searchAll({ query: artistName });
        artistId = allResult.artists?.results?.[0]?.id;
    }
    
    if (!artistId) {
      // Fallback to Audius
      const appName = 'react_music_player';
      const response = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(artistName)}&app_name=${appName}`);
      if (response.ok) {
        const data = await response.json();
        const tracks = data.data?.map((track: any) => ({
          id: track.id,
          title: track.title,
          artist: track.user?.name || 'Unknown Artist',
          album: 'Audius Single',
          artwork: track.artwork?.['480x480'] || track.artwork?.['150x150'] || '',
          duration: track.duration * 1000 || 0,
          url: `https://discoveryprovider.audius.co/v1/tracks/${track.id}/stream?app_name=${appName}`
        })) || [];
        return res.json(tracks);
      }
      return res.json([]);
    }

    const pages = [1, 2, 3, 4, 5];
    const songsPromises = pages.map(p => saavn.artists.getArtistSongs({ artistId, page: p }).catch(() => ({ songs: [] })));
    const songsResults = await Promise.all(songsPromises);
    
    let allSongs = songsResults.flatMap(r => r.songs || []);
    
    if (allSongs.length === 0) {
        const searchSongsResult = await saavn.search.searchSongs({ query: artistName, page: 1, limit: 50 });
        allSongs = searchSongsResult.results || [];
    }
    
    const tracks = allSongs.map(formatSaavnTrack).filter(t => isRelevant(t, artistName));
    const uniqueTracks = Array.from(new Map(tracks.map(t => [t.id, t])).values());
    
    res.json(uniqueTracks);
  } catch (err: any) {
    console.warn('Artist radio error:', err.message);
    res.json([]);
  }
});

app.get('/api/download', async (req, res) => {
  try {
    const url = req.query.url as string;
    const filename = req.query.filename as string || 'track.m4a';
    
    if (!url) return res.status(400).send('URL is required');
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch track');
    
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', response.headers.get('Content-Type') || 'audio/mp4');
    
    const arrayBuffer = await response.arrayBuffer();
    res.send(Buffer.from(arrayBuffer));
  } catch (err: any) {
    console.error('Download error:', err.message);
    res.status(500).send('Download failed');
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    // Serve index.html for all non-API routes in dev mode
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      try {
        // 1. Read index.html
        let template = await fs.promises.readFile(path.resolve(__dirname, 'index.html'), 'utf-8');

        // 2. Apply Vite HTML transforms. This injects the Vite client, and also applies
        //    HTML transforms from Vite plugins, e.g. global preambles from @vitejs/plugin-react
        template = await vite.transformIndexHtml(url, template);

        // 3. Send the rendered HTML back.
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        // If an error is caught, let Vite fix the stack trace so it maps back to
        // your actual source code.
        vite.ssrFixStacktrace(e as Error);
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global error handler - MUST be after all other routes and middleware
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[SERVER] Running on http://localhost:${PORT}`);
    console.log(`[SERVER] NODE_ENV: ${process.env.NODE_ENV}`);
  });
}

startServer();
