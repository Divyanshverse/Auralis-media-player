import SoundCloud from 'soundcloud-scraper';
import fetch from 'node-fetch';

async function test() {
  const client = new SoundCloud.Client();
  try {
    const search = await client.search('Bad Boy Tungevaag & Raaban', 'track');
    if (search.length > 0) {
      const track = await client.getSongInfo(search[0].url);
      
      const streamUrl = track.streams.progressive || track.streams.hls;
      console.log('Stream URL:', streamUrl);
      
      const res = await fetch(`${streamUrl}?client_id=${client.API_KEY}`);
      console.log('Status:', res.status);
      if (res.ok) {
        const data = await res.json();
        console.log('Response:', data);
      }
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
