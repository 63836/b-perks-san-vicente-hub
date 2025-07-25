import { useState, useEffect } from 'react';
import { Header, BottomNavigation } from '@/components/ui/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, AlertTriangle, Megaphone, Calendar } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface NewsAlert {
  id: number;
  title: string;
  content: string;
  type: 'news' | 'alert' | 'announcement';
  imageUrl?: string;
  authorId: number;
  publishedAt: string;
}

export default function Notifications() {
  // Fetch real notifications from backend
  const { data: notifications = [], isLoading } = useQuery<NewsAlert[]>({
    queryKey: ['/api/news'],
  });

  // Mark all notifications as read when component mounts
  useEffect(() => {
    if (notifications.length > 0) {
      // Clear notification count when user views the notifications page
      import('@/store/notificationStore').then(({ notificationStore }) => {
        notificationStore.clearNotifications();
      });
    }
  }, [notifications.length]);
  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-destructive" />;
      case 'announcement':
        return <Megaphone className="h-5 w-5 text-primary" />;
      case 'event':
        return <Calendar className="h-5 w-5 text-accent" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // Use notification store for unread count instead of all notifications
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    import('@/store/notificationStore').then(({ notificationStore }) => {
      setUnreadCount(notificationStore.getCount());
      const unsubscribe = notificationStore.subscribe(setUnreadCount);
      return unsubscribe;
    });
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header title="Notifications" />

      <div className="p-4 space-y-6">
        {/* Summary */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Bell className="h-12 w-12 mx-auto text-primary mb-2" />
              <h3 className="text-lg font-semibold mb-1">
                {unreadCount > 0 ? `${unreadCount} Unread` : 'All Caught Up!'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0 
                  ? `You have ${unreadCount} unread notifications` 
                  : 'No new notifications at the moment'
                }
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <div className="space-y-3">
          {isLoading ? (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">Loading notifications...</p>
              </CardContent>
            </Card>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground">No notifications yet.</p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card 
                key={notification.id} 
                className="border-primary/20 bg-primary/5 transition-colors"
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-foreground">
                          {notification.title}
                        </h4>
                        <div className="flex items-center ml-2">
                          <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {notification.publishedAt ? formatTimestamp(notification.publishedAt) : 'No date'}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm mt-1 text-foreground">
                        {notification.content}
                      </p>
                      
                      <Badge 
                        variant="outline" 
                        className="mt-2 text-xs capitalize"
                      >
                        {notification.type}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No notifications</h3>
            <p className="text-muted-foreground">
              You'll receive notifications about events, alerts, and community updates here
            </p>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}