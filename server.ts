import express from 'express';
import cors from 'cors';
import lyricsFinder from 'lyrics-finder';
import YTMusic from 'ytmusic-api';
import youtubedl from 'youtube-dl-exec';
import fetch from 'node-fetch';
import { LRUCache } from 'lru-cache';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import play from 'play-dl';

// Hack for play.getFreeClientID.called
(play as any).isInit = false;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize YTMusic
const ytmusic = new YTMusic();
ytmusic.initialize().then(() => console.log('YTMusic initialized')).catch(console.error);

// Initialize stream cache
const streamCache = new LRUCache<string, any>({
  max: 500, // Store up to 500 resolved streams
  ttl: 1000 * 60 * 15, // 15 minutes TTL
});

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
  const nocache = req.query.nocache === 'true';
  
  const cacheKey = id || url || `${title}-${artist}`;
  if (!nocache && streamCache.has(cacheKey)) {
    return res.json(streamCache.get(cacheKey));
  }
  
  try {
    // 1. Primary Source: Soundcloud
    // (JioSaavn disabled as the public instance requires payment now and delays response)
    let ytUrl = url;
    if (id && !url) {
      ytUrl = `https://www.youtube.com/watch?v=${id}`;
    }

    // If no URL or ID, search YTMusic to find the videoId
    if (!ytUrl && title) {
      const query = `${title} ${artist || ''}`.trim();
      const searchResult = await ytmusic.searchSongs(query);
      if (searchResult && searchResult.length > 0) {
        ytUrl = `https://www.youtube.com/watch?v=${searchResult[0].videoId}`;
      }
    }

    try {
      // If we don't have a soundcloud client id, get one.
      if (!(play as any).isInit) {
         try {
           const scId = await play.getFreeClientID();
           await play.setToken({ soundcloud: { client_id: scId } });
           (play as any).isInit = true;
         } catch(e){}
      }

      const query = `${title} ${artist || ''}`.trim();
      const searchResults = await play.search(query, { source: { soundcloud: 'tracks' }, limit: 1 });
      
      if (searchResults && searchResults.length > 0) {
         let playableUrl = `/api/stream?sc_url=${encodeURIComponent(searchResults[0].url)}`;
         try {
            const scStream = await play.stream(searchResults[0].url);
            if (scStream && scStream.url && scStream.url.includes('.m3u8')) {
               playableUrl = scStream.url;
            }
         } catch(e) {}
         
         const result = {
            url: playableUrl,
            title: searchResults[0].name || title,
            artist: searchResults[0].user?.name || artist,
            artwork: searchResults[0].thumbnail,
            directUrl: searchResults[0].url
         };
         streamCache.set(cacheKey, result);
         return res.json(result);
      }
    } catch (scErr: any) {
      console.warn('Soundcloud fallback error:', scErr.message);
      return res.status(500).json({ error: 'sc err', msg: scErr.message, stack: scErr.stack });
    }

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

        const output: any = await youtubedl(ytUrl, ytdlOptions);
        
        const format = output.formats?.filter((f: any) => f.acodec !== 'none' && f.vcodec === 'none')
          .sort((a: any, b: any) => (b.abr || 0) - (a.abr || 0))[0];
        
        if (format && format.url) {
          const videoId = output.id;
          const result = {
            url: `/api/stream?id=${videoId}`,
            title: title || output.title,
            artist: artist || output.uploader,
            artwork: output.thumbnail,
            directUrl: format.url
          };
          streamCache.set(cacheKey, result);
          return res.json(result);
        }
      } catch (ytError: any) {
        // Suppress YouTube bot bot-protection errors as they are expected on datacenter IPs
      }
    }

    return res.status(404).json({ error: 'Stream not found. No full-length tracks available.' });
  } catch (err: any) {
    console.error('Stream resolution error:', err.message);
    res.status(500).json({ error: 'Failed to resolve stream' });
  }
});

// Stream endpoint to dynamically fetch audio URL (legacy redirect or pipes)
app.get('/api/stream', async (req, res) => {
  const title = req.query.title as string;
  const artist = req.query.artist as string;
  const url = req.query.url as string;
  const id = req.query.id as string;
  const scUrl = req.query.sc_url as string;
  
  if (scUrl) {
    try {
      if (!(play as any).isInit) {
         try {
           const scId = await play.getFreeClientID();
           await play.setToken({ soundcloud: { client_id: scId } });
           (play as any).isInit = true;
         } catch(e){}
      }
      const stream = await play.stream(scUrl);
      if (stream && stream.stream) {
        res.setHeader('Content-Type', 'audio/mpeg');
        // Do not set Accept-Ranges if we cannot handle 206! This breaks Chrome audio playback.
        return stream.stream.pipe(res);
      }
    } catch(e) {
      console.warn('Soundcloud streaming error', e);
    }
  }

  const cacheKey = id || url || `${title}-${artist}`;
  
  try {
    let directUrl: string | undefined;
    
    if (streamCache.has(cacheKey)) {
      directUrl = streamCache.get(cacheKey).directUrl;
    }
    
    // Very fast Soundcloud search fallback (avoids yt-dlp 10-20s cold start and bot block)
    if (!directUrl && title) {
      try {
        if (!(play as any).isInit) {
           const scId = await play.getFreeClientID();
           await play.setToken({ soundcloud: { client_id: scId } });
           (play as any).isInit = true;
        }
        
        const cleanTitle = title.replace(/\([^)]*\)|\[[^\]]*\]/g, '').trim();
        const sq = `${cleanTitle} ${artist || ''}`.trim();
        const searchResults = await play.search(sq, { source: { soundcloud: 'tracks' }, limit: 1 });
        
        if (searchResults && searchResults.length > 0) {
           const scStream = await play.stream(searchResults[0].url);
           if (scStream && scStream.stream) {
              res.setHeader('Content-Type', 'audio/mpeg');
              // No Accept-Ranges for piped streams without range handlers!
              return scStream.stream.pipe(res);
           }
        }
      } catch (scErr) {
        console.warn('Soundcloud fast-stream error', scErr);
      }
    }
    
    if (!directUrl) {
      let ytUrl = url;
      if (id && !url) {
        ytUrl = `https://www.youtube.com/watch?v=${id}`;
      }

      if (!ytUrl && title) {
        const query = `${title} ${artist || ''}`.trim();
        const searchResult = await ytmusic.searchSongs(query);
        if (searchResult && searchResult.length > 0) {
          ytUrl = `https://www.youtube.com/watch?v=${searchResult[0].videoId}`;
        }
      }

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

          const output: any = await youtubedl(ytUrl, ytdlOptions);
          
          const format = output.formats?.filter((f: any) => f.acodec !== 'none' && f.vcodec === 'none')
            .sort((a: any, b: any) => (b.abr || 0) - (a.abr || 0))[0];
            
          if (format && format.url) {
            directUrl = format.url;
            streamCache.set(cacheKey, {
              url: `/api/stream?id=${output.id}`,
              title: title || output.title,
              artist: artist || output.uploader,
              artwork: output.thumbnail,
              directUrl: format.url
            });
          }
        } catch (ytError: any) {
          // Suppress YouTube bot bot-protection errors as they are expected on datacenter IPs
        }
      }
    }
    
    if (directUrl) {
      // Proxy the audio stream to bypass IP restrictions
      const fetchOpts: any = {};
      if (req.headers.range) {
        fetchOpts.headers = { Range: req.headers.range };
      }
      const audioRes = await fetch(directUrl, fetchOpts);
      if (audioRes.ok && audioRes.body) {
        res.status(audioRes.status);
        res.setHeader('Content-Type', audioRes.headers.get('content-type') || 'audio/mp4');
        if (audioRes.headers.has('accept-ranges')) {
          res.setHeader('Accept-Ranges', audioRes.headers.get('accept-ranges')!);
        }
        if (audioRes.headers.has('content-length')) {
          res.setHeader('Content-Length', audioRes.headers.get('content-length')!);
        }
        if (audioRes.headers.has('content-range')) {
          res.setHeader('Content-Range', audioRes.headers.get('content-range')!);
        }
        return audioRes.body.pipe(res);
      }
    }
    
    res.status(404).send('Audio stream not found');
  } catch (e) {
    res.status(500).send('Error fetching audio stream');
  }
});

app.get('/api/search/artists', async (req, res) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const searchResult = await ytmusic.searchArtists(query);
    const artists = searchResult.slice(0, limit).map((a: any) => ({
      id: a.artistId,
      name: a.name,
      image: a.thumbnails?.[a.thumbnails.length - 1]?.url || a.thumbnails?.[0]?.url || ''
    }));
    
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

app.get('/api/search/playlists', async (req, res) => {
  try {
    const query = req.query.q as string;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const searchResult = await ytmusic.searchPlaylists(query);
    const playlists = searchResult.slice(0, limit).map((p: any) => ({
      id: p.playlistId,
      name: p.name,
      creator: p.artist?.name || 'YouTube Music',
      image: p.thumbnails?.[p.thumbnails.length - 1]?.url || p.thumbnails?.[0]?.url || '',
      trackCount: p.videoCount || 0
    }));
    
    res.json(playlists);
  } catch (err: any) {
    console.warn('Playlist search error:', err.message);
    res.json([]);
  }
});

app.get('/api/playlist/tracks', async (req, res) => {
  try {
    const playlistId = req.query.id as string;
    const videos = await ytmusic.getPlaylistVideos(playlistId);
    
    if (videos && videos.length > 0) {
      const tracks = videos.map((song: any) => ({
        id: song.videoId,
        title: song.name,
        artist: song.artists?.map((a: any) => a.name).join(', ') || song.artist?.name || 'Unknown Artist',
        album: song.album?.name || 'Playlist Track',
        artwork: song.thumbnails?.[song.thumbnails.length - 1]?.url || song.thumbnails?.[0]?.url || '',
        duration: song.duration * 1000 || 0,
        url: `/api/stream?id=${song.videoId}&title=${encodeURIComponent(song.name)}&artist=${encodeURIComponent(song.artists?.[0]?.name || song.artist?.name || '')}`
      }));
      return res.json(tracks);
    }
    
    res.json([]);
  } catch (err: any) {
    console.warn('Playlist tracks error:', err.message);
    res.json([]);
  }
});

app.get('/api/search', async (req, res) => {
  const query = req.query.q as string;
  const limit = parseInt(req.query.limit as string) || 15;
  
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
    const filtered = deduplicateTracks(mapped.filter(t => isRelevant(t, query)));
    res.json(filtered);
  } catch (e) { 
    console.error('YTMusic search error:', e);
    res.json([]); 
  }
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
    
    res.json({ name: artistName, image: '' });
  } catch (err: any) {
    console.warn('Artist details error:', err.message);
    res.json({ name: req.query.q, image: '' });
  }
});

app.get('/api/artist/albums', async (req, res) => {
  try {
    const artistName = req.query.q as string;
    
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
    
    res.json([]);
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
    }
    
    res.json([]);
  } catch (err: any) {
    console.warn('Album tracks error:', err.message);
    res.json([]);
  }
});

app.get('/api/artist/radio', async (req, res) => {
  try {
    const artistName = req.query.q as string;
    
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
    
    res.json([]);
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
        let template = await fs.promises.readFile(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
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

  // Global error handler
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
