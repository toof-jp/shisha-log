import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '~/lib/user';
import { useAuth } from '~/hooks/use-auth';

export function useCurrentUser() {
  const { isAuthenticated } = useAuth();
  
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentUser,
    enabled: isAuthenticated,
  });
}