import play from 'play-dl';

async function test() {
  try {
    await play.getFreeClientID().then((clientID) => play.setToken({
      soundcloud : {
          client_id : clientID
      }
    }));
    const search = await play.search('Be With You Muse', { source: { soundcloud: 'tracks' }, limit: 1 });
    const track = search[0];
    console.log('Track:', track.name);
    console.log('URL:', track.url);
    
    // Check if it's a preview
    const stream = await play.stream(track.url);
    console.log('Stream URL:', stream.url);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
