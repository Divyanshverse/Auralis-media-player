import youtubedl from 'youtube-dl-exec';

async function test() {
  try {
    const output = await youtubedl('https://www.youtube.com/watch?v=Y4R6k8_iIkE', {
      dumpJson: true,
      noWarnings: true,
      preferFreeFormats: true,
      extractorArgs: 'youtube:player_client=android'
    });
    console.log('Success', output.title);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
