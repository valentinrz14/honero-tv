import {useEffect} from 'react';
import {DeviceEventEmitter} from 'react-native';
import {Channel} from '@/data/channels';

/**
 * Listens for Google Assistant voice search intents forwarded from native Android.
 * When a query arrives, finds the best matching channel and calls onChannelFound.
 */
export function useVoiceSearch(
  channels: Channel[],
  onChannelFound: (channel: Channel) => void,
) {
  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      'voiceSearch',
      (query: string) => {
        if (!query || channels.length === 0) return;

        const normalizedQuery = query.toLowerCase().trim();
        const match = findBestMatch(channels, normalizedQuery);

        if (match) {
          console.log(`Voice search: "${query}" → ${match.name}`);
          onChannelFound(match);
        } else {
          console.log(`Voice search: "${query}" → no match found`);
        }
      },
    );

    return () => subscription.remove();
  }, [channels, onChannelFound]);
}

function findBestMatch(channels: Channel[], query: string): Channel | null {
  // 1. Exact name match
  const exact = channels.find(
    ch => ch.name.toLowerCase() === query,
  );
  if (exact) return exact;

  // 2. Name starts with query
  const startsWith = channels.find(ch =>
    ch.name.toLowerCase().startsWith(query),
  );
  if (startsWith) return startsWith;

  // 3. Name contains query
  const contains = channels.find(ch =>
    ch.name.toLowerCase().includes(query),
  );
  if (contains) return contains;

  // 4. Query contains channel name (e.g. "poné telefe" → "TELEFE")
  const reverseContains = channels.find(ch =>
    query.includes(ch.name.toLowerCase()),
  );
  if (reverseContains) return reverseContains;

  // 5. Fuzzy: split query into words and find channel matching most words
  const queryWords = query.split(/\s+/);
  let bestScore = 0;
  let bestChannel: Channel | null = null;

  for (const ch of channels) {
    const name = ch.name.toLowerCase();
    let score = 0;
    for (const word of queryWords) {
      if (word.length >= 2 && name.includes(word)) {
        score++;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestChannel = ch;
    }
  }

  return bestScore > 0 ? bestChannel : null;
}
