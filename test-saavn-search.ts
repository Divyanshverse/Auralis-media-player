import SaavnAPI from 'saavnapi';

async function test() {
  const saavn: any = (SaavnAPI as any).default || SaavnAPI;
  try {
    const searchResult = await saavn.search.searchSongs({ query: 'Uprising', page: 1, limit: 10 });
    console.log('Results:', searchResult.results?.map((s: any) => `${s.name} - ${s.artists?.primary?.map((a:any)=>a.name).join(', ')}`));
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
