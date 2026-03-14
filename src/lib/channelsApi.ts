import {scrapeChannels} from './scraper';
import {
  Channel,
  Category,
  StreamOption,
  channels as fallbackChannels,
  categories as fallbackCategories,
} from '@/data/channels';

export interface ChannelsData {
  categories: Category[];
  channels: Channel[];
}

/**
 * Fetch channels by scraping pelisjuanita.com/tv/.
 * Falls back to hardcoded data if scraping fails.
 */
export async function fetchChannelsData(): Promise<ChannelsData> {
  try {
    const data = await scrapeChannels();

    if (data.channels.length > 0 && data.categories.length > 0) {
      return data;
    }

    console.log('Scraper returned empty data, using fallback');
    return getFallbackData();
  } catch (err) {
    console.log('Error fetching channels:', err);
    return getFallbackData();
  }
}

function getFallbackData(): ChannelsData {
  return {
    categories: fallbackCategories,
    channels: fallbackChannels,
  };
}

/**
 * Validate a stream URL by making a HEAD request.
 * Returns true if the URL responds successfully (2xx/3xx).
 */
export async function validateStreamUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Linux; Android 14; Chromecast HD) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      },
    });

    clearTimeout(timeout);
    return response.status < 400;
  } catch {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 14; Chromecast HD) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          Range: 'bytes=0-0',
        },
      });

      clearTimeout(timeout);
      return response.status < 400;
    } catch {
      return false;
    }
  }
}

/**
 * Find the first working stream option for a channel.
 */
export async function findWorkingStream(
  channel: Channel,
): Promise<StreamOption | null> {
  const options = channel.streamOptions || [];

  if (options.length === 0) {
    return null;
  }

  // Sort by priority (lower = better), prefer non-ad options
  const sorted = [...options].sort((a, b) => {
    if (a.hasAds !== b.hasAds) return a.hasAds ? 1 : -1;
    return a.priority - b.priority;
  });

  for (const option of sorted) {
    const works = await validateStreamUrl(option.streamUrl);
    if (works) {
      return option;
    }
  }

  return null;
}
