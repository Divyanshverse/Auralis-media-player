import YTMusic from 'ytmusic-api';

async function test() {
  const ytmusic = new YTMusic();
  await ytmusic.initialize();
  
  try {
    const songInfo = await ytmusic.getSong('rj5wZqReXQE');
    console.log('Song info:', songInfo);
  } catch (e) {
    console.log('getSong error:', e.message);
  }
}
test();
