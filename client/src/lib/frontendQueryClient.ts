import { QueryClient } from '@tanstack/react-query';
import { frontendStorage } from './frontendStorage';

// Frontend-only query client that uses browser storage
export const frontendQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      queryFn: async ({ queryKey }) => {
        const [endpoint] = queryKey as string[];
        return await frontendFetcher(endpoint);
      },
    },
  },
});

// Frontend fetcher that uses browser storage instead of network calls
async function frontendFetcher(endpoint: string): Promise<any> {
  console.log('Frontend fetcher called for:', endpoint);

  try {
    if (endpoint === '/api/auth/user') {
      return frontendStorage.getCurrentUser();
    }
    
    if (endpoint === '/api/events') {
      return await frontendStorage.getEvents();
    }
    
    if (endpoint === '/api/rewards') {
      return await frontendStorage.getRewards();
    }
    
    if (endpoint === '/api/reports') {
      return await frontendStorage.getReports();
    }
    
    if (endpoint === '/api/news') {
      return await frontendStorage.getNews();
    }
    
    if (endpoint === '/api/users') {
      return await frontendStorage.getUsers();
    }

    if (endpoint.startsWith('/api/rewards/claims')) {
      return await frontendStorage.getClaims();
    }

    if (endpoint.startsWith('/api/transactions')) {
      return await frontendStorage.getTransactions();
    }

    // Default return empty array for unknown endpoints
    return [];
  } catch (error) {
    console.error('Frontend fetcher error:', error);
    return [];
  }
}

// Frontend API request handler
export async function frontendApiRequest(url: string, options?: RequestInit): Promise<any> {
  console.log('Frontend API request:', url, options?.method || 'GET');

  try {
    const method = options?.method || 'GET';
    const data = options?.body ? JSON.parse(options.body as string) : undefined;

    // Handle authentication
    if (url === '/api/auth/login' && method === 'POST') {
      return await frontendStorage.login(data.username, data.password);
    }

    if (url === '/api/auth/logout' && method === 'POST') {
      frontendStorage.logout();
      return { success: true };
    }

    if (url === '/api/auth/register' && method === 'POST') {
      return await frontendStorage.createUser({
        username: data.username,
        password: data.password,
        name: data.name,
        age: data.age,
        phoneNumber: data.phoneNumber,
        points: 0,
        isAdmin: false
      });
    }

    // Handle events
    if (url === '/api/events' && method === 'POST') {
      return await frontendStorage.createEvent(data);
    }

    if (url.match(/\/api\/events\/\d+/) && method === 'PATCH') {
      const eventId = parseInt(url.split('/').pop()!);
      return await frontendStorage.updateEvent(eventId, data);
    }

    if (url.match(/\/api\/events\/\d+\/join/) && method === 'POST') {
      const eventId = parseInt(url.split('/')[3]);
      const currentUser = frontendStorage.getCurrentUser();
      if (currentUser) {
        // Create transaction for event participation
        await frontendStorage.createTransaction({
          userId: currentUser.id,
          type: 'event_participation',
          amount: 0,
          description: `Joined event`,
          eventId
        });
        return { success: true };
      }
      throw new Error('User not logged in');
    }

    // Handle rewards
    if (url === '/api/rewards' && method === 'POST') {
      return await frontendStorage.createReward(data);
    }

    if (url.match(/\/api\/rewards\/\d+/) && method === 'PATCH') {
      const rewardId = parseInt(url.split('/').pop()!);
      return await frontendStorage.updateReward(rewardId, data);
    }

    if (url.match(/\/api\/rewards\/\d+\/claim/) && method === 'POST') {
      const rewardId = parseInt(url.split('/')[3]);
      const currentUser = frontendStorage.getCurrentUser();
      if (currentUser) {
        const reward = (await frontendStorage.getRewards() as any[]).find(r => r.id === rewardId);
        if (reward && currentUser.points >= reward.pointsCost) {
          // Deduct points and create claim
          await frontendStorage.updateUser(currentUser.id, {
            points: currentUser.points - reward.pointsCost
          });
          
          // Update reward quantity
          await frontendStorage.updateReward(rewardId, {
            availableQuantity: reward.availableQuantity - 1
          });

          const claim = await frontendStorage.createClaim({
            userId: currentUser.id,
            rewardId,
            pointsUsed: reward.pointsCost
          });

          // Create transaction
          await frontendStorage.createTransaction({
            userId: currentUser.id,
            type: 'reward_redemption',
            amount: -reward.pointsCost,
            description: `Redeemed ${reward.title}`,
            rewardId
          });

          // Update session user
          const updatedUser = await frontendStorage.getUserById(currentUser.id);
          sessionStorage.setItem('currentUser', JSON.stringify(updatedUser));

          return claim;
        }
        throw new Error('Insufficient points or reward unavailable');
      }
      throw new Error('User not logged in');
    }

    // Handle reports
    if (url === '/api/reports' && method === 'POST') {
      const currentUser = frontendStorage.getCurrentUser();
      return await frontendStorage.createReport({
        ...data,
        userId: currentUser?.id,
        userName: currentUser?.name
      });
    }

    if (url.match(/\/api\/reports\/\d+/) && method === 'PATCH') {
      const reportId = parseInt(url.split('/').pop()!);
      return await frontendStorage.updateReport(reportId, data);
    }

    // Handle news
    if (url === '/api/news' && method === 'POST') {
      const currentUser = frontendStorage.getCurrentUser();
      return await frontendStorage.createNews({
        ...data,
        authorId: currentUser?.id,
        authorName: currentUser?.name
      });
    }

    // Handle user updates
    if (url.match(/\/api\/users\/\d+\/points/) && method === 'PATCH') {
      const userId = parseInt(url.split('/')[3]);
      const currentUser = frontendStorage.getCurrentUser();
      
      if (currentUser?.isAdmin) {
        const user = await frontendStorage.getUserById(userId);
        if (user) {
          const newPoints = user.points + data.points;
          await frontendStorage.updateUser(userId, { points: newPoints });
          
          // Create transaction
          await frontendStorage.createTransaction({
            userId,
            type: data.points > 0 ? 'points_earned' : 'points_deducted',
            amount: data.points,
            description: data.reason || 'Admin adjustment',
            grantedBy: currentUser.id
          });

          return await frontendStorage.getUserById(userId);
        }
      }
      throw new Error('Unauthorized or user not found');
    }

    return { success: true };
  } catch (error) {
    console.error('Frontend API request error:', error);
    throw error;
  }
}