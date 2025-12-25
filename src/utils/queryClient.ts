import { QueryClient } from '@tanstack/react-query';
import { defaultQueryOptions } from '../config/reactQuery';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      ...defaultQueryOptions,
      refetchOnWindowFocus: false,
    },
  },
});
