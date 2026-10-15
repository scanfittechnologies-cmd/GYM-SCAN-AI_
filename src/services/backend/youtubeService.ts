/**
 * youtubeService.ts
 *
 * Provides YouTube tutorial suggestions for gym machine exercises.
 *
 * Design principles:
 * - NEVER fabricate video titles, views, or ratings
 * - If YouTube API key is configured: fetch real results from YouTube Data API v3
 * - If no API key: generate a safe search URL that opens YouTube with a relevant query
 * - Always label results clearly as "Suggested YouTube Search" (not claimed verified content)
 *
 * IMPORTANT: We do not claim these videos are endorsed or verified.
 * We only surface what YouTube's own search returns.
 */

export interface YouTubeSuggestion {
  type: 'api_result' | 'search_link';
  /** The YouTube search query used (always present) */
  searchQuery: string;
  /** Direct YouTube search URL (always present as fallback) */
  searchUrl: string;
  /** Set only when type === 'api_result' and API returned a result */
  videoId?: string;
  videoTitle?: string;
  channelName?: string;
  thumbnailUrl?: string;
  videoUrl?: string;
}

const YT_API_KEY = import.meta.env?.VITE_YOUTUBE_API_KEY as string | undefined;
const YT_API_BASE = 'https://www.googleapis.com/youtube/v3';

/**
 * Build an accurate YouTube search query for a machine name.
 * e.g. "Lat Pulldown Machine" → "lat pulldown machine form tutorial gym"
 */
function buildSearchQuery(machineName: string, exerciseName?: string): string {
  const base = exerciseName
    ? `${exerciseName} on ${machineName}`
    : `${machineName} proper form tutorial`;
  return `${base} gym`;
}

/**
 * Build a direct YouTube search URL for the given query.
 */
function buildSearchUrl(query: string): string {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

/**
 * Fetch real YouTube results using the Data API v3.
 * Only called when VITE_YOUTUBE_API_KEY is set.
 */
async function fetchFromYouTubeAPI(
  machineName: string,
  exerciseName?: string
): Promise<YouTubeSuggestion[]> {
  if (!YT_API_KEY) {
    throw new Error('No API key configured');
  }

  const query = buildSearchQuery(machineName, exerciseName);
  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    videoCategoryId: '17', // Sports
    maxResults: '3',
    key: YT_API_KEY,
  });

  const response = await fetch(`${YT_API_BASE}/search?${params}`);
  if (!response.ok) {
    throw new Error(`YouTube API error: ${response.status}`);
  }

  const data = await response.json();

  if (!data.items || data.items.length === 0) {
    return [];
  }

  return data.items.map((item: any): YouTubeSuggestion => ({
    type: 'api_result',
    searchQuery: query,
    searchUrl: buildSearchUrl(query),
    videoId: item.id?.videoId,
    videoTitle: item.snippet?.title,
    channelName: item.snippet?.channelTitle,
    thumbnailUrl: item.snippet?.thumbnails?.medium?.url,
    videoUrl: item.id?.videoId
      ? `https://www.youtube.com/watch?v=${item.id.videoId}`
      : undefined,
  }));
}

/**
 * Main entry point.
 *
 * Returns up to 3 tutorial suggestions for a given machine.
 * When no API key is configured, returns a single search-link suggestion.
 */
export async function getYouTubeTutorials(
  machineName: string,
  exerciseName?: string
): Promise<YouTubeSuggestion[]> {
  const query = buildSearchQuery(machineName, exerciseName);
  const fallback: YouTubeSuggestion = {
    type: 'search_link',
    searchQuery: query,
    searchUrl: buildSearchUrl(query),
  };

  // Try the API if configured
  if (YT_API_KEY) {
    try {
      const results = await fetchFromYouTubeAPI(machineName, exerciseName);
      if (results.length > 0) {
        return results;
      }
    } catch (err) {
      // API failed — fall through to search link fallback
      console.warn('[youtubeService] YouTube API call failed, using search fallback:', err);
    }
  }

  // Always return the safe fallback
  return [fallback];
}

/**
 * Generate a list of pre-built search queries for a machine's common exercises.
 * Used to render multiple "suggested search" buttons without any API call.
 */
export function getPrebuiltSearchLinks(
  machineName: string
): Array<{ label: string; url: string }> {
  const base = machineName.trim();
  return [
    {
      label: `How to use ${base}`,
      url: buildSearchUrl(`how to use ${base} properly gym`),
    },
    {
      label: `${base} form tips`,
      url: buildSearchUrl(`${base} proper form tutorial`),
    },
    {
      label: `${base} beginner guide`,
      url: buildSearchUrl(`${base} beginner guide workout`),
    },
  ];
}
