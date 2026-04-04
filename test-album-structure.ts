import SaavnAPI from 'saavnapi';
const saavn = (SaavnAPI as any).default || SaavnAPI;

async function test() {
  try {
    const searchResult = await saavn.search.searchArtists({ query: 'Arijit Singh', page: 1, limit: 1 });
    const artistId = searchResult.results?.[0]?.id;
    
    if (artistId) {
      const artistAlbums = await saavn.artists.getArtistAlbums({ artistId, page: 1 });
      console.log('Sample album:', JSON.stringify(artistAlbums.albums?.[0], null, 2));
    }
  } catch (e: any) {
    console.error(e);
  }
}
test();
