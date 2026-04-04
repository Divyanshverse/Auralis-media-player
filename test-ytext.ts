import { videoInfo } from 'youtube-ext';

async function test() {
  try {
    const info = await videoInfo('https://www.youtube.com/watch?v=Y4R6k8_iIkE');
    console.log('Success', info.title);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
