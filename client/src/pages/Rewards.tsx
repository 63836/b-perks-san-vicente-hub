import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Header, BottomNavigation } from '@/components/ui/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Gift, ShoppingCart, Star, History, Copy, Check, Clock } from 'lucide-react';
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

interface RewardClaim {
  id: number;
  userId: number;
  rewardId: number;
  claimCode: string;
  status: 'unclaimed' | 'claimed' | 'expired';
  claimedAt: string;
  verifiedAt?: string;
  verifiedBy?: number;
}

export default function Rewards() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showHistory, setShowHistory] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<RewardClaim | null>(null);
  const [user, setUser] = useState(authStore.getCurrentUser());

  useEffect(() => {
    const currentUser = authStore.getCurrentUser();
    setUser(currentUser);
  }, []);

  // Fetch rewards
  const { data: rewards = [] } = useQuery<Reward[]>({
    queryKey: ['/api/rewards'],
  });

  // Fetch user's reward claims
  const { data: userClaims = [] } = useQuery<RewardClaim[]>({
    queryKey: ['/api/users', user?.id, 'reward-claims'],
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
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'reward-claims'] });
      queryClient.invalidateQueries({ queryKey: ['/api/rewards'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'transactions'] });
      
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
        description: "Reward claimed successfully! Check your history for the claim code.",
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

  const handleClaimClick = (claim: RewardClaim) => {
    setSelectedClaim(claim);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Claim code copied to clipboard",
    });
  };

  const getRewardTitle = (rewardId: number) => {
    const reward = rewards.find(r => r.id === rewardId);
    return reward ? reward.title : 'Unknown Reward';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unclaimed': return 'bg-yellow-100 text-yellow-800';
      case 'claimed': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'unclaimed': return <Clock className="h-4 w-4" />;
      case 'claimed': return <Check className="h-4 w-4" />;
      case 'expired': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
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
        {/* Points Balance and History Button */}
        <div className="flex items-center justify-between bg-gradient-secondary p-4 rounded-lg text-secondary-foreground">
          <div>
            <p className="text-sm opacity-80">Available Points</p>
            <p className="text-2xl font-bold">{userInfo?.points || user.points}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(true)}
            className="bg-background/20 border-background/30 hover:bg-background/30"
          >
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Rewards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRewards.map((reward) => {
            const isOutOfStock = reward.availableQuantity <= 0;
            const isLowStock = reward.availableQuantity <= 3 && reward.availableQuantity > 0;
            
            return (
            <Card key={reward.id} className={isOutOfStock ? 'opacity-60' : ''}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{reward.title}</CardTitle>
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    {reward.pointsCost} pts
                  </Badge>
                </div>
                <Badge variant="outline" className="w-fit">
                  {reward.category}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {reward.imageUrl ? (
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={reward.imageUrl} 
                      alt={reward.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                    <Gift className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
                
                <p className="text-sm text-muted-foreground">
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
            {userClaims.length === 0 ? (
              <div className="text-center py-8">
                <Gift className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No rewards claimed yet</p>
              </div>
            ) : (
              userClaims.map((claim) => (
                <Card key={claim.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleClaimClick(claim)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{getRewardTitle(claim.rewardId)}</h4>
                        <p className="text-sm text-muted-foreground">
                          Claimed: {claim.claimedAt ? new Date(claim.claimedAt).toLocaleDateString() : 'Unknown'}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getStatusColor(claim.status)}>
                            {getStatusIcon(claim.status)}
                            <span className="ml-1 capitalize">{claim.status}</span>
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {claim.claimCode ? claim.claimCode.substring(0, 8) + '...' : 'No Code'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Click to view
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

      {/* Claim Detail Dialog */}
      <Dialog open={!!selectedClaim} onOpenChange={() => setSelectedClaim(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Claim Details</DialogTitle>
          </DialogHeader>
          {selectedClaim && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">{getRewardTitle(selectedClaim.rewardId)}</h4>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getStatusColor(selectedClaim.status)}>
                    {getStatusIcon(selectedClaim.status)}
                    <span className="ml-1 capitalize">{selectedClaim.status}</span>
                  </Badge>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-medium mb-2">Claim Code</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white px-3 py-2 rounded border font-mono text-sm">
                    {selectedClaim.claimCode || 'No code available'}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!selectedClaim.claimCode}
                    onClick={() => selectedClaim.claimCode && copyToClipboard(selectedClaim.claimCode)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Show this code to the Barangay office to claim your reward
                </p>
              </div>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>Claimed: {selectedClaim.claimedAt ? new Date(selectedClaim.claimedAt).toLocaleString() : 'Unknown'}</p>
                {selectedClaim.verifiedAt && (
                  <p>Verified: {new Date(selectedClaim.verifiedAt).toLocaleString()}</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
}