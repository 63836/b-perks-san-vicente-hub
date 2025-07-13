import { useState } from 'react';
import { Header, BottomNavigation } from '@/components/ui/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, ShoppingCart, Star } from 'lucide-react';

// Sample rewards data
const sampleRewards = [
  {
    id: '1',
    title: 'Eco-friendly Water Bottle',
    description: 'BPA-free stainless steel water bottle with Barangay logo',
    pointsCost: 100,
    imageUrl: '/placeholder.svg',
    isAvailable: true,
    category: 'Eco-friendly'
  },
  {
    id: '2',
    title: 'Community Garden Seeds Pack',
    description: 'Vegetable seeds for home gardening - tomato, lettuce, herbs',
    pointsCost: 75,
    imageUrl: '/placeholder.svg',
    isAvailable: true,
    category: 'Gardening'
  },
  {
    id: '3',
    title: 'Barangay T-Shirt',
    description: 'Official Barangay San Vicente t-shirt, available in all sizes',
    pointsCost: 150,
    imageUrl: '/placeholder.svg',
    isAvailable: true,
    category: 'Apparel'
  },
  {
    id: '4',
    title: 'Emergency Flashlight',
    description: 'LED flashlight with hand crank for emergencies',
    pointsCost: 200,
    imageUrl: '/placeholder.svg',
    isAvailable: true,
    category: 'Safety'
  },
  {
    id: '5',
    title: 'Reusable Shopping Bag',
    description: 'Durable canvas shopping bag to reduce plastic use',
    pointsCost: 50,
    imageUrl: '/placeholder.svg',
    isAvailable: true,
    category: 'Eco-friendly'
  },
  {
    id: '6',
    title: 'First Aid Kit',
    description: 'Basic first aid supplies for home emergency preparedness',
    pointsCost: 300,
    imageUrl: '/placeholder.svg',
    isAvailable: false,
    category: 'Safety'
  }
];

export default function Rewards() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', 'Eco-friendly', 'Safety', 'Gardening', 'Apparel'];
  
  const filteredRewards = selectedCategory === 'All' 
    ? sampleRewards 
    : sampleRewards.filter(reward => reward.category === selectedCategory);

  const handleRedeem = (reward: typeof sampleRewards[0]) => {
    // TODO: Implement redeem logic with points deduction
    alert(`Redeeming ${reward.title} for ${reward.pointsCost} points!`);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Rewards Store" />

      <div className="p-4 space-y-6">
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
          {filteredRewards.map((reward) => (
            <Card key={reward.id} className={!reward.isAvailable ? 'opacity-60' : ''}>
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
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <Gift className="h-12 w-12 text-muted-foreground" />
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {reward.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Star className="h-4 w-4 mr-1" />
                    {reward.isAvailable ? 'Available' : 'Out of Stock'}
                  </div>
                  
                  <Button
                    size="sm"
                    disabled={!reward.isAvailable}
                    onClick={() => handleRedeem(reward)}
                    className="bg-gradient-gold"
                  >
                    <ShoppingCart className="h-4 w-4 mr-1" />
                    Redeem
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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

      <BottomNavigation />
    </div>
  );
}