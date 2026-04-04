import play from 'play-dl';

async function test() {
  try {
    const stream = await play.stream('https://www.youtube.com/watch?v=rj5wZqReXQE');
    console.log('Stream URL:', stream.url);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
