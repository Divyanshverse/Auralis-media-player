import play from 'play-dl';

async function test() {
  try {
    const stream = await play.stream('https://www.youtube.com/watch?v=Y4R6k8_iIkE');
    console.log('Success', stream.url);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
