import youtubedl from 'youtube-dl-exec';

async function test() {
  try {
    const output = await youtubedl('https://www.youtube.com/watch?v=rj5wZqReXQE', {
      dumpJson: true,
      noWarnings: true,
      noCallHome: true,
      noCheckCertificate: true,
      preferFreeFormats: true,
      youtubeSkipDashManifest: true,
    });
    console.log('Stream URL:', output.url);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
