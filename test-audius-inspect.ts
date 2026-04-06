async function test() {
  try {
    const query = 'Be With You Muse';
    const appName = 'react_music_player';
    const response = await fetch(`https://discoveryprovider.audius.co/v1/tracks/search?query=${encodeURIComponent(query)}&app_name=${appName}`);
    const data = await response.json();
    const track = data.data?.[0];
    console.log('Track:', track.title);
    console.log('Stream URL:', `https://discoveryprovider.audius.co/v1/tracks/${track.id}/stream?app_name=${appName}`);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
