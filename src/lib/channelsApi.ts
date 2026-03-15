import AsyncStorage from '@react-native-async-storage/async-storage';
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

const CHANNELS_CACHE_KEY = 'channels_cache';
const CHANNELS_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface CachedChannelsData {
  data: ChannelsData;
  timestamp: number;
}

async function getCachedChannels(): Promise<ChannelsData | null> {
  try {
    const raw = await AsyncStorage.getItem(CHANNELS_CACHE_KEY);
    if (!raw) return null;
    const cached: CachedChannelsData = JSON.parse(raw);
    if (Date.now() - cached.timestamp < CHANNELS_CACHE_TTL) {
      return cached.data;
    }
    return null;
  } catch {
    return null;
  }
}

async function setCachedChannels(data: ChannelsData): Promise<void> {
  try {
    const cached: CachedChannelsData = {data, timestamp: Date.now()};
    await AsyncStorage.setItem(CHANNELS_CACHE_KEY, JSON.stringify(cached));
  } catch {}
}

/**
 * Fetch channels by triggering a WebView scrape of pelisjuanita.com/tv/.
 * Uses persistent AsyncStorage cache to avoid re-scraping on cold starts.
 * Falls back to cached/fallback data if scraping fails.
 */
export async function fetchChannelsData(): Promise<ChannelsData> {
  // Try persistent cache first (instant cold start)
  const cached = await getCachedChannels();
  if (cached && cached.channels.length > 0) {
    console.log(`fetchChannelsData: using cached data (${cached.channels.length} channels)`);
    // Trigger background refresh but return cached immediately
    refreshChannelsInBackground();
    return cached;
  }

  return await scrapeAndCache();
}

async function scrapeAndCache(): Promise<ChannelsData> {
  try {
    console.log('fetchChannelsData: starting WebView scrape...');
    const data = await scrapeChannels();

    if (data.channels.length > 0 && data.categories.length > 0) {
      console.log(
        `fetchChannelsData: success - ${data.channels.length} channels`,
      );
      await setCachedChannels(data);
      return data;
    }

    console.log('Scraper returned empty data, using fallback');
    return getFallbackData();
  } catch (err) {
    console.log('Error fetching channels:', err);
    return getFallbackData();
  }
}

let _backgroundRefreshInProgress = false;
async function refreshChannelsInBackground(): Promise<void> {
  if (_backgroundRefreshInProgress) return;
  _backgroundRefreshInProgress = true;
  try {
    await scrapeAndCache();
  } finally {
    _backgroundRefreshInProgress = false;
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
 */
export async function validateStreamUrl(url: string): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

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
      const timeout = setTimeout(() => controller.abort(), 5000);

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
 * Validates streams in parallel for faster results.
 */
export async function findWorkingStream(
  channel: Channel,
): Promise<StreamOption | null> {
  const options = channel.streamOptions || [];

  if (options.length === 0) {
    return null;
  }

  const sorted = [...options].sort((a, b) => {
    if (a.hasAds !== b.hasAds) return a.hasAds ? 1 : -1;
    return a.priority - b.priority;
  });

  // Validate all streams in parallel, return the first working one by priority
  const results = await Promise.all(
    sorted.map(async option => ({
      option,
      works: await validateStreamUrl(option.streamUrl),
    })),
  );

  const working = results.find(r => r.works);
  return working?.option ?? null;
}
