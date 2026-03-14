import {useQuery} from '@tanstack/react-query';
import {fetchChannelsData, ChannelsData} from '@/lib/channelsApi';
import {
  Channel,
  Category,
  channels as hardcodedChannels,
  categories as hardcodedCategories,
} from '@/data/channels';

export const channelsQueryKey = ['channels'] as const;

export function useChannelsData() {
  return useQuery<ChannelsData>({
    queryKey: channelsQueryKey,
    queryFn: fetchChannelsData,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    // Provide hardcoded data as initial/placeholder so the UI renders immediately
    placeholderData: {
      categories: hardcodedCategories,
      channels: hardcodedChannels,
    },
  });
}

export function useChannels(): Channel[] {
  const {data} = useChannelsData();
  return data?.channels || hardcodedChannels;
}

export function useCategories(): Category[] {
  const {data} = useChannelsData();
  return data?.categories || hardcodedCategories;
}

export function useChannelById(channelId: string): Channel | undefined {
  const channels = useChannels();
  return channels.find(ch => ch.id === channelId);
}

export function useChannelsByCategory(categoryId: string): Channel[] {
  const channels = useChannels();
  return channels.filter(ch => ch.category === categoryId);
}

export function useSearchChannels(query: string): Channel[] {
  const channels = useChannels();
  if (query.length < 2) return [];
  const lower = query.toLowerCase();
  return channels.filter(
    ch =>
      ch.name.toLowerCase().includes(lower) ||
      ch.category.toLowerCase().includes(lower) ||
      (ch.description && ch.description.toLowerCase().includes(lower)),
  );
}
