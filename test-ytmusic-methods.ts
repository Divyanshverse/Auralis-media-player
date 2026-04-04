import YTMusic from 'ytmusic-api';

async function test() {
  const ytmusic = new YTMusic();
  console.log(Object.getOwnPropertyNames(Object.getPrototypeOf(ytmusic)));
}
test();
