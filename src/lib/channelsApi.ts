import {supabase} from './supabase';
import {
  Channel,
  Category,
  StreamOption,
  channels as hardcodedChannels,
  categories as hardcodedCategories,
} from '@/data/channels';

export interface ChannelsData {
  categories: Category[];
  channels: Channel[];
}

/**
 * Fetch channels and categories from Supabase.
 * Falls back to hardcoded data if the request fails or returns empty.
 */
export async function fetchChannelsData(): Promise<ChannelsData> {
  try {
    const {data, error} = await supabase.rpc('get_channels_with_options');

    if (error) {
      console.log('Failed to fetch channels from Supabase:', error.message);
      return getFallbackData();
    }

    const cats: Category[] = data?.categories || [];
    const chs: Channel[] = (data?.channels || []).map((ch: any) => ({
      id: ch.id,
      name: ch.name,
      category: ch.category,
      slug: ch.slug,
      logoUrl: ch.logoUrl || '',
      description: ch.description || undefined,
      isEvento: ch.isEvento || false,
      streamOptions: (ch.streamOptions || []).map((so: any) => ({
        id: so.id,
        label: so.label,
        streamUrl: so.streamUrl,
        hasAds: so.hasAds || false,
        priority: so.priority || 0,
      })),
    }));

    // If Supabase returned data, use it
    if (cats.length > 0 && chs.length > 0) {
      return {categories: cats, channels: chs};
    }

    // Otherwise fall back to hardcoded
    return getFallbackData();
  } catch (err) {
    console.log('Error fetching channels:', err);
    return getFallbackData();
  }
}

function getFallbackData(): ChannelsData {
  return {
    categories: hardcodedCategories,
    channels: hardcodedChannels,
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
          'Mozilla/5.0 (Linux; Android 10; BRAVIA 4K GB) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });

    clearTimeout(timeout);

    // Accept 2xx and 3xx as valid
    return response.status < 400;
  } catch {
    // If HEAD fails, try GET (some servers don't support HEAD)
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Linux; Android 10; BRAVIA 4K GB) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Range: 'bytes=0-0', // minimize data transfer
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
 * Tests each option URL and returns the first one that responds successfully.
 * Returns null if no options work.
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

  // Test each option sequentially
  for (const option of sorted) {
    const works = await validateStreamUrl(option.streamUrl);
    if (works) {
      return option;
    }
  }

  return null;
}
