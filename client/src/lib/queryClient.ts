import { QueryClient } from '@tanstack/react-query';
import { frontendApiRequest } from './frontendQueryClient';

// Create a query client instance for frontend-only operation
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // No retries for frontend-only mode
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

// Frontend-only fetcher function
export const defaultFetcher = async (url: string): Promise<any> => {
  return await frontendApiRequest(url);
};

// Frontend-only API request helper
export const apiRequest = async (url: string, options?: RequestInit): Promise<any> => {
  return await frontendApiRequest(url, options);
};