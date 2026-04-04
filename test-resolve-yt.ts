import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/resolve-track?id=JjJOlPQ2bo0&title=Test&artist=Test');
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Resolved:', data);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
