import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authStore } from '@/store/authStore';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const user = authStore.getCurrentUser();
    if (user) {
      if (user.isAdmin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

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
