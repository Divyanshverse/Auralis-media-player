import SaavnAPI from 'saavnapi';

async function test() {
  const saavn: any = (SaavnAPI as any).default || SaavnAPI;
  try {
    let searchResult = await saavn.search.searchArtists({ query: 'Muse', page: 1, limit: 5 });
    const muse = searchResult.results?.find((a: any) => a.name === 'Muse');
    if (muse) {
      console.log('Found Muse:', muse.id);
      const songs = await saavn.artists.getArtistSongs({ artistId: muse.id, page: 1 });
      console.log('Songs:', songs.songs?.map((s: any) => s.name));
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
