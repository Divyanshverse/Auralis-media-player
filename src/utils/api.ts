import { Track } from "../types";

export interface Album {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  year?: string;
}

export const searchTracks = async (
  query: string,
  limit = 15,
  signal?: AbortSignal
): Promise<Track[]> => {
  if (!query.trim()) return [];
  
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=${limit}`, { signal });
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message === 'Aborted') {
      return [];
    }
    console.error("Search error:", error);
    return [];
  }
};

export const searchAlbums = async (
  query: string,
  limit = 10,
  signal?: AbortSignal
): Promise<Album[]> => {
  if (!query.trim()) return [];
  
  try {
    const response = await fetch(`/api/artist/albums?q=${encodeURIComponent(query)}&limit=${limit}`, { signal });
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message === 'Aborted') {
      return [];
    }
    console.error("Search albums error:", error);
    return [];
  }
};

export const searchArtists = async (
  query: string,
  limit = 10,
  signal?: AbortSignal
): Promise<any[]> => {
  if (!query.trim()) return [];
  
  try {
    const response = await fetch(`/api/search/artists?q=${encodeURIComponent(query)}&limit=${limit}`, { signal });
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message === 'Aborted') {
      return [];
    }
    console.error("Search artists error:", error);
    return [];
  }
};

export const getAlbumTracks = async (albumId: string): Promise<Track[]> => {
  try {
    const response = await fetch(`/api/album/tracks?id=${encodeURIComponent(albumId)}`);
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error: any) {
    console.error("Get album tracks error:", error);
    return [];
  }
};

export const getRecommendations = async (): Promise<Track[]> => {
  const terms = ["top hits", "trending", "lofi", "bollywood", "pop", "chill", "punjabi", "hip hop"];
  const randomTerm = terms[Math.floor(Math.random() * terms.length)];
  return searchTracks(randomTerm, 24);
};

export const getRecommendationsForArtists = async (artists: {name: string}[]): Promise<Track[]> => {
  if (!artists || artists.length === 0) {
    return getRecommendations();
  }
  
  // Pick up to 3 random artists to search for
  const shuffled = [...artists].sort(() => 0.5 - Math.random()).slice(0, 3);
  const query = shuffled.map(a => a.name).join(" ");
  
  return searchTracks(query, 24);
};

export const getPopularArtistsDynamic = async (count: number = 6): Promise<any[]> => {
  const popularArtistNames = [
    "Arijit Singh", "Taylor Swift", "The Weeknd", "Diljit Dosanjh", "Shreya Ghoshal", 
    "Karan Aujla", "Sidhu Moose Wala", "AP Dhillon", "Ed Sheeran", "Drake", 
    "Badshah", "Neha Kakkar", "Justin Bieber", "Billie Eilish", "Dua Lipa", 
    "Atif Aslam", "Sonu Nigam", "Kishore Kumar", "Lata Mangeshkar", "Eminem", 
    "Post Malone", "A.R. Rahman", "Anirudh Ravichander", "Sid Sriram", "Darshan Raval", 
    "Armaan Malik", "Bruno Mars", "Ariana Grande", "Rihanna", "Coldplay",
    "Imagine Dragons", "Maroon 5", "Shawn Mendes", "Charlie Puth", "Zayn",
    "Harry Styles", "Selena Gomez", "Miley Cyrus", "Katy Perry", "Lady Gaga"
  ];
  
  // Shuffle and pick random artists
  const shuffled = popularArtistNames.sort(() => 0.5 - Math.random()).slice(0, count);
  
  try {
    const artists = await Promise.all(shuffled.map(async (name) => {
      const res = await searchArtists(name, 1);
      return res[0];
    }));
    return artists.filter(Boolean);
  } catch (error) {
    console.error("Failed to fetch dynamic artists:", error);
    return [];
  }
};

export const getLyrics = async (trackId: string, artist?: string, title?: string): Promise<string | null> => {
  if (!artist || !title) return null;
  try {
    const response = await fetch(`/api/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`);
    const json = await response.json();
    return json.lyrics || null;
  } catch (error) {
    console.error("Get lyrics error:", error);
    return null;
  }
};

export const getArtistDetails = async (artistName: string) => {
  try {
    const res = await fetch(`/api/artist/details?q=${encodeURIComponent(artistName)}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching artist details:', error);
    return null;
  }
};

export const getArtistAlbums = async (artistName: string): Promise<Album[]> => {
  try {
    const res = await fetch(`/api/artist/albums?q=${encodeURIComponent(artistName)}`);
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    console.error('Error fetching artist albums:', error);
    return [];
  }
};

export const getArtistRadio = async (artistName: string): Promise<Track[]> => {
  try {
    const response = await fetch(`/api/artist/radio?q=${encodeURIComponent(artistName)}`);
    if (!response.ok) throw new Error('Failed to fetch');
    return await response.json();
  } catch (error) {
    console.error("Get artist radio error:", error);
    return [];
  }
};
