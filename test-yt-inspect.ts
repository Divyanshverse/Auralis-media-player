import youtubedl from 'youtube-dl-exec';

async function test() {
  try {
    const ytUrl = 'https://www.youtube.com/watch?v=JjJOlPQ2bo0'; // Muse - Be With You
    const output = await youtubedl(ytUrl, {
      dumpJson: true,
      noWarnings: true,
      preferFreeFormats: true,
    });
    
    console.log('Title:', output.title);
    const format = output.formats?.filter(f => f.acodec !== 'none' && f.vcodec === 'none')
      .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];
    console.log('Format URL:', format?.url);
  } catch (e) {
    console.log('Error:', e.message);
  }
}
test();
