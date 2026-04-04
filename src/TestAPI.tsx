import { useEffect } from 'react';

export default function TestAPI() {
  useEffect(() => {
    fetch('https://jiosaavn-api-privatecvc2.vercel.app/search/playlists?query=lofi')
      .then(res => res.json())
      .then(console.log)
      .catch(console.error);
  }, []);
  return null;
}
