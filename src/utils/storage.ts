import AsyncStorage from '@react-native-async-storage/async-storage';

const RECENT_CHANNELS_KEY = '@hornero_tv_recent';
const MAX_RECENT = 10;

export async function getRecentChannels(): Promise<string[]> {
  try {
    const data = await AsyncStorage.getItem(RECENT_CHANNELS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function addRecentChannel(channelId: string): Promise<void> {
  try {
    const recent = await getRecentChannels();
    const filtered = recent.filter(id => id !== channelId);
    filtered.unshift(channelId);
    const trimmed = filtered.slice(0, MAX_RECENT);
    await AsyncStorage.setItem(RECENT_CHANNELS_KEY, JSON.stringify(trimmed));
  } catch {
    // Silent fail for storage errors
  }
}
