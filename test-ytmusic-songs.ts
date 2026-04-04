import YTMusic from 'ytmusic-api';

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  
  const albums = await ytmusic.searchAlbums('Muse');
  console.log('Albums:', albums.length);
  console.log(albums.slice(0, 5).map(a => `${a.name} - ${a.artist.name}`));
}
test();
