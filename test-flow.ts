import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/search?q=Uprising+Muse');
    const tracks = await res.json();
    console.log('Found tracks:', tracks.length);
    for (const track of tracks.slice(0, 5)) {
      console.log('Track:', track.title, track.artist, track.url);
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
