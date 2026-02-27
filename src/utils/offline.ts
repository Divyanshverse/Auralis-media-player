import localforage from 'localforage';
import { Track } from '../types';

export const saveTrackOffline = async (track: Track): Promise<boolean> => {
  try {
    const response = await fetch(track.url);
    if (!response.ok) throw new Error('Failed to fetch audio');
    const blob = await response.blob();
    await localforage.setItem(`track-${track.id}`, blob);
    
    if (track.artwork) {
      const artResponse = await fetch(track.artwork);
      if (artResponse.ok) {
        const artBlob = await artResponse.blob();
        await localforage.setItem(`art-${track.id}`, artBlob);
      }
    }
    return true;
  } catch (error) {
    console.error('Failed to save track offline', error);
    return false;
  }
};

export const removeTrackOffline = async (trackId: string): Promise<void> => {
  await localforage.removeItem(`track-${trackId}`);
  await localforage.removeItem(`art-${trackId}`);
};

export const getOfflineTrackUrl = async (trackId: string): Promise<string | null> => {
  try {
    const blob = await localforage.getItem<Blob>(`track-${trackId}`);
    if (blob) {
      return URL.createObjectURL(blob);
    }
  } catch (error) {
    console.error('Failed to get offline track', error);
  }
  return null;
};

export const getOfflineArtworkUrl = async (trackId: string): Promise<string | null> => {
  try {
    const blob = await localforage.getItem<Blob>(`art-${trackId}`);
    if (blob) {
      return URL.createObjectURL(blob);
    }
  } catch (error) {
    console.error('Failed to get offline artwork', error);
  }
  return null;
};
