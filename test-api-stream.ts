import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:3000/api/stream?title=Uprising&artist=Muse', { redirect: 'manual' });
  console.log('Status:', res.status);
  console.log('Location:', res.headers.get('location'));
}
test();
