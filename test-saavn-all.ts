import SaavnAPI from 'saavnapi';

async function test() {
  const saavn: any = (SaavnAPI as any).default || SaavnAPI;
  try {
    const query = 'Uprising Muse';
    const searchResult = await saavn.search.searchAll({ query });
    console.log('Search All Results:', JSON.stringify(searchResult, null, 2).substring(0, 500));
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
