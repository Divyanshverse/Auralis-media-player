import fetch from 'node-fetch';

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/resolve-track?id=dummy&title=Shape%20of%20you&artist=Ed%20Sheeran');
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Resolved:', data);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
