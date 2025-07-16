import { QueryClient } from '@tanstack/react-query';
import { offlineStorage } from '@/utils/offlineStorage';

// Create a query client instance with offline support
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry if offline
        if (!navigator.onLine) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

// Enhanced fetcher function with offline support
export const defaultFetcher = async (url: string): Promise<any> => {
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache successful responses for offline access
    await cacheResponseData(url, data);
    
    return data;
  } catch (error) {
    // If network fails, try to get cached data
    if (!navigator.onLine) {
      const cachedData = await getCachedResponseData(url);
      if (cachedData) {
        return cachedData;
      }
    }
    throw error;
  }
};

// Enhanced API request helper function with offline support
export const apiRequest = async (url: string, options?: RequestInit): Promise<any> => {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache successful responses
    await cacheResponseData(url, data);
    
    return data;
  } catch (error) {
    // If offline and it's a write operation, queue it
    if (!navigator.onLine && options?.method && options.method !== 'GET') {
      await offlineStorage.queueOfflineAction({
        endpoint: url,
        method: options.method as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
        data: options.body ? JSON.parse(options.body as string) : undefined,
        type: getActionType(options.method),
        headers: options.headers as Record<string, string>
      });
      
      // Return a success response to prevent UI errors
      return { success: true, offline: true, message: 'Action queued for sync when online' };
    }
    
    throw error;
  }
};

// Cache response data based on URL
async function cacheResponseData(url: string, data: any) {
  try {
    if (url.includes('/api/events')) {
      await offlineStorage.cacheEvents(Array.isArray(data) ? data : [data]);
    } else if (url.includes('/api/rewards')) {
      await offlineStorage.cacheRewards(Array.isArray(data) ? data : [data]);
    } else if (url.includes('/api/reports')) {
      await offlineStorage.cacheReports(Array.isArray(data) ? data : [data]);
    } else if (url.includes('/api/news')) {
      await offlineStorage.cacheNews(Array.isArray(data) ? data : [data]);
    } else if (url.includes('/api/users/')) {
      const userId = url.match(/\/api\/users\/(\d+)/)?.[1];
      if (userId) {
        await offlineStorage.cacheUserData(parseInt(userId), data);
      }
    }
  } catch (error) {
    console.error('Failed to cache response data:', error);
  }
}

// Get cached response data based on URL
async function getCachedResponseData(url: string): Promise<any> {
  try {
    if (url.includes('/api/events')) {
      return await offlineStorage.getCachedEvents();
    } else if (url.includes('/api/rewards')) {
      return await offlineStorage.getCachedRewards();
    } else if (url.includes('/api/reports')) {
      return await offlineStorage.getCachedReports();
    } else if (url.includes('/api/news')) {
      return await offlineStorage.getCachedNews();
    } else if (url.includes('/api/users/')) {
      const userId = url.match(/\/api\/users\/(\d+)/)?.[1];
      if (userId) {
        return await offlineStorage.getCachedUserData(parseInt(userId));
      }
    }
    return null;
  } catch (error) {
    console.error('Failed to get cached response data:', error);
    return null;
  }
}

function getActionType(method: string): 'create' | 'update' | 'delete' {
  switch (method.toUpperCase()) {
    case 'POST':
      return 'create';
    case 'PUT':
    case 'PATCH':
      return 'update';
    case 'DELETE':
      return 'delete';
    default:
      return 'create';
  }
}

// Set up the default query function
queryClient.setDefaultOptions({
  queries: {
    queryFn: ({ queryKey }) => {
      const [url] = queryKey as [string];
      return defaultFetcher(url);
    },
  },
});