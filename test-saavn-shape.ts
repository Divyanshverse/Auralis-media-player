import SaavnAPI from 'saavnapi';

const saavn: any = (SaavnAPI as any).default || SaavnAPI;

async function test() {
  try {
    const searchResult = await saavn.search.searchSongs({ query: 'Shape of You Ed Sheeran', page: 1, limit: 1 });
    const song = searchResult.results?.[0];
    console.log('Song:', song.name);
    console.log('Download URLs:', JSON.stringify(song.downloadUrl, null, 2));
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
