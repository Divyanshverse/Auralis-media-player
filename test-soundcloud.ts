import SoundCloud from 'soundcloud-scraper';
import fetch from 'node-fetch';

async function test() {
  try {
    const client = new SoundCloud.Client();
    const query = 'Uprising Muse';
    const searchResult = await client.search(query, 'track');
    const track = searchResult[1];
    const info = await client.getSongInfo(track.url);
    
    // Fetch the stream URL
    const res = await fetch(`${info.trackURL}?client_id=${client.API_KEY}`);
    console.log('Status:', res.status);
    console.log('Headers:', res.headers.raw());
    const text = await res.text();
    console.log('Stream data:', text);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
