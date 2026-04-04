import ytdl from '@distube/ytdl-core';

async function test() {
  try {
    const info = await ytdl.getInfo('https://music.youtube.com/watch?v=rj5wZqReXQE');
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    console.log('Stream URL:', format.url);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
