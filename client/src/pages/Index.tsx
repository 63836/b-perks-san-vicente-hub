import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { authStore } from '@/store/authStore';

const Index = () => {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const user = authStore.getCurrentUser();
    if (user) {
      if (user.isAdmin) {
        setLocation('/admin');
      } else {
        setLocation('/dashboard');
      }
    } else {
      setLocation('/login');
    }
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
};

export default Index;
