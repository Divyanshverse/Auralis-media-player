import youtubedl from 'youtube-dl-exec';

async function test() {
  try {
    const output = await youtubedl('--version');
    console.log('Version:', output);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
