import SaavnAPI from 'saavnapi';

async function test() {
  const saavn: any = (SaavnAPI as any).default || SaavnAPI;
  try {
    const searchResult = await saavn.search.searchSongs({ query: 'Bad Boy Tungevaag', page: 1, limit: 10 });
    console.log('Saavn Results:');
    searchResult.results?.forEach((s: any) => {
      console.log(`- ${s.name} by ${s.artists?.primary?.map((a:any)=>a.name).join(', ')}`);
    });
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
