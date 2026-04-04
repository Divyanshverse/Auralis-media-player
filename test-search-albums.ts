import SaavnAPI from 'saavnapi';

const saavn: any = (SaavnAPI as any).default || SaavnAPI;

async function test() {
  try {
    console.log('Testing searchAlbums for Taylor Swift...');
    const result = await saavn.search.searchAlbums({ query: 'Taylor Swift', page: 1, limit: 10 });
    console.log('Albums Result:', JSON.stringify(result, null, 2));
    
    console.log('Testing searchSongs for Taylor Swift...');
    const songsResult = await saavn.search.searchSongs({ query: 'Taylor Swift', page: 1, limit: 10 });
    console.log('Songs Result:', JSON.stringify(songsResult, null, 2));
  } catch (error) {
    console.error('Test failed:', error);
  }
}

test();
