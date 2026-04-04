import ytStream from 'yt-stream';

async function test() {
  try {
    const videoId = 'rj5wZqReXQE';
    const stream = await ytStream.stream(`https://www.youtube.com/watch?v=${videoId}`);
    console.log('Stream URL:', stream.url);
  } catch (e) {
    console.log('yt-stream error:', e.message);
  }
}
test();
