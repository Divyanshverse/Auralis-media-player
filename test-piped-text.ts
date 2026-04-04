import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('https://pipedapi.kavin.rocks/streams/fEiC8H-MiQg');
    const text = await res.text();
    console.log(text.substring(0, 200));
  } catch (e) {
    console.error(e);
  }
}
test();
