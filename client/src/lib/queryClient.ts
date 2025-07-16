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

// Offline-only fetcher function - no API calls
export const defaultFetcher = async (url: string): Promise<any> => {
  // Always get cached data, never make network calls
  const cachedData = await getCachedResponseData(url);
  if (cachedData) {
    return cachedData;
  }
  
  // Return default data if no cache exists
  return getDefaultOfflineData(url);
};

// Offline-only API request helper - no network calls
export const apiRequest = async (url: string, options?: RequestInit): Promise<any> => {
  // Use frontend API request instead of network calls
  return await frontendApiRequest(url, options);
};

export const apiRequestOld = async (url: string, options?: RequestInit): Promise<any> => {
  // For write operations, save to local storage immediately
  if (options?.method && options.method !== 'GET') {
    const data = options.body ? JSON.parse(options.body as string) : undefined;
    
    // Store action locally and return success
    await offlineStorage.queueOfflineAction({
      endpoint: url,
      method: options.method as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
      data,
      type: getActionType(options.method),
      headers: options.headers as Record<string, string>
    });
    
    // Simulate immediate success for local operations
    await simulateLocalOperation(url, options.method, data);
    
    return { success: true, offline: true, message: 'Action saved locally' };
  }
  
  // For read operations, get cached data
  return defaultFetcher(url);
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

// Provide default offline data when no cache exists
function getDefaultOfflineData(url: string): any {
  if (url.includes('/api/events')) {
    return [];
  } else if (url.includes('/api/rewards')) {
    return [];
  } else if (url.includes('/api/reports')) {
    return [];
  } else if (url.includes('/api/news')) {
    return [];
  } else if (url.includes('/api/users/')) {
    return null;
  }
  return [];
}

// Simulate local operations for immediate UI feedback
async function simulateLocalOperation(url: string, method: string, data: any): Promise<void> {
  try {
    if (method === 'POST') {
      if (url.includes('/api/events') && data) {
        // Add event to local cache
        const events = await offlineStorage.getCachedEvents() || [];
        const newEvent = { ...data, id: Date.now(), createdAt: new Date() };
        events.push(newEvent);
        await offlineStorage.cacheEvents(events);
      } else if (url.includes('/api/reports') && data) {
        // Add report to local cache
        const reports = await offlineStorage.getCachedReports() || [];
        const newReport = { ...data, id: Date.now(), createdAt: new Date(), status: 'pending' };
        reports.push(newReport);
        await offlineStorage.cacheReports(reports);
      } else if (url.includes('/api/rewards') && data) {
        // Add reward to local cache
        const rewards = await offlineStorage.getCachedRewards() || [];
        const newReward = { ...data, id: Date.now(), createdAt: new Date() };
        rewards.push(newReward);
        await offlineStorage.cacheRewards(rewards);
      }
    }
  } catch (error) {
    console.error('Failed to simulate local operation:', error);
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