/**
 * Free Internet Search Service using DuckDuckGo
 * Runs on the client side in the background (or calls proxy endpoint)
 * Requires no API keys.
 */

export interface DuckDuckGoResult {
  title: string;
  snippet: string;
  uri: string;
}

/**
 * Searches DuckDuckGo for spiritual references, prayer times, verses, or facts.
 */
export async function searchDuckDuckGo(query: string, maxResults = 4): Promise<DuckDuckGoResult[]> {
  if (!query || !query.trim()) return [];

  const cleanQuery = query.trim().slice(0, 150);

  // 1. Try local server-side proxy endpoint
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    const res = await fetch(`/api/search/duckduckgo?q=${encodeURIComponent(cleanQuery)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.results) && data.results.length > 0) {
        return data.results.slice(0, maxResults);
      }
    }
  } catch {}

  // 2. Direct client-side DuckDuckGo Instant Answer API fallback
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const results: DuckDuckGoResult[] = [];

      if (data.AbstractText && data.AbstractURL) {
        results.push({
          title: data.Heading || cleanQuery,
          snippet: data.AbstractText,
          uri: data.AbstractURL,
        });
      }

      if (Array.isArray(data.RelatedTopics)) {
        for (const topic of data.RelatedTopics) {
          if (topic.Text && topic.FirstURL) {
            results.push({
              title: topic.Text.slice(0, 60),
              snippet: topic.Text,
              uri: topic.FirstURL,
            });
            if (results.length >= maxResults) break;
          }
        }
      }

      if (results.length > 0) {
        return results;
      }
    }
  } catch {}

  return [];
}
