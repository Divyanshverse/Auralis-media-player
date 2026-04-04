import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('https://pipedapi.tokhmi.xyz/streams/fEiC8H-MiQg');
    const data = await res.json();
    console.log(data.audioStreams?.[0]?.url ? 'Stream URL found' : 'No stream URL');
  } catch (e) {
    console.error(e);
  }
}
test();
