import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:3000/api/search?q=Taylor+Swift');
  const data = await res.json();
  console.log('Search Songs:', data.length);
  if (data.length > 0) {
    console.log(data[0]);
  }
}
test();
