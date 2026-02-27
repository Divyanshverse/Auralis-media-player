import { Track } from "../types";

const SAAVN_API = "https://jiosaavn-api-privatecvc2.vercel.app";

let currentAbortController: AbortController | null = null;

export const searchTracks = async (
  query: string,
  limit = 15,
): Promise<Track[]> => {
  if (!query.trim()) return [];
  
  if (currentAbortController) {
    currentAbortController.abort();
  }
  currentAbortController = new AbortController();
  
  try {
    const response = await fetch(
      `${SAAVN_API}/search/songs?query=${encodeURIComponent(query)}&limit=${limit}`,
      { signal: currentAbortController.signal }
    );
    if (!response.ok) throw new Error("Failed to fetch");
    const json = await response.json();

    if (!json.data || !json.data.results) return [];

    return json.data.results
      .map((item: any) => {
        const highestQualityImage =
          item.image && item.image.length > 0
            ? item.image[item.image.length - 1].link
            : "";
        const highestQualityAudio =
          item.downloadUrl && item.downloadUrl.length > 0
            ? item.downloadUrl[item.downloadUrl.length - 1].link
            : "";

        return {
          id: item.id.toString(),
          title: item.name.replace(/&quot;/g, '"').replace(/&amp;/g, "&"),
          artist: item.primaryArtists || "Unknown Artist",
          album:
            item.album?.name?.replace(/&quot;/g, '"').replace(/&amp;/g, "&") ||
            "Single",
          duration: parseInt(item.duration) * 1000,
          artwork: highestQualityImage,
          url: highestQualityAudio,
        };
      })
      .filter((track: Track) => track.url);
  } catch (error: any) {
    if (error.name === 'AbortError' || error.message?.includes('aborted')) {
      return [];
    }
    console.error("Search error:", error);
    return [];
  }
};

export const getRecommendations = async (): Promise<Track[]> => {
  const terms = ["top hits", "trending", "lofi", "bollywood", "pop", "chill"];
  const randomTerm = terms[Math.floor(Math.random() * terms.length)];
  return searchTracks(randomTerm, 12);
};
