import SaavnAPI from 'saavnapi';

const saavn: any = (SaavnAPI as any).default || SaavnAPI;

async function test() {
  try {
    const artistId = "565990";
    console.log('Testing getArtistAlbums...');
    const albumsResult = await saavn.artists.getArtistAlbums({ artistId, page: 1 });
    console.log('Albums Result:', JSON.stringify(albumsResult, null, 2));
    
    console.log('Testing getArtistSongs...');
    const songsResult = await saavn.artists.getArtistSongs({ artistId, page: 1 });
    console.log('Songs Result:', JSON.stringify(songsResult, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
