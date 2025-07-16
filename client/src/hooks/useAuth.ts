import { useQuery } from "@tanstack/react-query";
import { frontendStorage } from "@/lib/frontendStorage";

export function useAuth() {
  const { data: user, isLoading } = useQuery({
    queryKey: ["/api/auth/user"],
    queryFn: () => frontendStorage.getCurrentUser(),
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  };
}