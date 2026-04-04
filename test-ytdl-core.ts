import ytdl from '@distube/ytdl-core';

async function test() {
  try {
    const info = await ytdl.getInfo('https://www.youtube.com/watch?v=Y4R6k8_iIkE');
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    console.log('Stream URL:', format.url);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
