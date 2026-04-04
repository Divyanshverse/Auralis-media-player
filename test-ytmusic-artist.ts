import YTMusic from 'ytmusic-api';

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  
  const artist = await ytmusic.searchArtists('Muse');
  console.log('Artist:', artist[0]);
  
  if (artist[0]) {
    const artistDetails = await ytmusic.getArtist(artist[0].artistId);
    console.log('Keys:', Object.keys(artistDetails));
    console.log('Top Albums:', artistDetails.topAlbums?.length);
    console.log('Top Albums data:', JSON.stringify(artistDetails.topAlbums?.slice(0, 2), null, 2));
    console.log('Top Songs data:', JSON.stringify(artistDetails.topSongs?.slice(0, 2), null, 2));
  }
}
test();
