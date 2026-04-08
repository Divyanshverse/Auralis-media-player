export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  artwork: string;
  url: string;
  fullUrl?: string;
  previewUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: number;
}
