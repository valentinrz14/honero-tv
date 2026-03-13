import {Channel, channels as localChannels} from './channels';

const IPTV_ARGENTINA_URL =
  'https://iptv-org.github.io/iptv/countries/ar.m3u';

interface M3UEntry {
  name: string;
  url: string;
  logo?: string;
  group?: string;
}

function parseM3U(content: string): M3UEntry[] {
  const entries: M3UEntry[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#EXTINF:')) {
      const nameMatch = line.match(/,(.+)$/);
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      const groupMatch = line.match(/group-title="([^"]+)"/);

      const nextLine = lines[i + 1]?.trim();
      if (nextLine && !nextLine.startsWith('#')) {
        entries.push({
          name: nameMatch?.[1] || 'Unknown',
          url: nextLine,
          logo: logoMatch?.[1],
          group: groupMatch?.[1],
        });
        i++;
      }
    }
  }

  return entries;
}

function mapGroupToCategory(group: string | undefined): string {
  if (!group) return 'entretenimiento';
  const lower = group.toLowerCase();
  if (lower.includes('news') || lower.includes('noticias')) return 'noticias';
  if (lower.includes('sport') || lower.includes('deporte')) return 'deportes';
  if (lower.includes('kids') || lower.includes('infantil') || lower.includes('children')) return 'infantil';
  if (lower.includes('music') || lower.includes('musica') || lower.includes('música')) return 'musica';
  if (lower.includes('culture') || lower.includes('cultura') || lower.includes('education') || lower.includes('educación')) return 'cultura';
  if (lower.includes('general') || lower.includes('entertainment') || lower.includes('entretenimiento')) return 'entretenimiento';
  return 'entretenimiento';
}

export async function fetchRemoteChannels(): Promise<Channel[]> {
  try {
    const response = await fetch(IPTV_ARGENTINA_URL, {
      headers: {'User-Agent': 'HorneroTV/1.0'},
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const content = await response.text();
    const entries = parseM3U(content);

    return entries.map((entry, idx) => ({
      id: `remote-${idx}`,
      name: entry.name,
      category: mapGroupToCategory(entry.group),
      streamUrl: entry.url,
      logoUrl: entry.logo || '',
      description: entry.group || '',
    }));
  } catch (error) {
    console.warn('Failed to fetch remote channels, using local data:', error);
    return [];
  }
}

export async function getAllChannels(): Promise<Channel[]> {
  // Start with local channels
  const allChannels = [...localChannels];

  // Try to fetch remote channels and merge (avoid duplicates by name)
  try {
    const remoteChannels = await fetchRemoteChannels();
    const localNames = new Set(localChannels.map(ch => ch.name.toLowerCase()));

    for (const remote of remoteChannels) {
      if (!localNames.has(remote.name.toLowerCase())) {
        allChannels.push(remote);
      }
    }
  } catch {
    // Use local channels only
  }

  return allChannels;
}
