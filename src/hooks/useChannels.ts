import {useQuery} from '@tanstack/react-query';
import {fetchChannelsData, ChannelsData} from '@/lib/channelsApi';
import {
  Channel,
  Category,
  categories as fallbackCategories,
} from '@/data/channels';

export const channelsQueryKey = ['channels'] as const;

export function useChannelsData() {
  return useQuery<ChannelsData>({
    queryKey: channelsQueryKey,
    queryFn: fetchChannelsData,
    staleTime: 10 * 60 * 1000, // 10 minutes - scraping is heavier than API
    gcTime: 60 * 60 * 1000, // 1 hour cache
    retry: 2,
  });
}

export function useChannels(): Channel[] {
  const {data} = useChannelsData();
  return data?.channels || [];
}

export function useCategories(): Category[] {
  const {data} = useChannelsData();
  return data?.categories || fallbackCategories;
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
      (ch.country && ch.country.toLowerCase().includes(lower)),
  );
}

export function useChannelsLoading(): boolean {
  const {isLoading} = useChannelsData();
  return isLoading;
}
