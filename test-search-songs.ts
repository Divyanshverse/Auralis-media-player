import SaavnAPI from 'saavnapi';

const saavn = (SaavnAPI as any).default || SaavnAPI;

async function test() {
  const searchSongsResult = await saavn.search.searchSongs({ query: 'Taylor Swift', page: 1, limit: 10 });
  console.log(JSON.stringify(searchSongsResult.results?.slice(0, 2), null, 2));
}
test();
