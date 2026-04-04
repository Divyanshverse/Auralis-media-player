import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/stream?id=Y4R6k8_iIkE&title=Uprising&artist=Muse', { redirect: 'manual' });
    console.log('Status:', res.status);
    console.log('Location:', res.headers.get('location'));
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
