import ytdl from '@distube/ytdl-core';

async function test() {
  try {
    const info = await ytdl.getInfo('JjJOlPQ2bo0');
    const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' });
    console.log('URL:', format.url);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
