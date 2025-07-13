import { Header, BottomNavigation } from '@/components/ui/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, AlertTriangle, Megaphone, Calendar } from 'lucide-react';

// Sample notifications data
const sampleNotifications = [
  {
    id: '1',
    title: 'New Event: Tree Planting Activity',
    message: 'Join us for a tree planting activity on January 25. Register now to earn 75 points!',
    type: 'event',
    timestamp: '2024-01-15T14:30:00Z',
    isRead: false
  },
  {
    id: '2',
    title: 'Heavy Rainfall Alert',
    message: 'Yellow rainfall warning issued for Baguio City. Stay safe and avoid flood-prone areas.',
    type: 'alert',
    timestamp: '2024-01-14T06:30:00Z',
    isRead: false
  },
  {
    id: '3',
    title: 'New Announcement: Waste Segregation',
    message: 'New waste segregation guidelines will be implemented starting February 1, 2024.',
    type: 'announcement',
    timestamp: '2024-01-13T09:00:00Z',
    isRead: true
  },
  {
    id: '4',
    title: 'Event Registration Confirmed',
    message: 'You have successfully registered for the Community Clean-up Drive.',
    type: 'confirmation',
    timestamp: '2024-01-12T16:45:00Z',
    isRead: true
  },
  {
    id: '5',
    title: 'Points Earned!',
    message: 'You earned 50 points for participating in the Disaster Preparedness Seminar.',
    type: 'points',
    timestamp: '2024-01-10T17:00:00Z',
    isRead: true
  }
];

export default function Notifications() {
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

  const unreadCount = sampleNotifications.filter(n => !n.isRead).length;

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
          {sampleNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`${notification.isRead ? 'bg-muted/30' : 'border-primary/20 bg-primary/5'} transition-colors`}
            >
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className={`text-sm font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center ml-2">
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-primary rounded-full mr-2"></div>
                        )}
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTimestamp(notification.timestamp)}
                        </div>
                      </div>
                    </div>
                    
                    <p className={`text-sm mt-1 ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {notification.message}
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
          ))}
        </div>

        {sampleNotifications.length === 0 && (
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