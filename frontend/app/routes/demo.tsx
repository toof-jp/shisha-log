import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import type { Route } from './+types/demo';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Demo Mode - Shisha Log' },
    { name: 'description', content: 'Demo access to Shisha Log' },
  ];
}

export default function Demo() {
  const navigate = useNavigate();

  useEffect(() => {
    // Create a fake user session for demo purposes
    const fakeUser = {
      id: 'demo-user',
      email: 'demo@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };

    // Store in localStorage for demo purposes
    localStorage.setItem('demo-mode', 'true');
    localStorage.setItem('demo-user', JSON.stringify(fakeUser));

    // Navigate to home
    navigate('/');
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Entering Demo Mode...
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Setting up demo session
        </p>
      </div>
    </div>
  );
}