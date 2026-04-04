import play from 'play-dl';

async function test() {
  try {
    await play.getFreeClientID().then((clientID) => play.setToken({
      soundcloud : {
          client_id : clientID
      }
    }));
    const search = await play.search('Be With You Muse', { source: { soundcloud: 'tracks' }, limit: 5 });
    console.log('SC results:');
    search.forEach(t => console.log(`- ${t.name} by ${t.user?.name}`));
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
