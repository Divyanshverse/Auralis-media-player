import SaavnAPI from 'saavnapi';

const saavn: any = (SaavnAPI as any).default || SaavnAPI;

async function test() {
  try {
    console.log('Testing searchSongs...');
    const result = await saavn.search.searchSongs({ query: 'Arijit Singh', page: 1, limit: 1 });
    console.log('Result keys:', Object.keys(result));
    console.log('Result status:', result.status);
    console.log('Result data keys:', result.data ? Object.keys(result.data) : 'no data');
    if (result.data && result.data.results) {
      console.log('First result:', JSON.stringify(result.data.results[0], null, 2));
    } else if (result.results) {
      console.log('First result (direct):', JSON.stringify(result.results[0], null, 2));
    } else {
      console.log('Full result:', JSON.stringify(result, null, 2));
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
