import { useState } from 'react';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Header } from '@/components/ui/navigation';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Upload, Coins, Package } from 'lucide-react';

export default function AddReward() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    pointsCost: 0,
    category: '',
    totalQuantity: 1,
    imageFile: null as File | null
  });

  const createRewardMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch('/api/rewards', {
        method: 'POST',
        body: data
      });
      if (!response.ok) throw new Error('Failed to create reward');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/rewards'] });
      toast({
        title: "Success",
        description: "Reward added successfully!",
      });
      setLocation('/admin/dashboard');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create reward. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('pointsCost', formData.pointsCost.toString());
    submitData.append('category', formData.category);
    submitData.append('totalQuantity', formData.totalQuantity.toString());
    submitData.append('availableQuantity', formData.totalQuantity.toString());
    
    if (formData.imageFile) {
      submitData.append('image', formData.imageFile);
    }
    
    createRewardMutation.mutate(submitData);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, imageFile: file }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Add Reward" />
      
      <div className="p-4 space-y-6">
        <Button 
          variant="outline" 
          onClick={() => setLocation('/admin/dashboard')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Add New Reward
            </CardTitle>
          </CardHeader>
          <CardContent>
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
                  rows={3}
                  required
                />
              </div>

              <div>
                <Label htmlFor="pointsCost">Points Cost</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="pointsCost"
                    type="number"
                    value={formData.pointsCost}
                    onChange={(e) => setFormData(prev => ({ ...prev, pointsCost: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter points cost"
                    min="1"
                    required
                  />
                  <Coins className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>

              <div>
                <Label htmlFor="totalQuantity">Total Quantity</Label>
                <Input
                  id="totalQuantity"
                  type="number"
                  value={formData.totalQuantity}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalQuantity: parseInt(e.target.value) || 1 }))}
                  placeholder="Enter total quantity"
                  min="1"
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
                    <SelectItem value="eco-friendly">Eco-Friendly Products</SelectItem>
                    <SelectItem value="merchandise">Community Merchandise</SelectItem>
                    <SelectItem value="vouchers">Vouchers & Discounts</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="others">Others</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="image">Reward Image</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1"
                  />
                  <Upload className="h-4 w-4 text-muted-foreground" />
                </div>
                {formData.imageFile && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {formData.imageFile.name}
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  Add Reward
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setLocation('/admin/dashboard')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}