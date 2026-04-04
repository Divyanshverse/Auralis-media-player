import fetch from 'node-fetch';

async function test() {
  try {
    const videoId = 'rj5wZqReXQE';
    const res = await fetch(`https://api.vevioz.com/api/button/mp3/${videoId}`);
    console.log('Status:', res.status);
    const text = await res.text();
    console.log(text.substring(0, 200));
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
