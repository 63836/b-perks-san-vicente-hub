import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header, BottomNavigation } from '@/components/ui/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Gift, ShoppingCart, Star, History } from 'lucide-react';
import { authStore } from '@/store/authStore';
import { apiRequest } from '@/lib/queryClient';

interface Reward {
  id: number;
  title: string;
  description: string;
  pointsCost: number;
  imageUrl?: string;
  isAvailable: boolean;
  category: string;
  totalQuantity: number;
  availableQuantity: number;
  createdAt: string;
}

export default function Rewards() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showHistory, setShowHistory] = useState(false);
  const [user, setUser] = useState(authStore.getCurrentUser());

  useEffect(() => {
    const currentUser = authStore.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Fetch rewards
  const { data: rewards = [] } = useQuery<Reward[]>({
    queryKey: ['/api/rewards'],
  });

  // Fetch user's transactions (for reward history)
  const { data: userTransactions = [] } = useQuery({
    queryKey: ['/api/users', user?.id, 'transactions'],
    enabled: !!user?.id,
  });

  // Fetch user info for current points
  const { data: userInfo } = useQuery({
    queryKey: ['/api/users', user?.id],
    enabled: !!user?.id,
  });

  // Redeem reward mutation
  const redeemMutation = useMutation({
    mutationFn: (rewardId: number) => apiRequest(`/api/rewards/${rewardId}/claim`, {
      method: 'POST',
      body: JSON.stringify({ userId: user?.id }),
    }),
    onSuccess: async (claimData) => {
      // Invalidate multiple queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rewards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id] });
      
      // Force refresh user data from server
      try {
        const response = await fetch(`/api/users/${user?.id}`);
        if (response.ok) {
          const updatedUserData = await response.json();
          authStore.setCurrentUser(updatedUserData);
          setUser(updatedUserData);
        }
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
      
      toast({
        title: "Success!",
        description: "Reward claimed successfully! Check your history for the transaction record.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const categories = ['All', ...new Set(rewards.map(reward => reward.category))];
  
  const filteredRewards = selectedCategory === 'All' 
    ? rewards 
    : rewards.filter(reward => reward.category === selectedCategory);

  const handleRedeem = (reward: Reward) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to redeem rewards",
        variant: "destructive",
      });
      return;
    }

    const currentPoints = userInfo?.points || user.points;
    if (currentPoints < reward.pointsCost) {
      toast({
        title: "Insufficient Points",
        description: `You need ${reward.pointsCost - currentPoints} more points to redeem this reward.`,
        variant: "destructive",
      });
      return;
    }

    if (reward.availableQuantity <= 0) {
      toast({
        title: "Out of Stock",
        description: "This reward is currently out of stock.",
        variant: "destructive",
      });
      return;
    }

    redeemMutation.mutate(reward.id);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <Header title="Rewards Store" />
        <div className="p-4 flex items-center justify-center h-64">
          <div className="text-center">
            <Gift className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Please log in</h3>
            <p className="text-muted-foreground">
              Log in to view and redeem rewards
            </p>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Rewards Store" />

      <div className="p-4 space-y-6">
        {/* Points Display */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center">
                <Star className="h-6 w-6 mr-2" />
                Your Points
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowHistory(true)}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                <History className="h-4 w-4 mr-1" />
                History
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {userInfo?.points || user?.points || 0}
            </div>
            <p className="text-blue-100 text-sm">
              Points available for rewards
            </p>
          </CardContent>
        </Card>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 gap-4">
          {filteredRewards.map((reward) => {
            const isOutOfStock = reward.availableQuantity <= 0;
            const isLowStock = reward.availableQuantity <= 3 && reward.availableQuantity > 0;
            
            return (
            <Card 
              key={reward.id} 
              className={`${isOutOfStock ? 'opacity-60' : ''} hover:shadow-lg transition-shadow`}
            >
              <CardContent className="p-4">
                {reward.imageUrl && (
                  <div className="w-full h-32 bg-muted rounded-lg mb-3 overflow-hidden">
                    <img 
                      src={reward.imageUrl} 
                      alt={reward.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg line-clamp-2 flex-1">
                    {reward.title}
                  </h3>
                  <Badge variant="secondary" className="ml-2 bg-gradient-gold text-white">
                    {reward.pointsCost} pts
                  </Badge>
                </div>
                
                <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                  {reward.description}
                </p>

                {/* Stock Status */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      isOutOfStock 
                        ? 'bg-red-100 text-red-800' 
                        : isLowStock 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {isOutOfStock ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'Available'}
                    </div>
                  </div>
                  <div className="text-muted-foreground">
                    {reward.availableQuantity}/{reward.totalQuantity} left
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button
                    size="sm"
                    disabled={isOutOfStock || user.points < reward.pointsCost || redeemMutation.isPending}
                    onClick={() => handleRedeem(reward)}
                    className="bg-gradient-gold flex-1"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    {redeemMutation.isPending ? 'Redeeming...' : 'Redeem'}
                  </Button>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>

        {filteredRewards.length === 0 && (
          <div className="text-center py-12">
            <Gift className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No rewards found</h3>
            <p className="text-muted-foreground">
              Try selecting a different category
            </p>
          </div>
        )}
      </div>

      {/* History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reward History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {userTransactions.filter(t => t.type === 'redeemed').length === 0 ? (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No rewards redeemed yet</p>
              </div>
            ) : (
              userTransactions
                .filter(transaction => transaction.type === 'redeemed')
                .map((transaction) => (
                  <Card key={transaction.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{transaction.description}</h4>
                          <p className="text-sm text-muted-foreground">
                            Redeemed: {new Date(transaction.timestamp).toLocaleDateString()}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className="bg-red-100 text-red-800">
                              <ShoppingCart className="h-3 w-3 mr-1" />
                              <span className="ml-1">Redeemed</span>
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-red-600">
                            {transaction.amount} pts
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Points used
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
}