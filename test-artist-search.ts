import SaavnAPI from 'saavnapi';

const saavn: any = (SaavnAPI as any).default || SaavnAPI;

async function test() {
  try {
    console.log('Testing searchArtists for Taylor Swift...');
    const searchResult = await saavn.search.searchArtists({ query: 'Taylor Swift', page: 1, limit: 1 });
    console.log('Result:', JSON.stringify(searchResult, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
