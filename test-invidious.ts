import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('https://api.invidious.io/instances.json');
    const instances = await res.json();
    const activeInstances = instances.filter((i: any) => i[1].type === 'https').map((i: any) => i[1].uri);
    
    console.log('Found', activeInstances.length, 'instances');
    
    const videoId = 'JjJOlPQ2bo0';
    
    for (const instance of activeInstances.slice(0, 10)) {
      try {
        const res = await fetch(`${instance}/api/v1/videos/${videoId}`);
        if (res.ok) {
          const data = await res.json();
          const audioStream = data.adaptiveFormats?.filter((f: any) => f.type.startsWith('audio')).sort((a: any, b: any) => parseInt(b.bitrate) - parseInt(a.bitrate))[0];
          if (audioStream) {
            console.log(`${instance}: SUCCESS -> ${audioStream.url.substring(0, 50)}...`);
            return;
          }
        } else {
          console.log(`${instance}: Status ${res.status}`);
        }
      } catch (e) {
        console.log(`${instance}: Error - ${e.message}`);
      }
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
