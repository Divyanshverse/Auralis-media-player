import YTMusic from 'ytmusic-api';

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  
  try {
    const data = await ytmusic.constructRequest("player", { videoId: 'rj5wZqReXQE' });
    console.log(Object.keys(data));
    console.log('streamingData:', !!data.streamingData);
    if (data.streamingData) {
      console.log('formats:', data.streamingData.formats?.length);
      console.log('adaptiveFormats:', data.streamingData.adaptiveFormats?.length);
      const audioFormat = data.streamingData.adaptiveFormats?.find(f => f.hasAudio && !f.hasVideo);
      console.log('audioFormat:', audioFormat);
    }
  } catch (e) {
    console.log('error:', e.message);
  }
}
test();
