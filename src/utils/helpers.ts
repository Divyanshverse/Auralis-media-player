import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(ms: number) {
  if (!ms) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export async function downloadToDevice(track: { title: string; url: string }) {
  try {
    // Use the proxy endpoint to handle CORS and filename
    const downloadUrl = `/api/download?url=${encodeURIComponent(track.url)}&filename=${encodeURIComponent(track.title + '.m4a')}`;
    
    const a = document.createElement('a');
    a.href = downloadUrl;
    // The server sets Content-Disposition, so this is just a fallback/hint
    a.download = `${track.title}.m4a`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
}
