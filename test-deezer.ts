import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('https://api.deezer.com/search?q=uprising+muse');
    const data = await res.json();
    console.log(JSON.stringify(data).substring(0, 200));
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
