import SaavnAPI from 'saavnapi';

async function test() {
  const saavn: any = (SaavnAPI as any).default || SaavnAPI;
  try {
    const query = 'Muse Uprising';
    const searchResult = await saavn.search.searchSongs({ query, page: 1, limit: 10 });
    console.log('Results:', searchResult.results?.map((s: any) => `${s.title} - ${s.artist}`));
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
