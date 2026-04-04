import YTMusic from 'ytmusic-api';

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  
  try {
    const songs = await ytmusic.searchSongs('Uprising Muse');
    console.log('Songs:', songs.length);
    if (songs.length) {
      console.log('Video ID:', songs[0].videoId);
      const song = await ytmusic.getSong(songs[0].videoId);
      console.log('Song Keys:', Object.keys(song));
      console.log(song);
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
