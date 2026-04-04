import SaavnAPI from 'saavnapi';

const saavn: any = (SaavnAPI as any).default || SaavnAPI;

async function test() {
  try {
    console.log('Testing searchAll...');
    const result = await saavn.search.searchAll({ query: 'Arijit Singh' });
    console.log('Result keys:', Object.keys(result));
    if (result.albums) {
      console.log('Albums keys:', Object.keys(result.albums));
      if (result.albums.results) {
        console.log('First album:', JSON.stringify(result.albums.results[0], null, 2));
      }
    }
    if (result.artists) {
      console.log('Artists keys:', Object.keys(result.artists));
      if (result.artists.results) {
        console.log('First artist:', JSON.stringify(result.artists.results[0], null, 2));
      }
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
