import SaavnAPI from 'saavnapi';

const saavn: any = (SaavnAPI as any).default || SaavnAPI;

async function test() {
  try {
    const searchResult = await saavn.search.searchSongs({ query: 'Be With You Muse', page: 1, limit: 5 });
    console.log('Saavn results:', searchResult.results?.map(s => `${s.name} by ${s.artists?.primary?.map(a => a.name).join(', ')}`));
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
