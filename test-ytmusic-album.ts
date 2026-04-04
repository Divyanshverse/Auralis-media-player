import YTMusic from 'ytmusic-api';

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  
  try {
    const album = await ytmusic.getAlbum('MPREb_QDFoAM3wIcj');
    console.log('Album:', album.name);
    console.log('Songs:', album.songs.length);
    console.log(album.songs.slice(0, 2).map(s => `${s.name} - ${s.videoId}`));
  } catch (e) {
    console.error(e);
  }
}
test();
