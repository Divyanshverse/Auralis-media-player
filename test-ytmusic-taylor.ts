import YTMusic from 'ytmusic-api';

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  
  const songs = await ytmusic.searchSongs('Taylor Swift');
  console.log('Songs:', songs.length);
  console.log(songs.slice(0, 5).map(s => `${s.name} - ${s.artist.name}`));
}
test();
