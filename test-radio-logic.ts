import SaavnAPI from 'saavnapi';

const saavn = (SaavnAPI as any).default || SaavnAPI;

const formatSaavnTrack = (song: any) => {
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

const isRelevant = (track: any, query: string) => {
  const q = query.toLowerCase();
  const title = track.title.toLowerCase();
  const artist = track.artist.toLowerCase();
  return title.includes(q) || artist.includes(q);
};

async function test() {
  const artistName = 'Taylor Swift';
  let searchResult = await saavn.search.searchArtists({ query: artistName, page: 1, limit: 1 });
  let artistId = searchResult.results?.[0]?.id;
  
  const pages = [1, 2, 3, 4, 5];
  const songsPromises = pages.map(p => saavn.artists.getArtistSongs({ artistId, page: p }).catch(() => ({ songs: [] })));
  const songsResults = await Promise.all(songsPromises);
  
  let allSongs = songsResults.flatMap(r => r.songs || []);
  console.log('getArtistSongs returned', allSongs.length);
  
  if (allSongs.length === 0) {
      console.log('Falling back to searchSongs for', artistName);
      const searchSongsResult = await saavn.search.searchSongs({ query: artistName, page: 1, limit: 50 });
      allSongs = searchSongsResult.results || [];
      console.log('searchSongs found', allSongs.length, 'songs');
  }
  
  const tracks = allSongs.map(formatSaavnTrack).filter(t => isRelevant(t, artistName));
  console.log('After relevance filter:', tracks.length);
}
test();
