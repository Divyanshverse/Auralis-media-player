import play from 'play-dl';

async function test() {
  try {
    await play.getFreeClientID().then((clientID) => play.setToken({
      soundcloud : {
          client_id : clientID
      }
    }));
    const search = await play.search('Bad Boy Tungevaag & Raaban', { source: { soundcloud: 'tracks' }, limit: 1 });
    if (search.length > 0) {
      console.log('Track:', search[0].name);
      const stream = await play.stream(search[0].url);
      console.log('Stream type:', stream.type);
      console.log('Stream URL:', stream.url);
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
