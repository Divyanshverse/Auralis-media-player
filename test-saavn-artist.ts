import SaavnAPI from 'saavnapi';

const saavn = (SaavnAPI as any).default || SaavnAPI;

async function test() {
  const artistName = 'Taylor Swift';
  let searchResult = await saavn.search.searchArtists({ query: artistName, page: 1, limit: 1 });
  let artistId = searchResult.results?.[0]?.id;
  console.log('Artist ID:', artistId);

  const searchSongs = await saavn.search.searchSongs({ query: artistName, page: 1, limit: 10 });
  console.log('Search Songs:', searchSongs.results?.length || 0);

  const searchAlbums = await saavn.search.searchAlbums({ query: artistName, page: 1, limit: 10 });
  console.log('Search Albums:', searchAlbums.results?.length || 0);
}
test();
