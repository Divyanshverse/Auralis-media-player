import fetch from 'node-fetch';

async function test() {
  try {
    const query = 'Uprising Muse';
    const appName = 'my_random_app_name_' + Math.floor(Math.random() * 100000);
    const response = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=${appName}`);
    if (response.ok) {
      const data = await response.json();
      console.log('Results:', data.data?.map((t: any) => `${t.title} - ${t.user?.name}`));
    }
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
