import YTMusic from 'ytmusic-api';

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  
  try {
    const songs = await ytmusic.searchSongs('Uprising Muse');
    console.log('Songs:', songs.length);
    for (const song of songs.slice(0, 3)) {
      console.log(song.name, song.artist?.name, song.videoId);
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
