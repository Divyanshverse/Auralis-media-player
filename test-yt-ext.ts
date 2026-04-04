import yt from 'youtube-ext';

async function test() {
  try {
    const info = await yt.videoInfo('rj5wZqReXQE');
    console.log(info);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
