import fetch from 'node-fetch';

async function test() {
  try {
    const query = 'Uprising';
    const appName = 'my_random_app_name_' + Math.floor(Math.random() * 100000);
    const response = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=${appName}`);
    console.log('Status:', response.status);
    if (response.ok) {
      const data = await response.json();
      console.log('Results:', data.data?.length);
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
