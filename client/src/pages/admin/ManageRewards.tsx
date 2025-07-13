import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/ui/navigation';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Edit, Trash2, Package, Users, Clock, CheckCircle, Eye, Copy } from 'lucide-react';
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

interface User {
  id: number;
  name: string;
  username: string;
  points: number;
}

export default function ManageRewards() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const currentUser = authStore.getCurrentUser();
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isClaimDetailOpen, setIsClaimDetailOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<RewardClaim | null>(null);
  const [activeTab, setActiveTab] = useState('rewards');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pointsCost: 0,
    category: '',
    imageUrl: '',
    isAvailable: true
  });

  // Fetch rewards
  const { data: rewards = [] } = useQuery<Reward[]>({
    queryKey: ['/api/rewards'],
  });

  // Fetch reward claims
  const { data: claims = [] } = useQuery<RewardClaim[]>({
    queryKey: ['/api/reward-claims'],
  });

  // Fetch users
  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Create reward mutation
  const createRewardMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/rewards', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rewards'] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Success",
        description: "Reward created successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create reward",
        variant: "destructive",
      });
    },
  });

  // Update reward mutation
  const updateRewardMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => apiRequest(`/api/rewards/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rewards'] });
      setIsEditDialogOpen(false);
      setSelectedReward(null);
      resetForm();
      toast({
        title: "Success",
        description: "Reward updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update reward",
        variant: "destructive",
      });
    },
  });

  // Delete reward mutation
  const deleteRewardMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/rewards/${id}`, {
      method: 'DELETE',
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rewards'] });
      toast({
        title: "Success",
        description: "Reward deleted successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete reward",
        variant: "destructive",
      });
    },
  });

  // Verify claim mutation
  const verifyClaimMutation = useMutation({
    mutationFn: ({ claimId, status }: { claimId: number; status: string }) => 
      apiRequest(`/api/reward-claims/${claimId}/verify`, {
        method: 'POST',
        body: JSON.stringify({ status, verifiedBy: currentUser?.id }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reward-claims'] });
      toast({
        title: "Success",
        description: "Claim verified successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to verify claim",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      pointsCost: 0,
      category: '',
      imageUrl: '',
      isAvailable: true
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedReward) {
      updateRewardMutation.mutate({
        id: selectedReward.id,
        data: formData
      });
    } else {
      createRewardMutation.mutate(formData);
    }
  };

  const handleEdit = (reward: Reward) => {
    setSelectedReward(reward);
    setFormData({
      title: reward.title,
      description: reward.description,
      pointsCost: reward.pointsCost,
      category: reward.category,
      imageUrl: reward.imageUrl || '',
      isAvailable: reward.isAvailable
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this reward?')) {
      deleteRewardMutation.mutate(id);
    }
  };

  const handleClaimDetail = (claim: RewardClaim) => {
    setSelectedClaim(claim);
    setIsClaimDetailOpen(true);
  };

  const getUserName = (userId: number) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Unknown User';
  };

  const getRewardTitle = (rewardId: number) => {
    const reward = rewards.find(r => r.id === rewardId);
    return reward ? reward.title : 'Unknown Reward';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Claim code copied to clipboard!",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unclaimed': return 'bg-yellow-100 text-yellow-800';
      case 'claimed': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const unclaimedClaims = claims.filter(c => c.status === 'unclaimed');
  const claimedClaims = claims.filter(c => c.status === 'claimed');

  return (
    <div className="min-h-screen bg-background">
      <Header title="Manage Rewards" />
      
      <div className="p-4 space-y-6">
        <Button 
          variant="outline" 
          onClick={() => setLocation('/admin/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
            <TabsTrigger value="unclaimed">Unclaimed ({unclaimedClaims.length})</TabsTrigger>
            <TabsTrigger value="claimed">Claimed ({claimedClaims.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="rewards" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Manage Rewards</h2>
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Reward
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add New Reward</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="title">Reward Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter reward title"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter reward description"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="pointsCost">Points Cost</Label>
                      <Input
                        id="pointsCost"
                        type="number"
                        value={formData.pointsCost}
                        onChange={(e) => setFormData(prev => ({ ...prev, pointsCost: parseInt(e.target.value) }))}
                        placeholder="Enter points cost"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Environment">Environment</SelectItem>
                          <SelectItem value="Community">Community</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Health">Health</SelectItem>
                          <SelectItem value="Technology">Technology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="imageUrl">Image URL (optional)</Label>
                      <Input
                        id="imageUrl"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                        placeholder="Enter image URL"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isAvailable"
                        checked={formData.isAvailable}
                        onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                      />
                      <Label htmlFor="isAvailable">Available for redemption</Label>
                    </div>
                    <Button type="submit" className="w-full" disabled={createRewardMutation.isPending}>
                      {createRewardMutation.isPending ? 'Creating...' : 'Create Reward'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4">
              {rewards.map((reward) => (
                <Card key={reward.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{reward.title}</h3>
                          <Badge variant={reward.isAvailable ? "default" : "secondary"}>
                            {reward.isAvailable ? 'Available' : 'Unavailable'}
                          </Badge>
                          <Badge variant="outline">{reward.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{reward.description}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {reward.pointsCost} points
                          </span>
                          <span>Created: {new Date(reward.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(reward)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(reward.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="unclaimed" className="space-y-4">
            <h2 className="text-lg font-semibold">Unclaimed Rewards</h2>
            <div className="grid gap-4">
              {unclaimedClaims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{getRewardTitle(claim.rewardId)}</h3>
                          <Badge className={getStatusColor(claim.status)}>
                            {claim.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Claimed by: {getUserName(claim.userId)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Claim Date: {new Date(claim.claimedAt).toLocaleDateString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {claim.claimCode}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(claim.claimCode)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleClaimDetail(claim)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm" 
                          onClick={() => verifyClaimMutation.mutate({ claimId: claim.id, status: 'claimed' })}
                          disabled={verifyClaimMutation.isPending}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Verify
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="claimed" className="space-y-4">
            <h2 className="text-lg font-semibold">Claimed Rewards</h2>
            <div className="grid gap-4">
              {claimedClaims.map((claim) => (
                <Card key={claim.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{getRewardTitle(claim.rewardId)}</h3>
                          <Badge className={getStatusColor(claim.status)}>
                            {claim.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Claimed by: {getUserName(claim.userId)}
                        </p>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>Claim Date: {new Date(claim.claimedAt).toLocaleDateString()}</p>
                          {claim.verifiedAt && (
                            <p>Verified: {new Date(claim.verifiedAt).toLocaleDateString()}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                            {claim.claimCode}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(claim.claimCode)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleClaimDetail(claim)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Reward Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Reward</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Reward Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter reward title"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter reward description"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-pointsCost">Points Cost</Label>
                <Input
                  id="edit-pointsCost"
                  type="number"
                  value={formData.pointsCost}
                  onChange={(e) => setFormData(prev => ({ ...prev, pointsCost: parseInt(e.target.value) }))}
                  placeholder="Enter points cost"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Environment">Environment</SelectItem>
                    <SelectItem value="Community">Community</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Health">Health</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-imageUrl">Image URL (optional)</Label>
                <Input
                  id="edit-imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  placeholder="Enter image URL"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                />
                <Label htmlFor="edit-isAvailable">Available for redemption</Label>
              </div>
              <Button type="submit" className="w-full" disabled={updateRewardMutation.isPending}>
                {updateRewardMutation.isPending ? 'Updating...' : 'Update Reward'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>

        {/* Claim Detail Dialog */}
        <Dialog open={isClaimDetailOpen} onOpenChange={setIsClaimDetailOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Claim Details</DialogTitle>
            </DialogHeader>
            {selectedClaim && (
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Reward</Label>
                  <p className="text-sm">{getRewardTitle(selectedClaim.rewardId)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Claimed by</Label>
                  <p className="text-sm">{getUserName(selectedClaim.userId)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Claim Code</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded flex-1">
                      {selectedClaim.claimCode}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(selectedClaim.claimCode)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge className={getStatusColor(selectedClaim.status)}>
                    {selectedClaim.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Claim Date</Label>
                  <p className="text-sm">{new Date(selectedClaim.claimedAt).toLocaleDateString()}</p>
                </div>
                {selectedClaim.verifiedAt && (
                  <div>
                    <Label className="text-sm font-medium">Verified Date</Label>
                    <p className="text-sm">{new Date(selectedClaim.verifiedAt).toLocaleDateString()}</p>
                  </div>
                )}
                {selectedClaim.status === 'unclaimed' && (
                  <Button 
                    onClick={() => verifyClaimMutation.mutate({ claimId: selectedClaim.id, status: 'claimed' })}
                    disabled={verifyClaimMutation.isPending}
                    className="w-full"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Verify Claim
                  </Button>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}