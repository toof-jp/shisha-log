import { Navigate, Outlet } from 'react-router';
import { useAuth } from '~/hooks/use-auth';

export function AuthGuard() {
  const { user, loading } = useAuth();

  console.log('AuthGuard: user =', user);
  console.log('AuthGuard: loading =', loading);
  console.log('AuthGuard: window =', typeof window);

  // During SSR, always show loading state
  if (typeof window === 'undefined' || loading) {
    console.log('AuthGuard: showing loading state');
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    console.log('AuthGuard: no user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('AuthGuard: user authenticated, rendering outlet');
  return <Outlet />;
}