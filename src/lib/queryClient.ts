import {QueryClient} from '@tanstack/react-query';

const oneDay = 1000 * 60 * 60 * 24;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: oneDay,
    },
    mutations: {
      retry: false,
    },
  },
});
