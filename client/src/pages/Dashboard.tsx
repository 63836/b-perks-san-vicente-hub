import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header, BottomNavigation } from '@/components/ui/navigation';
import { authStore } from '@/store/authStore';
import { notificationStore } from '@/store/notificationStore';
import { useToast } from '@/hooks/use-toast';
import { Coins, TrendingUp, Calendar, Gift, MapPin, LogOut } from 'lucide-react';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState(authStore.getCurrentUser());
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch user transactions from API
  const { data: transactions = [] } = useQuery({
    queryKey: ['/api/users', user?.id, 'transactions'],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/users/${user.id}/transactions`);
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    },
    enabled: !!user?.id
  });

  useEffect(() => {
    const currentUser = authStore.getCurrentUser();
    if (!currentUser) {
      setLocation('/login');
      return;
    }
    if (currentUser.isAdmin) {
      setLocation('/admin');
      return;
    }
    setUser(currentUser);
    
    // Initialize notification count
    setNotificationCount(notificationStore.getCount());
    
    // Subscribe to notification updates
    const unsubscribe = notificationStore.subscribe(setNotificationCount);
    return unsubscribe;
  }, [setLocation]);

  const handleLogout = () => {
    authStore.logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    setLocation('/login');
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header 
        title={`Welcome, ${user.name.split(' ')[0]}!`}
        showNotifications={true}
        notificationCount={notificationCount}
        onNotificationClick={() => setLocation('/notifications')}
      />

      <div className="p-4 space-y-6">
        {/* Points Card */}
        <Card className="bg-primary text-primary-foreground shadow-strong">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Coins className="h-8 w-8 mr-2 text-white" />
                <span className="text-2xl font-semibold text-white">B-Perks Points</span>
              </div>
              <div className="text-4xl font-bold mb-2 text-white">{user.points.toLocaleString()}</div>
              <p className="text-white/80">
                Keep participating to earn more!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="hover:shadow-medium transition-shadow cursor-pointer" onClick={() => setLocation('/events')}>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Events</h3>
              <p className="text-sm text-muted-foreground">Join community events</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-medium transition-shadow cursor-pointer" onClick={() => setLocation('/rewards')}>
            <CardContent className="p-4 text-center">
              <Gift className="h-8 w-8 mx-auto mb-2 text-accent" />
              <h3 className="font-semibold">Rewards</h3>
              <p className="text-sm text-muted-foreground">Redeem your points</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {transactions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No activity yet. Start participating in events to earn points!
              </p>
            ) : (
              transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(transaction.timestamp)}
                    </p>
                  </div>
                  <Badge 
                    variant={transaction.type === 'earned' ? 'default' : 'secondary'}
                    className={transaction.type === 'earned' ? 'bg-success' : ''}
                  >
                    {transaction.type === 'earned' ? '+' : ''}{transaction.amount} pts
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Location Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center text-muted-foreground">
              <MapPin className="h-4 w-4 mr-2" />
              <span className="text-sm">Barangay San Vicente, Baguio City</span>
            </div>
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
}