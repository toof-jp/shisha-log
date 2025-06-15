import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { getStoredToken, setStoredToken, clearStoredToken, isAuthenticated } from '~/lib/auth';
import { login, register, type User } from '~/lib/auth-api';
import { apiClient, createProfile } from '~/lib/api-client';

interface AuthUser {
  userId: string;
  displayName: string;
  user: User;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Skip auth check during SSR
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }

    const checkAuth = async () => {
      if (isAuthenticated()) {
        try {
          const { data } = await apiClient.get<User>('/profile');
          setUser({ 
            userId: data.user_id,
            displayName: data.display_name,
            user: data
          });
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          clearStoredToken();
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const signUp = async (userId: string, password: string, displayName: string) => {
    try {
      const authResponse = await register({ user_id: userId, password, display_name: displayName });
      setStoredToken(authResponse.token, 86400); // 24 hours
      
      // Create profile after successful registration
      try {
        await createProfile({
          display_name: displayName,
        });
      } catch (profileError) {
        console.error('Failed to create profile:', profileError);
        // Continue even if profile creation fails - user can create it later
      }
      
      setUser({ 
        userId: authResponse.user.user_id,
        displayName: authResponse.user.display_name,
        user: authResponse.user
      });
      
      navigate('/');
    } catch (error) {
      throw error;
    }
  };

  const signIn = async (userId: string, password: string) => {
    try {
      const authResponse = await login({ user_id: userId, password });
      setStoredToken(authResponse.token, 86400); // 24 hours
      
      setUser({ 
        userId: authResponse.user.user_id,
        displayName: authResponse.user.display_name,
        user: authResponse.user
      });
      
      navigate('/');
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    clearStoredToken();
    setUser(null);
    navigate('/login');
  };

  return { 
    user, 
    loading, 
    signIn, 
    signUp, 
    signOut,
    isAuthenticated: isAuthenticated()
  };
}