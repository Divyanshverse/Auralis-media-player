import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/search?q=Bad+Boy+Tungevaag+%26+Raaban');
    const tracks = await res.json();
    console.log('Found tracks:', tracks.length);
    if (tracks.length > 0) {
      const track = tracks[0];
      console.log('First track:', track.title, track.artist, track.url);
      
      const resolveUrl = `http://localhost:3000/api/resolve-track?id=${track.id}&title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}&url=${encodeURIComponent(track.url)}`;
      console.log('Resolving:', resolveUrl);
      const resolveRes = await fetch(resolveUrl);
      const resolved = await resolveRes.json();
      console.log('Resolved:', resolved);
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
