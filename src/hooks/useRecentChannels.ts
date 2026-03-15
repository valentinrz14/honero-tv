import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {getRecentChannels, addRecentChannel} from '@/utils/storage';

export const recentChannelsKey = ['recentChannels'] as const;

export function useRecentChannels() {
  return useQuery({
    queryKey: recentChannelsKey,
    queryFn: getRecentChannels,
    staleTime: 0, // always refetch on mount
  });
}

export function useAddRecentChannel() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (channelId: string) => addRecentChannel(channelId),
    onSuccess: () => {
      qc.invalidateQueries({queryKey: recentChannelsKey});
    },
  });
}
