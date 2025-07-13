import { Link, useLocation } from 'react-router-dom';
import { Home, MapPin, Calendar, Newspaper, Gift, FileText, Settings, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const userNavItems = [
  { to: '/dashboard', icon: Home, label: 'Home' },
  { to: '/map', icon: MapPin, label: 'Map' },
  { to: '/events', icon: Calendar, label: 'Events' },
  { to: '/news', icon: Newspaper, label: 'News' },
  { to: '/rewards', icon: Gift, label: 'Rewards' },
  { to: '/report', icon: FileText, label: 'Report' },
];

const adminNavItems = [
  { to: '/admin', icon: Settings, label: 'Dashboard' },
  { to: '/admin/events', icon: Calendar, label: 'Events' },
  { to: '/admin/news', icon: Newspaper, label: 'News' },
  { to: '/admin/rewards', icon: Gift, label: 'Rewards' },
  { to: '/admin/reports', icon: FileText, label: 'Reports' },
];

interface BottomNavigationProps {
  isAdmin?: boolean;
}

export function BottomNavigation({ isAdmin = false }: BottomNavigationProps) {
  const location = useLocation();
  const navItems = isAdmin ? adminNavItems : userNavItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span className="text-xs font-medium">{item.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

interface HeaderProps {
  title: string;
  showNotifications?: boolean;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

export function Header({ title, showNotifications = false, notificationCount = 0, onNotificationClick }: HeaderProps) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-40">
      <div className="flex items-center justify-between h-14 px-4">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {showNotifications && (
          <button
            onClick={onNotificationClick}
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
              >
                {notificationCount > 9 ? '9+' : notificationCount}
              </Badge>
            )}
          </button>
        )}
      </div>
    </header>
  );
}