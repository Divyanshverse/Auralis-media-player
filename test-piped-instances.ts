import fetch from 'node-fetch';

async function test() {
  const instances = [
    'https://pipedapi.kavin.rocks',
    'https://pipedapi.syncpundit.io',
    'https://api.piped.projectsegfau.lt',
    'https://piped-api.garudalinux.org',
    'https://pipedapi.lunar.icu'
  ];
  
  const videoId = 'rj5wZqReXQE';
  
  for (const instance of instances) {
    try {
      const res = await fetch(`${instance}/streams/${videoId}`);
      if (res.ok) {
        const data = await res.json();
        const audioStream = data.audioStreams?.sort((a: any, b: any) => b.bitrate - a.bitrate)[0];
        console.log(`${instance}: SUCCESS -> ${audioStream?.url?.substring(0, 50)}...`);
      } else {
        console.log(`${instance}: FAILED -> ${res.status}`);
      }
    } catch (e) {
      console.log(`${instance}: ERROR -> ${e.message}`);
    }
  }
}
test();
