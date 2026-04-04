import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/resolve-track?title=Be%20With%20You&artist=Muse');
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Resolved:', data);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
