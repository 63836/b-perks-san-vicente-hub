import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/ui/navigation';
import { authStore } from '@/store/authStore';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  FileX, 
  Calendar, 
  Newspaper, 
  Gift, 
  BarChart3, 
  LogOut,
  AlertTriangle 
} from 'lucide-react';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [user, setUser] = useState(authStore.getCurrentUser());

  // Fetch real data from API
  const { data: users = [] } = useQuery({
    queryKey: ['/api/users'],
  });

  const { data: events = [] } = useQuery({
    queryKey: ['/api/events'],
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['/api/reports'],
  });

  const { data: rewards = [] } = useQuery({
    queryKey: ['/api/rewards'],
  });

  // Calculate accurate stats from local data
  const adminStats = {
    totalUsers: users.length,
    pendingReports: reports.filter((report: any) => report.status === 'pending').length,
    activeEvents: events.filter((event: any) => event.isActive).length,
    totalRewards: rewards.filter((reward: any) => reward.isAvailable).length
  };

  useEffect(() => {
    const currentUser = authStore.getCurrentUser();
    if (!currentUser) {
      setLocation('/login');
      return;
    }
    if (!currentUser.isAdmin) {
      setLocation('/dashboard');
      return;
    }
    setUser(currentUser);
  }, [setLocation]);

  const handleLogout = () => {
    authStore.logout();
    toast({
      title: "Logged out",
      description: "Admin session ended successfully.",
    });
    setLocation('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header title="Admin Dashboard" />

      <div className="p-4 space-y-6">
        {/* Welcome Card */}
        <Card className="bg-gradient-secondary text-secondary-foreground shadow-strong">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Welcome, Admin</h2>
              <p className="text-secondary-foreground/80">
                Barangay San Vicente Management System
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <div className="text-2xl font-bold">{adminStats.totalUsers}</div>
              <p className="text-sm text-muted-foreground">Total Users</p>
            </CardContent>
          </Card>

          <Card className="border-destructive/20">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-destructive" />
              <div className="text-2xl font-bold text-destructive">{adminStats.pendingReports}</div>
              <p className="text-sm text-muted-foreground">Pending Reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-info" />
              <div className="text-2xl font-bold">{adminStats.activeEvents}</div>
              <p className="text-sm text-muted-foreground">Active Events</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Gift className="h-8 w-8 mx-auto mb-2 text-accent" />
              <div className="text-2xl font-bold">{adminStats.totalRewards}</div>
              <p className="text-sm text-muted-foreground">Available Rewards</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => setLocation('/admin/create-announcement')}
            >
              <Newspaper className="h-4 w-4 mr-2" />
              Create Announcement
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => setLocation('/admin/ongoing-events')}
            >
              <Calendar className="h-4 w-4 mr-2" />
              Ongoing Events
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => setLocation('/admin/manage-rewards')}
            >
              <Gift className="h-4 w-4 mr-2" />
              Manage Rewards
            </Button>
            
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={() => setLocation('/admin/reports')}
            >
              <FileX className="h-4 w-4 mr-2" />
              Review Reports
              {adminStats.pendingReports > 0 && (
                <span className="ml-auto bg-destructive text-destructive-foreground px-2 py-1 rounded-full text-xs">
                  {adminStats.pendingReports}
                </span>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-sm">New user registration</p>
                <p className="text-xs text-muted-foreground">Maria Santos joined</p>
              </div>
              <span className="text-xs text-muted-foreground">2 hours ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-sm">Event participation</p>
                <p className="text-xs text-muted-foreground">Clean-up drive completed</p>
              </div>
              <span className="text-xs text-muted-foreground">5 hours ago</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium text-sm">New report submitted</p>
                <p className="text-xs text-muted-foreground">Street light maintenance</p>
              </div>
              <span className="text-xs text-muted-foreground">1 day ago</span>
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


    </div>
  );
}