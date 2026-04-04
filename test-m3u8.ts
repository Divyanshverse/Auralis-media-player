import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/resolve-track?title=Be%20With%20You&artist=Muse');
    const data = await res.json();
    console.log('Resolved URL:', data.url);
    
    const m3u8Res = await fetch(data.url);
    console.log('m3u8 status:', m3u8Res.status);
    console.log('m3u8 headers:', m3u8Res.headers.raw());
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
