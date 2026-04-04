import fetch from 'node-fetch';

async function test() {
  const instances = [
    'https://pipedapi.kavin.rocks',
    'https://pipedapi.tokhmi.xyz',
    'https://pipedapi.syncpundit.io',
    'https://api.piped.projectsegfau.lt',
    'https://piped-api.garudalinux.org',
    'https://pipedapi.smnz.de'
  ];
  const videoId = 'JjJOlPQ2bo0';
  
  for (const instance of instances) {
    try {
      const res = await fetch(`${instance}/streams/${videoId}`);
      console.log(`${instance}: Status ${res.status}`);
      if (res.ok) {
        const data = await res.json();
        const audioStream = data.audioStreams?.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];
        if (audioStream) {
          console.log(`${instance}: SUCCESS -> ${audioStream.url.substring(0, 50)}...`);
          return;
        }
      }
    } catch (e) {
      console.log(`${instance}: Error - ${e.message}`);
    }
  }
}
test();
