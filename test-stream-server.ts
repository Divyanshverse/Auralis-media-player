import express from 'express';
import SaavnAPI from 'saavnapi';

const saavn = (SaavnAPI as any).default || SaavnAPI;
const app = express();

app.get('/api/stream', async (req, res) => {
  const title = req.query.title as string;
  const artist = req.query.artist as string;
  
  try {
    const query = `${title} ${artist}`;
    const searchResult = await saavn.search.searchSongs({ query, page: 1, limit: 1 });
    const song = searchResult.results?.[0];
    
    if (song) {
      const downloadUrl = song.downloadUrl?.[song.downloadUrl.length - 1]?.url || song.downloadUrl?.[0]?.url;
      if (downloadUrl) {
        return res.redirect(downloadUrl);
      }
    }
    res.status(404).send('Not found');
  } catch (e) {
    res.status(500).send('Error');
  }
});

app.listen(3001, () => console.log('Test server running on 3001'));
